const fs = require('fs');
const path = require('path');

// Files that need fixing
const filesToFix = [
  'src/routes/liveMatch.routes.ts',
  'src/routes/match.routes.ts', 
  'src/routes/player.routes.ts',
  'src/routes/team.routes.ts',
  'src/routes/tournament.routes.ts',
  'src/server.ts'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix express-validator import issues by adding type annotations
    content = content.replace(/\.map\(\(err\) => err\.msg\)/g, '.map((err: any) => err.msg)');
    
    // Fix custom validation function in tournament routes
    content = content.replace(
      /\.custom\(\(endDate, \{ req \}\) => \{/g,
      '.custom((endDate: any, { req }: any) => {'
    );
    
    // Fix rate limiter functions in server.ts
    content = content.replace(
      /keyGenerator: \(req\) => \{/g,
      'keyGenerator: (req: any) => {'
    );
    content = content.replace(
      /handler: \(req, res\) => \{/g,
      'handler: (req: any, res: any) => {'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing TypeScript errors...');

// Fix all files
filesToFix.forEach(fixFile);

console.log('✅ All TypeScript errors should be fixed!');
console.log('📦 Run "npm install" to install missing dependencies');
console.log('🏗️  Run "npm run build" to verify the build works'); 