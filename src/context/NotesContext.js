import React, { createContext, useState, useCallback } from 'react';
import { 
  getAllNotes, 
  getNoteById, 
  createNote, 
  updateNoteById, 
  deleteNoteById,
  updateNoteStatus as apiUpdateNoteStatus
} from '../services/notesService';

export const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupérer toutes les notes
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllNotes();
      setNotes(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des notes:', err);
      setError('Impossible de charger les notes. Veuillez réessayer plus tard.');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer une note par son ID
  const fetchNoteById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const note = await getNoteById(id);
      return note;
    } catch (err) {
      console.error('Erreur lors de la récupération de la note:', err);
      setError('Impossible de charger cette note. Veuillez réessayer plus tard.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ajouter une nouvelle note
  const addNote = useCallback(async (note) => {
    setLoading(true);
    setError(null);
    try {
      const newNote = await createNote(note);
      setNotes(prevNotes => [newNote, ...prevNotes]);
      return newNote;
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la note:', err);
      setError('Impossible d\'ajouter la note. Veuillez réessayer plus tard.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour une note existante
  const updateNote = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const updatedNote = await updateNoteById(id, updates);
      setNotes(prevNotes => 
        prevNotes.map(note => note._id === id ? updatedNote : note)
      );
      return updatedNote;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la note:', err);
      setError('Impossible de mettre à jour la note. Veuillez réessayer plus tard.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Supprimer une note
  const deleteNote = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteNoteById(id);
      setNotes(prevNotes => prevNotes.filter(note => note._id !== id));
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de la note:', err);
      setError('Impossible de supprimer la note. Veuillez réessayer plus tard.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour le statut d'une note
  const updateNoteStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const updatedNote = await apiUpdateNoteStatus(id, status);
      setNotes(prevNotes => 
        prevNotes.map(note => note._id === id ? updatedNote : note)
      );
      return updatedNote;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut de la note:', err);
      setError('Impossible de mettre à jour le statut de la note. Veuillez réessayer plus tard.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        error,
        fetchNotes,
        fetchNoteById,
        addNote,
        updateNote,
        deleteNote,
        updateNoteStatus
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
