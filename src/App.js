import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './App.css';

const BACKEND_URL = 'http://localhost:7000';

const App = () => {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [parentPath, setParentPath] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  // Fetch directory contents
  const fetchDirectory = async (path = '') => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/directory`, {
        params: { path }
      });
      setFiles(response.data.items || []);
      setCurrentPath(response.data.path || '');
      setParentPath(response.data.parent);
      setError(null);
    } catch (err) {
      setError('Erreur de chargement des fichiers: ' + (err.response?.data?.error || err.message));
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDirectory();
    
    // Connect to WebSocket
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      console.log('Connecté au serveur WebSocket');
      setConnected(true);
    });

    socket.on('directory_update', (data) => {
      console.log('Directory updated:', data);
      // Only refresh if we're viewing the updated directory
      if (data.path === '.' && currentPath === '' || data.path === currentPath) {
        fetchDirectory(currentPath);
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Erreur de connexion WebSocket:', err);
      setConnected(false);
    });

    socket.on('disconnect', () => {
      console.log('Déconnecté du serveur WebSocket');
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Navigate to a directory
  const navigateToDirectory = (path) => {
    fetchDirectory(path);
  };

  // Navigate to parent directory
  const navigateToParent = () => {
    if (parentPath !== null) {
      fetchDirectory(parentPath);
    }
  };

  // Open file in default application
  const openFile = async (path) => {
    try {
      await axios.get(`${BACKEND_URL}/api/open`, { params: { path } });
      
      // Create a URL to the file
      const fileUrl = `${BACKEND_URL}/api/file?path=${encodeURIComponent(path)}`;
      
      // Open the file URL in a new tab
      window.open(fileUrl, '_blank');
    } catch (err) {
      setError('Erreur lors de l\'ouverture du fichier: ' + (err.response?.data?.error || err.message));
    }
  };

  // Download file
  const downloadFile = (path) => {
    const downloadUrl = `${BACKEND_URL}/api/file?path=${encodeURIComponent(path)}`;
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', path.split('/').pop());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get file icon based on file type
  const getFileIcon = (file) => {
    if (file.is_directory) {
      return '📁';
    }
    
    const extension = file.name.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf': return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️';
      case 'mp3':
      case 'wav': return '🎵';
      case 'mp4':
      case 'avi':
      case 'mov': return '🎬';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📊';
      case 'zip':
      case 'rar': return '🗜️';
      case 'js':
      case 'py':
      case 'java':
      case 'c':
      case 'cpp':
      case 'html':
      case 'css': return '💻';
      default: return '📄';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Explorateur de Fichiers</h1>
        <div className="breadcrumb">
          <button 
            onClick={() => navigateToDirectory('')}
            className="breadcrumb-item"
          >
            Accueil
          </button>
          {currentPath && currentPath.split('/').filter(Boolean).map((segment, index, array) => {
            const path = array.slice(0, index + 1).join('/');
            return (
              <React.Fragment key={path}>
                <span className="breadcrumb-separator">/</span>
                <button 
                  onClick={() => navigateToDirectory(path)}
                  className="breadcrumb-item"
                >
                  {segment}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '🟢 Connecté' : '🔴 Déconnecté'}
        </div>
      </header>

      <main className="file-container">
        {loading ? (
          <div className="loading">Chargement des fichiers...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="directory-actions">
              {parentPath !== null && (
                <button 
                  className="btn btn-secondary"
                  onClick={navigateToParent}
                >
                  ⬆️ Dossier parent
                </button>
              )}
              <div className="file-count">
                {files.length} élément{files.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <table className="file-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Nom</th>
                  <th>Taille</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => (
                  <tr key={index} className="file-item">
                    <td className="file-icon">{getFileIcon(file)}</td>
                    <td 
                      className="file-name"
                      onClick={() => file.is_directory 
                        ? navigateToDirectory(file.path) 
                        : openFile(file.path)
                      }
                    >
                      {file.name}
                    </td>
                    <td className="file-size">
                      {file.is_directory ? '--' : formatFileSize(file.size)}
                    </td>
                    <td className="file-actions">
                      {file.is_directory ? (
                        <button 
                          className="btn btn-primary"
                          onClick={() => navigateToDirectory(file.path)}
                        >
                          Ouvrir
                        </button>
                      ) : (
                        <button 
                          className="btn btn-primary"
                          onClick={() => openFile(file.path)}
                        >
                          Ouvrir
                        </button>
                      )}
                      <button 
                        className="btn btn-secondary"
                        onClick={() => downloadFile(file.path)}
                      >
                        Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Explorateur de fichiers en temps réel - Mise à jour automatique</p>
      </footer>
    </div>
  );
};

export default App;

