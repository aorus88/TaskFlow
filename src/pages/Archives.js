import React, { useState, useEffect } from "react";
import ArchivedTasks from "../components/ArchivedTasks";

const Archives = ({ 
  archivedTasks, 
  handleDeleteTask,
  onFetchArchivedTasks // <-- Nouvelle prop (optionnelle) pour charger les archives depuis l'API 
}) => {
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // (Optionnel) Charger les tâches archivées quand on arrive sur la page
  useEffect(() => {
    if (onFetchArchivedTasks) {
      onFetchArchivedTasks();
    }
  }, [onFetchArchivedTasks]);

  // Suppression d'une tâche archivée
  const handleDeleteArchivedTask = (taskId) => {
    handleDeleteTask(taskId, true); // true = tâche archivée
    setFeedbackMessage("Tâche archivée supprimée avec succès !");
    setTimeout(() => setFeedbackMessage(""), 3000);
  };

  return (
    <div className="archives-page">
      <h1>Tâches Archivées</h1>

      {/* Affichage du message de feedback */}
      {feedbackMessage && <div className="feedback-message">{feedbackMessage}</div>}

      <ArchivedTasks
        tasks={archivedTasks}
        handleDeleteTask={handleDeleteArchivedTask}
      />
    </div>
  );
};

export default Archives;
