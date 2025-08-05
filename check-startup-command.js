#!/usr/bin/env node

console.log('🔍 === VÉRIFICATION STARTUP COMMAND AZURE ===');

console.log('\n📋 Startup Command actuel dans Azure :');
console.log('   (à vérifier dans Azure Portal)');
console.log('   App Service → Configuration → General Settings → Startup Command');

console.log('\n✅ Startup Command correct :');
console.log('   bash startup.sh');

console.log('\n❌ Startup Command incorrect :');
console.log('   npm start');
console.log('   npm run dev');
console.log('   (vide - Azure devine automatiquement)');

console.log('\n🔧 Configuration via Azure CLI :');
console.log('   az webapp config set \\');
console.log('     --resource-group 7oumaligue-rg \\');
console.log('     --name 7oumaligue-backend \\');
console.log('     --startup-file "bash startup.sh"');

console.log('\n🔧 Configuration via Azure Portal :');
console.log('   1. App Service → 7oumaligue-backend');
console.log('   2. Configuration → General Settings');
console.log('   3. Startup Command : bash startup.sh');
console.log('   4. Save + Restart');

console.log('\n📊 Vérification des logs attendus :');
console.log('   🚀 === DÉMARRAGE AZURE AVEC INSTALLATION COMPLÈTE ===');
console.log('   🔧 Désactivation du loader Azure...');
console.log('   📦 Installation des dépendances système...');
console.log('   ✅ Dépendances système installées');
console.log('   🔧 Installation de TypeScript globalement...');
console.log('   ✅ TypeScript installé globalement');
console.log('   🔨 Vérification du build...');
console.log('   ✅ Build vérifié');
console.log('   🚀 Démarrage de l\'application...');
console.log('   > 7oumaligue-backend@1.0.0 start');
console.log('   > tsc && node dist/src/server.js');
console.log('   ✅ Server running on 0.0.0.0:8080');

console.log('\n⚠️ Si tu vois encore ces erreurs :');
console.log('   sh: 1: tsc: not found');
console.log('   sh: 1: kill-port: not found');
console.log('   → Le Startup Command n\'est pas configuré correctement'); 