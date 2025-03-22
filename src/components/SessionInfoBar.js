import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const SessionInfoBar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [timeSinceLogin, setTimeSinceLogin] = useState(0);
  const [loginTime] = useState(() => {
    // Si on recharge la page, on utilise l'heure stockée ou l'heure actuelle
    const storedTime = localStorage.getItem('loginTimestamp');
    return storedTime ? new Date(parseInt(storedTime)) : new Date();
  });

  // Stocker l'heure de connexion dans localStorage
  useEffect(() => {
    if (currentUser && !localStorage.getItem('loginTimestamp')) {
      localStorage.setItem('loginTimestamp', Date.now().toString());
    }
  }, [currentUser]);

  // Mettre à jour le temps écoulé toutes les secondes
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diffInSeconds = Math.floor((now - loginTime) / 1000);
      setTimeSinceLogin(diffInSeconds);
    }, 1000);

    return () => clearInterval(timer);
  }, [loginTime]);

  // Formater le temps en heures:minutes:secondes
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    // Supprimer le timestamp de connexion
    localStorage.removeItem('loginTimestamp');
    logout();
  };

  if (!currentUser) return null;

  return (
    <div className="session-info-bar">
      <div className="session-user-info">
        <span className="user-emoji">👤</span>
        <span className="username">{currentUser.username}</span>
      </div>
      <div className="connection-info">
        <span className="connection-emoji">🟢</span>
        <span className="connection-time">Connecté depuis: {formatTime(timeSinceLogin)}</span>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Déconnexion
      </button>
    </div>
  );
};

export default SessionInfoBar;
