const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const oldUrl = 'http://192.168.50.241:4000';
const newUrl = 'https://192.168.50.241:4443';
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];

// Fonction pour parcourir récursivement les répertoires
function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      walkSync(filePath, callback);
    } else if (stats.isFile() && fileExtensions.includes(path.extname(file))) {
      callback(filePath);
    }
  });
}

// Fonction pour mettre à jour les URLs dans un fichier
function updateUrlsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remplacer toutes les occurrences de l'ancienne URL
    content = content.replace(new RegExp(oldUrl, 'g'), newUrl);
    
    // Si le contenu a changé, enregistrer le fichier
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Mise à jour du fichier: ${filePath}`);
    }
  } catch (err) {
    console.error(`Erreur lors de la mise à jour du fichier ${filePath}:`, err);
  }
}

// Exécution principale
console.log(`Mise à jour des URLs de ${oldUrl} à ${newUrl} dans le répertoire ${srcDir}...`);
walkSync(srcDir, updateUrlsInFile);
console.log('Terminé!');
