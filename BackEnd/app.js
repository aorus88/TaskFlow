const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// 1) Création de l'application Express
const app = express();

// 2) Middlewares
// Configuration CORS améliorée
app.use(cors({
  origin: ['http://192.168.50.241:3000', 'http://localhost:3000', 'http://127.0.0.1:3000', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200, // Pour les navigateurs anciens qui ne supportent pas HTTP 204
  preflightContinue: false
}));
app.use(express.json());

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'votre_clé_secrète_de_session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Pas besoin de secure en HTTP
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Initialiser Passport
app.use(passport.initialize());
app.use(passport.session());

// Importer la configuration de Passport
require('./config/passport');

// 3) Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflowDB')
.then(() => {
    console.log('Connecté à MongoDB');
})
.catch((err) => {
    console.error('Erreur de connexion à MongoDB :', err);
});

// Importer les routes d'authentification
const authRoutes = require('./routes/auth');

// Appliquer les routes
app.use('/api/auth', authRoutes);

// Choisissez UNE des deux options ci-dessous:

// OPTION 1: Utiliser l'authentification JWT (pour la production)
const jwt = require('jsonwebtoken');
const checkAuth = (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête d'autorisation
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // En développement, simuler un utilisateur admin connecté
      req.user = {
        _id: "67dee6ba6514967a97a47495", // ID de l'utilisateur admin
        username: "admin",
        email: "admin@taskflow.com",
        role: "admin"
      };
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_clé_secrète_jwt');
    
    // Attacher l'utilisateur décodé à la requête
    req.user = decoded;
    next();
  } catch (error) {
    // En cas d'erreur, simuler l'utilisateur admin pour le développement
    console.error('Erreur d\'authentification (simulation admin utilisée):', error);
    req.user = {
      _id: "67dee6ba6514967a97a47495",
      username: "admin",
      email: "admin@taskflow.com",
      role: "admin"
    };
    next();
  }
};

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ error: 'Accès refusé. Privilèges insuffisants.' });
};

//définir le shéma du temps de session
const sessionSchema = new mongoose.Schema({
    duration: Number,
    date: Date,
    type: { type: String, enum: ['task', 'subtask'] },
    targetId: String // ID de la tâche ou sous-tâche
});

const Session = mongoose.model('Session', sessionSchema);

// 4) Définition du Schéma / Modèle Mongoose
const subtaskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    addedAt: { type: Date, default: Date.now },
    archivedAt: { type: Date, default: null },
    archived: { type: String, enum: ['open', 'closed'], default: 'open' }, // Nouveau champ
    sessions: [sessionSchema], // Ajouter les sessions
});

const taskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    archivedAt: { type: Date, default: null },
    archived: { type: String, enum: ['open', 'closed'], default: 'open' }, // Nouveau champ
    addedAt: { type: Date, default: Date.now },
    categories: { type: [String], default: [] },
    taskType: { type: String, enum: ['task', 'habit'], default: 'task' }, // Ajout du type de tâche
    totalTime: { type: Number, default: 0 }, // Temps total en minutes
    LastSessionTime: { type: Number, default: 0 }, // Temps en cours en minutes
    subtasks: { type: [subtaskSchema], default: [] },
    sessions: [sessionSchema], // Ajouter les sessions
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Ajouter userId
});

const Task = mongoose.model('Task', taskSchema);

// Schéma pour les entrées de consommation de cigarettes
const consumptionEntrySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time: { type: String, required: true },
    mood: { type: String, required: true },
    consumption: { type: String, enum: ['yes', 'no'], required: true },
    createdAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Ajouter userId
});

const ConsumptionEntry = mongoose.model('ConsumptionEntry', consumptionEntrySchema);

// Mettre à jour le schéma des notes pour prendre en charge les nouvelles fonctionnalités
const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, required: true },
    category: { type: String, default: "" },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['à faire', 'en cours', 'terminé'], default: 'à faire' }, // Nouveau champ
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Ajouter userId
});

const Note = mongoose.model('Note', noteSchema);

