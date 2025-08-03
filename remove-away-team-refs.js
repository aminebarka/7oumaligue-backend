const fs = require('fs');
const path = require('path');

function removeAwayTeamRefs() {
  console.log('🧹 Suppression des références awayTeamRef...\n');

  const files = [
    'src/controllers/liveMatch.controller.ts'
  ];

  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Supprimer les lignes contenant awayTeamRef
      const lines = content.split('\n');
      const filteredLines = lines.filter(line => !line.includes('awayTeamRef'));
      
      const newContent = filteredLines.join('\n');
      
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ ${file} nettoyé`);
    } else {
      console.log(`❌ ${file} non trouvé`);
    }
  });

  console.log('\n🎉 Nettoyage terminé!');
}

removeAwayTeamRefs(); 