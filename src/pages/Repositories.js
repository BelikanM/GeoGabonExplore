import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import { getUserRepositories, deleteRepository } from '../services/repository';
import { ID, Query } from './appwrite';

function Repositories() {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);
        
        const reposData = await getUserRepositories(currentUser.$id);
        setRepositories(reposData.documents);
      } catch (err) {
        setError('Failed to load repositories');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleDeleteRepo = async (repoId) => {
    if (window.confirm('Are you sure you want to delete this repository?')) {
      try {
        await deleteRepository(repoId);
        setRepositories(repositories.filter(repo => repo.$id !== repoId));
      } catch (err) {
        setError('Failed to delete repository');
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading repositories...</div>;
  
  return (
    <div className="repositories-container">
      <h2>Your Repositories</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <Link to="/create-repo" className="btn-create">
        Create New Repository
      </Link>
      
      {repositories.length === 0 ? (
        <p>You don't have any repositories yet.</p>
      ) : (
        <div className="repositories-list">
          {repositories.map(repo => (
            <div key={repo.$id} className="repository-card">
              <h3>{repo.name}</h3>
              <p>{repo.description}</p>
              <p className="created-date">
                Created: {new Date(repo.created_at).toLocaleDateString()}
              </p>
              
              <div className="repository-actions">
                <Link to={`/repository/${repo.$id}`} className="btn-view">
                  View Details
                </Link>
                <button 
                  onClick={() => handleDeleteRepo(repo.$id)} 
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Repositories;

