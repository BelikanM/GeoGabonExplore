import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import { createRepository } from '../services/repository';

function CreateRepo() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
    };
    
    checkUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Repository name is required');
      return;
    }
    
    try {
      await createRepository(user.$id, name, description);
      navigate('/repositories');
    } catch (err) {
      setError('Failed to create repository');
      console.error(err);
    }
  };

  return (
    <div className="create-repo-container">
      <h2>Create New Repository</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Repository Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required
          />
        </div>
        
        <div className="form-group">
          <label>Description (optional)</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            rows={4}
          />
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/repositories')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-create">
            Create Repository
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateRepo;

