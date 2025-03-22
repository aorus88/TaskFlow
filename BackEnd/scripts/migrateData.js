const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement
dotenv.config();

// Récupérer les mêmes modèles que dans app.js
// Notez: C'est une version simplifiée, vous pourriez avoir besoin d'importer vos modèles
// depuis un fichier séparé selon votre structure de code

const sessionSchema = new mongoose.Schema({
    duration: Number,
    date: Date,
    type: { type: String, enum: ['task', 'subtask'] },
    targetId: String
});

const subtaskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    addedAt: { type: Date, default: Date.now },
    archivedAt: { type: Date, default: null },
    archived: { type: String, enum: ['open', 'closed'], default: 'open' },
    sessions: [sessionSchema],
});

const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    archivedAt: { type: Date, default: null },
    archived: { type: String, enum: ['open', 'closed'], default: 'open' },
    addedAt: { type: Date, default: Date.now },
    categories: { type: [String], default: [] },
    taskType: { type: String, enum: ['task', 'habit'], default: 'task' },
    totalTime: { type: Number, default: 0 },
    LastSessionTime: { type: Number, default: 0 },
    subtasks: { type: [subtaskSchema], default: [] },
    sessions: [sessionSchema],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Pas required pour la migration
});

const consumptionEntrySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time: { type: String, required: true },
    mood: { type: String, required: true },
    consumption: { type: String, enum: ['yes', 'no'], required: true },
    createdAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Pas required pour la migration
});

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, required: true },
    category: { type: String, default: "" },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['à faire', 'en cours', 'terminé'], default: 'à faire' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Pas required pour la migration
});

// Définissez vos modèles
const Task = mongoose.model('Task', taskSchema);
const ConsumptionEntry = mongoose.model('ConsumptionEntry', consumptionEntrySchema);
const Note = mongoose.model('Note', noteSchema);
const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String
}));

async function migrateData() {
  try {
    // Se connecter à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflowDB');
    console.log('Connecté à MongoDB');

    // 1. Trouver ou créer un utilisateur par défaut
    let defaultUser = await User.findOne({ role: 'admin' });
    if (!defaultUser) {
      console.log("Création d'un utilisateur par défaut...");
      defaultUser = new User({
        username: 'admin',
        email: 'admin@taskflow.com',
        password: 'Admin123!', // Ce mot de passe sera haché automatiquement
        role: 'admin'
      });
      await defaultUser.save();
      console.log("Utilisateur par défaut créé avec ID:", defaultUser._id);
    } else {
      console.log("Utilisateur par défaut déjà existant avec ID:", defaultUser._id);
    }

    // 2. Mettre à jour les tâches
    console.log("Mise à jour des tâches...");
    const tasksCount = await Task.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: defaultUser._id } }
    );
    console.log(`${tasksCount.modifiedCount} tâches mises à jour`);

    // 3. Mettre à jour les entrées de consommation
    console.log("Mise à jour des entrées de consommation...");
    const entriesCount = await ConsumptionEntry.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: defaultUser._id } }
    );
    console.log(`${entriesCount.modifiedCount} entrées de consommation mises à jour`);

    // 4. Mettre à jour les notes
    console.log("Mise à jour des notes...");
    const notesCount = await Note.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: defaultUser._id } }
    );
    console.log(`${notesCount.modifiedCount} notes mises à jour`);

    console.log("Migration terminée avec succès");
    
  } catch (error) {
    console.error("Erreur lors de la migration des données:", error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log("Connexion fermée");
  }
}

migrateData();
