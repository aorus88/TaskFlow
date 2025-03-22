import React, { useState, useEffect, useContext } from 'react';
import { TasksContext } from '../context/TasksContext';
import { AuthContext } from '../context/AuthContext'; // Importer le contexte d'authentification
import { regenerateHabits } from '../utils/cronJobs';
import './Settings.css';
import AdditionalMenu from '../components/AdditionalMenu';
import { API_BASE_URL } from '../utils/api';

const Settings = ({ taskCategories, isDarkMode, toggleDarkMode, setThemeMode }) => {
  const { tasks, fetchTasks } = useContext(TasksContext);
  const { currentUser, isAdmin } = useContext(AuthContext); // Récupérer l'état d'authentification et le rôle
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
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('themeMode') || 'system';
  });

  // États pour la gestion des utilisateurs
  const [users, setUsers] = useState([]);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

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

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setCurrentTheme(newTheme);
    setThemeMode(newTheme);
  };

  // Fonction pour charger la liste des utilisateurs
  const fetchUsers = async () => {
    if (!isAdmin) return;
    
    setUserLoading(true);
    setUserError(null);
    try {
      // Utiliser l'URL de base dynamique
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Impossible de récupérer la liste des utilisateurs');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erreur:', error);
      setUserError(error.message || 'Erreur lors de la récupération des utilisateurs');
      
      // Fallback en mode développement pour permettre de continuer à travailler
      if (process.env.NODE_ENV === 'development') {
        setUsers([{
          _id: '67dee6ba6514967a97a47495',
          username: 'admin',
          email: 'admin@taskflow.com',
          role: 'admin'
        }]);
      }
    } finally {
      setUserLoading(false);
    }
  };

  // Charger les utilisateurs lorsque l'onglet "Utilisateurs" est sélectionné
  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      fetchUsers();
    }
  }, [activeTab, isAdmin]);

  // Gérer les changements dans le formulaire utilisateur
  const handleUserFormChange = (field, value) => {
    setUserFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  // Sélectionner un utilisateur pour modification
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setIsEditingUser(true);
    setUserFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      password: '' // Champ vide pour le mot de passe
    });
  };

  // Réinitialiser le formulaire utilisateur
  const resetUserForm = () => {
    setSelectedUser(null);
    setIsEditingUser(false);
    setUserFormData({
      username: '',
      email: '',
      password: '',
      role: 'user'
    });
    setUserError(null);
  };

  // Ajouter un nouvel utilisateur
  const handleAddUser = async () => {
    setUserLoading(true);
    setUserError(null);
    try {
      // Validation basique
      if (!userFormData.username || !userFormData.email || (!isEditingUser && !userFormData.password)) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(userFormData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de l\'utilisateur');
      }
      
      // Rafraîchir la liste des utilisateurs
      fetchUsers();
      resetUserForm();
      alert('Utilisateur créé avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      setUserError(error.message);
    } finally {
      setUserLoading(false);
    }
  };

  // Mettre à jour un utilisateur existant
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    setUserLoading(true);
    setUserError(null);
    try {
      const payload = {...userFormData};
      // Ne pas envoyer le mot de passe s'il est vide
      if (!payload.password) delete payload.password;
      
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour de l\'utilisateur');
      }
      
      // Rafraîchir la liste des utilisateurs
      fetchUsers();
      resetUserForm();
      alert('Utilisateur mis à jour avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      setUserError(error.message);
    } finally {
      setUserLoading(false);
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    setUserLoading(true);
    setUserError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression de l\'utilisateur');
      }
      
      // Rafraîchir la liste des utilisateurs
      fetchUsers();
      // Réinitialiser le formulaire si l'utilisateur supprimé était en cours d'édition
      if (selectedUser && selectedUser._id === userId) {
        resetUserForm();
      }
      alert('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      setUserError(error.message);
    } finally {
      setUserLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="app-title">
        <h3>
          TaskFlow ⚙️ Paramètres
          <button onClick={toggleDarkMode} className="dark-mode-button">
            {isDarkMode ? "🌚" : "🌞"}
          </button>
        </h3>
      </div>

      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          Général
        </button>
        <button 
          className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          Apparence
        </button>
        <button 
          className={`tab-button ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          Habitudes
        </button>
        {/* Afficher l'onglet Utilisateurs seulement pour les administrateurs */}
        {isAdmin && (
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Utilisateurs
          </button>
        )}
      </div>

      {activeTab === 'general' && (
        <div className="general-settings">
          <div className="settings-section">
            <h3>Paramètres généraux</h3>
            {/* Autres paramètres généraux ici */}
          </div>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="appearance-settings">
          <div className="settings-section">
            <h3>Apparence</h3>
            <div className="settings-option">
              <label>
                <span>Thème d'interface :</span>
                <select value={currentTheme} onChange={handleThemeChange}>
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="system">Système</option>
                </select>
              </label>
            </div>
            {/* Autres options d'apparence ici */}
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
                  <option value="Travail 💼">Travail 💼</option>
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

      {/* Nouvelle section pour la gestion des utilisateurs */}
      {activeTab === 'users' && isAdmin && (
        <div className="users-settings">
          <h1>👥 Gestion des utilisateurs</h1>
          
          {userError && <div className="error-message">{userError}</div>}
          
          <div className="settings-layout">
            <div className="users-list">
              <h2>Liste des utilisateurs</h2>
              {userLoading ? (
                <p>Chargement...</p>
              ) : (
                <ul className="users-list-items">
                  {users.map(user => (
                    <li 
                      key={user._id} 
                      className={`user-item ${selectedUser && selectedUser._id === user._id ? 'selected' : ''}`}
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="user-item-info">
                        <div className="user-name">{user.username}</div>
                        <div className="user-email">{user.email}</div>
                        <div className="user-role">
                          <span className={`role-badge ${user.role}`}>
                            {user.role === 'admin' ? '👑 Admin' : '👤 Utilisateur'}
                          </span>
                        </div>
                      </div>
                      <div className="user-item-controls">
                        <button 
                          className="delete-user-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user._id);
                          }}
                          disabled={user._id === currentUser?._id} // Empêcher la suppression de soi-même
                        >
                          Supprimer
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="user-form">
              <h2>{isEditingUser ? `Modifier l'utilisateur: ${selectedUser?.username}` : 'Nouvel utilisateur'}</h2>
              
              <div className="form-group">
                <label>Nom d'utilisateur:</label>
                <input 
                  type="text"
                  value={userFormData.username}
                  onChange={(e) => handleUserFormChange('username', e.target.value)}
                  placeholder="Nom d'utilisateur"
                />
              </div>
              
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => handleUserFormChange('email', e.target.value)}
                  placeholder="Email"
                />
              </div>
              
              <div className="form-group">
                <label>{isEditingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}:</label>
                <input 
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => handleUserFormChange('password', e.target.value)}
                  placeholder={isEditingUser ? "Laisser vide pour ne pas changer" : "Mot de passe"}
                />
              </div>
              
              <div className="form-group">
                <label>Rôle:</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => handleUserFormChange('role', e.target.value)}
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="save-user"
                  onClick={isEditingUser ? handleUpdateUser : handleAddUser}
                  disabled={userLoading}
                >
                  {isEditingUser ? 'Mettre à jour' : 'Créer l\'utilisateur'}
                </button>
                {isEditingUser && (
                  <button 
                    type="button" 
                    className="cancel-edit"
                    onClick={resetUserForm}
                    disabled={userLoading}
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
