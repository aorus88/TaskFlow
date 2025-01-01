const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1) Création de l'application Express
const app = express();

// 2) Middlewares
app.use(cors());
app.use(express.json());

// 3) Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/taskflowDB')
.then(() => {
    console.log('Connecté à MongoDB');
})
.catch((err) => {
    console.error('Erreur de connexion à MongoDB :', err);
});

// 4) Définition du Schéma / Modèle Mongoose
const subtaskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    addedAt: { type: Date, default: Date.now },
    archivedAt: { type: Date, default: null },
    archived: { type: String, enum: ['open', 'closed'], default: 'open' }, // Nouveau champ
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
    totalTimeEstimed: { type: Number, default: 0 }, // Temps total estimé en minutes
    currentSessionTime: { type: Number, default: 0 }, // Temps en cours en minutes
    subtasks: { type: [subtaskSchema], default: [] }
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
    const filter = archived === 'true' ? { archived: 'closed' } : { archived: 'open' };
    try {
        const tasks = await Task.find(filter);
        console.log("Backend - Tâches récupérées :", tasks); // Ajoutez ce log
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des tâches.' });
    }
});

// b) Ajouter une nouvelle tâche
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

// c) Mettre à jour une tâche
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

// d) Supprimer une tâche
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Task.findByIdAndDelete(id);
        res.json({ message: 'Tâche supprimée avec succès.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la tâche.' });
    }
});

// e) Ajouter une sous-tâche à une tâche existante
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

// f) Mettre à jour le statut d'une sous-tâche
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

// Routes pour les entrées de consommation de cigarettes
// a) Récupérer toutes les entrées
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
    try {
        await ConsumptionEntry.findByIdAndDelete(id);
        res.json({ message: 'Entrée supprimée avec succès.' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'entrée.' });
    }
});

// 6) Exportation de l'application
module.exports = app;