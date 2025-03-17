import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import KanbanColumn from './KanbanColumn';
import '../../styles/kanban.css';

// Statuts et leurs détails
const STATUSES = [
  { id: 'todo', name: 'à faire', color: '#f8d7da' }, // Rouge léger
  { id: 'in-progress', name: 'en cours', color: '#fff3cd' }, // Jaune léger
  { id: 'done', name: 'terminé', color: '#d1e7dd' } // Vert léger
];

const KanbanBoard = ({ notes, onEditNote, onDeleteNote, onStatusChange }) => {
  // Organiser les notes par statut
  const getNotesByStatus = () => {
    return STATUSES.reduce((acc, status) => {
      acc[status.id] = notes.filter(note => note.status === status.name);
      return acc;
    }, {});
  };

  const notesByStatus = getNotesByStatus();
  
  // Gestion du glisser-déposer
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    
    // Abandonner s'il n'y a pas de destination valide
    if (!destination) return;
    
    // Abandonner si l'élément est déposé à la même position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;
    
    // Obtenir le nouveau statut à partir de l'ID de la colonne de destination
    const newStatus = STATUSES.find(
      status => status.id === destination.droppableId
    )?.name;
    
    if (newStatus) {
      onStatusChange(draggableId, newStatus);
    }
  };
  
  return (
    <div className="kanban-container">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status.id}
              id={status.id}
              title={status.name}
              color={status.color}
              notes={notesByStatus[status.id] || []}
              onEditNote={onEditNote}
              onDeleteNote={onDeleteNote}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
