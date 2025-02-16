import React, { useState, useEffect, useContext } from "react";
import "./FusionTool.css"; // Importer les styles spécifiques
import GlobalPomodoroTimer from "../components/GlobalPomodoroTimer"; // Importer le composant GlobalPomodoroTimer
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

const BarChartCard = ({ label, data, color }) => {
  const chartData = {
    labels: data.map((entry) => entry.date),
    datasets: [
      {
        label: "🍂",
        data: data.map((entry) => entry.count),
        backgroundColor: 
        data.map((entry) => {
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
            return "rgba(0, 255, 0, 1)";
          } else if (entry.count >= 3 && entry.count <= 6) {
            return "rgba(255, 165, 0, 1)";
          } else {
            return "rgba(255, 0, 0, 1)";
          }
        }),
        borderWidth: 1,
      },

      {
        label: "🔋",
        data: data.map((entry) => entry.noCount),
        backgroundColor: "rgba(0, 255, 0, 0.2)", // Vert
        borderColor: "rgba(0, 255, 0, 1)", // Vert
        borderWidth: 1, 
      },
    ],

  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 15 }, color: "#333" },
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
        formatter: (value) => value,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "X par jour", color: "#333", font: { size: 14 } },
        ticks: { color: "#333", font: { size: 12 } },
        grid: { color: "rgba(0, 0, 0, 0.1)" },
      },
      x: {
        title: { display: true, text: "Date", color: "#333", font: { size: 14 } },
        ticks: { color: "#333", font: { size: 12 } },
        grid: { color: "rgba(0, 0, 0, 0.1)" },
      },
    },
    animation: { duration: 1000, easing: "easeInOutBounce" },
  };

  return (
    <div
      className="stat-card"
      style={{ borderColor: color, backgroundColor: `${color}33` }}
    >
      <h3 className="stat-card-label">{label}</h3>
      <Bar data={chartData} options={options} />
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

  // État pour le tri des entrées
  const [sortOrder, setSortOrder] = useState("desc");

  // État pour l'heure actuelle
  const [currentTime, setCurrentTime] = useState(new Date());

  // Un objet de filtre général
  const [filter, setFilter] = useState({
    date: "",
    taskId: "",
    categories: [],
    consumption: "",
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

  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const globalStats = getGlobalStats();

  const getEmojiAndColor = (count) => {
    if (count <= 3) {
      return { emoji: "🟢 Bravo ! 😉", };
    } else if (count > 3 && count <= 6) {
      return { emoji: "🟠 Peut faire mieux 😑", };
    } else {
      return { emoji: "🔴 Aïe aïe... 😓😭", };
    }
  };

  const todayStats = getEmojiAndColor(globalStats.todayEntries);
  const yesterdayStats = getEmojiAndColor(globalStats.yesterdayEntries);
  const dayBeforeYesterdayStats = getEmojiAndColor(globalStats.dayBeforeYesterdayEntries);

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

  return (
    <div className="fusion-tool">
      <div className="statistics-container">
        <div className="statistics-header">
        <h3>⛩️ TaskFlow 1.3.9 ⛩️ ➖
        <button onClick={toggleDarkMode} className="dark-mode-button">
          {isDarkMode ? "🌚" : "🌞"}
        </button>_D_A_Y__
        🕒 {formatClock(currentTime)} 🕒</h3>
      </div>
      </div>

      <GlobalPomodoroTimer
        tasks={tasks.filter(task => task.status === 'open')}
        fetchTasks={fetchTasks}
        setSelectedTaskId={setSelectedTaskId}
        selectedTaskId={selectedTaskId}
        onAddTask={onAddTask}
        taskCategories={taskCategories}
      />

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

      {/* Statistiques globales  */}
      <div className="stats-global-FusionTool">
        <h3>Statistiques Globales</h3>
        <div className="stats-container-FusionTool">
          <StatCard
            label="Hier"
            value={globalStats.yesterdayEntries}
            emoji={yesterdayStats.emoji}
            color={yesterdayStats.color}
          />
          <StatCard
            label="Avant-hier"
            value={globalStats.dayBeforeYesterdayEntries}
            emoji={dayBeforeYesterdayStats.emoji}
            color={dayBeforeYesterdayStats.color}
          />
          {/* Durée depuis la dernière entrée avec consommation "yes" */}
          <StatCard
            label="Dernière entrée 🍂"
            value={
              timeSinceLastYesEntry !== null
                ? `${timeSinceLastYesEntry.hours}h ${timeSinceLastYesEntry.minutes}m`
                : "N/A"
            }
            emoji="⏳"
          />
          {/* Durée depuis la dernière entrée avec consommation "no" */}
          <StatCard
            label="Dernière victoire 💯"
            value={
              timeSinceLastNoEntry !== null
                ? `${timeSinceLastNoEntry.hours}h ${timeSinceLastNoEntry.minutes}m`
                : "N/A"
            }
            emoji="⏳"
          />
          <StatCard 
            label="Ce mois-ci" 
            value={globalStats.thisMonthEntries} 
            emoji="📊"
          />
          <StatCard 
            label="Le mois dernier" 
            value={globalStats.lastMonthEntries} 
            emoji="📊" 
          />
          <StatCard
            label="Les 7 derniers jours"
            value={entries.filter(
              (entry) => new Date(entry.date) >= new Date(sevenDaysAgo) && entry.consumption === "yes"
            ).length}
            emoji="📅"
          />
          <StatCard
            label="Aujourd'hui"
            value={globalStats.todayEntries}
            emoji={todayStats.emoji}
            color={todayStats.color}
          />
        </div>
        <div className="stats-chart-container">
          <BarChartCard label="15 derniers jours 🗓️" data={last15DaysStats} className="double-width" />
        </div>
      </div>

      <h2>Historique des Consommations</h2>
      <button
        className="sort-button"
        onClick={() => setSortOrder((prevOrder) => (prevOrder === "desc" ? "asc" : "desc"))}
      >
        Trier : {sortOrder === "desc" ? "Du plus récent" : "Du plus ancien"}
      </button>

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
          {sortedEntries.map((entry) => (
            <tr key={entry._id || entry.id}>
              <td>{new Date(entry.date).toLocaleDateString("fr-FR")}</td>
              <td>{entry.time}</td>
              <td>{getMoodWithEmoji(entry.mood)}</td>
              <td>{entry.consumption === "yes" ? "Oui" : "Non"}</td>
              <td>
                <button onClick={() => handleDeleteEntry(entry._id || entry.id)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FusionTool;
