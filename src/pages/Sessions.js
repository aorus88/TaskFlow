import React, { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TaskFilters_Sessions from '../components/TaskFilters_Sessions';
import './Sessions.css';
import GlobalPomodoroTimer from "../components/GlobalPomodoroTimer";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import 'moment/locale/fr';

const localizer = momentLocalizer(moment);

// Déplacer fetchTasksAndSessions en dehors du composant - actualisation calendrier après ajout session 
const fetchTasksAndSessions = async (setTasks, setSessions) => {
  try {
    const response = await fetch('http://192.168.50.241:4000/all-tasks');
    const data = await response.json();
    if (Array.isArray(data)) {
      const allTasks = data.filter(task =>
        Array.isArray(task.sessions) && task.sessions.length > 0
      );
      setTasks(allTasks);

      const allSessions = allTasks.flatMap(task =>
        task.sessions.map(session => {
          const end = new Date(session.date);
          const start = new Date(new Date(session.date).getTime() - session.duration * 60000);
          return {
            ...session,
            taskId: task._id,
            taskName: task.name,
            totalTime: task.totalTime,
            categories: task.categories,
            start: isNaN(start) ? null : start,
            end: isNaN(end) ? null : end,
          };
        })
      );
      console.log("Sessions formatées :", allSessions);
      setSessions(allSessions);
    } else {
      console.error('Les données reçues ne sont pas un tableau:', data);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches et sessions:', error);
  }
};

const Sessions = ({ isDarkMode, toggleDarkMode, taskCategories, onAddTask }) => {
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filter, setFilter] = useState({
    date: '',
    sortOrder: 'newest',
    taskId: '',
    categories: '',
  });

  // Utiliser useCallback pour mémoriser la fonction
  const fetchTasksAndSessionsCallback = useCallback(() => {
    fetchTasksAndSessions(setTasks, setSessions);
  }, []);

  // Mettre à jour l'heure
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Charger les données initiales
  useEffect(() => {
    fetchTasksAndSessionsCallback();
  }, [fetchTasksAndSessionsCallback]);

  const formatClock = (time) => {
    return time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Reste du code existant...
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

      setSessions(sessions.filter(session => session._id !== sessionId));
      // Recharger les données après la suppression
      fetchTasksAndSessionsCallback();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression de la session');
    }
  };

  // Garder le reste du code identique...
  const sortedSessions = sessions.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return filter.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

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
    <div className="statistics-container">
 

    

      <div className="sessions-header">
        <h1> ⏱️ Suivi du temps</h1>
      </div>

      <Calendar
        localizer={localizer}
        events={sessions}
        startAccessor="start"
        endAccessor="end"
        titleAccessor={(session) => {
          const taskName = session.subTaskName ? session.subTaskName : session.taskName;
          return `${taskName} - ${session.categories.join(', ')} - ${session.duration} minutes`;
        }}
        style={{ 
          height: 600, 
          width: '100%', 
          margin: '10px 0', 
          padding: '0 20px', 
          overflow: 'auto',


        }}  
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
        step={30} // Adjust the step to 15 minutes to reduce overlapping
        timeslots={2} // Number of timeslots per hour

      />

      <TaskFilters_Sessions 
        filter={filter} 
        setFilter={setFilter} 
        tasks={tasks} 
      />

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