import React, { useEffect, useState } from 'react';
import "./VersionHistory.css"; // Créez ce fichier pour les styles spécifiques à cette page

const VersionHistory = ({ isDarkMode, toggleDarkMode }) => { 

     // Ajout de l'état pour l'heure actuelle
      const [currentTime, setCurrentTime] = useState(new Date());
    
      // Mise à jour de l'heure chaque seconde
      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
      }, []);
      
      // Fonction pour formater l'heure
      const formatClock = (time) => {
        return time.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      };

  return (
    <div className="version-history">


<div className="statistics-container">
      <div className="statistics-header">
        <h2>⛩️ TaskFlow 1.3.7 ⛩️ _N_I_G_H_T_
        <button onClick={toggleDarkMode} className="dark-mode-button">
          {isDarkMode ? "🌚" : "🌞"}
        </button>_D_A_Y__
        🕒 {formatClock(currentTime)} 🕒</h2>
      </div>


      <h1>Historique Versions - TaskFlow 📈📊</h1>
      <p>Bienvenue sur la page de l'historique des versions. Ici, vous trouverez des informations sur les différentes versions de l'application.</p>
      <ul>


        {/* Ajoutez d'autres versions ici */}
        <li>Version 1.3.7 - publication prévue le 02.02.2025 à 20h00
          <ul> Update Fusion-Tool - stat-cards   </ul>          
          <ul> Update Suivi du temps - calendrier    </ul>
          <ul> Update Sessions-js - suppression entrées    </ul>
          <ul> Mise à jour du menu flottant    </ul>
          <ul>Suppression du pomodoro (graphique) sur archive.js</ul>

        </li>
        
        <li>Version 1.3.6 
          <ul> Intégration DarkMode + Horloge sur toutes les pages   </ul>          
          <ul> Améliorations de l'interface utilisateur   </ul>          
            </li>
        <li>Version 1.4.2 - Intégration Calendrier, Pomodoro all pages, Historiques des versions, Graphique 10 jours, Amélioration css / 19.01.2025</li>
        <li>Version 1.3.1 - Démarrage du suivi versions</li>
        <li>Version 1.2.6 - Ajout de nouvelles fonctionnalités</li>
        <li>Version 1.1.6 - Correction de bugs et améliorations</li>
        <li>Version 1.0.0 - Initial release</li>

        {/* Ajoutez d'autres versions ici */}
      </ul>
    </div>
    </div>
  );
};

export default VersionHistory;