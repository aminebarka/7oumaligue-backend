const fs = require('fs');
const path = require('path');

console.log('🔍 === DIAGNOSTIC AZURE ===');
console.log('📅 Date:', new Date().toISOString());
console.log('📁 Répertoire actuel:', process.cwd());
console.log('🔧 Node.js version:', process.version);
console.log('📦 NPM version:', require('child_process').execSync('npm --version', { encoding: 'utf8' }).trim());

console.log('\n📋 Contenu du répertoire:');
try {
    const files = fs.readdirSync('.');
    files.forEach(file => {
        const stats = fs.statSync(file);
        console.log(`   ${stats.isDirectory() ? '📁' : '📄'} ${file} (${stats.size} bytes)`);
    });
} catch (error) {
    console.log('❌ Erreur lecture répertoire:', error.message);
}

console.log('\n📦 Vérification package.json:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('✅ package.json valide');
    console.log('   Nom:', packageJson.name);
    console.log('   Version:', packageJson.version);
    console.log('   Scripts disponibles:', Object.keys(packageJson.scripts || {}));
    
    if (packageJson.scripts && packageJson.scripts.start) {
        console.log('✅ Script start défini:', packageJson.scripts.start);
    } else {
        console.log('❌ Script start manquant');
    }
} catch (error) {
    console.log('❌ Erreur package.json:', error.message);
}

console.log('\n🔨 Vérification build:');
const distPath = path.join('dist', 'src', 'server.js');
if (fs.existsSync(distPath)) {
    const stats = fs.statSync(distPath);
    console.log('✅ dist/src/server.js existe');
    console.log('   Taille:', stats.size, 'bytes');
    console.log('   Modifié:', stats.mtime);
    
    // Vérifier le contenu
    const content = fs.readFileSync(distPath, 'utf8');
    if (content.includes('require(') || content.includes('module.exports')) {
        console.log('✅ Fichier semble être du JavaScript compilé');
    } else {
        console.log('⚠️ Le fichier ne semble pas être du JavaScript compilé');
    }
} else {
    console.log('❌ dist/src/server.js manquant');
}

console.log('\n🔧 Variables d\'environnement:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'non défini');
console.log('   PORT:', process.env.PORT || 'non défini');
console.log('   PWD:', process.env.PWD || 'non défini');

console.log('\n🚀 Test de démarrage...');
try {
    console.log('Tentative d\'exécution de npm start...');
    const { spawn } = require('child_process');
    const npm = spawn('npm', ['start'], { 
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'production' }
    });
    
    npm.stdout.on('data', (data) => {
        console.log('📤 STDOUT:', data.toString());
    });
    
    npm.stderr.on('data', (data) => {
        console.log('📤 STDERR:', data.toString());
    });
    
    npm.on('close', (code) => {
        console.log('🏁 Processus terminé avec code:', code);
    });
    
    // Arrêter après 10 secondes
    setTimeout(() => {
        npm.kill();
        console.log('⏰ Test arrêté après 10 secondes');
    }, 10000);
    
} catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
}

console.log('\n🎯 Diagnostic terminé'); 