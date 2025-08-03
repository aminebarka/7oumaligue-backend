const { exec } = require('child_process');

console.log('🔍 Test de compilation TypeScript...\n');

exec('npx tsc --noEmit', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Erreurs de compilation trouvées:');
    console.log(stderr);
    
    // Compter les erreurs
    const errorCount = (stderr.match(/error TS/g) || []).length;
    console.log(`\n📊 Total d'erreurs: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('✅ Aucune erreur TypeScript!');
      startServer();
    } else {
      console.log('🔧 Erreurs à corriger avant de démarrer le serveur');
      console.log('\n💡 Actions recommandées:');
      console.log('1. Supprimer toutes les références à awayTeamRef');
      console.log('2. Régénérer le client Prisma: npx prisma generate');
      console.log('3. Migrer la base de données: node migrate-remove-away-team.js');
    }
  } else {
    console.log('✅ Compilation TypeScript réussie!');
    startServer();
  }
});

function startServer() {
  console.log('\n🚀 Démarrage du serveur...\n');
  exec('npm run dev', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Erreur lors du démarrage du serveur:', error);
    } else {
      console.log('✅ Serveur démarré avec succès!');
    }
  });
} 