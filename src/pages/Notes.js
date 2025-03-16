import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import '../styles/Notes.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({
    id: '',
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    // Charger les notes depuis le backend au démarrage
    const fetchNotes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:4000/notes');
        const data = await response.json();
        setNotes(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des notes:', err);
      }
    };
    fetchNotes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote({
      ...newNote,
      [name]: value,
    });
  };

  const handleAddNote = async () => {
    if (!newNote.title || !newNote.content) return;

    try {
      const response = await fetch('http://127.0.0.1:4000/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });

      if (response.ok) {
        const addedNote = await response.json();
        setNotes([addedNote, ...notes]);
        setNewNote({
          id: '',
          title: '',
          content: '',
          date: new Date().toISOString().split('T')[0],
        });
      } else {
        console.error('Erreur lors de l\'ajout de la note:', response.status);
      }
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la note:', err);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:4000/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes(notes.filter(note => note._id !== id));
      } else {
        console.error('Erreur lors de la suppression de la note:', response.status);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de la note:', err);
    }
  };

  return (
    <Container className="notes-container">
      <h2>Notes Quotidiennes</h2>

      <Form className="note-form mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Titre</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={newNote.title}
            onChange={handleInputChange}
            placeholder="Titre de la note"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contenu</Form.Label>
          <Form.Control
            as="textarea"
            name="content"
            value={newNote.content}
            onChange={handleInputChange}
            placeholder="Écrivez votre note ici..."
            rows={3}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={newNote.date}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Button variant="primary" onClick={handleAddNote}>
          Ajouter une note
        </Button>
      </Form>

      <Row xs={1} md={2} lg={3} className="g-4">
        {notes.map((note) => (
          <Col key={note._id}>
            <Card className="note-card">
              <Card.Body>
                <Card.Title>{note.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{note.date}</Card.Subtitle>
                <Card.Text>{note.content}</Card.Text>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteNote(note._id)}
                >
                  Supprimer
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Notes;
