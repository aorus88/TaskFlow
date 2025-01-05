import React, { createContext, useState, useEffect } from 'react';

export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTimeLeft = localStorage.getItem('timeLeft');
    return savedTimeLeft !== null ? JSON.parse(savedTimeLeft) : 25 * 60;
  });
  const [isRunning, setIsRunning] = useState(() => {
    const savedIsRunning = localStorage.getItem('isRunning');
    return savedIsRunning !== null ? JSON.parse(savedIsRunning) : false;
  });
  const [customDuration, setCustomDuration] = useState(() => {
    const savedCustomDuration = localStorage.getItem('customDuration');
    return savedCustomDuration !== null ? JSON.parse(savedCustomDuration) : 25;
  });
  const [selectedTaskId, setSelectedTaskId] = useState(() => {
    const savedSelectedTaskId = localStorage.getItem('selectedTaskId');
    return savedSelectedTaskId !== null ? JSON.parse(savedSelectedTaskId) : null;
  });
  const [sessionTime, setSessionTime] = useState(() => {
    const savedSessionTime = localStorage.getItem('sessionTime');
    return savedSessionTime !== null ? JSON.parse(savedSessionTime) : 0;
  });

  // Synchronize with local storage
  useEffect(() => {
    localStorage.setItem('timeLeft', JSON.stringify(timeLeft));
  }, [timeLeft]);

  useEffect(() => {
    localStorage.setItem('isRunning', JSON.stringify(isRunning));
  }, [isRunning]);

  useEffect(() => {
    localStorage.setItem('customDuration', JSON.stringify(customDuration));
  }, [customDuration]);

  useEffect(() => {
    localStorage.setItem('selectedTaskId', JSON.stringify(selectedTaskId));
  }, [selectedTaskId]);

  useEffect(() => {
    localStorage.setItem('sessionTime', JSON.stringify(sessionTime));
  }, [sessionTime]);

  const resetTimer = () => {
    setTimeLeft(customDuration * 60);
    setSessionTime(0);
    setIsRunning(false);
  };

  return (
    <TimerContext.Provider
      value={{
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
        resetTimer,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};