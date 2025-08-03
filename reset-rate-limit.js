const http = require('http');

async function resetRateLimit() {
  console.log('🔄 Réinitialisation du rate limiting...\n');

  try {
    // Faire une requête pour réinitialiser le compteur
    const response = await new Promise((resolve, reject) => {
      const req = http.get('http://localhost:5000/health', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => reject(new Error('Timeout')));
    });
    
    console.log('✅ Requête de réinitialisation envoyée');
    console.log(`📊 Status: ${response.statusCode}`);
    
  } catch (error) {
    console.log('❌ Erreur lors de la réinitialisation:', error.message);
  }

  console.log('\n💡 Si le problème persiste, redémarrez le serveur avec:');
  console.log('   npm run dev');
}

resetRateLimit().catch(console.error); 