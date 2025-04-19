# save as push.py
import os
import sys
import requests
import zipfile
import tempfile

def zip_project(path):
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.zip')
    temp_file.close()
    
    with zipfile.ZipFile(temp_file.name, 'w') as zipf:
        for root, dirs, files in os.walk(path):
            for file in files:
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, start=path)
                zipf.write(filepath, arcname)
    
    return temp_file.name

def push_project(repo_id, project_path):
    api_url = f"http://localhost:6000/api/upload/{repo_id}"
    zip_path = zip_project(project_path)
    
    with open(zip_path, 'rb') as f:
        files = {'file': ('project.zip', f, 'application/zip')}
        response = requests.post(api_url, files=files)
        
        if response.status_code == 200:
            print("Project uploaded successfully!")
        else:
            print(f"Error: {response.text}")
    
    # Clean up temporary file
    os.unlink(zip_path)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python push.py <REPO_ID> <PROJECT_PATH>")
        sys.exit(1)
    
    repo_id = sys.argv[1]
    project_path = sys.argv[2]
    push_project(repo_id, project_path)

