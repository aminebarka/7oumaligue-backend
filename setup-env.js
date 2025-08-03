const fs = require('fs');
const path = require('path');

const envContent = `# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/7oumaligue?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV=development

# Rate Limiting - Désactivé en développement
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
ENABLE_RATE_LIMIT=false

# Frontend URL for CORS
FRONTEND_URL="http://localhost:5173"
`;

const envPath = path.join(__dirname, '.env');

try {
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Fichier .env créé avec succès');
    console.log('📝 Veuillez modifier la DATABASE_URL selon votre configuration PostgreSQL');
    console.log('🔓 Rate limiting désactivé en développement');
  } else {
    console.log('⚠️  Le fichier .env existe déjà');
    console.log('💡 Pour désactiver le rate limiting, ajoutez ENABLE_RATE_LIMIT=false');
  }
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env:', error);
} 