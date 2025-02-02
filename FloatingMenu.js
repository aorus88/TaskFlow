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
        {isOpen ? "⬅️" : "➡️"}
      </button>

      {isOpen && (
        <>

          {/* Titre menu flottant */}
          <h2 className="menu-title"> <p> </p> </h2>


          <ul className="menu-list">
            <li>
              <Link to="/" className="menu-link" onClick={handleLinkClick}>
              🏠 TaskFlow 🏠 <p></p>
              home.js
                 
              </Link>
            </li>

            <li>
              <Link to="/fusion-tool" className="menu-link" onClick={handleLinkClick}>
              🍂 4:20 🍂<p></p>
              Fusion-Tool.js
              </Link>
            </li>

            <li>
              <Link to="/sessions" className="menu-link" onClick={handleLinkClick}>
              ⏱️ Suivi du temps⏱️ <p></p>
              Sessions.js
              </Link>
            </li>
     

            <li>
            <Link to="/VersionHistory" className="menu-link" onClick={handleLinkClick}>
                ///// ⛳
                <p></p>VersionHistory.js
              </Link>
            </li>

            <li>
              <Link to="/archives" className="menu-link" onClick={handleLinkClick}>
                ///// 🔄️
                <p></p>/Archives.js
              </Link>
            </li>

            <li>
              <Link to="/settings" className="menu-link" onClick={handleLinkClick}>
                ///// ⚙️ (in progress)
                <p></p>Settings.js
              </Link>
            </li>

          

   

          </ul>
        </>
      )}
    </div>
  );
};

export default FloatingMenu;