/* ==============================================
   src/components/TaskDetailModal.js
   ==============================================
   Composant responsable d'afficher et d'éditer 
   les détails d'une Tâche (selectedTask),
   sous la forme d'une "modale" (fenêtre superposée).

   PROPS :
   ------
   - selectedTask : Objet représentant la tâche à afficher.
   - setSelectedTask : Setter pour modifier 
       localement la tâche (ex. changer titre, desc, sous-tâches).
   - onSave : Fonction callback à appeler quand on veut 
       sauvegarder les modifications (PUT).
   - onClose : Fonction callback pour fermer la modale 
       (ex. passer showModal à false).
   - onAddSubTask (optionnel) : callback pour ajouter une sous-tâche.
   - onToggleSubTask (optionnel) : callback pour cocher/décocher.
   - onChangeSubTaskTitle (optionnel) : callback pour modifier le titre 
       d’une sous-tâche.

   SI tu préfères, tu peux gérer directement 
   add/toggle/changeSubTask dans ce composant, 
   sans passer par des callbacks parent.

   UTILISATION :
   ------------
   Dans TaskView.js (ou ailleurs) :
     {showModal && selectedTask && (
       <TaskDetailModal
         selectedTask={selectedTask}
         setSelectedTask={setSelectedTask}
         onSave={handleUpdateTask} 
         onClose={closeModal}
         onAddSubTask={handleAddSubTask}
         onToggleSubTask={handleToggleSubTask}
         onChangeSubTaskTitle={handleChangeSubTaskTitle}
       />
     )}

   LIBRAIRIES :
   ------------
   - React (hooks)
   - CSS custom ou inline pour le style de la modale.
*/

import React from 'react';

/* 
  Styles "inline" pour la superposition ("overlay") et la fenêtre.
  Tu peux évidemment déplacer ce style dans un fichier .css séparé.
*/
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
};

const modalStyle = {
  backgroundColor: '#fff',
  padding: '1rem',
  borderRadius: '4px',
  width: '500px',
  maxHeight: '80vh',
  overflowY: 'auto'
};

function TaskDetailModal({
  selectedTask,
  setSelectedTask,
  onSave,
  onClose,
  onAddSubTask,
  onToggleSubTask,
  onChangeSubTaskTitle
}) {
  // Si aucune tâche sélectionnée, on ne rend rien
  if (!selectedTask) return null;

  /* 
   * Exemple de fonctions internes si on préfère tout gérer ici :
   * 
   * const addSubTaskLocal = () => {
   *   const newSubTask = { title: 'Nouvelle sous-tâche', done: false };
   *   setSelectedTask((prev) => ({
   *     ...prev,
   *     subTasks: [...(prev.subTasks || []), newSubTask]
   *   }));
   * };
   * 
   * => et ainsi de suite pour toggler ou renommer 
   *    une sous-tâche.
   * 
   * Mais si tu préfères déléguer au parent,
   * tu continues à utiliser onAddSubTask, onToggleSubTask, etc.
   */

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setSelectedTask((prev) => ({ ...prev, title: newTitle }));
  };

  const handleDescChange = (e) => {
    const newDesc = e.target.value;
    setSelectedTask((prev) => ({ ...prev, description: newDesc }));
  };

  const handlePriorityChange = (e) => {
    setSelectedTask((prev) => ({ ...prev, priority: e.target.value }));
  };

  const handleTagsChange = (e) => {
    // On reçoit une string "tag1, tag2" -> tableau
    const splitted = e.target.value.split(',').map((t) => t.trim());
    setSelectedTask((prev) => ({ ...prev, tags: splitted }));
  };

  const handleDueDateChange = (e) => {
    setSelectedTask((prev) => ({ ...prev, dueDate: e.target.value }));
  };

  const handleCategoryChange = (e) => {
    setSelectedTask((prev) => ({ ...prev, category: e.target.value }));
  };

  // Rendu
  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h3>Détails de la tâche</h3>

        {/* Titre */}
        <label>Titre :</label>
        <input
          type="text"
          value={selectedTask.title}
          onChange={handleTitleChange}
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />

        {/* Description */}
        <label>Description :</label>
        <textarea
          rows={3}
          value={selectedTask.description || ''}
          onChange={handleDescChange}
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />

        {/* Priorité */}
        <label>Priorité :</label>
        <select
          value={selectedTask.priority || 'low'}
          onChange={handlePriorityChange}
          style={{ marginBottom: '0.5rem' }}
        >
          <option value="low">Faible</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
        </select>
        <br />

        {/* Tags */}
        <label>Tags :</label>
        <input
          type="text"
          // On retransforme le tableau en string
          value={(selectedTask.tags || []).join(', ')}
          onChange={handleTagsChange}
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />

        {/* Date d'échéance */}
        <label>Date d’échéance :</label>
        <input
          type="date"
          value={
            selectedTask.dueDate
              ? selectedTask.dueDate.substring(0, 10)
              : ''
          }
          onChange={handleDueDateChange}
          style={{ marginBottom: '0.5rem' }}
        />
        <br />

        {/* Catégorie */}
        <label>Catégorie :</label>
        <input
          type="text"
          value={selectedTask.category || ''}
          onChange={handleCategoryChange}
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />

        {/* Sous-tâches */}
        <div style={{ borderTop: '1px solid #ccc', marginTop: '1rem', paddingTop: '1rem' }}>
          <h4>Sous-tâches</h4>
          {(selectedTask.subTasks || []).map((st, idx) => (
            <div key={idx} style={{ marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={st.done}
                onChange={() => {
                  if (onToggleSubTask) {
                    onToggleSubTask(idx);
                  }
                  // si on gère en local : 
                  // setSelectedTask(...subTasks[idx].done = !subTasks[idx].done)
                }}
              />
              <input
                type="text"
                value={st.title}
                onChange={(e) => {
                  if (onChangeSubTaskTitle) {
                    onChangeSubTaskTitle(idx, e.target.value);
                  }
                }}
                style={{ marginLeft: '0.5rem' }}
              />
            </div>
          ))}
          <button 
            onClick={() => {
              if (onAddSubTask) {
                onAddSubTask();
              }
              // si on gère en local : 
              // setSelectedTask(...subTasks.push(...))
            }}
          >
            + Ajouter une sous-tâche
          </button>
        </div>

        {/* Boutons de contrôle */}
        <div style={{ marginTop: '1rem' }}>
          <button onClick={onSave} style={{ marginRight: '1rem' }}>
            Enregistrer
          </button>
          <button onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
