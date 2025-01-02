import React, { useEffect, useContext, useState } from "react";
import "./PomodoroTimer.css"; // Assurez-vous que le fichier CSS est bien lié.
import { TimerContext } from "../context/TimerContext"; // Importer le contexte

const PomodoroTimer = ({ tasks, updateTaskTime }) => {
  const { timeLeft, setTimeLeft, isRunning, setIsRunning, customDuration, setCustomDuration, selectedTaskId, setSelectedTaskId, sessionTime, setSessionTime } = useContext(TimerContext);
  const [isPaused, setIsPaused] = useState(false);

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
            handleSessionEnd();
            return customDuration * 60; // Redémarrer le décompte
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, isPaused, setTimeLeft, setSessionTime, customDuration]);

  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      setSelectedTaskId(tasks[0]._id); // Réattribuer automatiquement si aucune sélection
      console.log("Tâche par défaut réattribuée :", tasks[0]._id);
    }
  }, [tasks, selectedTaskId]);

  useEffect(() => {
    console.log("Valeur de selectedTaskId :", selectedTaskId);
  }, [selectedTaskId]);

  const handleSessionEnd = async () => {
    if (!selectedTaskId) return;
  
    const sessionTimeInMinutes = Math.floor(sessionTime / 60); // Convertir en minutes
    const session = {
      duration: sessionTimeInMinutes,
      date: new Date(),
      taskName: tasks.find((task) => task._id === selectedTaskId)?.name,
    };
  
    try {
      const response = await fetch(
        `http://192.168.50.241:4000/tasks/${selectedTaskId}/sessions`,
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
      // Mettre à jour l'état local
      updateTaskTime(updatedTask._id, updatedTask);
      console.log("Session ajoutée :", updatedTask);
    } catch (error) {
      console.error("Erreur :", error);
    }
  
    setSessionTime(0); // Réinitialiser le temps de session
  };
  
  

  const startTimer = () => {
    if (!selectedTaskId) {
      alert("Veuillez sélectionner une tâche avant de démarrer le minuteur !");
      console.error("Aucune tâche sélectionnée !");
      return;
    }
    setIsRunning(true);
    setIsPaused(false);
    console.log("Minuteur démarré pour la tâche :", selectedTaskId);
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
    if (!selectedTaskId) {
      alert("Veuillez sélectionner une tâche avant d'arrêter !");
      console.error("Aucune tâche sélectionnée !");
      return;
    }

    setIsRunning(false);
    await handleSessionEnd();
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
        value={selectedTaskId || ""}
        onChange={(e) => {
          setSelectedTaskId(e.target.value);
          console.log("Tâche sélectionnée :", e.target.value); // Log ID sélectionné
        }}
        className="task-selector"
      >
        <option value="" disabled>
          Sélectionnez une tâche
        </option>
        {tasks.map((task) => (
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
          disabled={!selectedTaskId}
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
    </div>
  );
};

export default PomodoroTimer;