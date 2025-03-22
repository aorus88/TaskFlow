// filepath: a:\src\components\ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { currentUser, loading, isAuthenticated, isAdmin } = useContext(AuthContext);

  // Si l'authentification est en cours de vérification, afficher un indicateur de chargement
  if (loading) {
    return <div>Chargement...</div>;
  }

  // Vérifier les conditions d'accès
  if (!isAuthenticated) {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    return <Navigate to="/login" replace />;
  }

  // Vérifier les droits d'administrateur si nécessaire
  if (requireAdmin && !isAdmin) {
    // Rediriger vers la page d'accueil si l'utilisateur n'a pas les droits d'admin
    return <Navigate to="/" replace />;
  }

  // Si toutes les conditions sont remplies, autoriser l'accès
  return <Outlet />;
};

export default ProtectedRoute;