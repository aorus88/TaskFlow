
import React, { useEffect, useContext, useState } from "react";
import { TimerContext } from "../context/TimerContext";

const GlobalPomodoroTimer = () => {
  const {
    timeLeft,
    setTimeLeft,
    isRunning,
    setIsRunning,
    customDuration,
    selectedTaskId,
    sessionTime,
    setSessionTime,
  } = useContext(TimerContext);
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
            handleSessionEnd(); // Trigger session end only once
            return customDuration * 60; // Restart timer for new session
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

    try {
      // Prevent redundant calls by stopping the timer immediately
      setIsRunning(false);

      const sessionTimeInMinutes = Math.floor(sessionTime / 60); // Convert session time to minutes
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
        throw new Error("Erreur lors de l'ajout de la session au backend.");
      }

      // Reset timer and session for the next cycle
      setTimeLeft(customDuration * 60);
      setSessionTime(0);

      console.log("Session ajoutée avec succès :", session);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la session :", error);
    }
  };

  return null; // This component does not render anything visually
};

export default GlobalPomodoroTimer;
