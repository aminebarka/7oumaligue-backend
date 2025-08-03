const { exec } = require('child_process');

console.log('🔍 Test de compilation TypeScript...\n');

exec('npx tsc --noEmit', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Erreurs de compilation TypeScript:');
    console.log(stderr);
    console.log('\n💡 Erreurs à corriger avant de démarrer le serveur');
  } else {
    console.log('✅ Compilation TypeScript réussie!');
    console.log('🚀 Vous pouvez maintenant démarrer le serveur avec: npm run dev');
  }
}); 