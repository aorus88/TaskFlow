import React, { createContext, useState, useEffect, useCallback } from 'react';
import { AUTH_API_URL } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Vérifier si l'utilisateur est déjà authentifié au chargement
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          // Pour faciliter le développement, on peut simuler un utilisateur admin
          const devMode = process.env.NODE_ENV === 'development';
          if (devMode) {
            console.log("Mode développement: simuler un utilisateur admin");
            setCurrentUser({
              _id: "67dee6ba6514967a97a47495", 
              username: "admin",
              email: "admin@taskflow.com",
              role: "admin"
            });
          } else {
            setLoading(false);
          }
          return;
        }
        
        const response = await fetch(`${AUTH_API_URL}/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        } else {
          // Token invalide ou expiré
          localStorage.removeItem('authToken');
        }
      } catch (err) {
        console.error('Erreur lors de la vérification d\'authentification:', err);
        setError('Impossible de vérifier l\'authentification.');
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);
  
  // Fonction d'inscription
  const register = useCallback(async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${AUTH_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }
      
      return data;
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fonction de connexion
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Échec de la connexion');
      }
      
      // Stocker le token dans localStorage
      localStorage.setItem('authToken', data.token);
      setCurrentUser(data.user);
      
      return data;
    } catch (err) {
      setError(err.message || 'Échec de la connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fonction de déconnexion
  const logout = useCallback(async () => {
    try {
      await fetch(`${AUTH_API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      // Supprimer le timestamp de connexion
      localStorage.removeItem('loginTimestamp');
      // Toujours supprimer le token et déconnecter l'utilisateur localement
      localStorage.removeItem('authToken');
      setCurrentUser(null);
    }
  }, []);
  
  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        loading, 
        error, 
        register, 
        login, 
        logout,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
