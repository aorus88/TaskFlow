/**
 * Fichier de configuration de l'API
 * Centralise les URL et options par défaut pour les requêtes API
 */

// Déterminer automatiquement l'URL de base selon l'environnement
export const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168'))
  ? `http://${window.location.hostname}:4000`
  : '/api'; // En production, utilisera des chemins relatifs

// URL de base pour l'authentification
export const AUTH_API_URL = `${API_BASE_URL}/api/auth`;

// Options par défaut pour les requêtes fetch
export const DEFAULT_FETCH_OPTIONS = {
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include' // Important pour les cookies de session
};

// Fonctions d'aide pour les requêtes API
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('Utilisateur non authentifié');
  }
  
  const authHeader = {
    Authorization: `Bearer ${token}`
  };
  
  const mergedOptions = {
    ...DEFAULT_FETCH_OPTIONS,
    ...options,
    headers: {
      ...DEFAULT_FETCH_OPTIONS.headers,
      ...options.headers,
      ...authHeader
    }
  };
  
  return fetch(url, mergedOptions);
};

// Fonction pour migrer les données existantes vers l'utilisateur admin
export const migrateDataToAdmin = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const response = await fetch(`${API_BASE_URL}/api/auth/migrate-data`, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la migration des données');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la migration des données:', error);
    throw error;
  }
};

// Fonction pour obtenir des URL absolues avec le bon protocole
export const getApiUrl = (path) => {
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168');
  if (isLocalDev) {
    return `http://${window.location.hostname}:4000${path}`;
  } else {
    return path; // En production, utilise des chemins relatifs
  }
};
