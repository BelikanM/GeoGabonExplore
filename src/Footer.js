// Footer.js
import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css"; 

const Footer = () => {
  return (
    <footer className="footer">
      <nav className="footer-navigation">
        <ul>
          <li>
            <Link to="/login">Inscription / Connexion</Link>
          </li>
          <li>
            <Link to="/create-repo">Créer un dépôt</Link>
          </li>
          <li>
            <Link to="/repositories">Liste des dépôts</Link>
          </li>
          <li>
            <Link to="/repository/:id">Afficher les fichiers / commits</Link>
          </li>
        </ul>
      </nav>
      <p>&copy; {new Date().getFullYear()} MonGitHub. Tous droits réservés.</p>
    </footer>
  );
};

export default Footer;

