const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Task = require('../models/Task');
const Note = require('../models/Note');
const ConsumptionEntry = require('../models/ConsumptionEntry');

// Middleware pour gérer les requêtes OPTIONS (preflight CORS)
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});

// Login route
router.post('/login', async (req, res) => {
  // Ajouter les en-têtes CORS à la réponse
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  try {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'votre_clé_secrète_jwt',
      { expiresIn: '7d' }
    );
    
    // Renvoyer une réponse avec le token et les infos de l'utilisateur (sans le mot de passe)
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    res.json({
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Erreur de connexion:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

// Appliquer les en-têtes CORS à toutes les autres routes
const applyCorsHeaders = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  next();
};

// Register route
router.post('/register', applyCorsHeaders, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Un utilisateur avec cet email ou ce nom d\'utilisateur existe déjà.' 
      });
    }
    
    // Créer un nouvel utilisateur
    const newUser = new User({
      username,
      email,
      password
    });
    
    await newUser.save();
    
    // Ne pas renvoyer le mot de passe
    const userWithoutPassword = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    };
    
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription.' });
  }
});

// Migration route - pour associer les données sans propriétaire à l'admin
router.post('/migrate-data', applyCorsHeaders, async (req, res) => {
  try {
    // Vérifier si l'utilisateur admin existe
    const adminUser = await User.findOne({ email: 'admin@taskflow.com' });
    if (!adminUser) {
      return res.status(404).json({ error: 'Utilisateur admin non trouvé' });
    }
    
    // Migrer les tâches sans userId
    const tasksUpdated = await Task.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: adminUser._id } }
    );
    
    // Migrer les notes sans userId
    const notesUpdated = await Note.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: adminUser._id } }
    );
    
    // Migrer les entrées de consommation sans userId
    const entriesUpdated = await ConsumptionEntry.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: adminUser._id } }
    );
    
    res.json({
      message: 'Migration des données réussie',
      tasksUpdated: tasksUpdated.nModified || 0,
      notesUpdated: notesUpdated.nModified || 0,
      entriesUpdated: entriesUpdated.nModified || 0
    });
  } catch (err) {
    console.error('Erreur lors de la migration des données:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la migration des données' });
  }
});

// Get current user route
router.get('/me', applyCorsHeaders, async (req, res) => {
  try {
    // Le middleware a déjà vérifié le token et attaché l'utilisateur à req.user
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Logout route
router.post('/logout', applyCorsHeaders, (req, res) => {
  // Avec JWT, le logout est principalement côté client (suppression du token)
  res.json({ message: 'Déconnexion réussie' });
});

module.exports = router;
