import React, { useEffect, useContext, useState, useRef, useCallback } from "react";
import { TimerContext } from "../context/TimerContext";
import "./GlobalPomodoroTimer.css";

const GlobalPomodoroTimer = ({ tasks = [], isPreview = false }) => {
  const {
    timeLeft,
    setTimeLeft,
    isRunning,
    setIsRunning,
    customDuration,
    setCustomDuration,
    selectedTaskId,
    setSelectedTaskId,
    sessionTime,
    setSessionTime,
  } = useContext(TimerContext);

  // États locaux
  const [isPaused, setIsPaused] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const isSubmitting = useRef(false);
  const timerRef = useRef(null);

  // Mettre à jour le compte des sessions
  useEffect(() => {
    if (selectedTaskId && tasks.length > 0) {
      const selectedTask = tasks.find((task) => task._id === selectedTaskId);
      if (selectedTask) {
        setSessionCount(selectedTask.sessions.length);
      }
    }
  }, [selectedTaskId, tasks]);

  // Gérer le timer
// Gérer le timer avec durée précise
useEffect(() => {
  if (isRunning && !isPaused) {
    let startTime = Date.now() - (sessionTime * 1000); // Conversion en millisecondes
    
    timerRef.current = setInterval(() => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          setSessionTime(elapsedTime);
          return customDuration * 60 - elapsedTime;
        } else {
          if (!sessionEnded && !isSubmitting.current) {
            console.log(`Session terminée. Durée totale: ${elapsedTime} secondes`);
            handleSessionEnd(elapsedTime);
            setSessionEnded(true);
          }
          return 0;
        }
      });
    }, 1000);
  }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused, customDuration, sessionEnded]);

// Gérer la fin de session avec durée précise
const handleSessionEnd = async (totalSeconds = 0) => {
  if (!selectedTaskId || isSubmitting.current) {
    return;
  }

  try {
    isSubmitting.current = true;
    setIsRunning(false);

    // Calcul précis de la durée en minutes
    const sessionTimeInMinutes = Math.max(Math.ceil(totalSeconds / 60), 1);
    console.log(`Temps de session: ${totalSeconds} secondes (${sessionTimeInMinutes} minutes)`);

    const session = {
      duration: sessionTimeInMinutes,
      date: new Date(),
    };

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
      throw new Error("Erreur lors de l'ajout de la session");
    }

    setTimeLeft(customDuration * 60);
    setSessionTime(0);
    setSessionEnded(false);
    
    console.log("Session ajoutée avec succès:", session);
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    isSubmitting.current = false;
  }
};











  // Gérer le changement de durée
  const handleDurationChange = useCallback((value) => {
    const minutes = Number(value);
    if (minutes > 0) {
      setCustomDuration(minutes);
      setTimeLeft(minutes * 60);
      console.log(`Durée définie: ${minutes} minutes (${minutes * 60} secondes)`);
    }
  }, [setCustomDuration, setTimeLeft]);


  // Actions du timer
  const startTimer = useCallback(() => {
    if (!selectedTaskId) {
      alert("Veuillez sélectionner une tâche");
      return;
    }
    setIsRunning(true);
    setIsPaused(false);
    setSessionEnded(false);
  }, [selectedTaskId, setIsRunning]);

  const pauseResumeTimer = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(customDuration * 60);
    setSessionTime(0);
    setSessionEnded(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [customDuration, setTimeLeft, setSessionTime]);

  const stopAndAssignTime = useCallback(() => {
    if (!selectedTaskId) {
      alert("Veuillez sélectionner une tâche");
      return;
    }
    handleSessionEnd();
  }, [selectedTaskId]);

  // Formatage du temps
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  if (!tasks?.length) {
    return <div>Aucune tâche disponible</div>;
  }

  const progress = ((customDuration * 60 - timeLeft) / (customDuration * 60)) * 100;
  const segments = 60;
  const segmentProgress = 100 / segments;
  const activeSegments = Math.floor(progress / segmentProgress);

  return (
    <div className={`pomodoro-timer ${isPreview ? "preview" : ""}`}>
      <h1 className="timer-header">Minuteur Pomodoro 🏔️</h1>
      <div className="timer-container">
        <div className="progress-bar-container">
          {Array.from({ length: segments }).map((_, index) => (
            <div
              key={index}
              className={`progress-bar-segment ${index < activeSegments ? "active" : "inactive"}`}
              style={{ width: `${segmentProgress}%` }}
            />
          ))}
        </div>
        <span className="timer-display">{formatTime(timeLeft)}</span>
      </div>
      {!isPreview && (
        <>
          <select
            value={selectedTaskId || ""}
            onChange={(e) => {
              const taskId = e.target.value;
              const index = tasks.findIndex(task => task._id === taskId);
              setCurrentTaskIndex(index);
              setSelectedTaskId(taskId);
            }}
            className="task-selector"
          >
            <option value="" disabled>Sélectionnez une tâche</option>
            {tasks.map((task) => (
              <option key={task._id} value={task._id}>
                {task.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={customDuration}
            onChange={(e) => handleDurationChange(e.target.value)}
            min="1"
            placeholder="Durée (min)"
            className="duration-input"
          />
          <div className="timer-buttons">
            <button onClick={startTimer} className="start-button" disabled={!selectedTaskId || isRunning}>
              Démarrer
            </button>
            <button onClick={pauseResumeTimer} className="pause-button" disabled={!isRunning}>
              {isPaused ? "Reprendre" : "Pause"}
            </button>
            <button onClick={stopAndAssignTime} className="stop-button" disabled={!selectedTaskId}>
              Arrêter & Attribuer
            </button>
            <button onClick={resetTimer} className="reset-button">
              Réinitialiser
            </button>
          </div>
        </>
      )}
      <div className="session-info">
        <p>Sessions complétées : {sessionCount}</p>
      </div>
    </div>
  );
};

export default GlobalPomodoroTimer;