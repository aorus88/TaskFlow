import React, { useRef, useEffect } from 'react';
import { Form, Row, Col, Badge, InputGroup, FormControl, Button } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/editor.css';

// Liste des statuts possibles
const STATUSES = ['à faire', 'en cours', 'terminé'];

// Note: ReactQuill utilise findDOMNode qui est déprécié.
// C'est un problème interne à la bibliothèque et n'affecte pas la fonctionnalité.
const EditorMain = ({ note, onChange, isEditing, categories }) => {
  const quillRef = useRef(null);
  const [tempTag, setTempTag] = React.useState('');

  // Configuration simplifiée de ReactQuill avec barre d'outils intégrée
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];
  
  // Fonction pour générer un titre automatiquement depuis le contenu
  useEffect(() => {
    if (!isEditing && note.content && !note.title) {
      const textContent = note.content.replace(/<[^>]+>/g, '');
      const words = textContent.trim().split(/\s+/).slice(0, 7);
      let title = words.join(' ');
      
      if (textContent.length > title.length && title.length > 0) {
        title += '...';
      }
      
      const autoTitle = title.length > 0 ? title : 'Nouvelle note';
      onChange({...note, title: autoTitle});
    }
  }, [note.content, note.title, isEditing, onChange]);

  // Gestion des tags
  const handleAddTag = () => {
    if (tempTag.trim() && !note.tags.includes(tempTag.trim())) {
      onChange({
        ...note,
        tags: [...note.tags, tempTag.trim()]
      });
      setTempTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onChange({
      ...note,
      tags: note.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Handler pour les changements de propriétés
  const handlePropertyChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...note,
      [name]: value
    });
  };

  // Handler pour le contenu de l'éditeur
  const handleContentChange = (content) => {
    console.log('Contenu modifié:', content); // Log de débogage
    onChange({
      ...note,
      content
    });
  };

  return (
    <div className="editor-container">
      <div className="editor-wrapper">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={note.content}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          placeholder="Écrivez votre note ici..."
        />
      </div>

      <div className="editor-metadata">
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Titre</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={note.title}
                onChange={handlePropertyChange}
                placeholder="Titre de la note"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={note.date}
                onChange={handlePropertyChange}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Catégorie</Form.Label>
              <Form.Select
                name="category"
                value={note.category}
                onChange={handlePropertyChange}
              >
                <option value="">Sélectionner</option>
                {categories.map((cat, index) => (
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
                value={note.status}
                onChange={handlePropertyChange}
              >
                {STATUSES.map((status, index) => (
                  <option key={index} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Tags</Form.Label>
              <InputGroup>
                <FormControl
                  placeholder="Ajouter un tag"
                  value={tempTag}
                  onChange={(e) => setTempTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button variant="outline-secondary" onClick={handleAddTag}>+</Button>
              </InputGroup>
              <div className="tags-container mt-2">
                {note.tags && note.tags.map((tag, index) => (
                  <Badge 
                    bg="info" 
                    className="me-1 mb-1 tag-badge" 
                    key={index}
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </Form.Group>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default EditorMain;
