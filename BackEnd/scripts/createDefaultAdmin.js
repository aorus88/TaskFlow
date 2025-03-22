const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Charger les variables d'environnement
dotenv.config();

// Se connecter à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflowDB')
  .then(async () => {
    console.log('Connecté à MongoDB');
    
    try {
      // Vérifier si un admin existe déjà
      const adminExists = await User.findOne({ role: 'admin' });
      
      if (!adminExists) {
        // Créer un nouvel administrateur
        const adminUser = new User({
          username: 'admin',
          email: 'admin@taskflow.com',
          password: 'Admin123!', // Ce mot de passe sera haché automatiquement
          role: 'admin'
        });
        
        await adminUser.save();
        console.log('Utilisateur administrateur créé avec succès!');
        console.log('Email: admin@taskflow.com');
        console.log('Mot de passe: Admin123!');
      } else {
        console.log('Un utilisateur administrateur existe déjà.');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'administrateur:', error);
    }
    
    // Fermer la connexion
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB:', err);
  });
