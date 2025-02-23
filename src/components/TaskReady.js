const TaskReady = [

  {
    name: "🌞 - Démarrage de la journée ",
    date: new Date().toISOString().split("T")[0],
    time: "07:30",
    priority: "high",
    categories: "Hygiène 🚿",
    subtasks: [  // Ajout des sous-tâches
      {
        id: 1,
        name: "Douche 🚿",
        archived: "open"
      },
      {
        id: 2,
        name: "Se brosser les dents 🦷",
        archived: "open"
      },
      {
        id: 3,
        name: "Fil dentaire 🧵",
        archived: "open"
      }
    ]
  },

  {
    name: "🌙 - Se préparer pour dormir ",
    date: new Date().toISOString().split("T")[0],
    time: "22:30",
    priority: "high",
    categories: "Hygiène 🚿",
    subtasks: [  // Ajout des sous-tâches
      {
        id: 1,
        name: "Se brosser les dents 🦷",
        archived: "open"
      },
      {
        id: 2,
        name: "Fil dentaire 🧵",
        archived: "open"
      },
      {
        id: 3,
        name: "Prendre les médicaments 💊",
        archived: "open"
      },
      {
        id: 4,
        name: "Préparer les vêtements du lendemain 👕",
        archived: "open"
      }
    ]
  },

  {
    name: "💊 - Préparer le pilulier",
    date: new Date().toISOString().split("T")[0],
    time: "22:00",
    priority: "medium",
    categories: "Autre 📝",
    subtasks: [  // Ajout des sous-tâches   ]
  ]
},

  {
    name: "✍️ - Rédaction de rapports",
    date: new Date().toISOString().split("T")[0],
    time: "18:00",
    priority: "medium",
    categories: "Travail 💼",
    subtasks: [  // Ajout des sous-tâches

    ]
  },

  
];

export default TaskReady;