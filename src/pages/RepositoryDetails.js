import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import { 
  getRepositoryById, 
  getRepositoryCommands, 
  addCommand, 
  deleteCommand,
  uploadFile,
  getRepoFiles,
  getFilePreview,
  deleteFile
} from '../services/repository';

function RepositoryDetails() {
  const { repoId } = useParams();
  const [repository, setRepository] = useState(null);
  const [commands, setCommands] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  // Command form state
  const [commandName, setCommandName] = useState('');
  const [commandScript, setCommandScript] = useState('');
  const [showCommandForm, setShowCommandForm] = useState(false);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);
        
        const repoData = await getRepositoryById(repoId);
        setRepository(repoData);
        
        // Check if user owns this repository
        if (repoData.user_id !== currentUser.$id) {
          setError('You do not have permission to view this repository');
          return;
        }
        
        const commandsData = await getRepositoryCommands(repoId);
        setCommands(commandsData.documents);
        
        const filesData = await getRepoFiles(repoId);
        setFiles(filesData.files);
      } catch (err) {
        setError('Failed to load repository details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [repoId, navigate]);

  const handleAddCommand = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!commandName.trim() || !commandScript.trim()) {
      setError('Command name and script are required');
      return;
    }
    
    try {
      const newCommand = await addCommand(repoId, commandName, commandScript);
      setCommands([...commands, newCommand]);
      setCommandName('');
      setCommandScript('');
      setShowCommandForm(false);
    } catch (err) {
      setError('Failed to add command');
      console.error(err);
    }
  };

  const handleDeleteCommand = async (commandId) => {
    if (window.confirm('Are you sure you want to delete this command?')) {
      try {
        await deleteCommand(commandId);
        setCommands(commands.filter(cmd => cmd.$id !== commandId));
      } catch (err) {
        setError('Failed to delete command');
        console.error(err);
      }
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      await uploadFile(selectedFile, repoId);
      const filesData = await getRepoFiles(repoId);
      setFiles(filesData.files);
      setSelectedFile(null);
      setShowFileUpload(false);
    } catch (err) {
      setError('Failed to upload file');
      console.error(err);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(fileId);
        setFiles(files.filter(file => file.$id !== fileId));
      } catch (err) {
        setError('Failed to delete file');
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading repository details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!repository) return <div>Repository not found</div>;

  return (
    <div className="repository-details-container">
      <h2>{repository.name}</h2>
      <p className="repo-description">{repository.description}</p>
      <p className="created-date">
        Created: {new Date(repository.created_at).toLocaleDateString()}
      </p>
      
      <div className="repository-sections">
        {/* Commands Section */}
        <div className="commands-section">
          <div className="section-header">
            <h3>Commands</h3>
            <button 
              onClick={() => setShowCommandForm(!showCommandForm)} 
              className="btn-add"
            >
              {showCommandForm ? 'Cancel' : 'Add Command'}
            </button>
          </div>
          
          {showCommandForm && (
            <form onSubmit={handleAddCommand} className="command-form">
              <div className="form-group">
                <label>Command Name</label>
                <input 
                  type="text" 
                  value={commandName} 
                  onChange={(e) => setCommandName(e.target.value)} 
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Script</label>
                <textarea 
                  value={commandScript} 
                  onChange={(e) => setCommandScript(e.target.value)} 
                  rows={5}
                  required
                />
              </div>
              
              <button type="submit" className="btn-save">
                Save Command
              </button>
            </form>
          )}
          
          {commands.length === 0 ? (
            <p>No commands added yet.</p>
          ) : (
            <div className="commands-list">
              {commands.map(cmd => (
                <div key={cmd.$id} className="command-item">
                  <div className="command-header">
                    <h4>{cmd.name}</h4>
                    <button 
                      onClick={() => handleDeleteCommand(cmd.$id)} 
                      className="btn-delete-small"
                    >
                      Delete
                    </button>
                  </div>
                  <pre className="command-script">{cmd.script}</pre>
                  <p className="command-date">
                    Added: {new Date(cmd.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Files Section */}
        <div className="files-section">
          <div className="section-header">
            <h3>Files</h3>
            <button 
              onClick={() => setShowFileUpload(!showFileUpload)} 
              className="btn-add"
            >
              {showFileUpload ? 'Cancel' : 'Upload File'}
            </button>
          </div>
          
          {showFileUpload && (
            <form onSubmit={handleFileUpload} className="file-upload-form">
              <div className="form-group">
                <label>Select File</label>
                <input 
                  type="file" 
                  onChange={(e) => setSelectedFile(e.target.files[0])} 
                  required
                />
              </div>
              
              <button type="submit" className="btn-upload">
                Upload
              </button>
            </form>
          )}
          
          {files.length === 0 ? (
            <p>No files uploaded yet.</p>
          ) : (
            <div className="files-list">
              {files.map(file => (
                <div key={file.$id} className="file-item">
                  <div className="file-info">
                    <h4>{file.name}</h4>
                    <p>Size: {Math.round(file.sizeOriginal / 1024)} KB</p>
                  </div>
                  
                  <div className="file-actions">
                    <a 
                      href={getFilePreview(file.$id)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-download"
                    >
                      Download
                    </a>
                    <button 
                      onClick={() => handleDeleteFile(file.$id)} 
                      className="btn-delete-small"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <button onClick={() => navigate('/repositories')} className="btn-back">
        Back to Repositories
      </button>
    </div>
  );
}

export default RepositoryDetails;

