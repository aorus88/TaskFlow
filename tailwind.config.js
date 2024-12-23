module.exports = {
  darkMode: 'class', // Le mode sombre est activé avec une classe
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Analyse tous les fichiers dans src
  ],
  theme: {
    extend: {
      colors: {
        priority: {
          low: "#4caf50", // Vert pour les tâches à faible priorité
          medium: "#ffa500", // Orange pour les tâches à priorité moyenne
          high: "#f44336", // Rouge pour les tâches à haute priorité
        },
        background: {
          light: "#f9f9f9", // Couleur de fond clair
          dark: "#1a202c", // Couleur de fond sombre
        },
      },
      fontFamily: {
        sans: ["Roboto", "Arial", "sans-serif"], // Polices pour le texte général
        heading: ["Poppins", "sans-serif"], // Polices pour les titres
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Plugin pour améliorer les styles de formulaires
    require('@tailwindcss/typography'), // Plugin pour la typographie
  ],
};
