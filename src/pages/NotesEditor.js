import React, { useState, useEffect, useContext } from 'react';
import { Container } from 'react-bootstrap';
import Ribbon from '../components/Ribbon/Ribbon';
import EditorMain from '../components/Editor/EditorMain';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import { NotesContext } from '../context/NotesContext';
import '../styles/editor.css';

const NotesEditor = ({ taskCategories = [] }) => {
  // États pour la gestion des notes
  const { 
    notes, 
    fetchNotes, 
    addNote, 
    updateNote, 
    deleteNote, 
    updateNoteStatus 
  } = useContext(NotesContext);
  
  const [currentNote, setCurrentNote] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    tags: [],
    status: 'à faire'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('edit'); // 'edit', 'kanban', 'list'
  const [filterSettings, setFilterSettings] = useState({
    searchTerm: '',
    category: 'all'
  });

  // Charger les notes au démarrage
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Filtrer les notes selon les critères
  const filteredNotes = notes.filter(note => {
    const matchesSearch = !filterSettings.searchTerm || 
      note.title.toLowerCase().includes(filterSettings.searchTerm.toLowerCase()) || 
      note.content.toLowerCase().includes(filterSettings.searchTerm.toLowerCase()) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(filterSettings.searchTerm.toLowerCase())));
    
    const matchesCategory = filterSettings.category === 'all' || 
      note.category === filterSettings.category;
    
    return matchesSearch && matchesCategory;
  });

  // Fonctions de gestion des notes avec logs de débogage
  const handleCreateNote = async () => {
    if (!currentNote.title || !currentNote.content) {
      console.log('Création impossible: titre ou contenu manquant', currentNote);
      return;
    }
    
    console.log('Création de note:', currentNote);
    await addNote(currentNote);
    resetEditor();
  };

  const handleEditNote = (note) => {
    console.log('Edition de note:', note);
    setCurrentNote({
      ...note,
      tags: Array.isArray(note.tags) ? note.tags : []
    });
    setIsEditing(true);
    setViewMode('edit');
  };

  const handleUpdateNote = async () => {
    if (!currentNote.title || !currentNote.content) {
      console.log('Mise à jour impossible: titre ou contenu manquant', currentNote);
      return;
    }
    
    console.log('Mise à jour de note:', currentNote);
    await updateNote(currentNote._id, currentNote);
    resetEditor();
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      await deleteNote(id);
      if (currentNote._id === id) {
        resetEditor();
      }
    }
  };

  const resetEditor = () => {
    setCurrentNote({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      tags: [],
      status: 'à faire'
    });
    setIsEditing(false);
  };

  const handleStatusChange = async (noteId, newStatus) => {
    const noteToUpdate = notes.find(note => note._id === noteId);
    if (!noteToUpdate) return;
    
    await updateNoteStatus(noteId, newStatus);
  };

  // Fonctions de navigation et de vue
  const handleViewChange = (newView) => {
    setViewMode(newView);
  };

  const handleSearchChange = (term) => {
    setFilterSettings({
      ...filterSettings,
      searchTerm: term
    });
  };

  const handleCategoryFilterChange = (category) => {
    setFilterSettings({
      ...filterSettings,
      category
    });
  };

  return (
    <Container fluid className="notes-editor">
      <Ribbon 
        viewMode={viewMode}
        onViewChange={handleViewChange}
        onSearch={handleSearchChange}
        onCategoryChange={handleCategoryFilterChange}
        categories={taskCategories}
        onNewNote={resetEditor}
        searchTerm={filterSettings.searchTerm}
        selectedCategory={filterSettings.category}
        isEditing={isEditing}
        onSave={isEditing ? handleUpdateNote : handleCreateNote}
      />
      
      <div className="editor-content">
        {viewMode === 'edit' && (
          <EditorMain
            note={currentNote}
            onChange={setCurrentNote}
            isEditing={isEditing}
            categories={taskCategories}
          />
        )}
        
        {viewMode === 'kanban' && (
          <KanbanBoard
            notes={filteredNotes}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
            onStatusChange={handleStatusChange}
          />
        )}
        
        {viewMode === 'list' && (
          <div className="notes-list-view">
            {filteredNotes.length > 0 ? (
              <div className="row">
                {filteredNotes.map(note => (
                  <div key={note._id} className="col-md-4 mb-4">
                    <div className="note-card">
                      <h3>{note.title}</h3>
                      <div className="note-content" dangerouslySetInnerHTML={{ __html: note.content.substring(0, 150) + '...' }}></div>
                      <div className="note-footer">
                        <span className="note-category">{note.category}</span>
                        <span className="note-status">{note.status}</span>
                      </div>
                      <div className="note-actions">
                        <button onClick={() => handleEditNote(note)} className="btn-edit">Modifier</button>
                        <button onClick={() => handleDeleteNote(note._id)} className="btn-delete">Supprimer</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-notes">Aucune note trouvée</p>
            )}
          </div>
        )}
      </div>
    </Container>
  );
};

export default NotesEditor;
