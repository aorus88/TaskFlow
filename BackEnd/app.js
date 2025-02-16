const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1) Création de l'application Express
const app = express();

// 2) Middlewares
app.use(cors()); // Ajoutez cette ligne pour activer CORS
app.use(express.json());

// 3) Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/taskflowDB')
.then(() => {
    console.log('Connecté à MongoDB');
})
.catch((err) => {
    console.error('Erreur de connexion à MongoDB :', err);
});

//définir le shéma du temps de session
const sessionSchema = new mongoose.Schema({
    duration: Number,
    date: Date,
    taskName: String,
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
    totalTime: { type: Number, default: 0 }, // Temps total en minutes
    LastSessionTime: { type: Number, default: 0 }, // Temps en cours en minutes
    subtasks: { type: [subtaskSchema], default: [] },
    sessions: [sessionSchema], // Ajouter les sessions
});

const Task = mongoose.model('Task', taskSchema);

// Schéma pour les entrées de consommation de cigarettes
const consumptionEntrySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time: { type: String, required: true },
    mood: { type: String, required: true },
    consumption: { type: String, enum: ['yes', 'no'], required: true },
    createdAt: { type: Date, default: Date.now }
});

const ConsumptionEntry = mongoose.model('ConsumptionEntry', consumptionEntrySchema);

// 5) Routes de l'API
// a) Récupérer toutes les tâches avec filtres
app.get('/tasks', async (req, res) => {
  const { archived } = req.query;
  // Si vous recevez un paramètre archived, vous pouvez filtrer,
  // sinon, renvoyez toutes les tâches.
  let filter = {};
  if (archived === 'true') {
    filter = { archived: 'closed' };
  } else if (archived === 'false') {
    filter = { archived: 'open' };
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

// 1)
//  Ajouter une nouvelle tâche
app.post('/tasks', async (req, res) => {
    const { name, date, priority, categories, subtasks } = req.body;
    try {
        const newTask = new Task({
            name,
            date,
            priority,
            categories,
            subtasks
        });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ error: 'Erreur lors de l\'ajout de la tâche.' });
    }
});

// 2)
// Mettre à jour une tâche
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ error: 'Erreur lors de la mise à jour de la tâche.' });
    }
});

// 3)
//  Supprimer une tâche
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Task.findByIdAndDelete(id);
        res.json({ message: 'Tâche supprimée avec succès.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la tâche.' });
    }
});

// 1a)
//  Ajouter une sous-tâche à une tâche existante
app.post('/tasks/:id/subtasks', async (req, res) => {
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


//  1b) 
//  Mettre à jour le statut d'une sous-tâche
app.put('/tasks/:taskId/subtasks/:subtaskId', async (req, res) => {
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

/// 1c)
//  Route pour supprimer une sous-tache 
app.delete('/tasks/:taskId/subtasks/:subtaskId', async (req, res) => {
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

// 2a) 
// Ajouter une session de temps à une tâche
  app.post('/tasks/:taskId/sessions', async (req, res) => {
  const taskId = req.params.taskId;
  const session = req.body; // Exemple : { duration: 3, date: new Date(), subtaskId: '67b1c55f643bae2573ebe7b4' }
  
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).send({ error: 'Task not found' });
    }
    
    if (session.subtaskId) {
      // Recherche de la sous-tâche par son _id dans le tableau task.subtasks
      const subtask = task.subtasks.id(session.subtaskId);
      if (!subtask) {
        return res.status(404).send({ error: 'Subtask not found' });
      }
      // Ajout de la session dans la sous-tâche
      subtask.sessions.push({
        duration: session.duration,
        date: session.date || new Date()
      });
    } else {
      // Ajout de la session dans la tâche principale si aucune sous-tâche n'est spécifiée
      task.sessions.push({
        duration: session.duration,
        date: session.date || new Date()
      });
    }
    
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});


//  2b)
//  Route pour récupérer les sessions d'une tâche spécifique
app.get('/tasks/:id/sessions', async (req, res) => {
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

app.get('/sessions', async (req, res) => {
    try {
      const sessions = await Session.find();
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  //2c)
  //route pour supprimer les sessions d'une tâche spécifique 
  app.delete('/tasks/:taskId/sessions/:sessionId', async (req, res) => {
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
app.get('/consumption-entries', async (req, res) => {
    try {
        const entries = await ConsumptionEntry.find();
        res.json(entries);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des entrées.' });
    }
});

// b) Ajouter une nouvelle entrée
app.post('/consumption-entries', async (req, res) => {
    const { date, time, mood, consumption } = req.body;
    try {
        const newEntry = new ConsumptionEntry({
            date,
            time,
            mood,
            consumption
        });
        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (err) {
        res.status(400).json({ error: 'Erreur lors de l\'ajout de l\'entrée.' });
    }
});

// c) Mettre à jour une entrée
app.put('/consumption-entries/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedEntry = await ConsumptionEntry.findByIdAndUpdate(id, updates, { new: true });
        res.json(updatedEntry);
    } catch (err) {
        res.status(400).json({ error: 'Erreur lors de la mise à jour de l\'entrée.' });
    }
});

// d) Supprimer une entrée
app.delete('/consumption-entries/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        await ConsumptionEntry.findByIdAndDelete(id);
        res.json({ message: 'Entrée supprimée avec succès.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'entrée.' });
    }
});


// Endpoint pour renvoyer toutes les tâches avec leur champ "status" (fonction pour afficher toutes les sessions dans session.js + caldendrier)
app.get('/all-tasks', async (req, res) => {
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






// 6) Exportation de l'application
module.exports = app;