const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification du build TypeScript...');

// Vérifier si le dossier dist existe
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.log('❌ Dossier dist/ manquant. Exécutez: npm run build');
  process.exit(1);
}

// Vérifier si server.js existe dans dist/src/
const serverPath = path.join(distPath, 'src', 'server.js');
if (!fs.existsSync(serverPath)) {
  console.log('❌ dist/src/server.js manquant. Vérifiez votre build TypeScript');
  process.exit(1);
}

// Vérifier la taille du fichier
const stats = fs.statSync(serverPath);
console.log(`✅ Build OK - dist/src/server.js (${stats.size} bytes)`);

// Vérifier le contenu du fichier
const content = fs.readFileSync(serverPath, 'utf8');
if (content.includes('require(') || content.includes('module.exports')) {
  console.log('✅ Fichier compilé correctement (JavaScript CommonJS)');
} else {
  console.log('⚠️ Le fichier ne semble pas être du JavaScript compilé');
}

console.log('🎯 Prêt pour le déploiement Azure !'); 