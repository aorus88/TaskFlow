import React, { useEffect, useContext, useState } from "react";
import "./PomodoroTimer.css"; // Assurez-vous que le fichier CSS est bien lié.
import { TimerContext } from "../context/TimerContext"; // Importer le contexte

const PomodoroTimer = ({ tasks, updateTaskTime, reloadTasks }) => { // Ajoutez reloadTasks ici
  const { timeLeft, setTimeLeft, isRunning, setIsRunning, customDuration, setCustomDuration, selectedTaskId, setSelectedTaskId, sessionTime, setSessionTime } = useContext(TimerContext);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionCount, setSessionCount] = useState(0); // Compteur de sessions
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null); // Index de la tâche actuelle

  useEffect(() => {
    console.log("Tâches disponibles :", tasks); // Vérifie si les tâches sont chargées
    let timer;
    if (isRunning && !isPaused) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 0) {
            setSessionTime((prevSessionTime) => prevSessionTime + 1);
            return prevTime - 1;
          } else {
            handleSessionEnd(prevTime);
            return customDuration * 60; // Redémarrer le décompte
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, isPaused, setTimeLeft, setSessionTime, customDuration]);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      if (currentTaskIndex === null || !tasks[currentTaskIndex]) {
        setCurrentTaskIndex(0); // Initialiser avec la première tâche valide
        setSelectedTaskId(tasks[0]._id); // Réattribuer automatiquement si aucune sélection
        console.log("Tâche par défaut réattribuée :", tasks[0]._id);
      }
    } else {
      setCurrentTaskIndex(null); // Réinitialiser si aucune tâche
    }
  }, [tasks, currentTaskIndex, setSelectedTaskId]);

  useEffect(() => {
    console.log("Valeur de selectedTaskId :", selectedTaskId);
    if (selectedTaskId) {
      const selectedTask = tasks.find((task) => task._id === selectedTaskId);
      if (selectedTask) {
        setSessionCount(selectedTask.sessions.length); // Mettre à jour le compteur de sessions
      }
    }
  }, [selectedTaskId, tasks]);

  const handleSessionEnd = async (prevTime) => {
    if (currentTaskIndex === null || !tasks[currentTaskIndex]) {
      console.error("Aucune tâche sélectionnée ou l'index est invalide.");
      return;
    }

    const selectedTask = tasks[currentTaskIndex];

    if (!selectedTask || !selectedTask._id) {
      console.error("ID de la tâche sélectionnée introuvable.");
      return;
    }

    const sessionTimeInMinutes = Math.floor((customDuration * 60 - prevTime) / 60); // Convertir en minutes
    const session = {
      duration: sessionTimeInMinutes,
      date: new Date(),
      archivedAt: new Date(), // Ajouter la date de fin de session
      taskName: selectedTask.name,
    };

    console.log("ID de la tâche sélectionnée :", selectedTask._id); // Log ID de la tâche sélectionnée
    console.log("Session à envoyer :", session); // Log des données de la session

    try {
      const response = await fetch(
        `http://192.168.50.241:4000/tasks/${selectedTask._id}/sessions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(session),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la session au backend.");
      }

      const updatedTask = await response.json();

      // Mettre à jour localement l'état des tâches
      updateTaskTime(updatedTask._id, updatedTask);
      console.log("Session ajoutée :", updatedTask);

      // Mettre à jour le compteur de sessions
      setSessionCount(updatedTask.sessions.length);

      // Recharger les tâches pour mettre à jour les données
      reloadTasks();
    } catch (error) {
      console.error("Erreur :", error);
    }

    setSessionTime(0); // Réinitialiser le temps de session
    setTimeLeft(customDuration * 60); // Réinitialiser le minuteur
  };

  const startTimer = () => {
    if (currentTaskIndex === null || !tasks[currentTaskIndex]) {
      alert("Veuillez sélectionner une tâche avant de démarrer le minuteur !");
      console.error("Aucune tâche sélectionnée !");
      return;
    }
    setIsRunning(true);
    setIsPaused(false);
    console.log("Minuteur démarré pour la tâche :", tasks[currentTaskIndex]._id);
  };

  const pauseResumeTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customDuration * 60);
    setSessionTime(0);
  };

  const stopAndAssignTime = async () => {
    if (currentTaskIndex === null || !tasks[currentTaskIndex]) {
      alert("Veuillez sélectionner une tâche avant d'arrêter !");
      console.error("Aucune tâche sélectionnée !");
      return;
    }

    setIsRunning(false);
    await handleSessionEnd(timeLeft);
    setTimeLeft(customDuration * 60);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!tasks || tasks.length === 0) {
    return <div>Aucune tâche disponible. Veuillez en ajouter une pour commencer.</div>;
  }

  const progress = ((customDuration * 60 - timeLeft) / (customDuration * 60)) * 100;
  const segments = 60; // Augmenter le nombre de segments pour une progression plus fluide
  const segmentProgress = 100 / segments;
  const activeSegments = Math.floor(progress / segmentProgress);

  return (
    <div className="pomodoro-timer">
      <h1 className="timer-header">Minuteur Pomodoro</h1>
      <div className="timer-container">
        <div className="progress-bar-container">
          {Array.from({ length: segments }).map((_, index) => (
            <div
              key={index}
              className={`progress-bar-segment ${index < activeSegments ? "active" : "inactive"}`}
              style={{ width: `${segmentProgress}%` }}
            ></div>
          ))}
        </div>
        <span className="timer-display">{formatTime(timeLeft)}</span>
      </div>
      <select
        value={currentTaskIndex !== null ? tasks[currentTaskIndex]._id : ""}
        onChange={(e) => {
          const index = tasks.findIndex(task => task._id === e.target.value);
          setCurrentTaskIndex(index);
          setSelectedTaskId(e.target.value);
          console.log("Tâche sélectionnée :", e.target.value); // Log ID sélectionné
        }}
        className="task-selector"
      >
        <option value="" disabled>
          Sélectionnez une tâche
        </option>
        {tasks.map((task, index) => (
          <option key={task._id} value={task._id}>
            {task.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={customDuration}
        onChange={(e) => setCustomDuration(Number(e.target.value))}
        min="1"
        placeholder="Durée (min)"
        className="duration-input"
      />
      <div className="timer-buttons">
        <button 
          onClick={startTimer} 
          className="start-button"
          disabled={currentTaskIndex === null}
        > 
          Démarrer
        </button>
        <button 
          onClick={pauseResumeTimer} 
          className="pause-button"
        >
          {isPaused ? "Reprendre" : "Pause"} 
        </button>
        <button 
          onClick={stopAndAssignTime} 
          className="stop-button"
        >
          Arrêter & Attribuer
        </button>
        <button 
          onClick={resetTimer} 
          className="reset-button"
        >
          Réinitialiser
        </button>
      </div>
      <div className="session-info">
        <p>Sessions complétées : {sessionCount}</p>
      </div>
    </div>
  );
};

export default PomodoroTimer;