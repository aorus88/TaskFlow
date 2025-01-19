import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./FloatingMenu.css";

const FloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false); // État pour gérer ouverture/fermeture

  const toggleMenu = () => setIsOpen(!isOpen); // Basculer l'état

  // Fonction pour fermer le menu après un clic sur un lien
  const handleLinkClick = () => setIsOpen(false);

  return (
    <div className={`floating-menu ${isOpen ? "open" : "closed"}`}>
      {/* Bouton pour ouvrir/fermer le menu */}
      <button className="menu-toggle" onClick={toggleMenu}>
        {isOpen ? "←" : "→"}
      </button>

      {isOpen && (
        <>
          <h2 className="menu-title">TaskFlow 🛖 </h2>
          <ul className="menu-list">
            <li>
              <Link to="/" className="menu-link" onClick={handleLinkClick}>
                🏠 Accueil
              </Link>
            </li>

            <li>
              <Link to="/archives" className="menu-link" onClick={handleLinkClick}>
                ✅ Tâches terminées
              </Link>
            </li>

            <li>
              <Link to="/sessions" className="menu-link" onClick={handleLinkClick}>
                ⏱️ Sessions terminées
              </Link>
            </li>

            <li>
              <Link to="/fusion-tool" className="menu-link" onClick={handleLinkClick}>
                ⛩️ Fusion-Tool
              </Link>
            </li>

            <li>
            <Link to="/VersionHistory" className="menu-link" onClick={handleLinkClick}>
                ⛳ In Progress
              </Link>
            </li>


        

          </ul>
        </>
      )}
    </div>
  );
};

export default FloatingMenu;