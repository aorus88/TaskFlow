
import React, { useState, useEffect, useContext } from "react";
import { TimerContext } from "../context/TimerContext";

const PomodoroTimer = ({ tasks }) => {
  const {
    timeLeft,
    setTimeLeft,
    isRunning,
    setIsRunning,
    customDuration,
    setCustomDuration, // Assurez-vous que setCustomDuration est importé
    selectedTaskId,
    setSelectedTaskId,
    sessionTime,
    setSessionTime,
  } = useContext(TimerContext);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);

  // Synchronize selected task session count
  useEffect(() => {
    if (selectedTaskId && tasks.length > 0) {
      const selectedTask = tasks.find((task) => task._id === selectedTaskId);
      if (selectedTask) {
        setSessionCount(selectedTask.sessions.length);
      }
    }
  }, [selectedTaskId, tasks]);

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

  const stopAndAssignTime = () => {
    if (currentTaskIndex === null || !tasks[currentTaskIndex]) {
      alert("Veuillez sélectionner une tâche avant d'arrêter !");
      console.error("Aucune tâche sélectionnée !");
      return;
    }

    setIsRunning(false);
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
      <h1 className="timer-header">Minuteur Pomodoro 🏔️</h1>
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
