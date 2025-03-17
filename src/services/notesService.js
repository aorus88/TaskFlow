const API_URL = 'http://192.168.50.241:4000';

// Fonction de gestion des erreurs
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Récupérer toutes les notes
export const getAllNotes = async () => {
  try {
    const response = await fetch(`${API_URL}/notes`);
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    throw error;
  }
};

// Récupérer une note par son ID
export const getNoteById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/notes/${id}`);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la note ${id}:`, error);
    throw error;
  }
};

// Créer une nouvelle note
export const createNote = async (note) => {
  try {
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(note),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Erreur lors de la création de la note:', error);
    throw error;
  }
};

// Mettre à jour une note existante
export const updateNoteById = async (id, updates) => {
  try {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la note ${id}:`, error);
    throw error;
  }
};

// Supprimer une note
export const deleteNoteById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'DELETE',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Erreur lors de la suppression de la note ${id}:`, error);
    throw error;
  }
};

// Mettre à jour le statut d'une note
export const updateNoteStatus = async (id, status) => {
  try {
    const note = await getNoteById(id);
    if (!note) throw new Error('Note non trouvée');
    
    const response = await fetch(`${API_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...note, status }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut de la note ${id}:`, error);
    throw error;
  }
};

// Rechercher des notes
export const searchNotes = async (term) => {
  try {
    const response = await fetch(`${API_URL}/notes/search/${encodeURIComponent(term)}`);
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur lors de la recherche de notes:', error);
    throw error;
  }
};

// Filtrer les notes par catégorie
export const getNotesByCategory = async (category) => {
  try {
    const response = await fetch(`${API_URL}/notes/category/${encodeURIComponent(category)}`);
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erreur lors du filtrage des notes par catégorie:', error);
    throw error;
  }
};
