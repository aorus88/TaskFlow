// Script temporaire pour rendre le backend plus tolérant pendant le développement

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Schémas de base pour la migration
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String
});

const User = mongoose.model('User', userSchema);

async function createTemporaryUser() {
  try {
    // Se connecter à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflowDB');
    console.log('Connecté à MongoDB');

    // Vérifier si un utilisateur temporaire pour le développement existe déjà
    let devUser = await User.findOne({ email: 'dev@taskflow.com' });
    
    if (!devUser) {
      console.log("Création d'un utilisateur temporaire pour le développement...");
      devUser = new User({
        username: 'dev',
        email: 'dev@taskflow.com',
        password: 'DevPassword123!',
        role: 'admin'
      });
      await devUser.save();
      console.log("Utilisateur temporaire créé avec ID:", devUser._id);
    } else {
      console.log("Utilisateur temporaire déjà existant avec ID:", devUser._id);
    }

    // Modifier le modèle req.user pour le middleware checkAuth
    console.log(`
    ========================================
    ATTENTION: UTILISEZ CETTE CONFIGURATION UNIQUEMENT EN DÉVELOPPEMENT
    
    Pour activer l'authentification avec bypass temporaire:
    
    const checkAuth = (req, res, next) => {
      // En développement, on simule un utilisateur connecté
      req.user = {
        _id: "${devUser._id}",
        username: "dev",
        email: "dev@taskflow.com",
        role: "admin"
      };
      next();
    };
    
    Copiez ce code dans app.js pour remplacer temporairement le middleware checkAuth
    ========================================
    `);
    
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connexion fermée");
  }
}

createTemporaryUser();
