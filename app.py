from flask import Flask, jsonify, send_file, request, abort
from flask_socketio import SocketIO
from flask_cors import CORS
import os
import time
import threading
import mimetypes
import pathlib

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)
# Configure Socket.IO with CORS
socketio = SocketIO(app, cors_allowed_origins="*")

# Base directory to explore (root directory)
BASE_DIRECTORY = "."

def get_file_info(path, base_path):
    """Get file information including type, size, etc."""
    full_path = os.path.join(base_path, path)
    stats = os.stat(full_path)
    is_directory = os.path.isdir(full_path)
    
    return {
        "name": os.path.basename(path),
        "path": path,
        "is_directory": is_directory,
        "size": stats.st_size,
        "modified": stats.st_mtime,
        "type": "directory" if is_directory else mimetypes.guess_type(path)[0] or "application/octet-stream"
    }

def monitor_directory(directory_path):
    """Monitor directory and send updates via WebSocket."""
    previous_files = {}
    
    while True:
        try:
            current_files = {}
            for item in os.listdir(directory_path):
                item_path = os.path.join(directory_path, item)
                current_files[item] = os.path.getmtime(item_path)
            
            if current_files != previous_files:
                socketio.emit('directory_update', {"path": directory_path})
                previous_files = current_files
        except Exception as e:
            print(f"Error monitoring directory: {e}")
        
        time.sleep(1)

@app.route('/api/directory', methods=['GET'])
def get_directory_contents():
    """Get directory contents with path parameter."""
    relative_path = request.args.get('path', '')
    
    # Ensure the path doesn't go above the base directory
    if '..' in relative_path:
        return jsonify({"error": "Invalid path"}), 400
    
    full_path = os.path.normpath(os.path.join(BASE_DIRECTORY, relative_path))
    
    # Security check to prevent directory traversal
    if not os.path.abspath(full_path).startswith(os.path.abspath(BASE_DIRECTORY)):
        return jsonify({"error": "Access denied"}), 403
    
    try:
        items = []
        for item in os.listdir(full_path):
            item_path = os.path.join(relative_path, item)
            items.append(get_file_info(item_path, BASE_DIRECTORY))
        
        # Sort: directories first, then files alphabetically
        items.sort(key=lambda x: (not x["is_directory"], x["name"].lower()))
        
        return jsonify({
            "path": relative_path,
            "items": items,
            "parent": os.path.dirname(relative_path) if relative_path else None
        })
    except FileNotFoundError:
        return jsonify({"error": "Directory not found"}), 404
    except PermissionError:
        return jsonify({"error": "Permission denied"}), 403

@app.route('/api/file', methods=['GET'])
def get_file():
    """Download a file."""
    relative_path = request.args.get('path', '')
    
    # Security checks
    if '..' in relative_path:
        return jsonify({"error": "Invalid path"}), 400
    
    full_path = os.path.normpath(os.path.join(BASE_DIRECTORY, relative_path))
    
    if not os.path.abspath(full_path).startswith(os.path.abspath(BASE_DIRECTORY)):
        return jsonify({"error": "Access denied"}), 403
    
    try:
        if os.path.isfile(full_path):
            return send_file(full_path, as_attachment=True)
        else:
            return jsonify({"error": "Not a file"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/open', methods=['GET'])
def open_file():
    """Signal to open a file (frontend will handle actual opening)."""
    relative_path = request.args.get('path', '')
    
    # Security checks
    if '..' in relative_path:
        return jsonify({"error": "Invalid path"}), 400
    
    full_path = os.path.normpath(os.path.join(BASE_DIRECTORY, relative_path))
    
    if not os.path.abspath(full_path).startswith(os.path.abspath(BASE_DIRECTORY)):
        return jsonify({"error": "Access denied"}), 403
    
    try:
        if os.path.isfile(full_path):
            # Just confirm the file exists - frontend will handle opening
            return jsonify({"success": True, "path": relative_path})
        else:
            return jsonify({"error": "Not a file"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Start directory monitoring in a separate thread
    threading.Thread(target=monitor_directory, args=(BASE_DIRECTORY,), daemon=True).start()
    socketio.run(app, host='0.0.0.0', port=7000, debug=True, allow_unsafe_werkzeug=True)