// Middleware pour servir les fichiers statiques du build React
// Utilisons un chemin relatif par rapport au répertoire du backend
const path = require('path');

// Servir les fichiers statiques avec une configuration explicite
app.use(express.static(path.join(__dirname, '../public'), {
  index: false, // Ne pas servir automatiquement index.html
  setHeaders: (res, path) => {
    // Ajouter des en-têtes de cache appropriés
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.ico')) {
      res.setHeader('Content-Type', 'image/x-icon');
    }
  }
}));

// Route spécifique pour servir le favicon.ico
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/favicon.ico'));
});

// Configurer les en-têtes de base
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// 5) Routes de l'API
// a) Récupérer toutes les tâches avec filtres
app.get('/tasks', checkAuth, async (req, res) => {
  const { archived } = req.query;
  // Si vous recevez un paramètre archived, vous pouvez filtrer,
  // sinon, renvoyez toutes les tâches.
  let filter = {
    userId: req.user._id // Filtrer par utilisateur connecté
  };
  if (archived === 'true') {
    filter.archived = 'closed';
  } else if (archived === 'false') {
    filter.archived = 'open';
  }

  try {
    // Utiliser .lean() pour avoir des objets JS simples
    const tasks = await Task.find(filter).lean();
    // Ajoutez un champ "status" égal à la valeur du champ "archived"
    const tasksWithStatus = tasks.map(task => ({
      ...task,
      status: task.archived // Ici, status sera "open" ou "closed"
    }));
    console.log("Backend - Tâches récupérées avec status :", tasksWithStatus);
    res.json(tasksWithStatus);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des tâches.' });
  }
});

// routes pour ajouter des tâches à TaskFlow
// 1) Ajouter une nouvelle tâche
app.post('/tasks', checkAuth, async (req, res) => {
    const { name, date, priority, categories, subtasks, taskType, time, status } = req.body;
    try {
        const newTask = new Task({
            name,
            date,
            priority,
            categories,
            subtasks,
            taskType: taskType || 'task', // S'assurer que le taskType est bien sauvegardé
            time,
            status,
            userId: req.user._id // Associer à l'utilisateur connecté
        });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ error: 'Erreur lors de l\'ajout de la tâche.' });
    }
});

// 2) Mettre à jour une tâche
app.put('/tasks/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        // Vérifier que la tâche appartient à l'utilisateur
        const task = await Task.findOne({ _id: id, userId: req.user._id });
        if (!task) {
            return res.status(404).json({ error: 'Tâche non trouvée ou accès non autorisé.' });
        }
        const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ error: 'Erreur lors de la mise à jour de la tâche.' });
    }
});

// 3) Supprimer une tâche
app.delete('/tasks/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    try {
        await Task.findByIdAndDelete(id);
        res.json({ message: 'Tâche supprimée avec succès.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la tâche.' });
    }
});

// 1a) Ajouter une sous-tâche à une tâche existante
app.post('/tasks/:id/subtasks', checkAuth, async (req, res) => {
    const { id } = req.params;
    const { name, priority } = req.body;
    try {
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ error: 'Tâche non trouvée.' });
        }
        // Vérifiez l'unicité de la sous-tâche
        const isSubtaskUnique = !task.subtasks.some(subtask => subtask.name === name);
        if (!isSubtaskUnique) {
            return res.status(400).json({ error: 'La sous-tâche existe déjà.' });
        }
        task.subtasks.push({ name, priority });
        await task.save();
        console.log("Sous-tâche ajoutée :", { name, priority }); // Ajoutez ce log
        res.json(task);
    } catch (err) {
        console.error('Erreur lors de l\'ajout de la sous-tâche :', err);
        res.status(400).json({ error: 'Erreur lors de l\'ajout de la sous-tâche.' });
    }
});

