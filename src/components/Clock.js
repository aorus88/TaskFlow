import React, { useState, useEffect } from "react";
import "./Clock.css"; // Importer les styles spécifiques

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Nettoyage pour éviter les fuites de mémoire
  }, []);


  return (
    <div className="clock-container"
          >
      
      
      <span className="clock-time">
        {time.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </span>

    </div>
  );
};

export default Clock;