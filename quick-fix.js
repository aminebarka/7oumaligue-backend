const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

console.log('🚀 Correction rapide du système...');

async function quickFix() {
  try {
    // 1. Corriger le fichier tournament.controller.ts
    console.log('1. Correction du contrôleur des tournois...');
    const controllerPath = 'src/controllers/tournament.controller.ts';
    if (fs.existsSync(controllerPath)) {
      let content = fs.readFileSync(controllerPath, 'utf8');
      
      // Corriger l'erreur du champ stadium
      if (content.includes('stadium: stadium || ""')) {
        console.log('✅ Champ stadium déjà correct');
      } else {
        content = content.replace(/stadium: stadium \|\| ""/g, 'stadium: stadium || ""');
        fs.writeFileSync(controllerPath, content);
        console.log('✅ Fichier tournament.controller.ts corrigé');
      }
    }

    // 2. Vérifier et ajouter les stades
    console.log('\n2. Vérification des stades en base...');
    const prisma = new PrismaClient();
    
    const stadiums = await prisma.stadium.findMany({
      select: { id: true, name: true, city: true }
    });
    
    console.log(`📊 Nombre de stades: ${stadiums.length}`);
    
    if (stadiums.length === 0) {
      console.log('⚠️ Aucun stade trouvé. Ajout des stades de test...');
      
      const testStadiums = [
        {
          name: "Stade Municipal de Douz",
          address: "123 Avenue Mohammed V",
          city: "Douz",
          region: "Douz-Settat",
          capacity: 5000,
          fieldCount: 3,
          fieldTypes: ["5v5", "7v7", "11v11"],
          amenities: ["parking", "shower", "cafe"],
          images: ["https://example.com/stadium1.jpg"],
          contactInfo: { phone: "+212-5-22-123456" },
          pricing: { "5v5": 200, "7v7": 300, "default": 250 },
          description: "Stade municipal moderne avec 3 terrains",
          isPartner: true,
          ownerId: 1
        },
        {
          name: "Complexe Sportif Al Amal",
          address: "456 Boulevard Hassan II",
          city: "Douz",
          region: "Douz-Salé-Kénitra",
          capacity: 3000,
          fieldCount: 2,
          fieldTypes: ["5v5", "7v7"],
          amenities: ["parking", "shower", "cafe"],
          images: ["https://example.com/stadium2.jpg"],
          contactInfo: { phone: "+212-5-37-789012" },
          pricing: { "5v5": 150, "7v7": 250, "default": 200 },
          description: "Complexe sportif avec 2 terrains",
          isPartner: false,
          ownerId: 1
        }
      ];
      
      for (const stadium of testStadiums) {
        await prisma.stadium.create({ data: stadium });
        console.log(`✅ Stade ajouté: ${stadium.name}`);
      }
    } else {
      console.log('✅ Stades déjà présents en base');
      stadiums.forEach(stadium => {
        console.log(`  - ${stadium.name} (${stadium.city})`);
      });
    }
    
    await prisma.$disconnect();
    
    // 3. Créer un script de démarrage simple
    console.log('\n3. Création du script de démarrage...');
    const startScript = `const { spawn } = require('child_process');

console.log('🚀 Démarrage du serveur...');

const server = spawn('npx', ['ts-node', '--transpile-only', 'src/server.ts'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: { ...process.env, TS_NODE_TRANSPILE_ONLY: 'true' }
});

server.on('error', (error) => {
  console.error('❌ Erreur:', error);
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
  process.exit(0);
});`;

    fs.writeFileSync('start-server.js', startScript);
    console.log('✅ Script de démarrage créé: start-server.js');
    
    console.log('\n🎉 Correction terminée !');
    console.log('\n📋 Prochaines étapes:');
    console.log('1. Démarrer le serveur: node start-server.js');
    console.log('2. Tester l\'API: curl http://localhost:5000/api/stadiums/public');
    console.log('3. Vérifier dans le frontend que la liste déroulante fonctionne');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
  }
}

quickFix(); 