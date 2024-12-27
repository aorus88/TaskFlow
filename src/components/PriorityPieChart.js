import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Enregistrement des éléments nécessaires
ChartJS.register(ArcElement, Tooltip, Legend);

const PriorityPieChart = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return <p>Aucune donnée pour afficher le diagramme.</p>;
  }

  const priorities = ["low", "medium", "high"];
  const priorityCounts = priorities.map(
    priority => tasks.filter(task => task.priority === priority).length
  );

  const data = {
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        data: priorityCounts,
        backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div style={{ width: "300px", margin: "0 auto" }}>
      <h3>Répartition des Priorités</h3>
      <Pie data={data} options={options} />
    </div>
  );
};

export default PriorityPieChart;
