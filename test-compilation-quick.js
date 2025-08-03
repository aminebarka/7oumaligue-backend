const { exec } = require('child_process');

console.log('🔍 Test rapide de compilation TypeScript...\n');

exec('npx tsc --noEmit', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Erreurs de compilation trouvées:');
    console.log(stderr);
    
    // Compter les erreurs
    const errorCount = (stderr.match(/error TS/g) || []).length;
    console.log(`\n📊 Total d'erreurs: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('✅ Aucune erreur TypeScript!');
    } else {
      console.log('🔧 Erreurs à corriger avant de démarrer le serveur');
    }
  } else {
    console.log('✅ Compilation TypeScript réussie!');
    console.log('🚀 Le serveur devrait démarrer correctement');
  }
}); 