import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css"; // Import des styles globaux
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("L'élément root est introuvable dans le DOM.");
}

// Rendu de l'application
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);