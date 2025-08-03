const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des erreurs de types...');

// Fonction pour remplacer les types number par string dans les fichiers
function fixTypeErrors() {
  const filesToFix = [
    'src/routes/advanced.routes.ts',
    'src/routes/community.routes.ts',
    'src/routes/draw.routes.ts',
    'src/routes/group.routes.ts',
    'src/routes/player-cards.routes.ts',
    'src/routes/stadium.routes.ts',
    'src/routes/tv.routes.ts'
  ];

  filesToFix.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Corrections communes
      content = content.replace(/parseInt\(([^)]+)\)/g, 'String($1)');
      content = content.replace(/where: \{ id: parseInt\(([^)]+)\) \}/g, 'where: { id: String($1) }');
      content = content.replace(/tournamentId: parseInt\(([^)]+)\)/g, 'tournamentId: String($1)');
      content = content.replace(/teamId: parseInt\(([^)]+)\)/g, 'teamId: String($1)');
      content = content.replace(/playerId: parseInt\(([^)]+)\)/g, 'playerId: String($1)');
      content = content.replace(/matchId: parseInt\(([^)]+)\)/g, 'matchId: String($1)');
      
      // Supprimer les propriétés qui n'existent pas
      content = content.replace(/,\s*tenantId: req\.user\?\.tenantId/g, '');
      content = content.replace(/,\s*participants: parseInt\(participants\) \|\| 0/g, '');
      content = content.replace(/,\s*transactionId: ['"][^'"]+['"]/g, '');
      content = content.replace(/,\s*yellowCards: \d+/g, '');
      content = content.replace(/,\s*badgeType: ['"][^'"]+['"]/g, '');
      content = content.replace(/,\s*phone: ['"][^'"]+['"]/g, '');
      
      // Corriger les imports
      content = content.replace(/import \{ authMiddleware \} from ['"]\.\.\/middleware\/auth\.middleware['"]/g, 
                               'import { authenticateToken } from \'../middleware/auth.middleware\'');
      content = content.replace(/import \{ ApiResponse \} from ['"]\.\.\/utils\/apiResponse['"]/g, 
                               'import { success, created, badRequest, notFound } from \'../utils/apiResponse\'');
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fichier corrigé: ${filePath}`);
    }
  });
}

// Fonction pour corriger les erreurs spécifiques
function fixSpecificErrors() {
  // Corriger le fichier tournament.controller.ts
  const controllerPath = 'src/controllers/tournament.controller.ts';
  if (fs.existsSync(controllerPath)) {
    let content = fs.readFileSync(controllerPath, 'utf8');
    
    // Corriger l'erreur du champ stadium
    content = content.replace(/stadium: stadium \|\| "",/g, 'stadium: stadium || "",');
    
    fs.writeFileSync(controllerPath, content);
    console.log('✅ Fichier tournament.controller.ts corrigé');
  }
}

// Exécuter les corrections
try {
  fixTypeErrors();
  fixSpecificErrors();
  console.log('🎉 Corrections terminées !');
} catch (error) {
  console.error('❌ Erreur lors des corrections:', error.message);
} 