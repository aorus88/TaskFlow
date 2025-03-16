import React, { useEffect, useState, useContext } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TaskFilters_Sessions from '../components/TaskFilters_Sessions';
import './Sessions.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import 'moment/locale/fr';
import { SelectedTaskContext } from '../context/SelectedTaskContext';
import { TasksContext } from '../context/TasksContext';

const localizer = momentLocalizer(moment);

function Sessions({ isDarkMode, toggleDarkMode, taskCategories, onAddTask }) {
  const { tasks, sessions, loading, fetchTasks } = useContext(TasksContext);
  const { selectedTaskId, setSelectedTaskId } = useContext(SelectedTaskContext);
  
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [newSession, setNewSession] = useState({
    taskId: "",
    duration: 30, // valeur par défaut
    date: new Date(),
    // Utiliser une méthode qui préserve le fuseau horaire local
    formattedDateTime: new Date().toISOString().slice(0, 16)
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filter, setFilter] = useState({
    date: '',
    sortOrder: 'newest',
    taskId: '',
    categories: '',
  });

  // Ajouter cette fonction pour obtenir la date et heure locale au format ISO
  const getLocalISOString = (date) => {
    const pad = (num) => String(num).padStart(2, '0');
    
    return date.getFullYear() + '-' +
      pad(date.getMonth() + 1) + '-' +
      pad(date.getDate()) + 'T' +
      pad(date.getHours()) + ':' +
      pad(date.getMinutes());
  };

  // Fonction pour mettre à jour avec l'heure actuelle
  const setCurrentDateTime = () => {
    const now = new Date();
    setNewSession({
      ...newSession,
      date: now,
      formattedDateTime: getLocalISOString(now)
    });
  };

  // Mettre à jour l'heure
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Charger les données initiales
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const formatClock = (time) => {
    return time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Gestion de la suppression de session
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

      // Au lieu de modifier l'état local, on rafraîchit les données via le contexte
      fetchTasks();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression de la session');
    }
  };

  const handleAddSession = async () => {
    try {
      // Extraire le type et l'ID du format "task-id" ou "subtask-id"
      const [type, id] = newSession.taskId.split('-');
      
      // Trouver la tâche parente
      const parentTask = type === 'subtask'
        ? tasks.find(task => task.subtasks?.some(st => st._id === id))
        : tasks.find(task => task._id === id);
      
      if (!parentTask) {
        throw new Error("Tâche parente non trouvée");
      }
      
      // Création de l'objet session avec les informations correctes
      const sessionData = {
        duration: parseInt(newSession.duration, 10),
        date: newSession.date, // Cette date contient bien l'heure choisie
        categories: parentTask.categories || [],
        type: type, // 'task' ou 'subtask'
        targetId: id // l'id de la tâche ou sous-tâche cible
      };
      
      const response = await fetch(
        `http://192.168.50.241:4000/tasks/${parentTask._id}/sessions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData)
        }
      );
      
      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la session");
      }
      
      setShowSessionForm(false);
      // Rafraîchir les données via le contexte partagé
      fetchTasks();
    } catch (error) {
      console.error("Erreur lors de l'ajout de session:", error);
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

            {/* Bouton pour afficher le formulaire */}
            <button onClick={() => setShowSessionForm(true)}>
        Ajouter une session
      </button>

      {showSessionForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Nouvelle session</h2>
            <label>
              Tâche cible:
              <select
                value={newSession.taskId}
                onChange={(e) => setNewSession({...newSession, taskId: e.target.value})}
                className="session-task-selector"
              >
                <option value="">Sélectionnez une tâche</option>
                {tasks
                  .filter(task => task.status === "open") // Filtrer uniquement les tâches ouvertes
                  .slice().reverse().map((task) => (
                  <React.Fragment key={task._id}>
                    <option value={`task-${task._id}`}>
                      {task.name}
                    </option>
                    {task.subtasks
                      ?.filter(subtask => subtask.archived !== "closed")
                      .map((subtask) => (
                        <option key={subtask._id} value={`subtask-${subtask._id}`}>
                          ├─ {subtask.name}
                        </option>
                      ))
                    }
                  </React.Fragment>
                ))}
              </select>
            </label>
            
            <label>
              Durée (minutes):
              <input
                type="number"
                value={newSession.duration}
                onChange={(e) => setNewSession({...newSession, duration: parseInt(e.target.value, 10)})}
              />
            </label>

            <label>
              Heure de fin :
              <input
                type="datetime-local"
                value={newSession.formattedDateTime}
                onChange={(e) => {
                  const selectedDateTime = new Date(e.target.value);
                  setNewSession({
                    ...newSession, 
                    date: selectedDateTime,
                    formattedDateTime: e.target.value
                  });
                }}
              />
              <button 
                type="button"
                onClick={setCurrentDateTime}
                className="set-current-time-btn"
              >
                Maintenant
              </button>
            </label>

            <button onClick={handleAddSession}>Enregistrer</button>
            <button onClick={() => setShowSessionForm(false)}>Annuler</button>
          </div>
        </div>
      )}


      <ul className="sessions-list">
        {sortedSessions.length > 0 ? (
          sortedSessions.map((session) => {
            const startDate = new Date(session.date);
            const endDate = new Date(session.end);
            return (
              <li key={session._id} className="session-item">
                <h3>
                  {session.type === 'subtask' ? (
                    <>
                      <span className="task-type">🆎</span> {session.subtaskName}
                      <br />
                      <span className="parent-task">🅰️{session.taskName}</span>
                    </>
                  ) : (
                    <>
                      <span className="task-type">🅰️</span> {session.taskName}
                    </>
                  )}
                </h3>
                <p>Catégories : {session.categories.join(', ')}</p>
                <p>Type : {session.type === 'subtask' ? 'Sous-tâche' : 'Tâche principale'}</p>
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
}

export default Sessions;