// 1b) Mettre à jour le statut d'une sous-tâche
app.put('/tasks/:taskId/subtasks/:subtaskId', checkAuth, async (req, res) => {
    const { taskId, subtaskId } = req.params;
    const { archived } = req.body;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Tâche non trouvée.' });
        }
        const subtask = task.subtasks.id(subtaskId);
        if (!subtask) {
            return res.status(404).json({ error: 'Sous-tâche non trouvée.' });
        }
        subtask.archived = archived;
        subtask.archivedAt = archived === 'closed' ? new Date().toISOString() : null;
        await task.save();
        res.json(task);
    } catch (err) {
        console.error('Erreur lors de la mise à jour de la sous-tâche :', err);
        res.status(400).json({ error: 'Erreur lors de la mise à jour de la sous-tâche.' });
    }
});

// 1c) Route pour supprimer une sous-tache
app.delete('/tasks/:taskId/subtasks/:subtaskId', checkAuth, async (req, res) => {
  const { taskId, subtaskId } = req.params;
  try {
    console.log(`Suppression de la sous-tâche ${subtaskId} de la tâche ${taskId}`);
    const task = await Task.findById(taskId);
    if (!task) {
      console.error('Tâche non trouvée.');
      return res.status(404).json({ error: 'Tâche non trouvée.' });
    }
    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      console.error('Sous-tâche non trouvée.');
      return res.status(404).json({ error: 'Sous-tâche non trouvée.' });
    }
    task.subtasks.pull(subtaskId); // Utiliser la méthode pull pour supprimer la sous-tâche
    await task.save();
    res.json({ message: 'Sous-tâche supprimée avec succès.' });
  } catch (err) {
    console.error('Erreur lors de la suppression de la sous-tâche :', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la sous-tâche.', details: err.message });
  }
});

// routes pour les sessions - pomodoro timer
// 2a) Ajouter une session de temps à une tâche
app.post('/tasks/:taskId/sessions', checkAuth, async (req, res) => {
  const taskId = req.params.taskId;
  const session = req.body; // { duration, date, type, targetId }
  
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).send({ error: 'Task not found' });
    }
    // Création de la nouvelle session avec type et targetId
    const newSession = {
      duration: session.duration,
      date: session.date || new Date(),
      type: session.type, // 'task' ou 'subtask'
      targetId: session.targetId // ID de la tâche ou sous-tâche
    };
    
    // Ajouter la session au tableau de sessions
    task.sessions.push(newSession);
    // Si c'est une sous-tâche, trouver et mettre à jour la sous-tâche correspondante
    if (session.type === 'subtask') {
      const subtask = task.subtasks.id(session.targetId);
      if (!subtask) {
        return res.status(404).send({ error: 'Subtask not found' });
      }
      if (!subtask.sessions) {
        subtask.sessions = [];
      }
      subtask.sessions.push(newSession);
    }
    await task.save();
    res.json(task);
  } catch (err) {
    console.error('Erreur lors de l\'ajout de la session:', err);
    res.status(400).send(err);
  }
});

// 2b) Route pour récupérer les sessions d'une tâche spécifique
app.get('/tasks/:id/sessions', checkAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée.' });
    }
    res.json(task.sessions);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des sessions.' });
  }
});

// 2c) route pour supprimer les sessions d'une tâche spécifique 
app.delete('/tasks/:taskId/sessions/:sessionId', checkAuth, async (req, res) => {
  const { taskId, sessionId } = req.params;
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée.' });
    }
    task.sessions = task.sessions.filter(session => session._id.toString() !== sessionId);
    await task.save();
    res.json({ message: 'Session supprimée avec succès.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la session.' });
  }
});

// Routes pour les entrées de consommation de cigarettes
// 3a) Récupérer toutes les entrées
app.get('/consumption-entries', checkAuth, async (req, res) => {
    try {
        const entries = await ConsumptionEntry.find();
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des entrées.' });
    }
});

// 3b) Ajouter une nouvelle entrée
app.post('/consumption-entries', checkAuth, async (req, res) => {
    const { date, time, mood, consumption } = req.body;
    try {
        const newEntry = new ConsumptionEntry({
            date,
            time,
            mood,
            consumption,
            userId: req.user._id // Associer à l'utilisateur connecté
        });
        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (err) {
        res.status(400).json({ error: 'Erreur lors de l\'ajout de l\'entrée.' });
    }
});

// 3c) Mettre à jour une entrée
app.put('/consumption-entries/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedEntry = await ConsumptionEntry.findByIdAndUpdate(id, updates, { new: true });
        res.json(updatedEntry);
    } catch (err) {
        res.status(400).json({ error: 'Erreur lors de la mise à jour de l\'entrée.' });
    }
});

