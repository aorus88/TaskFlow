import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaArchive, FaChartLine, FaStickyNote, FaCog, FaHistory } from 'react-icons/fa';
import './AdditionalMenu.css';

const AdditionalMenu = ({ position = "side" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Classes CSS basées sur la position (top ou side)
  const menuContainerClass = position === "top" ? "horizontal-menu" : "additional-menu";
  const menuClass = position === "top" ? "horizontal-menu-content" : "menu-content";

  return (
    <>
      <div className={menuContainerClass}>
        <div className={menuClass}>
          <Link to="/" className="menu-link">
            <FaHome size={24} color="#ffffff" />
            {position === "top" && <span>Accueil</span>}
          </Link>

          <Link to="/sessions" className="menu-link">
            <FaCalendarAlt size={24} color="#ffffff" />
            {position === "top" && <span>Sessions</span>}
          </Link>

          <Link to="/fusion-tool" className="menu-link">
            <FaChartLine size={24} color="#ffffff" />
            {position === "top" && <span>Fusion</span>}
          </Link>

          <Link to="/notes" className="menu-link">
            <FaStickyNote size={24} color="#ffffff" />
            {position === "top" && <span>Notes</span>}
          </Link>

          <Link to="/settings" className="menu-link">
            <FaCog size={24} color="#ffffff" />
            {position === "top" && <span>Paramètres</span>}
          </Link>

          <Link to="/archives" className="menu-link">
            <FaArchive size={24} color="#ffffff" />
            {position === "top" && <span>Archives</span>}
          </Link>

          <Link to="/versionHistory" className="menu-link">
            <FaHistory size={24} color="#ffffff" />
            {position === "top" && <span>Historique</span>}
          </Link>
        </div>
      </div>
    </>
  );
};

export default AdditionalMenu;