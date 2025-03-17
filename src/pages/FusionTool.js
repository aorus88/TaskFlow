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
  // -------------------------------
  // 1. ÉTATS
  // -------------------------------
  const [isExpanded, setIsExpanded] = useState(false);
  
  // -------------------------------
  // 2. FONCTIONS AUXILIAIRES
  // -------------------------------
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Fonction pour formater les dates
  const formatChartDate = (dateStr) => {
    if (!dateStr) return "";
    
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        // Récupérer l'initiale du jour de la semaine
        const weekday = date.toLocaleDateString("fr-FR", {
          weekday: "narrow" // "narrow" donne généralement l'initiale (L, M, M...)
        });
        
        // Formater la date comme avant
        const dayMonth = date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        });
        
        // Combiner les deux
        return `${weekday} ${dayMonth}`;
      }
      return dateStr;
    } catch (error) {
      console.error("Erreur format date:", dateStr);
      return dateStr;
    }
  };

  // -------------------------------
  // 3. DONNÉES DU GRAPHIQUE
  // -------------------------------
  const chartData = {
    labels: data.map((entry) => entry.date),
    datasets: [
      {
        label: "🍂",
        data: data.map((entry) => entry.count),
        backgroundColor: data.map((entry) => {
          if (entry.count < 3) {
            return "rgba(0, 255, 0, 0.2)"; // Vert pour < 3
          } else if (entry.count >= 3 && entry.count <= 6) {
            return "rgba(255, 165, 0, 0.2)"; // Orange pour 3 à 6
          } else {
            return "rgba(255, 0, 0, 0.2)"; // Rouge pour > 6
          }
        }),
        borderColor: data.map((entry) => {
          if (entry.count < 3) {
            return "rgba(0, 255, 0, 0.2)"; // Vert pour < 3
          } else if (entry.count >= 3 && entry.count <= 6) {
            return "rgba(255, 165, 0, 0.2)"; // Orange pour 3 à 6
          } else {
            return "rgba(255, 0, 0, 0.2)"; // Rouge pour > 6
          }
        }),
        borderWidth: 1,
      },
      {
        label: "🏆",
        data: data.map((entry) => entry.noCount),
        backgroundColor: data.map((entry) => {
          if (entry.noCount < 3) {
            return "rgba(144, 238, 144, 0.2)"; // Vert clair pour < 3
          } else if (entry.noCount >= 3 && entry.noCount <= 6) {
            return "rgba(60, 179, 113, 0.2)"; // Vert moyen pour 3 à 6
          } else {
            return "rgba(0, 128, 0, 0.2)"; // Vert foncé pour > 6
          }
        }),
        borderColor: data.map((entry) => {
          if (entry.noCount < 3) {
            return "rgba(144, 238, 144, 1)"; // Vert clair pour < 3
          } else if (entry.noCount >= 3 && entry.noCount <= 6) {
            return "rgba(60, 179, 113, 1)"; // Vert moyen pour 3 à 6
          } else {
            return "rgba(0, 128, 0, 1)"; // Vert foncé pour > 6
          }
        }),
        borderWidth: 1,
      },
    ],
  };

  // -------------------------------
  // 4. OPTIONS DU GRAPHIQUE
  // -------------------------------
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: { 
          font: { size: 18 }, 
          color: "#333",
          padding: 2, // Augmentez cette valeur (25 → 40 ou plus)
        },
        // Ajoutez une marge supplémentaire
        margin: {
          top: 0, // Marge supérieure additionnelle
          bottom: 10
        },
        title: {
          display: false,
          padding: {
            top: 20, // Augmentez cette valeur (102→ 20)
            bottom: 10
          }
        }
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
      datalabels: {
        display: true,
        color: "#000",
        anchor: "end",
        align: "end",
        offset: 4,
        font: {
          weight: 'bold',
          size: 12,
        },
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        borderRadius: 4,
        padding: {
          top: 2,
          bottom: 2,
          left: 4,
          right: 4,
        },
        formatter: (value) => value,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "/ jour", color: "#333", font: { size: 18 } },
        ticks: { color: "#333", font: { size: 12 } },
        grid: { color: "rgba(0, 0, 0, 0)" },
      },
      x: {
        title: { display: true, color: "#333", font: { size: 18 } },
        ticks: {
          color: "#333",
          font: { size: 12 },
          callback: function (value, index) {
            // Récupérer directement la date à partir des labels originaux
            return formatChartDate(chartData.labels[index]);
          },
        },
        grid: { color: "rgba(0, 0, 0, 0)" },
      },
    },
    animation: { duration: 1200, easing: "easeOutQuart" },
  };

  // -------------------------------
  // 5. RENDU JSX
  // -------------------------------
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
      
      {isExpanded && (
        <div style={{ height: "300px", width: "100%" }}>
          <Bar 
            data={chartData} 
            options={options} 
            key={`chart-${isExpanded}`} 
          />
        </div>
      )}
      
      
      {!isExpanded && (
  <div className="chart-preview" style={{ padding: "10px 0", textAlign: "center" }}>
    <p>Cliquez sur "Développer" pour voir le graphique</p>
    <div className="mini-chart">
      {data.slice(-15).map((entry, index) => (
        <div key={`${index}-container`} className="mini-bar-container" style={{ display: 'inline-block', margin: '0 2px' }}>
          {/* Barre pour les entrées "yes" (🍂) */}
          <div 
            key={`yes-${index}`} 
            className="mini-bar" 
            style={{
              height: `${Math.min(entry.count * 5, 30)}px`,
              width: '6px',
              display: 'inline-block',
              backgroundColor: entry.count < 3 
                ? "rgba(0, 255, 0, 0.5)" 
                : entry.count <= 6 
                  ? "rgba(255, 165, 0, 0.5)" 
                  : "rgba(255, 0, 0, 0.5)",
              marginRight: '2px'
            }}
            title={`🍂 ${entry.date}: ${entry.count}`}
          ></div>
          
          {/* Barre pour les entrées "no" (🏆) */}
          <div 
            key={`no-${index}`} 
            className="mini-bar" 
            style={{
              height: `${Math.min(entry.noCount * 5, 30)}px`,
              width: '6px',
              display: 'inline-block',
              backgroundColor: entry.noCount < 3 
                ? "rgba(144, 238, 144, 0.5)" 
                : entry.noCount <= 6 
                  ? "rgba(60, 179, 113, 0.5)" 
                  : "rgba(0, 128, 0, 0.5)"
            }}
            title={`🏆 ${entry.date}: ${entry.noCount}`}
          ></div>
        </div>
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

  // Calcul en secondes depuis la dernière entrée "yes" (pour affichage, pas pour le pourcentage)
const timeSinceLastYesSec = lastYesEntry ? Math.floor((new Date() - lastYesEntry) / 1000) : 0;


// 1. Définir le point de départ (dernière entrée "yes" ou début de journée si aucune)
const now = new Date();
let startPoint;

if (lastYesEntry) {
  startPoint = new Date(lastYesEntry);
} else {
  // Si aucune entrée "yes", on prend minuit comme départ
  startPoint = new Date();
  startPoint.setHours(0, 0, 0, 0);
}

// 2. Définir la fin de journée
const endOfDay = new Date();
endOfDay.setHours(23, 59, 59, 999);

// 3. Calcul du temps total depuis le départ jusqu'à la fin du jour
const totalPeriodSec = Math.max(Math.floor((endOfDay - startPoint) / 1000), 1); // On évite division par zéro

// 4. Calcul du temps écoulé depuis le départ
const elapsedSec = Math.floor((now - startPoint) / 1000);

// 5. Calcul du pourcentage
const glassProgress = Math.min((elapsedSec / totalPeriodSec) * 100, 100);


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
          label="🛡️Restant "
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
