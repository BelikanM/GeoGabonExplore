from flask import Flask, jsonify, send_file
import sqlite3
import zipfile
import os

app = Flask(__name__)
DB_PATH = "files.db"
ZIP_PATH = "project.zip"

@app.route('/files', methods=['GET'])
def get_files():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT path, is_dir FROM files")
    items = [{"path": row[0], "is_dir": bool(row[1])} for row in c.fetchall()]
    conn.close()
    return jsonify(items)

@app.route('/file/<path:file_path>', methods=['GET'])
def get_file(file_path):
    # Extraction directe depuis le zip et envoi au frontend
    with zipfile.ZipFile(ZIP_PATH, 'r') as archive:
        try:
            # Extraire temporairement en mémoire
            data = archive.read(file_path)
            from io import BytesIO
            return send_file(BytesIO(data), attachment_filename=os.path.basename(file_path))
        except KeyError:
            return {"error": "File not found"}, 404

if __name__ == "__main__":
    app.run(debug=True)

