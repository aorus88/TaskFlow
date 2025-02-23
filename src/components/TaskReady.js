const TaskReady = [
  {
    name: "Démarrage de la journée 🌞",
    date: new Date().toISOString().split("T")[0],
    time: "07:30",
    priority: "high",
    categories: "Santé 🏥",
    subtasks: [  // Ajout des sous-tâches
      {
        id: 1,
        name: "Exercices respiration 🫁",
        archived: "open"
      },
      {
        id: 2,
        name: "Verre d'eau 💧",
        archived: "open"
      },
      {
        id: 3,
        name: "Méditation 5min 🧘",
        archived: "open"
      }
    ]
  },
  
  {
    name: "Entrainement 🛤️ ",
    date: new Date().toISOString().split("T")[0],
    time: "08:00",
    priority: "high",
    categories: "Sport 🏋️",
  },
  {
    name: "Manger équilibré 🥗",
    date: new Date().toISOString().split("T")[0],
    time: "11:30",
    priority: "medium",
    categories: "Cuisine 🍳",
  },
  {
    name: "Relaxation 🧘",
    date: new Date().toISOString().split("T")[0],
    time: "13:00",
    priority: "medium",
    categories: "Podcast 🎙️",
  },
  {
    name: "Marche en plein air",
    date: new Date().toISOString().split("T")[0],
    time: "16:00",
    priority: "medium",
    categories: "Sport 🏋️",
  },
  {
    name: "Journal de progression",
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    priority: "high",
    categories: "Personnel 🐈",
  },
  {
    name: "Session respiration",
    date: new Date().toISOString().split("T")[0],
    time: "20:00",
    priority: "high",
    categories: "Meditation 🧘",
  },
  {
    name: "Documentation app",
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    priority: "medium",
    categories: "TaskFlow ⛩️",
  },
  {
    name: "Administratif 🗃️",
    date: new Date().toISOString().split("T")[0],
    time: "21:00",
    priority: "medium", 
    categories: "Finances 💵",
  },
  {
    name: "Lecture développement personnel",
    date: new Date().toISOString().split("T")[0],
    time: "21:30",
    priority: "low",
    categories: "Lecture 📖",
  }
];

export default TaskReady;