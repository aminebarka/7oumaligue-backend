const { exec } = require('child_process');

console.log('🔍 Test rapide de compilation...\n');

exec('npx tsc --noEmit', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Erreurs trouvées:');
    console.log(stderr);
  } else {
    console.log('✅ Compilation réussie!');
    console.log('🚀 Le serveur devrait démarrer correctement');
  }
}); 