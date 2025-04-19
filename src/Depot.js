import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Depot() {
  const [depots, setDepots] = useState([]); // État pour stocker les dépôts
  const [newDepot, setNewDepot] = useState({ name: '', path: '', description: '' }); // État pour le nouveau dépôt

  // Fonction pour récupérer les dépôts depuis l'API
  useEffect(() => {
    fetchDepots();
  }, []);

  const fetchDepots = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:6000/api/depots'); // Assurez-vous que l'API tourne sur le port 6000
      setDepots(response.data); // Met à jour l'état avec les dépôts récupérés
    } catch (error) {
      console.error("Erreur lors de la récupération des dépôts :", error);
    }
  };

  // Fonction pour ajouter un nouveau dépôt
  const addDepot = async () => {
    try {
      await axios.post('http://127.0.0.1:6000/api/depots', newDepot);
      setDepots([...depots, newDepot]); // Ajoute le nouveau dépôt à la liste
      setNewDepot({ name: '', path: '', description: '' }); // Réinitialise le formulaire
    } catch (error) {
      console.error("Erreur lors de l'ajout du dépôt :", error);
    }
  };

  // Fonction pour supprimer un dépôt
  const deleteDepot = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:6000/api/depots/${id}`);
      setDepots(depots.filter((depot) => depot.id !== id)); // Met à jour la liste après suppression
    } catch (error) {
      console.error("Erreur lors de la suppression du dépôt :", error);
    }
  };

  return (
    <div>
      <h1>Gestion des Dépôts</h1>
      
      {/* Formulaire pour ajouter un dépôt */}
      <div>
        <input
          type="text"
          placeholder="Nom"
          value={newDepot.name}
          onChange={(e) => setNewDepot({ ...newDepot, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Chemin"
          value={newDepot.path}
          onChange={(e) => setNewDepot({ ...newDepot, path: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newDepot.description}
          onChange={(e) => setNewDepot({ ...newDepot, description: e.target.value })}
        />
        <button onClick={addDepot}>Ajouter Dépôt</button>
      </div>

      {/* Liste des dépôts */}
      <ul>
        {depots.map((depot) => (
          <li key={depot.id}>
            <strong>{depot.name}</strong>
            <p>Chemin : {depot.path}</p>
            <p>Description : {depot.description}</p>
            <button onClick={() => deleteDepot(depot.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Depot;

