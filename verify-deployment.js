const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration de déploiement...');

// Vérifier les fichiers essentiels
const filesToCheck = [
  'startup.sh',
  '.deployment',
  'package.json',
  'dist/src/server.js'
];

let allGood = true;

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.log(`❌ ${file} manquant`);
    allGood = false;
  }
});

// Vérifier le contenu de startup.sh
const startupPath = path.join(__dirname, 'startup.sh');
if (fs.existsSync(startupPath)) {
  const content = fs.readFileSync(startupPath, 'utf8');
  if (content.includes('npm start')) {
    console.log('✅ startup.sh contient npm start');
  } else {
    console.log('❌ startup.sh ne contient pas npm start');
    allGood = false;
  }
}

// Vérifier le contenu de .deployment
const deploymentPath = path.join(__dirname, '.deployment');
if (fs.existsSync(deploymentPath)) {
  const content = fs.readFileSync(deploymentPath, 'utf8');
  if (content.includes('bash startup.sh')) {
    console.log('✅ .deployment pointe vers startup.sh');
  } else {
    console.log('❌ .deployment ne pointe pas vers startup.sh');
    allGood = false;
  }
}

// Vérifier package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (packageJson.scripts && packageJson.scripts.start) {
    console.log('✅ package.json a un script start défini');
    console.log(`   Script start: ${packageJson.scripts.start}`);
  } else {
    console.log('❌ package.json n\'a pas de script start');
    allGood = false;
  }
}

if (allGood) {
  console.log('\n🎯 Configuration de déploiement correcte !');
  console.log('📋 Résumé:');
  console.log('   - startup.sh force npm start');
  console.log('   - .deployment utilise startup.sh');
  console.log('   - package.json a le bon script start');
  console.log('   - dist/src/server.js existe');
} else {
  console.log('\n❌ Problèmes détectés dans la configuration');
  process.exit(1);
} 