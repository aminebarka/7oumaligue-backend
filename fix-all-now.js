const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function fixAllNow() {
  console.log('🔧 Correction complète et immédiate...\n');

  try {
    // 1. Nettoyer les références awayTeamRef
    console.log('1️⃣ Nettoyage des références awayTeamRef...');
    const liveMatchController = path.join(__dirname, 'src/controllers/liveMatch.controller.ts');
    
    if (fs.existsSync(liveMatchController)) {
      let content = fs.readFileSync(liveMatchController, 'utf8');
      const lines = content.split('\n');
      const filteredLines = lines.filter(line => !line.includes('awayTeamRef'));
      const newContent = filteredLines.join('\n');
      fs.writeFileSync(liveMatchController, newContent);
      console.log('✅ Références awayTeamRef supprimées');
    }

    // 2. Régénérer le client Prisma
    console.log('\n2️⃣ Régénération du client Prisma...');
    await new Promise((resolve, reject) => {
      exec('npx prisma generate', (error, stdout, stderr) => {
        if (error) {
          console.log('❌ Erreur Prisma:', error);
          reject(error);
        } else {
          console.log('✅ Client Prisma régénéré');
          resolve();
        }
      });
    });

    // 3. Test de compilation
    console.log('\n3️⃣ Test de compilation TypeScript...');
    await new Promise((resolve, reject) => {
      exec('npx tsc --noEmit', (error, stdout, stderr) => {
        if (error) {
          console.log('❌ Erreurs de compilation:');
          console.log(stderr);
          reject(error);
        } else {
          console.log('✅ Compilation réussie!');
          resolve();
        }
      });
    });

    // 4. Démarrer le serveur
    console.log('\n4️⃣ Démarrage du serveur...');
    const serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: 'inherit'
    });

    console.log('\n🎉 Serveur démarré!');
    console.log('🌐 URL: http://localhost:5000');
    console.log('⚽ API Matches: http://localhost:5000/api/matches');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

fixAllNow(); 