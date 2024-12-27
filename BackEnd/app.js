/*******************************************************
 * FICHIER : app.js
 * BACK-END NODE/EXPRESS (MongoDB)
 *******************************************************/
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1) Création de l'application Express
const app = express();

// 2) Middlewares
// -- Autorise les requêtes cross-origin depuis http://192.168.50.241:3000 
//    (ou toute autre origine de ton choix) :
app.use(cors({ 
    origin: 'http://192.168.50.241:3000',
  }));
  

app.use(express.json()); // pour lire req.body au format JSON

// 3) Connexion à MongoDB
//    À adapter selon ton URL / le nom de ta base
mongoose.connect('mongodb://127.0.0.1:27017/taskflowDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connecté à MongoDB');
})
.catch((err) => {
  console.error('Erreur de connexion à MongoDB :', err);
});

// 4) Définition du Schéma / Modèle Mongoose
const subtaskSchema = new mongoose.Schema({
  title: String,
  completed: { type: Boolean, default: false },
});

const taskSchema = new mongoose.Schema({
  name: String,
  date: String,
  priority: { type: String, default: 'low' },
  status: { type: String, default: 'open' },
  subtasks: [subtaskSchema],
  archivedAt: { type: Date, default: null },
  addedAt: { type: Date, default: Date.now },
});

const Task = mongoose.model('Task', taskSchema);

// 5) Routes existantes

// a) Test (accueil)
app.get('/', (req, res) => {
  res.send('Hello depuis ton backend Node + MongoDB (mis à jour avec CORS) !');
});

// b) Obtenir toutes les tâches (GET /tasks) - ici on renvoie TOUTES les tâches
//    (Si tu préfères, tu peux filtrer seulement les "non archivées".)
app.get('/tasks', async (req, res) => {
  try {
    // EXEMPLE : Filtrer pour renvoyer seulement les tâches non archivées
    // const tasks = await Task.find({ archivedAt: null });

    // OU renvoyer toutes les tâches
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    console.error('Erreur GET /tasks :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// c) Créer une tâche (POST /tasks)
app.post('/tasks', async (req, res) => {
  try {
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Erreur POST /tasks :', error);
    res.status(400).json({ message: 'Erreur pour créer la tâche' });
  }
});

// d) Mettre à jour une tâche existante (PUT /tasks/:id)
app.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // On applique la mise à jour
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedTask) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    res.json(updatedTask);
  } catch (error) {
    console.error('Erreur PUT /tasks/:id :', error);
    res.status(400).json({ message: 'Erreur pour mettre à jour la tâche' });
  }
});

// e) Supprimer une tâche (DELETE /tasks/:id)
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    console.error('Erreur DELETE /tasks/:id :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// f) AJOUT : Récupérer les tâches ARCHIVÉES (GET /tasks/archived)
app.get('/tasks/archived', async (req, res) => {
  try {
    // On suppose qu'une tâche "archivée" => archivedAt != null, ou status = "closed"
    // Choisis ce que tu veux comme logique :
    const archived = await Task.find({ archivedAt: { $ne: null } });
    // ou "status: 'closed'" si tu gères comme ça :
    // const archived = await Task.find({ status: 'closed' });

    res.json(archived);
  } catch (error) {
    console.error('Erreur GET /tasks/archived :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 6) Lancement du serveur
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
