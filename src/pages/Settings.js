import React, { useState, useEffect, useContext } from 'react';
import { TasksContext } from '../context/TasksContext';
import { regenerateHabits } from '../utils/cronJobs';
import './Settings.css';

const Settings = ({ taskCategories }) => {
  const { tasks, fetchTasks } = useContext(TasksContext);
  const [habits, setHabits] = useState([]);
  const [activeHabits, setActiveHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // 'general' ou 'habits'
  const [showActiveHabitsModal, setShowActiveHabitsModal] = useState(false);
  const [newHabitForm, setNewHabitForm] = useState({
    name: '',
    priority: 'medium',
    categories: 'Personnel 🐈',
    taskType: 'habit',
    subtasks: []
  });
  const [newSubtask, setNewSubtask] = useState('');

  // Charger toutes les habitudes
  useEffect(() => {
    if (tasks && tasks.length) {
      // Filtrer les modèles d'habitudes (templates)
      const habitTemplates = tasks.filter(task => 
        task.taskType === 'habit' && 
        task.archived === 'open'
      );
      setHabits(habitTemplates);
      
      // Filtrer les instances d'habitudes actives (du jour)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dailyHabits = tasks.filter(task => 
        task.taskType === 'habit' && 
        task.archived === 'open' &&
        new Date(task.date) >= today &&
        new Date(task.date) < tomorrow
      );
      setActiveHabits(dailyHabits);
    }
  }, [tasks]);

  // Gérer la sélection d'une habitude pour l'édition
  const handleSelectHabit = (habit) => {
    setSelectedHabit(habit);
    setIsEditing(true);
    setNewHabitForm({
      name: habit.name,
      priority: habit.priority,
      categories: habit.categories,
      taskType: 'habit',
      subtasks: habit.subtasks || []
    });
  };

  // Gérer les changements dans le formulaire
  const handleFormChange = (field, value) => {
    setNewHabitForm({
      ...newHabitForm,
      [field]: value
    });
  };

  // Ajouter une sous-tâche au formulaire
  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setNewHabitForm({
        ...newHabitForm,
        subtasks: [
          ...newHabitForm.subtasks,
          {
            name: newSubtask,
            archived: 'open',
            id: Date.now()
          }
        ]
      });
      setNewSubtask('');
    }
  };

  // Supprimer une sous-tâche du formulaire
  const handleRemoveSubtask = (index) => {
    const updatedSubtasks = [...newHabitForm.subtasks];
    updatedSubtasks.splice(index, 1);
    setNewHabitForm({
      ...newHabitForm,
      subtasks: updatedSubtasks
    });
  };

  // Sauvegarder une nouvelle habitude ou mettre à jour une existante
  const handleSaveHabit = async () => {
    try {
      const payload = {
        ...newHabitForm,
        date: new Date().toISOString(),
        time: '23:59',
        status: 'open',
        taskType: 'habit' // S'assurer que le type est toujours explicitement défini
      };

      console.log("Payload de l'habitude:", payload); // Ajout de log pour débogage

      if (isEditing && selectedHabit) {
        // Mise à jour d'une habitude existante
        const response = await fetch(`http://192.168.50.241:4000/tasks/${selectedHabit._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Erreur lors de la mise à jour de l\'habitude');
      } else {
        // Création d'une nouvelle habitude
        const response = await fetch('http://192.168.50.241:4000/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Erreur lors de la création de l\'habitude');
        
        const data = await response.json();
        console.log("Habitude créée:", data); // Ajout de log pour vérifier la réponse
      }

      // Réinitialiser le formulaire et rafraîchir les données
      setNewHabitForm({
        name: '',
        priority: 'medium',
        categories: 'Personnel 🐈',
        taskType: 'habit',
        subtasks: []
      });
      setIsEditing(false);
      setSelectedHabit(null);
      await fetchTasks();
      
      // Régénérer les habitudes pour inclure la nouvelle
      await regenerateHabits();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la sauvegarde de l\'habitude.');
    }
  };

  // Supprimer une habitude
  const handleDeleteHabit = async (habitId) => {
    if (!habitId || !window.confirm('Êtes-vous sûr de vouloir supprimer cette habitude ?')) return;

    try {
      const response = await fetch(`http://192.168.50.241:4000/tasks/${habitId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression de l\'habitude');

      await fetchTasks();
      
      if (selectedHabit && selectedHabit._id === habitId) {
        setSelectedHabit(null);
        setIsEditing(false);
        setNewHabitForm({
          name: '',
          priority: 'medium',
          categories: 'Personnel 🐈',
          taskType: 'habit',
          subtasks: []
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la suppression de l\'habitude.');
    }
  };

  // Activer/désactiver une habitude
  const handleToggleHabitStatus = async (habit) => {
    try {
      const updatedStatus = habit.archived === 'open' ? 'closed' : 'open';
      const response = await fetch(`http://192.168.50.241:4000/tasks/${habit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: updatedStatus })
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du statut');

      await fetchTasks();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue lors de la mise à jour du statut.');
    }
  };

  // Forcer la régénération manuelle des habitudes
  const handleRegenerateHabits = async () => {
    try {
      await regenerateHabits();
      await fetchTasks();
      alert('Habitudes régénérées avec succès');
    } catch (error) {
      console.error('Erreur lors de la régénération des habitudes:', error);
      alert('Une erreur est survenue lors de la régénération des habitudes.');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          Paramètres généraux
        </button>
        <button 
          className={`tab-button ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          Gestion des habitudes
        </button>
      </div>
      
      {activeTab === 'general' && (
        <div className="general-settings">
          <h1>⚙️ Paramètres généraux</h1>
          <div className="settings-section">
            <h2>Apparence</h2>
            <div className="settings-option">
              <label>
                <span>Thème par défaut:</span>
                <select>
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="system">Système</option>
                </select>
              </label>
            </div>
          </div>
          <div className="settings-section">
            <h2>Notifications</h2>
            <div className="settings-option">
              <label>
                <input type="checkbox" /> Activer les notifications sonores
              </label>
            </div>
            <div className="settings-option">
              <label>
                <input type="checkbox" /> Rappels pour les tâches en retard
              </label>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'habits' && (
        <div className="habits-settings">
          <h1>🔄 Gestion des habitudes quotidiennes</h1>
          
          <div className="settings-layout">
            <div className="habits-list">
              <h2>Modèles d'habitudes</h2>
              <div className="habits-actions">
                <button 
                  className="new-habit-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedHabit(null);
                    setNewHabitForm({
                      name: '',
                      priority: 'medium',
                      categories: 'Personnel 🐈',
                      taskType: 'habit',
                      subtasks: []
                    });
                  }}
                >
                  Nouvelle habitude
                </button>
                
                <button 
                  className="show-habits-btn"
                  onClick={() => setShowActiveHabitsModal(true)}
                >
                  Afficher les habitudes du jour
                </button>
                
                <button 
                  className="regenerate-btn"
                  onClick={handleRegenerateHabits}
                >
                  Régénérer les habitudes
                </button>
              </div>
              
              <ul className="habits-list-items">
                {habits.map(habit => (
                  <li 
                    key={habit._id} 
                    className={`habit-item ${habit.archived === 'closed' ? 'disabled' : ''}`}
                    onClick={() => handleSelectHabit(habit)}
                  >
                    <div className="habit-item-name">
                      {habit.name}
                    </div>
                    <div className="habit-item-controls">
                      <button 
                        className={`toggle-status ${habit.archived === 'closed' ? 'activate' : 'deactivate'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleHabitStatus(habit);
                        }}
                      >
                        {habit.archived === 'closed' ? 'Activer' : 'Désactiver'}
                      </button>
                      <button 
                        className="delete-habit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHabit(habit._id);
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="habit-form">
              <h2>{isEditing ? 'Modifier l\'habitude' : 'Nouvelle habitude'}</h2>
              
              <div className="form-group">
                <label>Nom de l'habitude:</label>
                <input 
                  type="text"
                  value={newHabitForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="Nom de l'habitude"
                />
              </div>
              
              <div className="form-group">
                <label>Priorité:</label>
                <select
                  value={newHabitForm.priority}
                  onChange={(e) => handleFormChange('priority', e.target.value)}
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Catégorie:</label>
                <select
                  value={newHabitForm.categories}
                  onChange={(e) => handleFormChange('categories', e.target.value)}
                >
                  <option value="Personnel 🐈">Personnel 🐈</option>
                  {taskCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group subtasks-section">
                <label>Sous-tâches:</label>
                <div className="subtasks-input-group">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Nouvelle sous-tâche"
                  />
                  <button type="button" onClick={handleAddSubtask}>
                    Ajouter
                  </button>
                </div>
                
                <ul className="subtasks-list">
                  {newHabitForm.subtasks.map((subtask, index) => (
                    <li key={subtask.id || index} className="subtask-item">
                      <span>{subtask.name}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSubtask(index)}
                        className="remove-subtask"
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="save-habit"
                  onClick={handleSaveHabit}
                  disabled={!newHabitForm.name.trim()}
                >
                  {isEditing ? 'Mettre à jour' : 'Créer l\'habitude'}
                </button>
                {isEditing && (
                  <button 
                    type="button" 
                    className="cancel-edit"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedHabit(null);
                      setNewHabitForm({
                        name: '',
                        priority: 'medium',
                        categories: 'Personnel 🐈',
                        taskType: 'habit',
                        subtasks: []
                      });
                    }}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showActiveHabitsModal && (
        <div className="modal-overlay">
          <div className="modal-content habits-modal">
            <div className="modal-header">
              <h2>Habitudes actives aujourd'hui</h2>
              <button className="close-button" onClick={() => setShowActiveHabitsModal(false)}>×</button>
            </div>
            {activeHabits.length > 0 ? (
              <ul className="active-habits-list">
                {activeHabits.map(habit => (
                  <li key={habit._id} className="active-habit-item">
                    <div className="habit-details">
                      <h3>{habit.name}</h3>
                      <p>Priorité: {habit.priority === "low" ? "🟢 Faible" : habit.priority === "medium" ? "🟠 Moyenne" : "🔴 Haute"}</p>
                      {habit.categories && <p>Catégorie: {habit.categories}</p>}
                      <p>Sous-tâches: {habit.subtasks.length}</p>
                      <p>Progression: {
                        (() => {
                          const total = habit.subtasks.length;
                          const completed = habit.subtasks.filter(s => s.archived === 'closed').length;
                          return total > 0 ? `${Math.round((completed / total) * 100)}%` : 'N/A';
                        })()
                      }</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-habits-message">Aucune habitude active pour aujourd'hui.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
