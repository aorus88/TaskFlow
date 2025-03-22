import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./AdditionalMenu.css";
import { Home } from "../icons/Home";
import { Activity } from "../icons/Activity";
import { Calendar1 } from "../icons/Calendar1"; 
import { Note } from "../icons/Note";
import { Settings } from "../icons/Settings";
import { Archive } from "../icons/Archive";
import { History } from "../icons/History";

const AdditionalMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <button className="menu-button" onClick={toggleMenu}>
        {isOpen ? <Home stroke="#333" /> : <Home stroke="#333" />}
      </button>
      {isOpen && (
        <div className="menu-items">
            <Link to="/" className="menu-link" onClick={toggleMenu}>
                <Home width={24} height={24} stroke="#ffffff" />
            </Link>

          <Link to="/fusion-tool" className="menu-link" onClick={toggleMenu}>
            <Activity width={24} height={24} stroke="#ffffff" />
          </Link>

          <Link to="/sessions" className="menu-link" onClick={toggleMenu}>
            <Calendar1 width={24} height={24} stroke="#ffffff" />
          </Link>

          <Link to="/notes" className="menu-link" onClick={toggleMenu}>
            <Note width={24} height={24} stroke="#ffffff" />
          </Link>

          <Link to="/settings" className="menu-link" onClick={toggleMenu}>
            <Settings width={24} height={24} stroke="#ffffff" />
          </Link>

          <Link to="/archives" className="menu-link" onClick={toggleMenu}>
            <Archive width={24} height={24} stroke="#ffffff" />
          </Link>

          <Link to="/versionHistory" className="menu-link" onClick={toggleMenu}>
            <History width={24} height={24} stroke="#ffffff" />
          </Link>
        </div>
      )}
    </>
  );
};

export default AdditionalMenu;