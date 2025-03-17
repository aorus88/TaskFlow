import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ id, title, color, notes, onEditNote, onDeleteNote }) => {
  return (
    <div className="kanban-column">
      <div className="kanban-column-header" style={{ backgroundColor: color }}>
        <h3>{title.charAt(0).toUpperCase() + title.slice(1)}</h3>
        <span className="note-count">{notes.length}</span>
      </div>
      
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            className={`kanban-column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {notes.length > 0 ? (
              notes.map((note, index) => (
                <KanbanCard
                  key={note._id}
                  note={note}
                  index={index}
                  onEdit={onEditNote}
                  onDelete={onDeleteNote}
                />
              ))
            ) : (
              <div className="empty-column">Aucune note</div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
