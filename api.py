from flask import Flask, jsonify, send_file
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

def get_all_files():
    conn = sqlite3.connect('files.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM files')
    files = cursor.fetchall()
    conn.close()
    return files

@app.route('/files', methods=['GET'])
def list_files():
    files = get_all_files()
    result = []
    for file in files:
        result.append({
            "id": file[0],
            "name": file[1],
            "path": file[2],
            "type": file[3],
            "content": file[4] if file[3] == "file" else None
        })
    return jsonify(result)

@app.route('/download/<int:file_id>', methods=['GET'])
def download_file(file_id):
    conn = sqlite3.connect('files.db')
    cursor = conn.cursor()
    cursor.execute('SELECT path FROM files WHERE id = ?', (file_id,))
    file_path = cursor.fetchone()
    conn.close()

    if file_path and os.path.exists(file_path[0]):
        return send_file(file_path[0], as_attachment=True)
    return jsonify({"error": "File not found"}), 404

if __name__ == '__main__':
    app.run(port=2004)

