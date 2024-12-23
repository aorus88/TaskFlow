import React, { useState, useEffect } from "react";
import "./timer.css"; // Assurez-vous que le fichier CSS est bien lié.

const GlobalPomodoroTimer = ({ tasks, updateTaskTime }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customDuration, setCustomDuration] = useState(25);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            setIsRunning(false);
            return 0;
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const startTimer = () => {
    if (!selectedTaskId) {
      alert("Veuillez sélectionner une tâche !");
      return;
    }
    setTimeLeft(customDuration * 60);
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customDuration * 60);
  };

  const stopAndAssignTime = () => {
    if (!selectedTaskId) {
      alert("Veuillez sélectionner une tâche !");
      return;
    }

    const timeSpent = customDuration * 60 - timeLeft;

    if (timeSpent <= 0) {
      alert("Aucun temps n'a été passé !");
      setIsRunning(false);
      setTimeLeft(customDuration * 60);
      return;
    }

    setIsRunning(false);
    updateTaskTime(selectedTaskId, timeSpent);

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

  return (
    <div className="global-pomodoro-timer">
      <h4 className="timer-header">Minuteur Global</h4>
      <div className="timer-container">
        <div
          className="progress-circle"
          style={{ background: `conic-gradient(#4caf50 ${progress}%, #ddd ${progress}%)` }}
        >
          <span className="timer-display">{formatTime(timeLeft)}</span>
        </div>
      </div>
      <select
        value={selectedTaskId || ""}
        onChange={(e) => setSelectedTaskId(e.target.value)}
        className="task-selector"
      >
        <option value="" disabled>
          Sélectionnez une tâche
        </option>
        {tasks.map((task) => (
          <option key={task.id} value={task.id}>
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
        <button onClick={startTimer} className="start-button">
          Démarrer
        </button>
        <button onClick={pauseTimer} className="pause-button">
          Pause
        </button>
        <button onClick={stopAndAssignTime} className="stop-button">
          Arrêter & Attribuer
        </button>
        <button onClick={resetTimer} className="reset-button">
          Réinitialiser
        </button>
      </div>
    </div>
  );
};

export default GlobalPomodoroTimer;
