import React, { useEffect, useState } from 'react';
import "./VersionHistory.css"; // Créez ce fichier pour les styles spécifiques à cette page
import AdditionalMenu from "../components/AdditionalMenu";

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
 

      <h1>Historique Versions </h1>
      <p>Bienvenue sur la page de l'historique des versions. Ici, vous trouverez des informations sur les différentes versions de l'application.</p>
      <ul>
          <li><strong>Version 1.4.1 - 17 mars 2025</strong>
              <ul>Interface FusionTool repensée pour une utilisation plus intuitive</ul>
              <ul>Nouvelle méthode de saisie des entrées via deux boutons principaux (consommation/non-consommation)</ul>
              <ul>Sélecteur d'humeurs amélioré avec organisation par catégories (Positif/Négatif/Autre)</ul>
              <ul>Interface adaptée aux appareils mobiles (spécialement iOS)</ul>
              <ul>Correction des problèmes de fuseaux horaires pour les entrées de consommation</ul>
              <ul>Rafraîchissement automatique des données lors des modifications</ul>
              <ul>Optimisation des performances de l'application</ul>
          </li>
            
          <li><strong>Version 1.4.0</strong>
              <ul> Mise à jour général source-code     </ul>
              <ul> Préparation à la 1ère prise en main 24 février 2025   </ul>
          </li>


            <li><strong>Version 1.3.7 - publication prévue le 02.02.2025 à 20h00</strong>
              <ul> Update Fusion-Tool - stat-cards   </ul>          
              <ul> Update Suivi du temps - calendrier    </ul>
              <ul> Update Sessions-js - suppression entrées    </ul>
              <ul> Mise à jour du menu flottant    </ul>
              <ul>Suppression du pomodoro (graphique) sur archive.js</ul>

            </li>
            
            <li><strong>Version 1.3.6</strong>
              <ul> Intégration DarkMode + Horloge sur toutes les pages   </ul>          
              <ul> Améliorations de l'interface utilisateur   </ul>          
            </li>
            <li><strong>Version 1.4.2 </strong>
              <ul>Intégration Calendrier</ul>
              <ul>Pomodoro all pages</ul>
              <ul>Historiques des versions</ul>
              <ul>Graphique 10 jours</ul>
              <ul>Amélioration css / 19.01.2025</ul>
              </li>
            <li><strong>Version 1.3.1 - Démarrage du suivi versions</strong></li>
            <li><strong>Version 1.2.6 - Ajout de nouvelles fonctionnalités</strong></li>
            <li><strong>Version 1.1.6 - Correction de bugs et améliorations</strong></li>
            <li><strong>Version 1.0.0 - Initial release</strong></li>
      </ul>
    </div>
    </div>
  );
};

export default VersionHistory;