// 3d) Supprimer une entrée
app.delete('/consumption-entries/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    try {
        await ConsumptionEntry.findByIdAndDelete(id);
        res.json({ message: 'Entrée supprimée avec succès.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'entrée.' });
    }
});

// Endpoint pour renvoyer toutes les tâches avec leur champ "status" (fonction pour afficher toutes les sessions dans session.js + caldendrier)
app.get('/all-tasks', checkAuth, async (req, res) => {
  try {
    // Récupérer toutes les tâches sans filtre
    const tasks = await Task.find({}).lean();
    // Transformer chaque tâche en ajoutant le champ "status"
    // Ici, le champ "archived" contient déjà "open" ou "closed" selon votre schéma
    const tasksWithStatus = tasks.map(task => ({
      ...task,
      status: task.archived // status sera "open" ou "closed"
    }));
    console.log("Backend - Toutes les tâches récupérées avec status :", tasksWithStatus);
    res.json(tasksWithStatus);
  } catch (err) {
    console.error("Erreur lors de la récupération de toutes les tâches :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des tâches." });
  }
});

// a) Récupérer toutes les notes
app.get('/notes', checkAuth, async (req, res) => {
    try {
        const notes = await Note.find().sort({ date: -1, updatedAt: -1 });
        res.json(notes);
    } catch (err) {
        console.error('Erreur lors de la récupération des notes:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des notes.' });
    }
});

// b) Récupérer une note spécifique
app.get('/notes/:id', checkAuth, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ error: 'Note non trouvée.' });
        }
        res.json(note);
    } catch (err) {
        console.error('Erreur lors de la récupération de la note:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération de la note.' });
    }
});

// c) Ajouter une nouvelle note
app.post('/notes', checkAuth, async (req, res) => {
    const { title, content, date, category, tags } = req.body;
    try {
        const newNote = new Note({
            title,
            content,
            date,
            category: category || "",
            tags: tags || [],
            updatedAt: new Date(),
            userId: req.user._id // Associer à l'utilisateur connecté
        });
        await newNote.save();
        res.status(201).json(newNote);
    } catch (err) {
        console.error('Erreur lors de l\'ajout de la note:', err);
        res.status(400).json({ error: 'Erreur lors de l\'ajout de la note.' });
    }
});

// d) Mettre à jour une note
app.put('/notes/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    try {
        const updatedNote = await Note.findByIdAndUpdate(
            id, 
            updates, 
            { new: true, runValidators: true }
        );
        if (!updatedNote) {
            return res.status(404).json({ error: 'Note non trouvée.' });
        }
        res.json(updatedNote);
    } catch (err) {
        console.error('Erreur lors de la mise à jour de la note:', err);
        res.status(400).json({ error: 'Erreur lors de la mise à jour de la note.' });
    }
});

// e) Supprimer une note
app.delete('/notes/:id', checkAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedNote = await Note.findByIdAndDelete(id);
        if (!deletedNote) {
            return res.status(404).json({ error: 'Note non trouvée.' });
        }
        res.json({ message: 'Note supprimée avec succès.' });
    } catch (err) {
        console.error('Erreur lors de la suppression de la note:', err);
        res.status(500).json({ error: 'Erreur lors de la suppression de la note.' });
    }
});

// f) Rechercher des notes
app.get('/notes/search/:term', checkAuth, async (req, res) => {
    const { term } = req.params;
    try {
        const notes = await Note.find({
            $or: [
                { title: { $regex: term, $options: 'i' } },
                { content: { $regex: term, $options: 'i' } },
                { tags: { $in: [new RegExp(term, 'i')] } }
            ]
        }).sort({ date: -1, updatedAt: -1 });
        res.json(notes);
    } catch (err) {
        console.error('Erreur lors de la recherche de notes:', err);
        res.status(500).json({ error: 'Erreur lors de la recherche de notes.' });
    }
});

