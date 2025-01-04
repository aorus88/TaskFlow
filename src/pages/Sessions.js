// filepath: /src/pages/Sessions.js
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import TaskFilters_Sessions from '../components/TaskFilters_Sessions'; // Importer le nouveau composant TaskFilters_Sessions
import './Sessions.css';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]); // Ajouter un état pour les tâches
  const [filter, setFilter] = useState({
    date: '',
    sortOrder: 'newest',
    taskId: '',
    category: '',
  });

  useEffect(() => {
    const fetchTasksAndSessions = async () => {
      try {
        const response = await fetch('http://192.168.50.241:4000/tasks?archived=false');
        const data = await response.json();
        if (Array.isArray(data)) {
          const openTasks = data.filter(task => task.archived === 'open');
          setTasks(openTasks); // Mettre à jour l'état des tâches
          const allSessions = openTasks.flatMap(task => task.sessions.map(session => ({
            ...session,
            taskId: task._id, // Ajouter l'ID de la tâche à la session
            taskName: task.name,
            totalTime: task.totalTime,
            categories: task.categories,
          })));
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

  // Fonction pour filtrer les sessions en fonction des filtres
  const filteredSessions = sessions.filter((session) => {
    if (filter.date && new Date(session.date).toISOString().split('T')[0] !== filter.date) {
      return false;
    }
    if (filter.taskId && session.taskId !== filter.taskId) {
      return false;
    }
    if (filter.category && !session.categories.includes(filter.category)) {
      return false;
    }
    return true;
  });

  // Fonction pour trier les sessions
  const sortedSessions = filteredSessions.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return filter.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="sessions-page">
      <div className="sessions-header">
        <h1>Archive des sessions</h1>
      </div>
      <TaskFilters_Sessions filter={filter} setFilter={setFilter} tasks={tasks} /> {/* Passer les tâches */}
      <ul className="sessions-list">
        {sortedSessions.length > 0 ? (
          sortedSessions.map((session) => (
            <li key={session._id} className="session-item">
              <h3>{session.taskName}</h3>
              <p>Durée : {session.duration} minutes</p>
              <p>Date session : {format(new Date(session.date), "d MMMM yyyy", { locale: fr })}</p>
              <p>Heure session : {format(new Date(session.date), "HH:mm:ss", { locale: fr })}</p>
              <button 
                className="delete-button"
                onClick={() => handleDeleteSession(session.taskId, session._id)}
              >
                Supprimer
              </button>
            </li>
          ))
        ) : (
          <p>Aucune session trouvée.</p>
        )}
      </ul>
    </div>
  );
};

export default Sessions;