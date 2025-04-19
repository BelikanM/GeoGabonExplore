import React, { useEffect, useState } from 'react';
import './App.css'; // Ajoutez votre CSS ici
import { FaFileDownload } from 'react-icons/fa';

function App() {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetch('http://localhost:2004/files')
            .then(response => response.json())
            .then(data => setFiles(data));
    }, []);

    const downloadFile = (id) => {
        window.open(`http://localhost:2004/download/${id}`, '_blank');
    };

    return (
        <div className="App">
            <h1>Fichiers</h1>
            <ul className="file-list">
                {files.map(file => (
                    <li key={file[0]} className="file-item">
                        <span className="file-name">{file[1]}</span>
                        <button className="download-button" onClick={() => downloadFile(file[0])}>
                            <FaFileDownload /> Télécharger
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;

