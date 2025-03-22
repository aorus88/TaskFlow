/* ==================================================
   BackEnd/server.js
   Lance le serveur Node sur un port donné
==================================================== */

const app = require('./app');
const http = require('http');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Port pour HTTP
const HTTP_PORT = process.env.PORT || 4000;

// Créer et démarrer le serveur HTTP
const server = http.createServer(app);

server.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur HTTP démarré sur le port ${HTTP_PORT}`);
  console.log(`📋 Adresse locale: http://localhost:${HTTP_PORT}`);
  console.log(`📡 Adresse réseau: http://192.168.50.241:${HTTP_PORT}`);
});

// Gérer les erreurs serveur
server.on('error', (error) => {
  console.error('Erreur serveur:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Le port ${HTTP_PORT} est déjà utilisé. Veuillez utiliser un autre port.`);
    process.exit(1);
  }
});

process.on('SIGINT', () => {
  console.log('Arrêt du serveur...');
  server.close(() => {
    console.log('Serveur arrêté.');
    process.exit(0);
  });
});
