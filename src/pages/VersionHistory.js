import React from "react";
import "./VersionHistory.css"; // Créez ce fichier pour les styles spécifiques à cette page

const VersionHistory = () => {
  return (
    <div className="version-history">
      <h1>Historique des Versions - TaskFlow</h1>
      <p>Bienvenue sur la page de l'historique des versions. Ici, vous trouverez des informations sur les différentes versions de l'application.</p>
      <ul>


        {/* Ajoutez d'autres versions ici */}
        <li>Version 1.4.2 - Intégration Calendrier, Pomodoro all pages, Historiques des versions, Graphique 10 jours, Amélioration css / 19.01.2025</li>
        <li>Version 1.3.1 - Démarrage du suivi versions</li>
        <li>Version 1.2.6 - Ajout de nouvelles fonctionnalités</li>
        <li>Version 1.1.6 - Correction de bugs et améliorations</li>
        <li>Version 1.0.0 - Initial release</li>

        {/* Ajoutez d'autres versions ici */}
      </ul>
    </div>
  );
};

export default VersionHistory;