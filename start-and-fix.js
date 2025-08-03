const { exec, spawn } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function startAndFix() {
  console.log('🚀 Démarrage et correction du serveur...\n');

  try {
    // 1. Régénérer le client Prisma
    console.log('1️⃣ Régénération du client Prisma...');
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

    // 2. Vérifier et ajouter des données de test
    console.log('\n2️⃣ Vérification des données...');
    const teams = await prisma.team.findMany();
    const tournaments = await prisma.tournament.findMany();

    if (teams.length === 0 || tournaments.length === 0) {
      console.log('📝 Ajout de données de test...');
      
      // Créer un tournoi
      const tournament = await prisma.tournament.create({
        data: {
          name: 'Tournoi Test',
          description: 'Tournoi pour tester',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'upcoming',
          maxTeams: 8,
          numberOfGroups: 2,
          teamsPerGroup: 4,
        }
      });

      // Créer des équipes
      await prisma.team.create({
        data: { name: 'Équipe A', logo: '⚽', players: ['J1', 'J2'] }
      });
      await prisma.team.create({
        data: { name: 'Équipe B', logo: '⚽', players: ['J3', 'J4'] }
      });

      console.log('✅ Données de test créées');
    }

    // 3. Démarrer le serveur
    console.log('\n3️⃣ Démarrage du serveur...');
    
    const serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    // Attendre que le serveur démarre
    await new Promise((resolve, reject) => {
      let serverStarted = false;
      
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('📝 Serveur:', output.trim());
        
        if (output.includes('Server running on port 5000') || 
            output.includes('Listening on port 5000') ||
            output.includes('Server started')) {
          serverStarted = true;
          console.log('✅ Serveur démarré avec succès!');
          resolve();
        }
      });

      serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.log('❌ Erreur serveur:', error);
        
        if (error.includes('EADDRINUSE')) {
          console.log('🔧 Port 5000 occupé, tentative de libération...');
          // Ici on pourrait ajouter la logique pour tuer le processus
        }
      });

      // Timeout après 15 secondes
      setTimeout(() => {
        if (!serverStarted) {
          console.log('⏰ Timeout - serveur non démarré');
          reject(new Error('Serveur non démarré'));
        }
      }, 15000);
    });

    console.log('\n🎉 Serveur prêt!');
    console.log('🌐 URL: http://localhost:5000');
    console.log('📊 Health Check: http://localhost:5000/health');
    console.log('⚽ API Matches: http://localhost:5000/api/matches');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

startAndFix(); 