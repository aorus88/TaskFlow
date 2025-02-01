import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TaskFilters_Sessions from '../components/TaskFilters_Sessions'; // Importer le nouveau composant TaskFilters_Sessions
import './Sessions.css';
import GlobalPomodoroTimer from "../components/GlobalPomodoroTimer"; // Importer le composant GlobalPomodoroTimer
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import 'moment/locale/fr'; // Importer la locale française pour moment


const localizer = momentLocalizer(moment);

const taskCategories = [
  "Travail 💼",
  "Personnel 🐈",
  "NewHorizon ⛳",
  "Finances 💵",
  "Jeux vidéos 🎮",
  "Maison 🏠",
  "Achats 🛒",
  "TaskFlow ⛩️",
  "Cuisine 🍳",
  "Sport 🏋️",
  "Santé 🏥",
  "Loisirs 🎨",
  "Études 📚",
  "Famille 👨‍👩‍👧‍👦",
  "Amis 👫",
  "Voyages 🌍",
  "Bricolage 🛠️",
  "Lego 🧱",
  "Jardinage 🌷",
  "Meditation 🧘",
  "Musique 🎵",
  "Podcast 🎙️",
  "Lecture 📖",
  "Film 🎬",
  "Série 📺",
  "YouTube 📹",
  "Informatique 🖥️",
  "Autre 📝",
];

