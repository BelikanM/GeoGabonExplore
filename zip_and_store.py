import os
import sqlite3

def setup_database():
    conn = sqlite3.connect('files.db')
    cursor = conn.cursor()
    # Supprimer et recréer table pour garantir un stockage correct
    cursor.execute('DROP TABLE IF EXISTS files')
    cursor.execute('''
        CREATE TABLE files (
            id INTEGER PRIMARY KEY,
            name TEXT,
            path TEXT,
            type TEXT,      -- "file" ou "directory"
            content TEXT    -- Contenu du fichier si nécessaire
        )
    ''')
    conn.commit()
    conn.close()

def store_file(cursor, name, path, type, content=None):
    cursor.execute('INSERT INTO files (name, path, type, content) VALUES (?, ?, ?, ?)', (name, path, type, content))

def scan_directory(folder_path):
    conn = sqlite3.connect('files.db')
    cursor = conn.cursor()

    for root, dirs, files in os.walk(folder_path):
        # Ajouter les répertoires
        for dir_name in dirs:
            dir_path = os.path.join(root, dir_name)
            store_file(cursor, dir_name, dir_path, "directory")

        # Ajouter les fichiers
        for file_name in files:
            file_path = os.path.join(root, file_name)
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()  # Lire le contenu (prend en charge les erreurs d'encodage)
            store_file(cursor, file_name, file_path, "file", content)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    folder_to_scan = 'your_directory'  # Remplacez par votre répertoire
    setup_database()
    scan_directory(folder_to_scan)
    print(f"Tous les fichiers et répertoires de '{folder_to_scan}' ont été enregistrés dans SQLite.")