// g) Filtrer les notes par catégorie
app.get('/notes/category/:category', checkAuth, async (req, res) => {
    const { category } = req.params;
    try {
        const notes = await Note.find({
            category: { $regex: category, $options: 'i' }
        }).sort({ date: -1, updatedAt: -1 });
        res.json(notes);
    } catch (err) {
        console.error('Erreur lors du filtrage des notes par catégorie:', err);
        res.status(500).json({ error: 'Erreur lors du filtrage des notes par catégorie.' });
    }
});

// Route pour régénérer les habitudes quotidiennes
app.post('/regenerate-habits', checkAuth, async (req, res) => {
    try {
        // Trouver toutes les habitudes ouvertes de l'utilisateur connecté
        const habits = await Task.find({ 
            taskType: 'habit',
            archived: 'open',
            userId: req.user._id // Filtrer par utilisateur
        });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Début de la journée
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const newHabits = [];
        // Pour chaque habitude, vérifier si une instance pour aujourd'hui existe déjà
        for (const habit of habits) {
            // Vérifier si cette habitude a déjà été créée aujourd'hui
            const habitInstanceToday = await Task.findOne({
                name: habit.name,
                taskType: 'habit',
                date: { $gte: today, $lt: tomorrow }
            });
            
            // Si aucune instance n'existe pour aujourd'hui, en créer une nouvelle
            if (!habitInstanceToday) {
                const newHabit = new Task({
                    name: habit.name,
                    date: new Date(),
                    priority: habit.priority,
                    categories: habit.categories,
                    taskType: 'habit',
                    userId: req.user._id, // Associer à l'utilisateur
                    subtasks: habit.subtasks.map(subtask => ({
                        name: subtask.name,
                        priority: subtask.priority,
                        archived: 'open'
                    }))
                });
                
                await newHabit.save();
                newHabits.push(newHabit);
            }
        }
        
        res.json({
            message: 'Habitudes régénérées avec succès',
            count: newHabits.length,
            habits: newHabits
        });
    } catch (err) {
        console.error('Erreur lors de la régénération des habitudes:', err);
        res.status(500).json({ error: 'Erreur lors de la régénération des habitudes.' });
    }
});

// Routes d'API pour la gestion des utilisateurs (protégées par isAdmin)
app.get('/api/auth/users', checkAuth, isAdmin, async (req, res) => {
  try {
    // Récupérer tous les utilisateurs mais exclure les mots de passe
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des utilisateurs' });
  }
});

app.get('/api/auth/users/:id', checkAuth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de l\'utilisateur' });
  }
});

app.put('/api/auth/users/:id', checkAuth, isAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Mettre à jour les champs
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    
    // Mettre à jour le mot de passe si fourni
    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    
    // Renvoyer l'utilisateur sans le mot de passe
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'utilisateur' });
  }
});

app.delete('/api/auth/users/:id', checkAuth, isAdmin, async (req, res) => {
  try {
    // Empêcher la suppression de son propre compte
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'utilisateur' });
  }
});

// Modifier la route d'enregistrement pour permettre la création d'utilisateurs par les administrateurs
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Vérifier si l'utilisateur est administrateur (sauf pour le premier utilisateur ou dev)
    const isFirstUser = await User.countDocuments() === 0;
    const isAdmin = req.user && req.user.role === 'admin';
    
    // Si ce n'est pas le premier utilisateur et que l'utilisateur n'est pas admin, refuser la création
    if (!isFirstUser && !isAdmin && role === 'admin') {
      return res.status(403).json({ error: 'Permission refusée. Seul un administrateur peut créer d\'autres administrateurs.' });
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    // Créer le nouvel utilisateur
    const newUser = new User({
      username,
      email,
      password, // Le modèle User se chargera du hachage
      role: role || 'user' // Par défaut, le rôle est 'user'
    });
    
    await newUser.save();
    
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement' });
  }
});

// Route pour servir l'application React pour toutes les autres routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// 6) Exportation de l'application
module.exports = app;