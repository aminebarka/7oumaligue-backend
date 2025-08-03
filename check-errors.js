const { exec } = require('child_process');

console.log('🔍 Vérification des erreurs TypeScript...\n');

exec('npx tsc --noEmit --pretty', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Erreurs de compilation trouvées:');
    console.log(stderr);
    
    // Analyser les erreurs communes
    if (stderr.includes('updateLiveScore')) {
      console.log('\n💡 Erreur: updateLiveScore non trouvé');
      console.log('   Solution: Vérifier l\'import dans liveMatch.routes.ts');
    }
    
    if (stderr.includes('awayTeamRef')) {
      console.log('\n💡 Erreur: awayTeamRef non trouvé');
      console.log('   Solution: Supprimer les références à awayTeamRef');
    }
    
    if (stderr.includes('awayScore')) {
      console.log('\n💡 Erreur: awayScore non trouvé');
      console.log('   Solution: Supprimer les références à awayScore');
    }
    
    console.log('\n🔧 Actions recommandées:');
    console.log('1. Vérifier tous les imports dans les routes');
    console.log('2. Supprimer toutes les références à awayTeam/awayScore');
    console.log('3. Régénérer le client Prisma: npx prisma generate');
    
  } else {
    console.log('✅ Aucune erreur de compilation TypeScript!');
    console.log('🚀 Le serveur devrait démarrer correctement');
  }
}); 