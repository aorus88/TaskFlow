import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "./PriorityPieChart.css";

const PriorityPieChart = ({ tasks }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    const priorities = tasks.reduce(
      (acc, task) => {
        acc[task.priority]++;
        return acc;
      },
      { low: 0, medium: 0, high: 0 }
    );

    const data = {
      labels: ["Faible", "Moyenne", "Haute"],
      datasets: [
        {
          data: [priorities.low, priorities.medium, priorities.high],
          backgroundColor: [
            getComputedStyle(document.body).getPropertyValue("--color-low-priority"),
            getComputedStyle(document.body).getPropertyValue("--color-medium-priority"),
            getComputedStyle(document.body).getPropertyValue("--color-high-priority"),
          ],
          borderColor: "#1a202c", // Couleur de bordure pour le mode sombre
          borderWidth: 1,
          hoverOffset: 4, // Ajout d'un décalage au survol pour un meilleur effet visuel
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: "right", // Positionner la légende à droite
          labels: {
            color: getComputedStyle(document.body).getPropertyValue("--color-text"),
            font: {
              size: 14, // Taille de police pour les labels
              family: 'Roboto', // Police pour les labels
            },
          },
        },
        tooltip: {
          backgroundColor: getComputedStyle(document.body).getPropertyValue("--color-text"),
          titleColor: getComputedStyle(document.body).getPropertyValue("--color-background"),
          bodyColor: getComputedStyle(document.body).getPropertyValue("--color-background"),
          borderColor: getComputedStyle(document.body).getPropertyValue("--color-border"),
          borderWidth: 1,
        },
        datalabels: {
          display: true,
          color: getComputedStyle(document.body).getPropertyValue("--color-text"),
          font: {
            size: 16,
            weight: 'bold',
          },
          formatter: (value, context) => {
            const label = context.chart.data.labels[context.dataIndex];
            return `${label}: ${value}`;
          },
        },
      },
    };

    const chartInstance = new Chart(ctx, {
      type: "pie",
      data,
      options,
    });

    return () => {
      chartInstance.destroy();
    };
  }, [tasks]);

  return (
    <div className="priority-pie-chart">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default PriorityPieChart;