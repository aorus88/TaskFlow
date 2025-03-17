import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./AdditionalMenu.css";

const AdditionalMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <button className="menu-button" onClick={toggleMenu}>
        {isOpen ? "🏠" : "🏠"}
      </button>
      {isOpen && (
        <div className="menu-items">
            <Link to="/" className="menu-link" onClick={toggleMenu}>
                <span role="img" aria-label="Home">📬</span></Link>

          <Link to="/fusion-tool" className="menu-link" onClick={toggleMenu}>
            <span role="img" aria-label="Fusion Tool">⛩️</span>
          </Link>

          <Link to="/sessions" className="menu-link" onClick={toggleMenu}>
            <span role="img" aria-label="Sessions">📆</span>
          </Link>

          
          <Link to="/notes" className="menu-link" onClick={toggleMenu}>
            <span role="img" aria-label="Notes">📝</span>
            </Link>
      

      

          <Link to="/settings" className="menu-link" onClick={toggleMenu}>
            <span role="img" aria-label="Settings">⚙️</span>
          </Link>

      

            <Link to="/archives" className="menu-link" onClick={toggleMenu}>
            <span role="img" aria-label="Archives">📪</span>
          </Link>

          <Link to="/versionHistory" className="menu-link" onClick={toggleMenu}>
            <span role="img" aria-label="Version History">📜</span>
          </Link>

        
        </div>
      )}
    </>
  );
};

export default AdditionalMenu;