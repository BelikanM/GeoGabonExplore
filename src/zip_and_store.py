import os
import zipfile
import sqlite3

def zip_project_folder(folder_path, zip_path):
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as archive:
        for foldername, subfolders, filenames in os.walk(folder_path):
            for filename in filenames:
                filepath = os.path.join(foldername, filename)
                arcname = os.path.relpath(filepath, folder_path)  # chemin relatif
                archive.write(filepath, arcname)
    print(f"Project zipped into {zip_path}")

def store_files_in_db(zip_path, db_path):
    # Connexion SQLite
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Création de la table si elle n'existe pas
    c.execute('''CREATE TABLE IF NOT EXISTS files (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    path TEXT,
                    is_dir INTEGER
                )''')

    # Vider la table si on veut faire une mise à jour
    c.execute("DELETE FROM files")

    with zipfile.ZipFile(zip_path, 'r') as archive:
        for info in archive.infolist():
            # On détermine si c'est un dossier (les dossiers dans zip ont un slash final)
            is_dir = info.is_dir()
            c.execute("INSERT INTO files (path, is_dir) VALUES (?, ?)", (info.filename, int(is_dir)))

    conn.commit()
    conn.close()
    print(f"Files stored in DB {db_path}")

if __name__ == "__main__":
    folder_to_zip = "/chemin/vers/ton/projet"  # À adapter
    zip_file_path = "project.zip"
    db_file_path = "files.db"

    zip_project_folder(folder_to_zip, zip_file_path)
    store_files_in_db(zip_file_path, db_file_path)

