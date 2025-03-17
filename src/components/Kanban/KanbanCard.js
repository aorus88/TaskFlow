import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Badge } from 'react-bootstrap';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const KanbanCard = ({ note, index, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Draggable draggableId={note._id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="kanban-card-header">
            <h4>{note.title}</h4>
            {note.category && (
              <Badge bg="secondary" className="category-badge">
                {note.category}
              </Badge>
            )}
          </div>
          
          <div 
            className="kanban-card-content"
            dangerouslySetInnerHTML={{ __html: note.content.substring(0, 100) + '...' }}
          />
          
          <div className="kanban-card-footer">
            <div className="kanban-card-tags">
              {note.tags && note.tags.map((tag, idx) => (
                <Badge bg="info" key={idx} className="me-1">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="kanban-card-date">
              {formatDate(note.date)}
            </div>
            
            <div className="kanban-card-actions">
              <button 
                className="btn-edit" 
                onClick={() => onEdit(note)}
                title="Modifier"
              >
                <i className="fas fa-edit"></i>
              </button>
              <button 
                className="btn-delete" 
                onClick={() => onDelete(note._id)}
                title="Supprimer"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
