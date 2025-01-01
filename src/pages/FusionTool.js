import React, { useState } from "react";
import "./FusionTool.css"; // Importer les styles spécifiques

const FusionTool = ({ entries, onAddEntry }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    mood: "",
    consumption: "yes",
  });

  const handleChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const handleAddEntry = () => {
    onAddEntry({ ...formData, id: Date.now() });
    setFormData({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      mood: "",
      consumption: "yes",
    });
  };

  return (
    <div className="fusion-tool">
      <h1>Suivi de Consommation de Cigarettes</h1>
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
          <input
            type="text"
            value={formData.mood}
            onChange={(e) => handleChange("mood", e.target.value)}
            placeholder="Votre humeur"
          />
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

      <h2>Historique des Consommations</h2>
      <table className="fusion-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Heure</th>
            <th>Humeur</th>
            <th>Consommation</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{new Date(entry.date).toLocaleDateString("fr-FR")}</td>
              <td>{entry.time}</td>
              <td>{entry.mood}</td>
              <td>{entry.consumption === "yes" ? "Oui" : "Non"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FusionTool;