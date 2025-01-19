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

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]); // Ajouter un état pour les tâches
  const [filter, setFilter] = useState({
    date: '',
    sortOrder: 'newest',
    taskId: '',
    categories: '',
  });

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
      if (categories.includes("Travail 💼")) return { backgroundColor: 'rgba(255, 223, 186, 0.3)' }; // Beige clair transparent
      if (categories.includes("Personnel 🐈")) return { backgroundColor: 'rgba(255, 192, 203, 0.3)', color: "#000000" }; // Rose clair transparent
      if (categories.includes("Santé - Fusion-Tool 🧬")) return { backgroundColor: 'rgba(173, 216, 230, 0.3)' }; // Bleu clair transparent
      if (categories.includes("Finances 💵")) return { backgroundColor: 'rgba(144, 238, 144, 0.3)' }; // Vert clair transparent
      if (categories.includes("Jeux vidéos 🎮")) return { backgroundColor: 'rgba(221, 160, 221, 0.3)', color: "#000000" }; // Violet clair transparent
      if (categories.includes("Maison 🏠")) return { backgroundColor: 'rgba(255, 228, 181, 0.3)', color: "#000000" }; // Beige transparent
      if (categories.includes("Achats 🛒")) return { backgroundColor: 'rgba(255, 165, 0, 0.3)' }; // Orange clair transparent
      if (categories.includes("TaskFlow ⛩️")) return { backgroundColor: 'rgba(72, 209, 204, 0.3)', color: '#000000' }; // Cyan clair transparent avec texte noir
      if (categories.includes("Autre 📝")) return { backgroundColor: 'rgba(211, 211, 211, 0.3)' }; // Gris clair transparent
      return { backgroundColor: '#FFFFFF' }; // Blanc
    };

  return (
    <div className="sessions-page">
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