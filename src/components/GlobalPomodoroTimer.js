import React, { useEffect, useContext, useState, useRef, useCallback } from "react";
import { TimerContext } from "../context/TimerContext";
import TaskForm from "./TaskForm"; // Importez TaskForm
import "./GlobalPomodoroTimer.css";

// Sons de notification
const NOTIFICATION_SOUNDS = {
  sessionComplete: '/sounds/session-complete.mp3',
};

const playSound = (soundType) => {
  try {
    const audio = new Audio(NOTIFICATION_SOUNDS[soundType]);
    audio.play().catch(error => {
      console.warn("Erreur lors de la lecture du son:", error);
    });
  } catch (error) {
    console.warn("Le navigateur ne supporte pas la lecture audio:", error);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////

const GlobalPomodoroTimer = ({ tasks = [], isPreview = false, fetchTasks, onAddTask, taskCategories = [] }) => {
  const {
    timeLeft,
    setTimeLeft,
    isRunning,
    setIsRunning,
    customDuration,
    setCustomDuration,
    selectedTaskId, // Utilisation depuis le contexte
    setSelectedTaskId, // Utilisation depuis le contexte
    sessionTime,
    setSessionTime,
  } = useContext(TimerContext);

  // États locaux
  const [isPaused, setIsPaused] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(() => {
    const saved = localStorage.getItem('pomodoroMinimized');
    return saved ? JSON.parse(saved) : true;
  });
  const [isManualStop, setIsManualStop] = useState(false);
  const [isFloating, setIsFloating] = useState(() => {
    const saved = localStorage.getItem('pomodoroPosition');
    return saved ? JSON.parse(saved) : true;
  });

  // Nouvel état pour la modale
  const [isTaskFormModalOpen, setIsTaskFormModalOpen] = useState(false);

  // Mettre à jour le gestionnaire pour sauvegarder l'état
  const handleMinimize = () => {
    setIsMinimized(prev => {
      const newValue = !prev;
      localStorage.setItem('pomodoroMinimized', JSON.stringify(newValue));
      return newValue;
    });
  };

  const isSubmitting = useRef(false);
  const timerRef = useRef(null);

  // Sauvegarder la position du pomodoro
  const togglePosition = () => {
    setIsFloating(prev => {
      const newValue = !prev;
      localStorage.setItem('pomodoroPosition', JSON.stringify(newValue));
      return newValue;
    });
  };

  // Restaurer la dernière tâche ou sous-tâche sélectionnée
  useEffect(() => {
    // Ne restaurer que si aucune tâche n'est encore sélectionnée
    if (!selectedTaskId) {
      const lastSelectedTaskId = localStorage.getItem('lastSelectedTaskId');
      if (lastSelectedTaskId) {
        const [type, id] = lastSelectedTaskId.split('-');
        const taskExists = type === 'task' 
          ? tasks.some(task => task._id === id)
          : tasks.some(task => task.subtasks?.some(subtask => subtask._id === id));
        
        if (taskExists) {
          setSelectedTaskId(lastSelectedTaskId);
          console.log("Dernière tâche/sous-tâche restaurée:", lastSelectedTaskId);
        }
      }
    }
  }, [tasks, selectedTaskId]);

  // Mettre à jour le compte des sessions
  useEffect(() => {
    if (selectedTaskId && tasks.length > 0) {
      const [type, id] = selectedTaskId.split('-');
      if (type === 'task') {
        const selectedTask = tasks.find(task => task._id === id);
        if (selectedTask) {
          const taskSessions = selectedTask.sessions.filter(s => s.type === 'task');
          setSessionCount(taskSessions.length);
        }
      } else {
        const parentTask = tasks.find(task => 
          task.subtasks?.some(subtask => subtask._id === id)
        );
        if (parentTask) {
          const subtaskSessions = parentTask.sessions.filter(s => 
            s.type === 'subtask' && s.targetId === id
          );
          setSessionCount(subtaskSessions.length);
        }
      }
    }
  }, [selectedTaskId, tasks]);

  // Gérer le timer avec durée précise
  useEffect(() => {
    if (isRunning && !isPaused) {
      let startTime = Date.now() - (sessionTime * 1000);
      
      timerRef.current = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        
        setTimeLeft((prevTime) => {
          if (prevTime > 0) {
            setSessionTime(elapsedTime);
            return customDuration * 60 - elapsedTime;
          } else {
            if (!sessionEnded && !isSubmitting.current) {
              handleSessionEnd(elapsedTime);
              setSessionEnded(true);
              startNewSession(); // Démarrer nouvelle session
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
  }, [isRunning, isPaused, customDuration, sessionEnded, sessionTime, setSessionTime]);

  const handleSessionEnd = async (totalSeconds = 0) => {
    if (!selectedTaskId || isSubmitting.current) return;

    try {
      isSubmitting.current = true;
      setIsRunning(false);
      
      const [type, id] = selectedTaskId.split('-');
      const sessionTimeInMinutes = Math.floor(totalSeconds / 60);

      // Trouver la tâche parente
      const parentTask = type === 'subtask' 
        ? tasks.find(task => task.subtasks?.some(st => st._id === id))
        : tasks.find(task => task._id === id);

      if (!parentTask) throw new Error("Tâche parente non trouvée");

      const session = {
        duration: sessionTimeInMinutes,
        date: new Date(),
        type: type, // 'task' ou 'subtask'
        targetId: id // ID de la tâche ou sous-tâche
      };

      const response = await fetch(
        `http://192.168.50.241:4000/tasks/${parentTask._id}/sessions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(session)
        }
      );

      if (!response.ok) throw new Error("Erreur lors de l'ajout de la session");

      setTimeLeft(customDuration * 60);
      setSessionTime(0);
      setSessionEnded(false);

      if (fetchTasks) await fetchTasks();
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      isSubmitting.current = false;
    }
  };

  const startNewSession = useCallback(() => {
    if (!isManualStop) {
      setTimeout(() => {
        setTimeLeft(customDuration * 60);
        setSessionTime(0);
        setSessionEnded(false);
        setIsRunning(true);
        playSound('sessionComplete'); // Ajouter le son
      }, 1000);
    }
  }, [customDuration, isManualStop, setTimeLeft, setSessionTime, setIsRunning]);

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
    setIsManualStop(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [customDuration, setTimeLeft, setSessionTime]);

  const completeAndAssignTime = useCallback(() => {
    if (!selectedTaskId) {
      alert("Veuillez sélectionner une tâche");
      return;
    }
    setIsManualStop(true);
    handleSessionEnd(sessionTime);
  }, [selectedTaskId, sessionTime]);

  const handleDurationChange = useCallback((value) => {
    const minutes = Number(value);
    if (minutes > 0) {
      setCustomDuration(minutes);
      setTimeLeft(minutes * 60);
    }
  }, [setCustomDuration, setTimeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTaskNameWithIcon = (selectedTaskId, tasks) => {
    if (!selectedTaskId || !tasks?.length) {
      return "Aucune tâche sélectionnée";
    }

    const [type, id] = selectedTaskId.split('-');

    if (type === 'subtask') {
      const parentTask = tasks.find(task =>
        task.subtasks?.some(subtask => subtask._id === id)
      );
      if (parentTask) {
        const subtask = parentTask.subtasks.find(st => st._id === id);
        return subtask ? `🆎 ${parentTask.name} > ${subtask.name}` : "Sous-tâche non trouvée";
      }
    } else {
      const task = tasks.find(t => t._id === id);
      return task ? `🅰️ ${task.name}` : "Tâche non trouvée";
    }
    return "Tâche non trouvée";
  };

  if (!tasks?.length) {
    return <div>Aucune tâche disponible</div>;
  }

  const progress = ((customDuration * 60 - timeLeft) / (customDuration * 60)) * 100;
  const segments = 60;
  const segmentProgress = 100 / segments;
  const activeSegments = Math.floor(progress / segmentProgress);

  return (
    <div className={`pomodoro-timer ${!isPreview ? (isFloating ? 'floating' : 'docked') : ''} ${isMinimized ? 'minimized' : ''}`}>
      <div className="pomodoro-timer__header">
        <h1 className="pomodoro-timer-header-timer">{formatTime(timeLeft)} ⏱️</h1>




        
        <h1 className="pomodoro-timer-header-taskname">{getTaskNameWithIcon(selectedTaskId, tasks)}

        <select
          value={selectedTaskId || ""}
          onChange={(e) => {
            setSelectedTaskId(e.target.value);
            localStorage.setItem('lastSelectedTaskId', e.target.value);
          }}
          className="pomodoro-timer__selector"
        >
          <option value="" disabled>Sélectionnez une tâche</option>
          {tasks.slice().reverse().map((task) => (
            <React.Fragment key={task._id}>
              <option value={`task-${task._id}`}>
                {task.name}
              </option>
              {/* Filtrer les sous-tâches non archivées */}
              {task.subtasks
            ?.filter(subtask => subtask.archived !== "closed")
            .map((subtask) => (
              <option key={subtask._id} value={`subtask-${subtask._id}`}>
                ├─ {subtask.name}
              </option>
            ))}
        </React.Fragment>
          ))}
        </select>


        </h1>
        <h3></h3>
        <div className="pomodoro-timer__controls">
          <button 
            className="dock-button"
            onClick={togglePosition}
          >
            {isFloating ? '📌' : '📌'}
          </button>
          <button 
            className="minimize-button"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? '📂' : '📁'}
          </button>
          {/* Emojis conditionnels */}
          {isMinimized && (
            <>
              <button className="emoji-button" onClick={startTimer} disabled={!selectedTaskId || isRunning}>
                ▶️
              </button>
              <button className="emoji-button" onClick={pauseResumeTimer} disabled={!isRunning}>
                {isPaused ? "⏯️" : "⏸️"}
              </button>
              <button className="emoji-button" onClick={completeAndAssignTime} disabled={!selectedTaskId}>
                ✅
              </button>
              <button className="emoji-button" onClick={resetTimer}>
                ⛔
              </button>
            </>
          )}
          {/* Nouveau bouton pour ouvrir la modale */}
          <button className="pomodoro-button-add" onClick={() => setIsTaskFormModalOpen(true)}>➕ Ajouter Tâche</button>
        </div>
      </div>

      {/* Barre de progression visible même en mode minimisé */}
      <div className="pomodoro-timer__progress-bar minimized-progress-bar">
        {Array.from({ length: segments }).map((_, index) => (
          <div
            key={index}
            className={`progress-bar-segment ${index < activeSegments ? "active" : "inactive"}`}
            style={{ width: `${segmentProgress}%` }}
          />
        ))}
      </div>

      

      <div className={`pomodoro-timer__content ${isMinimized ? 'hidden' : ''}`}>




        
        <div className="pomodoro-timer__container">
          <span className="pomodoro-timer__display">{formatTime(timeLeft)}</span>
        </div>



        <input
          type="number"
          value={customDuration}
          onChange={(e) => handleDurationChange(e.target.value)}
          min="1"
          placeholder="Durée (min)"
          className="pomodoro-timer__input"
        />

        <div className="pomodoro-timer__buttons">
          <button onClick={startTimer} className="start-button" disabled={!selectedTaskId || isRunning}>
            Démarrer ⏱️
          </button>
          <button onClick={pauseResumeTimer} className="pause-button" disabled={!isRunning}>
            {isPaused ? "Reprendre ⏯️" : "Pause ⏸️"}
          </button>
          <button onClick={completeAndAssignTime} className="stop-button" disabled={!selectedTaskId}>
            Terminé ✅
          </button>
          <button onClick={resetTimer} className="reset-button">
            Réinitialiser 🛑
          </button>
        </div>

      </div>

      {/* Modale pour TaskForm */}
      {isTaskFormModalOpen && (
    <div className="modal-overlay">
    <div className="modal-content">
      <button onClick={() => setIsTaskFormModalOpen(false)}>❌</button>
      <TaskForm
        onAddTask={async (task) => {
          await onAddTask(task); // Appelle la fonction onAddTask passée en prop
          setIsTaskFormModalOpen(false);
          if (fetchTasks) await fetchTasks();
        }}
        taskCategories={taskCategories}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default GlobalPomodoroTimer;