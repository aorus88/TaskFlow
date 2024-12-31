/* ==================================================
   BackEnd/server.js
   Lance le serveur Node sur un port donné
==================================================== */

const app = require('./app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
