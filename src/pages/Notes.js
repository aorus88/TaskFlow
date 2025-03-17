import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Card, Row, Col, Badge, InputGroup, FormControl } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import '../styles/Notes.css';

// Configuration des modules et formats pour l'éditeur ReactQuill
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image'
];

// Statuts possibles pour les notes
const STATUSES = ['à faire', 'en cours', 'terminé'];

// Identifiants simples et fixes pour les colonnes
const COLUMN_IDS = {
  'à faire': 'column-todo',
  'en cours': 'column-in-progress',
  'terminé': 'column-done'
};

const Notes = ({ taskCategories = [] }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({
    id: '',
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    tags: [],
    status: 'à faire', // Statut par défaut
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [tempTag, setTempTag] = useState('');
  const quillRef = useRef(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' ou 'list'
  const [kanbanReady, setKanbanReady] = useState(false);

  // Récupérer les notes au chargement
  useEffect(() => {
    fetchNotes();
  }, []);

  // S'assurer que le kanban est prêt seulement après le premier rendu
  useEffect(() => {
    setKanbanReady(true); // Définit immédiatement à true dès le premier rendu.
  }, []);

  // Fonction pour récupérer les notes
  const fetchNotes = async () => {
    try {
      const response = await fetch('http://192.168.50.241:4000/notes');
      const data = await response.json();
      setNotes(Array.isArray(data) ? data : []); // sécurise la réception
    } catch (err) {
      console.error('Erreur lors de la récupération des notes:', err);
      setNotes([]); // assure que notes soit toujours initialisé
    }
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote({
      ...newNote,
      [name]: value,
    });
    
    // Configuration de la sauvegarde automatique pendant la saisie
    if (isEditing) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      
      setSaveStatus('En cours de saisie...');
      
      const timer = setTimeout(() => {
        setSaveStatus('Sauvegarde automatique...');
        handleUpdateNote();
      }, 2000);
      
      setAutoSaveTimer(timer);
    }
  };

  // Fonction pour générer automatiquement un titre à partir du contenu
  const generateTitleFromContent = (content) => {
    // Éliminer les balises HTML et extraire le texte brut
    const textContent = content.replace(/<[^>]+>/g, '');
    // Prendre les premiers mots (maximum 7)
    const words = textContent.trim().split(/\s+/).slice(0, 7);
    // Créer le titre
    let title = words.join(' ');
    
    // Ajouter des points de suspension si le titre est tronqué et n'est pas vide
    if (textContent.length > title.length && title.length > 0) {
      title += '...';
    }
    
    // Si le titre est vide, utiliser un titre par défaut
    return title.length > 0 ? title : 'Nouvelle note';
  };

  // Gérer les changements dans l'éditeur de texte riche
  const handleEditorChange = (content) => {
    // Générer un nouveau titre basé sur le contenu
    const generatedTitle = generateTitleFromContent(content);
    
    setNewNote({
      ...newNote,
      content,
      title: generatedTitle,  // Mise à jour automatique du titre
    });
    
    // Même logique de sauvegarde automatique
    if (isEditing) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      
      setSaveStatus('En cours de saisie...');
      
      const timer = setTimeout(() => {
        setSaveStatus('Sauvegarde automatique...');
        handleUpdateNote();
      }, 2000);
      
      setAutoSaveTimer(timer);
    }
  };

  // Ajouter une note
  const handleAddNote = async () => {
    if (!newNote.title || !newNote.content) return;

    try {
      const response = await fetch('http://192.168.50.241:4000/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });

      if (response.ok) {
        const addedNote = await response.json();
        setNotes([addedNote, ...notes]);
        resetForm();
      } else {
        console.error('Erreur lors de l\'ajout de la note:', response.status);
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la note:', err);
    }
  };

  // Éditer une note existante
  const handleEditNote = (note) => {
    setNewNote({
      ...note,
      tags: note.tags || [],
    });
    setIsEditing(true);
    setEditingId(note._id);
    setSaveStatus('');
    
    // Faire défiler jusqu'au formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mettre à jour une note existante
  const handleUpdateNote = async () => {
    // Validation simple pour éviter les soumissions vides
    if (!newNote.title.trim() || !newNote.content.trim()) {
      setSaveStatus('Titre et contenu requis');
      return;
    }
    
    try {
      const response = await fetch(`http://192.168.50.241:4000/notes/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(notes.map(note => note._id === editingId ? updatedNote : note));
        setSaveStatus('Sauvegardé');
        
        // Ne pas réinitialiser le formulaire en cas de sauvegarde automatique
        if (!autoSaveTimer) {
          resetForm();
        }
      } else {
        console.error('Erreur lors de la mise à jour de la note:', response.status);
        setSaveStatus('Erreur de sauvegarde');
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la note:', err);
      setSaveStatus('Erreur de sauvegarde');
    }
  };

  // Supprimer une note
  const handleDeleteNote = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;
    
    try {
      const response = await fetch(`http://192.168.50.241:4000/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(notes.filter(note => note._id !== id));
        if (editingId === id) {
          resetForm();
        }
      } else {
        console.error('Erreur lors de la suppression de la note:', response.status);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de la note:', err);
    }
  };

  // Changer le statut d'une note
  const handleStatusChange = async (noteId, newStatus) => {
    const noteToUpdate = notes.find(note => note._id === noteId);
    if (!noteToUpdate) return;
    
    try {
      const response = await fetch(`http://192.168.50.241:4000/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...noteToUpdate,
          status: newStatus
        }),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNotes(notes.map(note => note._id === noteId ? updatedNote : note));
      } else {
        console.error('Erreur lors de la mise à jour du statut:', response.status);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Fonction pour obtenir la couleur du status
  const getStatusColor = (status) => {
    switch (status) {
      case 'à faire': return '#f8d7da'; // Rouge léger
      case 'en cours': return '#fff3cd'; // Jaune léger
      case 'terminé': return '#d1e7dd'; // Vert léger
      default: return '#e2e3e5'; // Gris léger
    }
  };

  // Ajouter un tag à la note en cours d'édition
  const addTag = () => {
    if (tempTag.trim() && !newNote.tags.includes(tempTag.trim())) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, tempTag.trim()]
      });
      setTempTag('');
    }
  };

  // Supprimer un tag de la note en cours d'édition
  const removeTag = (tagToRemove) => {
    setNewNote({
      ...newNote,
      tags: newNote.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setNewNote({
      id: '',
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      tags: [],
      status: 'à faire',
    });
    setIsEditing(false);
    setEditingId(null);
    setSaveStatus('');
    setTempTag('');
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
      setAutoSaveTimer(null);
    }
  };

  // Ajouter une nouvelle note vide
  const handleAddNewNote = () => {
    resetForm();
    // Faire défiler jusqu'au formulaire
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fermer l'éditeur de note
  const handleCloseEditor = () => {
    resetForm();
  };

  // Gérer le glisser-déposer
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    
    // Extraire le statut à partir de l'ID de la colonne
    let newStatus;
    Object.entries(COLUMN_IDS).forEach(([status, id]) => {
      if (id === destination.droppableId) {
        newStatus = status;
      }
    });
    
    if (newStatus) {
      handleStatusChange(draggableId, newStatus);
    }
  };

  // Filtrer les notes selon le terme de recherche et la catégorie
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = filter === 'all' || note.category === filter;
    
    return matchesSearch && matchesCategory;
  });

  // Grouper les notes par statut pour le Kanban
  const notesByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = filteredNotes.filter(note => note.status === status);
    return acc;
  }, {});

  // Rendu d'une note dans le tableau Kanban
  const renderNoteCard = (note, index) => (
    <Draggable 
      key={note._id} 
      draggableId={String(note._id)}
      index={index}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="kanban-note"
        >
          <Card className={`note-card ${note.category ? `category-${note.category.split(' ')[0].toLowerCase()}` : ''}`}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <Card.Title className="mb-1">{note.title}</Card.Title>
                {note.category && (
                  <Badge bg="secondary" className="category-badge">
                    {note.category}
                  </Badge>
                )}
              </div>
              <Card.Subtitle className="mb-2 text-muted">{formatDate(note.date)}</Card.Subtitle>
              
              <div className="mt-2 mb-2">
                {note.tags && note.tags.map((tag, idx) => (
                  <Badge 
                    bg="info" 
                    className="me-1 mb-1"
                    key={idx}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="note-actions mt-3">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleEditNote(note)}
                  className="me-2"
                >
                  Modifier
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDeleteNote(note._id)}
                >
                  Supprimer
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </Draggable>
  );

  return (
    <Container className="notes-container">
      <h2>NotePad</h2>
      <p className="text-muted">Organisez vos idées et créez des notes riches en contenu</p>

      <Card className="note-form-card mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>{isEditing ? 'Modifier la note' : 'Nouvelle note'}</h4>
            <Button variant="outline-secondary" onClick={handleCloseEditor}>
              <i className="fas fa-times"></i> Fermer
            </Button>
          </div>
          
          {/* Éditeur de texte riche d'abord */}
          <Form>
            <Form.Group className="mb-3">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                modules={quillModules}
                formats={quillFormats}
                value={newNote.content}
                onChange={handleEditorChange}
                placeholder="Écrivez votre note ici..."
                className="rich-text-editor"
              />
            </Form.Group>
          </Form>
          
          {/* Champs de métadonnées sous l'éditeur */}
          <div className="metadata-fields mt-4">
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={newNote.date}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Catégorie</Form.Label>
                  <Form.Select
                    name="category"
                    value={newNote.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner</option>
                    {taskCategories.map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <Form.Select
                    name="status"
                    value={newNote.status}
                    onChange={handleInputChange}
                  >
                    {STATUSES.map((status, index) => (
                      <option key={index} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Tags</Form.Label>
                  <InputGroup>
                    <FormControl
                      placeholder="Ajouter un tag"
                      value={tempTag}
                      onChange={(e) => setTempTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button variant="outline-secondary" onClick={addTag}>+</Button>
                  </InputGroup>
                  <div className="tags-container mt-2">
                    {newNote.tags && newNote.tags.map((tag, index) => (
                      <Badge 
                        bg="info" 
                        className="me-1 mb-1 tag-badge" 
                        key={index}
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end mt-3">
              {isEditing ? (
                <>
                  <Button variant="primary" onClick={handleUpdateNote} className="me-2">
                    <i className="fas fa-save"></i> Mettre à jour
                  </Button>
                  <Button variant="secondary" onClick={resetForm}>
                    <i className="fas fa-times"></i> Annuler
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={handleAddNote}>
                  <i className="fas fa-plus"></i> Ajouter
                </Button>
              )}
              <small className="text-muted ms-3 d-flex align-items-center">{saveStatus}</small>
            </div>
          </div>
        </Card.Body>
      </Card>

      <div className="notes-filter-section mb-4">
        <Row>
          <Col md={3}>
            <InputGroup>
              <InputGroup.Text>🔍</InputGroup.Text>
              <FormControl
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Toutes les catégories</option>
              {taskCategories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={6}>
            <div className="d-flex justify-content-between">
              <div className="view-mode-toggle">
                <Button 
                  variant={viewMode === 'kanban' ? 'primary' : 'outline-primary'} 
                  onClick={() => setViewMode('kanban')}
                  className="me-2"
                >
                  Kanban
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'primary' : 'outline-primary'} 
                  onClick={() => setViewMode('list')}
                >
                  Liste
                </Button>
              </div>
              
              <div>
                <Button 
                  variant="success" 
                  onClick={handleAddNewNote}
                  className="me-2"
                >
                  <i className="fas fa-plus-circle"></i> Nouvelle note
                </Button>
                <span className="text-muted">
                  {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} trouvée{filteredNotes.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Affichage en mode Kanban */}
      {viewMode === 'kanban' && kanbanReady && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {STATUSES.map((status) => {
              const columnId = COLUMN_IDS[status];
              const notesInColumn = notesByStatus[status] || [];
              
              return (
                <div key={status} className="kanban-column">
                  <h5 className="kanban-column-title" style={{ backgroundColor: getStatusColor(status) }}>
                    {status.charAt(0).toUpperCase() + status.slice(1)} ({notesInColumn.length || 0})
                  </h5>
                  <Droppable droppableId={columnId}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="kanban-column-content"
                        data-status={status}
                        data-column-id={columnId}
                      >
                        {notesInColumn.length > 0 ? (
                          notesInColumn.map((note, index) => 
                            note && note._id ? renderNoteCard(note, index) : null
                          )
                        ) : (
                          <p className="text-muted text-center kanban-empty">Aucune note</p>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {viewMode === 'kanban' && !kanbanReady && (
        <div className="text-center py-5">
          <p>Chargement du tableau Kanban...</p>
        </div>
      )}

      {/* Affichage en mode Liste */}
      {viewMode === 'list' && (
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredNotes.map((note) => (
            <Col key={note._id}>
              <Card className={`note-card ${note.category ? `category-${note.category.split(' ')[0].toLowerCase()}` : ''}`}>
                <div 
                  className="note-status-indicator"
                  style={{ backgroundColor: getStatusColor(note.status) }}
                >
                  {note.status}
                </div>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <Card.Title className="mb-1">{note.title}</Card.Title>
                    {note.category && (
                      <Badge bg="secondary" className="category-badge">
                        {note.category}
                      </Badge>
                    )}
                  </div>
                  <Card.Subtitle className="mb-2 text-muted">{formatDate(note.date)}</Card.Subtitle>
                  
                  <div className="mt-2 mb-2">
                    {note.tags && note.tags.map((tag, index) => (
                      <Badge 
                        bg="info" 
                        className="me-1 mb-1"
                        key={index}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="note-actions mt-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEditNote(note)}
                      className="me-2"
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteNote(note._id)}
                    >
                      Supprimer
                    </Button>
                    <Form.Select
                      size="sm"
                      className="mt-2 status-select"
                      value={note.status}
                      onChange={(e) => handleStatusChange(note._id, e.target.value)}
                    >
                      {STATUSES.map((status, index) => (
                        <option key={index} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
      {filteredNotes.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">Aucune note trouvée</p>
        </div>
      )}
    </Container>
  );
};

export default Notes;
