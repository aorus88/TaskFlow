import React, { useState, useEffect, useContext, useRef } from "react";
import "./FusionTool.css"; // Importer les styles spécifiques
import { Bar } from "react-chartjs-2"; // Importer le composant Bar de react-chartjs-2
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"; // Importer les composants nécessaires de Chart.js
import ChartDataLabels from "chartjs-plugin-datalabels"; // Importer le plugin pour afficher les valeurs sur le graphique
import { SelectedTaskContext } from "../context/SelectedTaskContext"; // Importer le contexte
import TaskForm from "../components/TaskForm"; // Importer le composant TaskForm
import ConsumptionFilters from "../components/ConsumptionFilters"; // Importer le composant ConsumptionFilters
import { format } from "date-fns";

// Enregistrer les composants nécessaires de Chart.js, y compris le plugin datalabels
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const StatCard = ({ label, value, emoji, color }) => {
  return (
    <div
      className="stat-card"
      style={{ borderColor: color, backgroundColor: `${color}33` }}
    >
      <h3 className="stat-card-label">{label}</h3>
      <p className="stat-card-value" style={{ color: color }}>
        {value} {emoji}
      </p>
    </div>
  );
};

const BarChartCard = ({ label, data, color = "#4285f4" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const chartRef = useRef(null);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Préparation des données pour le graphique
  const chartData = {
    labels: data.map((entry) => entry.date),
    datasets: [
      {
        label: "Conso par jour",
        data: data.map((entry) => entry.count),
        backgroundColor: data.map((entry) => 
          entry.count < 3 
            ? "rgba(0, 255, 0, 0.5)" 
            : entry.count <= 6 
              ? "rgba(255, 165, 0, 0.5)" 
              : "rgba(255, 0, 0, 0.5)"
        ),
        borderColor: data.map((entry) => 
          entry.count < 3 
            ? "rgba(0, 200, 0, 1)" 
            : entry.count <= 6 
              ? "rgba(255, 140, 0, 1)" 
              : "rgba(200, 0, 0, 1)"
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: { font: { size: 14 }, color: "#333" },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) label += ": ";
            if (context.parsed.y !== null) label += context.parsed.y;
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Consommations", color: "#333", font: { size: 14 } },
        ticks: { color: "#333", font: { size: 12 } },
      },
      x: {
        title: { display: true, text: "Date", color: "#333", font: { size: 14 } },
        ticks: {
          color: "#333",
          font: { size: 10 },
          callback: function (value, index) {
            // Vérifier que value est une chaîne avant d'appeler split
            if (typeof value !== 'string') {
              return value;
            }
            
            const dateParts = value.split('-');
            if (dateParts.length === 3) {
              const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
              return date.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              });
            }
            return value;
          },
        },
      },
    },
    animation: { duration: 600, easing: "easeOutQuart" },
  };

  return (
    <div
      className="stat-card"
      style={{ borderColor: color, backgroundColor: `${color}33` }}
    >
      <div className="chart-header">
        <h3 className="stat-card-label">{label}</h3>
        <button 
          onClick={toggleExpand} 
          className="toggle-chart-btn"
        >
          {isExpanded ? 'Réduire ↑' : 'Développer ↓'}
        </button>
      </div>
      
      {isExpanded ? (
        <div style={{ height: "300px", width: "100%" }}>
          <Bar 
            data={chartData} 
            options={options} 
            ref={chartRef}
          />
        </div>
      ) : (
        <div className="chart-preview">
          <p>Cliquez sur "Développer" pour voir le graphique</p>
          <div className="mini-chart">
            {data.slice(-7).map((entry, index) => (
              <div 
                key={index} 
                className="mini-bar" 
                style={{
                  height: `${Math.min(entry.count * 5, 30)}px`,
                  backgroundColor: entry.count < 3 
                    ? "rgba(0, 255, 0, 0.5)" 
                    : entry.count <= 6 
                      ? "rgba(255, 165, 0, 0.5)" 
                      : "rgba(255, 0, 0, 0.5)"
                }}
                title={`${entry.date}: ${entry.count}`}
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const FusionTool = ({
  entries,
  onAddEntry,
  onDeleteEntry,
  isDarkMode,
  toggleDarkMode,
  onAddTask,
  taskCategories,
}) => {
  // Gestion des tâches et du contexte
  const [tasks, setTasks] = useState([]);
  const [isTaskFormModalOpen, setIsTaskFormModalOpen] = useState(false);
  const { selectedTaskId, setSelectedTaskId } = useContext(SelectedTaskContext);

  // État du formulaire
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    mood: "",
    consumption: "yes",
  });

  // État pour le tri des entrées - Mettre à jour pour utiliser la valeur du filtre
  const [sortOrder, setSortOrder] = useState("desc");

  // État pour l'heure actuelle
  const [currentTime, setCurrentTime] = useState(new Date());

  // Ajouter cet état pour contrôler l'affichage de la modale
  const [showFilters, setShowFilters] = useState(false);
  
  // Mettre à jour l'état du filtre pour inclure tous les champs nécessaires
  const [filter, setFilter] = useState(() => {
    const savedFilters = localStorage.getItem('consumptionFilters');
    return savedFilters ? JSON.parse(savedFilters) : {
      date: "",
      sortOrder: "desc",
      mood: "",
      consumption: "",
    };
  });

  // Mise à jour de l'heure chaque seconde
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fonction pour formater l'heure
  const formatClock = (time) => {
    return time.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
    .toISOString()
    .split("T")[0];
  const dayBeforeYesterday = new Date(new Date().setDate(new Date().getDate() - 2))
    .toISOString()
    .split("T")[0];
  const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7))
    .toISOString()
    .split("T")[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const startOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
    .toISOString()
    .split("T")[0];
  const endOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    .toISOString()
    .split("T")[0];

  const handleAddEntry = () => {
    const moodOptions = {
      heureux: "Heureux 😀",
      triste: "Triste 😭",
      stressé: "Stressé 😣",
      calme: "Calme 😌",
      fatigué: "Fatigué 😴",
      énergique: "Énergique 😜",
      anxieux: "Anxieux 😖",
      colère: "Colère 😡",
      ennuyé: "Ennuyé 😩",
      excité: "Excité 🥳",
      déprimé: "Déprimé 😵",
      détendu: "Détendu 😌",
      nerveux: "Nerveux 😵‍💫",
      frustré: "Frustré 😤",
      déterminé: "Déterminé 💪",
      motivé: "Motivé 🚀",
      concentré: "Concentré 🧐",
      confiant: "Confiant 😎",
      déçu: "Déçu 😞",
      dégoûté: "Dégoûté 🤢",
      honteux: "Honteux 😳",
      triste: "Triste 😢",
      démotivé: "Démotivé 😔",
      fiévreux: "Fiévreux 🤒",
      malade: "Malade 🤕",
      indécis: "Indécis 🤔",
      indiférent: "Indiférent 😐",
    };
    onAddEntry({
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    });
    setFormData({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      mood: "",
      consumption: "yes",
    });
  };

  const handleDeleteEntry = (id) => {
    console.log("ID à supprimer:", id);
    if (typeof onDeleteEntry === "function") {
      onDeleteEntry(id);
    } else {
      console.error("onDeleteEntry n'est pas défini ou n'est pas une fonction valide.");
    }
  };

  // Calcul de diverses statistiques
  const totalEntries = entries.length;
  const todayEntries = entries.filter(
    (entry) => entry.date.split("T")[0] === today && entry.consumption === "yes"
  ).length;
  const yesterdayEntries = entries.filter(
    (entry) => entry.date.split("T")[0] === yesterday && entry.consumption === "yes"
  ).length;
  const dayBeforeYesterdayEntries = entries.filter(
    (entry) => entry.date.split("T")[0] === dayBeforeYesterday && entry.consumption === "yes"
  ).length;
  const sevenDaysAgoEntries = entries.filter(
    (entry) => entry.date.split("T")[0] === sevenDaysAgo && entry.consumption === "yes"
  ).length;
  const nonConsumptionEntries = entries.filter(
    (entry) => entry.consumption === "no"
  ).length;
  const nonConsumptionTodayEntries = entries.filter(
    (entry) => entry.date.split("T")[0] === today && entry.consumption === "no"
  ).length;
  const thisMonthEntries = entries.filter(
    (entry) => entry.date.split("T")[0] >= startOfMonth && entry.consumption === "yes"
  ).length;
  const lastMonthEntries = entries.filter(
    (entry) =>
      entry.date.split("T")[0] >= startOfLastMonth &&
      entry.date.split("T")[0] <= endOfLastMonth &&
      entry.consumption === "yes"
  ).length;

  // Calcul de la dernière entrée avec consommation "yes"
  const lastYesEntry = entries
    .filter((entry) => entry.consumption === "yes")
    .reduce((latest, entry) => {
      const entryDate = new Date(entry.createdAt);
      return !latest || entryDate > latest ? entryDate : latest;
    }, null);
  let timeSinceLastYesEntry = null;
  if (lastYesEntry) {
    const diffMs = new Date() - lastYesEntry;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    timeSinceLastYesEntry = { hours, minutes };
  }

  // Calcul en secondes depuis la dernière entrée "yes" (si existante)
  const timeSinceLastYesSec = lastYesEntry ? Math.floor((new Date() - lastYesEntry) / 1000) : 0;
  // Seuil de 4 heures (en secondes)
  const thresholdSec = 4 * 3600;
  // Pourcentage de remplissage : maximum 100%
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const timeUntilEndOfDaySec = Math.floor((endOfDay - new Date()) / 1000);
  const glassProgress = Math.min((timeSinceLastYesSec / timeUntilEndOfDaySec) * 100, 100);

  // Fonction pour formater le temps en h, m, s
  const formatTimeDiff = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h}h ${m}m ${s}s`;
  };

  // Calcul de la dernière entrée avec consommation "no"
  const lastNoEntry = entries
    .filter((entry) => entry.consumption === "no")
    .reduce((latest, entry) => {
      const entryDate = new Date(entry.createdAt);
      return !latest || entryDate > latest ? entryDate : latest;
    }, null);
  let timeSinceLastNoEntry = null;
  if (lastNoEntry) {
    const diffMs = new Date() - lastNoEntry;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    timeSinceLastNoEntry = { hours, minutes };
  }

  // Fonction regroupant les statistiques globales (hors durées)
  const getGlobalStats = () => {
    return {
      totalEntries,
      todayEntries,
      yesterdayEntries,
      dayBeforeYesterdayEntries,
      sevenDaysAgoEntries,
      nonConsumptionEntries,
      nonConsumptionTodayEntries,
      thisMonthEntries,
      lastMonthEntries,
    };
  };

  // Mettre à jour pour utiliser la valeur du filtre pour le tri
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return filter.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const globalStats = getGlobalStats();

  const getEmojiAndColor = (count) => {
    if (count <= 3) {
      return { emoji: "🟢", };
    } else if (count > 3 && count <= 6) {
      return { emoji: "🟠", };
    } else {
      return { emoji: "🔴", };
    }
  };

  const todayStats = getEmojiAndColor(globalStats.todayEntries);
  const yesterdayStats = getEmojiAndColor(globalStats.yesterdayEntries);
  const dayBeforeYesterdayStats = getEmojiAndColor(globalStats.dayBeforeYesterdayEntries);
  const sevenDaysAgoStats = getEmojiAndColor(globalStats.sevenDaysAgoEntries);

  const getLast15DaysStats = () => {
    const last15Days = [];
    for (let i = 14; i >= 0; i--) {
      const date = new Date(new Date().setDate(new Date().getDate() - i))
        .toISOString()
        .split("T")[0];
      // Compter uniquement les entrées dont la date correspond et la consommation est "yes"
      const count = entries.filter(
        (entry) =>
          entry.date.split("T")[0] === date && entry.consumption === "yes"
      ).length;
      // compter uniquement les entrées dont la date correspond et la consommation est "no"
      const noCount = entries.filter(
        (entry) =>
          entry.date.split("T")[0] === date && entry.consumption === "no"
      ).length;
      last15Days.push({ date, count, noCount });
    }
    return last15Days;
  };

  const last15DaysStats = getLast15DaysStats();

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://192.168.50.241:4000/tasks");
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Erreur lors du chargement des tâches :", error);
    }
  };

  const getMoodWithEmoji = (mood) => {
    const moodMap = {
      heureux: "Heureux 😀",
      triste: "Triste 😭",
      stressé: "Stressé 😣",
      calme: "Calme 😌",
      fatigué: "Fatigué 😴",
      énergique: "Énergique 😜",
      anxieux: "Anxieux 😖",
      colère: "Colère 😡",
      ennuyé: "Ennuyé 😩",
      excité: "Excité 🥳",
      déprimé: "Déprimé 😵",
      détendu: "Détendu 😌",
      nerveux: "Nerveux 😵‍💫",
      frustré: "Frustré 😤",
      déterminé: "Déterminé 💪",
      motivé: "Motivé 🚀",
      concentré: "Concentré 🧐",
      confiant: "Confiant 😎",
      déçu: "Déçu 😞",
      dégoûté: "Dégoûté 🤢",
      honteux: "Honteux 😳",
      triste: "Triste 😢",
      démotivé: "Démotivé 😔",
      fiévreux: "Fiévreux 🤒",
      malade: "Malade 🤕",
      indécis: "Indécis 🤔",
      indiférent: "Indiférent 😐",
    };
    return moodMap[mood] || mood;
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const [editEntryModal, setEditEntryModal] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);

  // Fonction pour ouvrir la modale d'édition pour une entrée donnée
  const openEditEntryModal = (entry) => {
    setCurrentEntry({ ...entry });
    setEditEntryModal(true);
  };

  // Fonction pour fermer la modale d'édition
  const closeEditEntryModal = () => {
    setEditEntryModal(false);
    setCurrentEntry(null);
  };

  // Fonction pour mettre à jour un champ de l'entrée en cours d'édition
  const handleEditEntryChange = (field, value) => {
    setCurrentEntry({ ...currentEntry, [field]: value });
  };

  // Fonction pour sauvegarder l'édition (ici via une requête PUT)
  const handleSaveEntryEdit = async () => {
    try {
      const response = await fetch(
        `http://192.168.50.241:4000/consumption-entries/${currentEntry._id || currentEntry.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentEntry),
        }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'entrée.");
      }
      // Vous pouvez actualiser la liste des entrées ici, par exemple en rappelant une fonction de récupération,
      // ou en mettant à jour localement l'état.
      closeEditEntryModal();
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  // Fonction pour supprimer l'entrée depuis la modale
  const handleDeleteEntryFromModal = async () => {
    try {
      const response = await fetch(
        `http://192.168.50.241:4000/consumption-entries/${currentEntry._id || currentEntry.id}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'entrée.");
      }
      if (typeof onDeleteEntry === "function") {
        onDeleteEntry(currentEntry._id || currentEntry.id);
      }
      closeEditEntryModal();
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  // Mettre à jour la logique de tri et de filtrage des entrées
  const filteredEntries = sortedEntries.filter(entry => {
    // Filtre par date
    if (filter.date && entry.date.split("T")[0] !== filter.date) {
      return false;
    }
    
    // Filtre par humeur
    if (filter.mood && entry.mood !== filter.mood) {
      return false;
    }
    
    // Filtre par consommation (yes/no)
    if (filter.consumption && entry.consumption !== filter.consumption) {
      return false;
    }
    
    return true;
  });

  // Définir les options d'humeur pour le filtre
  const moodOptions = {
    heureux: "Heureux 😀",
    triste: "Triste 😭",
    stressé: "Stressé 😣",
    calme: "Calme 😌",
    fatigué: "Fatigué 😴",
    énergique: "Énergique 😜",
    anxieux: "Anxieux 😖",
    colère: "Colère 😡",
    ennuyé: "Ennuyé 😩",
    excité: "Excité 🥳",
  };

  // Ajouter cette fonction pour synchroniser le sortOrder avec le filtre
  useEffect(() => {
    setSortOrder(filter.sortOrder || "desc");
  }, [filter.sortOrder]);

  return (

    
    
    <div className="fusion-tool">
      <h1>Fusion-Tool ⛩️</h1>

      <form className="fusion-form">
        <label>
          Date :
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
        </label>
        <label>
          Heure :
          <input
            type="time"
            value={formData.time}
            onChange={(e) => handleChange("time", e.target.value)}
          />
        </label>
        <label>
          Humeur :
          <select
            value={formData.mood}
            onChange={(e) => handleChange("mood", e.target.value)}
          >
            <option value="">Sélectionnez</option>
            <option value="heureux">Heureux 😀</option>
            <option value="triste">Triste 😭</option>
            <option value="stressé">Stressé 😣</option>
            <option value="calme">Calme 😌</option>
            <option value="fatigué">Fatigué 😴</option>
            <option value="énergique">Énergique 😜</option>
            <option value="anxieux">Anxieux 😖</option>
            <option value="colère">Colère 😡</option>
            <option value="ennuyé">Ennuyé 😩</option>
            <option value="excité">Excité 🥳</option>
            <option value="déprimé">Déprimé 😵</option>
            <option value="détendu">Détendu 😌</option>
            <option value="nerveux">Nerveux 😵‍💫</option>
            <option value="frustré">Frustré 😤</option>
            <option value="déterminé">Déterminé 💪</option>
            <option value="motivé">Motivé 🚀</option>
            <option value="concentré">Concentré 🧐</option>
            <option value="confiant">Confiant 😎</option>
            <option value="déçu">Déçu 😞</option>
            <option value="dégoûté">Dégoûté 🤢</option>
            <option value="honteux">Honteux 😳</option>
            <option value="triste">Triste 😢</option>
            <option value="démotivé">Démotivé 😔</option>
            <option value="fiévreux">Fiévreux 🤒</option>
            <option value="malade">Malade 🤕</option>
            <option value="indécis">Indécis 🤔</option>
            <option value="indiférent">Indiférent 😐</option>
          </select>
        </label>
        <label>
          Consommation :
          <select
            value={formData.consumption}
            onChange={(e) => handleChange("consumption", e.target.value)}
          >
            <option value="yes">Oui</option>
            <option value="no">Non</option>
          </select>
        </label>
        <button type="button" onClick={handleAddEntry}>
          Ajouter
        </button>
      </form>


      <div className="stats-global-FusionTool">


        <StatCard
          label="📥Last "
          value={lastYesEntry ? `${formatClock(lastYesEntry)}` : "N/A"}
        />

        <StatCard
          label="⏳Last "
          value={timeSinceLastYesEntry ? formatTimeDiff(timeSinceLastYesSec) : "N/A"}
          />

<StatCard
          label="Progress "
          value={`${glassProgress.toFixed(2)}%`}
        />

        <StatCard
          label="⛩️ 0 J "
          value={`${globalStats.todayEntries} ${todayStats.emoji}`}
        />

        <StatCard
          label="⛩️ -1 J "
          value={`${globalStats.yesterdayEntries} ${yesterdayStats.emoji}`}
        />

        <StatCard
          label="⛩️ -2 J "
          value={`${globalStats.dayBeforeYesterdayEntries} ${dayBeforeYesterdayStats.emoji}`}
        />

        <StatCard
          label="⛩️ -7 J "
          value={`${globalStats.sevenDaysAgoEntries} ${sevenDaysAgoStats.emoji}`}
        />

      
        


     

     
     



        <div className="stats-chart-container">
          <BarChartCard
            label="15 derniers jours 🗓️"
            data={last15DaysStats}
          />
          
        </div>


      </div>

      {/* Ajouter le bouton pour ouvrir la modale des filtres */}
      <button className="show-filters-btn" onClick={() => setShowFilters(true)}>
        Afficher les filtres
      </button>

      {/* Modale des filtres */}
      {showFilters && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowFilters(false)}>
              Fermer
            </button>
            <ConsumptionFilters
              filter={filter}
              setFilter={setFilter}
              moodOptions={moodOptions}
            />
          </div>
        </div>
      )}

      <h2>Historique des Consommations</h2>
      {/* Supprimer le bouton de tri ici */}

      <table className="fusion-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Heure</th>
            <th>Humeur</th>
            <th>Consommation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((entry) => (
            <tr key={entry._id || entry.id}>
              <td>
                {new Date(entry.date).toLocaleDateString("fr-FR", {
                  weekday: "long", // jour de la semaine en lettres
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                })}
              </td>
              <td>{entry.time}</td>
              <td>{getMoodWithEmoji(entry.mood)}</td>
              <td>{entry.consumption === "yes" ? "Oui" : "Non"}</td>
              <td>
                <button onClick={() => openEditEntryModal(entry)}>
                  Éditer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modale d'édition d'entrée */}
      {editEntryModal && currentEntry && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Modifier l'entrée</h3>
            <label>
              Date :
              <input
                type="date"
                value={new Date(currentEntry.date).toISOString().split("T")[0]}
                onChange={(e) => handleEditEntryChange("date", e.target.value)}
              />
            </label>
            <label>
              Heure :
              <input
                type="time"
                value={currentEntry.time}
                onChange={(e) => handleEditEntryChange("time", e.target.value)}
              />
            </label>
            <label>
              Humeur :
              <select
                value={currentEntry.mood}
                onChange={(e) => handleEditEntryChange("mood", e.target.value)}
              >
                <option value="">Sélectionnez</option>
                <option value="heureux">Heureux 😀</option>
                <option value="triste">Triste 😭</option>
                <option value="stressé">Stressé 😣</option>
                <option value="calme">Calme 😌</option>
                <option value="fatigué">Fatigué 😴</option>
                <option value="énergique">Énergique 😜</option>
                <option value="anxieux">Anxieux 😖</option>
                <option value="colère">Colère 😡</option>
                <option value="ennuyé">Ennuyé 😩</option>
                <option value="excité">Excité 🥳</option>
                <option value="déprimé">Déprimé 😵</option>
                <option value="détendu">Détendu 😌</option>
                <option value="nerveux">Nerveux 😵‍💫</option>
                <option value="frustré">Frustré 😤</option>
                <option value="déterminé">Déterminé 💪</option>
                <option value="motivé">Motivé 🚀</option>
                <option value="concentré">Concentré 🧐</option>
                <option value="confiant">Confiant 😎</option>
                <option value="déçu">Déçu 😞</option>
                <option value="dégoûté">Dégoûté 🤢</option>
                <option value="honteux">Honteux 😳</option>
                <option value="triste">Triste 😢</option>
                <option value="démotivé">Démotivé 😔</option>
                <option value="fiévreux">Fiévreux 🤒</option>
                <option value="malade">Malade 🤕</option>
                <option value="indécis">Indécis 🤔</option>
                <option value="indiférent">Indiférent 😐</option>
              </select>
            </label>
            <label>
              Consommation :
              <select
                value={currentEntry.consumption}
                onChange={(e) =>
                  handleEditEntryChange("consumption", e.target.value)
                }
              >
                <option value="yes">Oui</option>
                <option value="no">Non</option>
              </select>
            </label>
            <div className="modal-buttons">
              <button onClick={handleSaveEntryEdit}>Enregistrer</button>
              <button onClick={closeEditEntryModal}>Annuler</button>
              <button onClick={handleDeleteEntryFromModal}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FusionTool;