const Sessions = ({ isDarkMode, toggleDarkMode }) => { 
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]); // Ajouter un état pour les tâches
  const [filter, setFilter] = useState({
    date: '',
    sortOrder: 'newest',
    taskId: '',
    categories: '',
  });

   // Ajout de l'état pour l'heure actuelle
    const [currentTime, setCurrentTime] = useState(new Date());
  
    // Mise à jour de l'heure chaque seconde
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(interval);
    }, []);
    
    // Fonction pour formater l'heure
    const formatClock = (time) => {
      return time.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

  useEffect(() => {
    const fetchTasksAndSessions = async () => {
      try {
        const response = await fetch('http://192.168.50.241:4000/tasks?archived=false');
        const data = await response.json();
        if (Array.isArray(data)) {
          const openTasks = data.filter(task => task.archived === 'open');
          setTasks(openTasks); // Mettre à jour l'état des tâches
          const allSessions = openTasks.flatMap(task => task.sessions.map(session => {
            const start = new Date(session.date);
            const end = new Date(new Date(session.date).getTime() + session.duration * 60000); // Calculer l'heure de fin
            return {
              ...session,
              taskId: task._id, // Ajouter l'ID de la tâche à la session
              taskName: task.name,
              totalTime: task.totalTime,
              categories: task.categories,
              start: isNaN(start) ? null : start,
              end: isNaN(end) ? null : end,
            };
          }));
          console.log("Sessions formatées :", allSessions); // Log pour vérifier les données des sessions
          setSessions(allSessions);
        } else {
          console.error('Les données reçues ne sont pas un tableau:', data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des tâches et sessions:', error);
      }
    };

    fetchTasksAndSessions();
  }, []);

  // Fonction pour supprimer une session
  const handleDeleteSession = async (taskId, sessionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      return;
    }
    try {
      const response = await fetch(
        `http://192.168.50.241:4000/tasks/${taskId}/sessions/${sessionId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la session');
      }

      // Mettre à jour l'état local après la suppression
      setSessions(sessions.filter(session => session._id !== sessionId));
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression de la session');
    }
  };

  // Fonction pour trier les sessions
  const sortedSessions = sessions.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return filter.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

    // Fonction pour obtenir la couleur de la session en fonction de la catégorie
    const getSessionStyle = (categories) => {
      const styles = {
        "Travail 💼": { backgroundColor: 'rgba(255, 223, 186, 0.8)', color: '#000000' },
        "Personnel 🐈": { backgroundColor: 'rgba(255, 192, 203, 0.8)', color: '#000000' },
        "NewHorizon ⛳": { backgroundColor: 'rgba(255, 255, 0, 0.8)', color: '#000000' },
        "Finances 💵": { backgroundColor: 'rgba(144, 238, 144, 0.8)', color: '#000000' },
        "Jeux vidéos 🎮": { backgroundColor: 'rgba(221, 160, 221, 0.8)', color: '#000000' },
        "Maison 🏠": { backgroundColor: 'rgba(255, 228, 181, 0.8)', color: '#000000' },
        "Achats 🛒": { backgroundColor: 'rgba(255, 165, 0, 0.8)', color: '#000000' },
        "TaskFlow ⛩️": { backgroundColor: 'rgba(72, 209, 204, 0.8)', color: '#000000' },
        "Cuisine 🍳": { backgroundColor: 'rgba(255, 182, 193, 0.8)', color: '#000000' },
        "Sport 🏋️": { backgroundColor: 'rgba(135, 206, 235, 0.8)', color: '#000000' },
        "Santé 🏥": { backgroundColor: 'rgba(255, 160, 122, 0.8)', color: '#000000' },
        "Loisirs 🎨": { backgroundColor: 'rgba(255, 105, 180, 0.8)', color: '#000000' },
        "Études 📚": { backgroundColor: 'rgba(173, 255, 47, 0.8)', color: '#000000' },
        "Famille 👨‍👩‍👧‍👦": { backgroundColor: 'rgba(255, 228, 225, 0.8)', color: '#000000' },
        "Amis 👫": { backgroundColor: 'rgba(255, 240, 245, 0.8)', color: '#000000' },
        "Voyages 🌍": { backgroundColor: 'rgba(240, 255, 240, 0.8)', color: '#000000' },
        "Bricolage 🛠️": { backgroundColor: 'rgba(245, 245, 220, 0.8)', color: '#000000' },
        "Lego 🧱": { backgroundColor: 'rgba(255, 250, 205, 0.8)', color: '#000000' },
        "Jardinage 🌷": { backgroundColor: 'rgba(144, 238, 144, 0.8)', color: '#000000' },
        "Meditation 🧘": { backgroundColor: 'rgba(224, 255, 255, 0.8)', color: '#000000' },
        "Musique 🎵": { backgroundColor: 'rgba(255, 228, 196, 0.8)', color: '#000000' },
        "Podcast 🎙️": { backgroundColor: 'rgba(255, 218, 185, 0.8)', color: '#000000' },
        "Lecture 📖": { backgroundColor: 'rgba(255, 239, 213, 0.8)', color: '#000000' },
        "Film 🎬": { backgroundColor: 'rgba(255, 222, 173, 0.8)', color: '#000000' },
        "Série 📺": { backgroundColor: 'rgba(255, 248, 220, 0.8)', color: '#000000' },
        "YouTube 📹": { backgroundColor: 'rgba(255, 250, 240, 0.8)', color: '#000000' },
        "Informatique 🖥️": { backgroundColor: 'rgba(245, 245, 245, 0.8)', color: '#000000' },
        "Autre 📝": { backgroundColor: 'rgba(211, 211, 211, 0.8)', color: '#000000' },
      };

      for (const category of categories) {
        if (styles[category]) {
          return styles[category];
        }
      }

      return { backgroundColor: '#FFFFFF', color: '#000000' };
    };

  return (
    
    <div className="sessions-page">

<div className="statistics-header">
        <h2>⛩️ TaskFlow 1.3.6 💤 -- 🕒 {formatClock(currentTime)}   
       
        <div className="dark-mode-toggle">
        <h3>Mode sombre</h3>
          <button onClick={toggleDarkMode} className="dark-mode-button">
            {isDarkMode ? "🌚" : "🌞"}
          </button>
          <div/>
        
        </div>    
           </h2>
      </div>


      <GlobalPomodoroTimer 
        tasks={tasks}
        selectedTaskId={filter.taskId}
      /* Conserver minuterie pomodoro sur fusion-tool  */

       />


      


           <div className="sessions-header">
       <h1> ⏱️ Sessions terminées</h1>
           </div>
           
           
           
           
           
           <Calendar
       localizer={localizer}
       events={sessions}
       startAccessor="start"
       endAccessor="end"
       titleAccessor={(session) => session.categories.join(', ')}
       style={{ height: 500, 
         width: '100%', 
         margin: '20px 0', 
         padding: '0 20px', 
         border: '1px solid #ccc', 
         borderRadius: '5px', 
         boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}  
       defaultView='day'
       scrollToTime={new Date()}
       messages={{
         next: "Suivant",
         previous: "Précédent",
         today: "Aujourd'hui",
         month: "Mois",
         week: "Semaine",
         day: "Jour",
         agenda: "Agenda",
       }}
       eventPropGetter={(event) => ({
         style: getSessionStyle(event.categories),
       })}
       step={15} // Adjust the step to 15 minutes to reduce overlapping
       timeslots={1} // Number of timeslots per hour
           />


          <TaskFilters_Sessions 
          filter={filter} 
          setFilter={setFilter} 
          tasks={tasks} /> {/* Passer les tâches */}


      <ul className="sessions-list">
        {sortedSessions.length > 0 ? (
          sortedSessions.map((session) => {
            const startDate = new Date(session.date);
            const endDate = new Date(session.end);
            return (
              <li key={session._id} className="session-item">
                <h3>{session.taskName}</h3>
                <p>Catégories : {session.categories.join(', ')}</p>
                <p>Durée : {session.duration} minutes</p>
                <p>Date de session : {isNaN(startDate) ? "Date invalide" : format(startDate, "d MMMM yyyy", { locale: fr })}</p>
                <p>Heure de fin : {isNaN(endDate) ? "Heure invalide" : format(endDate, "HH:mm:ss", { locale: fr })}</p>
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteSession(session.taskId, session._id)}
                >
                  Supprimer
                </button>
              </li>
            );
          })
        ) : (
          <p>Aucune session trouvée.</p>
        )}
      </ul>
    </div>
  );
};

export default Sessions;