# Configuration Azure pour 7ouma Ligue Backend

## Paramètres de Stack Azure

### Configuration Obligatoire
- **Stack**: Node.js
- **Major version**: 18
- **Minor version**: LTS
- **Startup Command**: `npm run azure:start`

### Variables d'Environnement Requises
```bash
NODE_ENV=production
PORT=8080
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
```

### Scripts de Démarrage Disponibles

1. **Production (Azure)**: `npm run azure:start`
   - Compile TypeScript si nécessaire
   - Démarre le serveur en mode production
   - Gère les erreurs de compilation

2. **Développement Local**: `npm run dev:simple`
   - Utilise le nouveau script robuste
   - Nettoie le port 5000
   - Démarre avec ts-node et nodemon

3. **Build Manuel**: `npm run build`
   - Compile TypeScript manuellement

### Résolution des Erreurs

#### Erreur "tsc not found"
✅ **Résolu** par `start-prod.js` qui utilise le chemin complet :
```javascript
const tscPath = path.join(__dirname, 'node_modules', 'typescript', 'bin', 'tsc');
```

#### Erreur "kill-port not found"
✅ **Résolu** par `start-dev-robust.js` qui utilise le chemin complet :
```javascript
const killPortPath = path.join(__dirname, 'node_modules', 'kill-port', 'dist', 'index.js');
```

### Déploiement

1. **Build automatique** : Le script `azure:start` compile automatiquement si nécessaire
2. **Gestion d'erreurs** : Arrêt propre en cas d'échec
3. **Logs détaillés** : Messages clairs pour le debugging

### Test Local

```bash
# Test du script de production
npm run azure:start

# Test du script de développement
npm run dev:simple
``` 