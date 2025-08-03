const { exec } = require('child_process');

console.log('🔧 Correction complète...\n');

// Étape 1: Régénérer le client Prisma
console.log('1️⃣ Régénération du client Prisma...');
exec('npx prisma generate', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Erreur Prisma:', error);
    return;
  }
  console.log('✅ Client Prisma régénéré');
  
  // Étape 2: Test de compilation
  console.log('\n2️⃣ Test de compilation TypeScript...');
  exec('npx tsc --noEmit', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Erreurs de compilation:');
      console.log(stderr);
    } else {
      console.log('✅ Compilation réussie!');
      console.log('🚀 Le serveur devrait démarrer correctement');
    }
  });
}); 