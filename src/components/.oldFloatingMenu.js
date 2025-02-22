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
          <h2 className="menu-title">Menu 🏠 </h2>
          <ul className="menu-list">
            <li>
              <Link to="/" className="menu-link" onClick={handleLinkClick}>
                🏠🏠🏠TaskFlow 
                <p className="menu-text-active"> /home.js  </p>
              </Link>
            </li>

            <li>
              <Link to="/fusion-tool" className="menu-link" onClick={handleLinkClick}>
              🍂🍂🍂 4:20 
                <p className="menu-text-active"> /Fusion-Tool.js   </p>
              </Link>
            </li>

            <li>
              <Link to="/sessions" className="menu-link" onClick={handleLinkClick}>
              ⏱️⏱️⏱️Tracking Time
                <p className="menu-text-active"> /Sessions.js  </p>
              </Link>
            </li>

            <li>
              <Link to="/archives" className="menu-link-inactive" onClick={handleLinkClick}>
                __Historique 🔄️
                <p className="menu-text-inactive"> /Archives.js  </p>
              </Link>
            </li>

            <li>
              <Link to="/VersionHistory" className="menu-link-inactive" onClick={handleLinkClick}>
                __In Progress ⛳
                <p className="menu-text-inactive"> /VersionHistory.js  </p>
              </Link>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default FloatingMenu;