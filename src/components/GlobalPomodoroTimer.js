import React, { useEffect, useContext, useState } from "react";
import { TimerContext } from "../context/TimerContext";

const GlobalPomodoroTimer = () => {
  const { timeLeft, setTimeLeft, isRunning, setIsRunning, customDuration, selectedTaskId, sessionTime, setSessionTime } = useContext(TimerContext);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timer;
    if (isRunning && !isPaused) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 0) {
            setSessionTime((prevSessionTime) => prevSessionTime + 1);
            return prevTime - 1;
          } else {
            clearInterval(timer);
            handleSessionEnd();
            return customDuration * 60; // Redémarrer le décompte
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, isPaused, setTimeLeft, setSessionTime, customDuration]);

  const handleSessionEnd = async () => {
    if (!selectedTaskId) {
      console.error("Aucune tâche sélectionnée !");
      return;
    }

    const sessionTimeInMinutes = Math.floor((customDuration * 60 - timeLeft) / 60); // Convertir en minutes
    const session = {
      duration: sessionTimeInMinutes,
      date: new Date(),
      archivedAt: new Date(), // Ajouter la date de fin de session
      taskName: selectedTaskId,
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

      // Redémarrer le décompte pour une nouvelle session
      setTimeLeft(customDuration * 60);
      setSessionTime(0);
      setIsRunning(true);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la session :", error);
    }
  };

  return null; // Ce composant ne rend rien visuellement
};

export default GlobalPomodoroTimer;