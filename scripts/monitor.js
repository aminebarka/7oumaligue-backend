const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api/health';
const LOG_FILE = path.join(__dirname, '../logs/monitor.log');
const CHECK_INTERVAL = 30000; // 30 secondes

// Fonction pour écrire dans les logs
function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // Créer le dossier logs s'il n'existe pas
  const logsDir = path.dirname(LOG_FILE);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  fs.appendFileSync(LOG_FILE, logMessage);
  console.log(logMessage.trim());
}

// Fonction pour vérifier la santé du serveur
async function checkServerHealth() {
  try {
    const response = await axios.get(API_URL, { timeout: 5000 });
    if (response.status === 200) {
      writeLog('✅ Serveur en bonne santé');
      return true;
    }
  } catch (error) {
    writeLog(`❌ Erreur de santé du serveur: ${error.message}`);
    return false;
  }
}

// Fonction pour redémarrer le serveur
function restartServer() {
  writeLog('🔄 Redémarrage du serveur...');
  
  exec('npm run pm2:restart', (error, stdout, stderr) => {
    if (error) {
      writeLog(`❌ Erreur lors du redémarrage: ${error.message}`);
      return;
    }
    writeLog('✅ Serveur redémarré avec succès');
  });
}

// Fonction pour démarrer le serveur s'il n'est pas en cours
function startServer() {
  writeLog('🚀 Démarrage du serveur...');
  
  exec('npm run pm2:start', (error, stdout, stderr) => {
    if (error) {
      writeLog(`❌ Erreur lors du démarrage: ${error.message}`);
      return;
    }
    writeLog('✅ Serveur démarré avec succès');
  });
}

// Fonction pour vérifier si PM2 est en cours d'exécution
function checkPM2Status() {
  return new Promise((resolve) => {
    exec('pm2 status', (error, stdout, stderr) => {
      if (error) {
        resolve(false);
        return;
      }
      
      const isRunning = stdout.includes('7oumaligue-backend') && stdout.includes('online');
      resolve(isRunning);
    });
  });
}

// Fonction principale de surveillance
async function monitor() {
  writeLog('🔍 Démarrage de la surveillance du serveur...');
  
  setInterval(async () => {
    const isPM2Running = await checkPM2Status();
    
    if (!isPM2Running) {
      writeLog('⚠️ PM2 n\'est pas en cours d\'exécution, démarrage...');
      startServer();
      return;
    }
    
    const isHealthy = await checkServerHealth();
    
    if (!isHealthy) {
      writeLog('⚠️ Serveur non réactif, redémarrage...');
      restartServer();
    }
  }, CHECK_INTERVAL);
}

// Gestion des signaux pour arrêter proprement
process.on('SIGINT', () => {
  writeLog('🛑 Arrêt de la surveillance...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  writeLog('🛑 Arrêt de la surveillance...');
  process.exit(0);
});

// Démarrer la surveillance
monitor(); 