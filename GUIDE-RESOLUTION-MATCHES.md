# ⚽ Guide de Résolution - Problème des Matchs

## 🔍 Diagnostic du Problème

L'erreur `POST http://localhost:5000/api/matches 404 (Not Found)` indique que :
1. Le serveur backend ne fonctionne pas
2. Les routes des matchs ne sont pas correctement enregistrées
3. Il y a un problème d'authentification
4. Le serveur n'est pas démarré

## 🚀 Étapes de Résolution

### Étape 1: Vérifier le Statut du Serveur

```bash
cd backend
node test-server-status.js
```

**Résultats attendus :**
- ✅ Serveur fonctionne
- ❌ Serveur ne répond pas → Démarrer le serveur

### Étape 2: Démarrer le Serveur Backend

```bash
cd backend
npm run dev
```

**Vérifications :**
- Pas d'erreurs TypeScript
- Serveur démarre sur le port 5000
- Logs de démarrage visibles

### Étape 3: Tester les Routes de Base

Ouvrez votre navigateur et testez :
- `http://localhost:5000/api/test` → Devrait retourner un JSON
- `http://localhost:5000/api/matches` → Devrait retourner une erreur 401 (auth requise)

### Étape 4: Vérifier l'Authentification

Le problème principal est l'authentification. Les routes des matchs nécessitent :
- Un token JWT valide
- Le rôle `admin` ou `coach`

**Solutions possibles :**

1. **Se connecter dans le frontend** pour obtenir un token valide
2. **Temporairement désactiver l'authentification** pour les matchs
3. **Créer un utilisateur de test** avec un token valide

## 🔧 Correction Temporaire (Sans Authentification)

Si vous voulez tester rapidement, modifiez temporairement `backend/src/routes/match.routes.ts` :

```typescript
// Commenter ces lignes temporairement
// router.get("/", authenticateToken, getMatches)
// router.post("/", authenticateToken, requireAdminOrCoach, matchValidation, validateRequest, createMatch)

// Et les remplacer par :
router.get("/", getMatches)
router.post("/", matchValidation, validateRequest, createMatch)
```

## 📊 Vérifications

### Dans la Console du Navigateur :
- Vérifiez les logs de débogage
- Regardez si le token est présent
- Vérifiez les erreurs de réseau

### Dans la Console du Serveur :
- Vérifiez les logs de démarrage
- Regardez les erreurs de compilation TypeScript
- Vérifiez les logs d'authentification

## 🎯 Solutions Prioritaires

1. **Démarrer le serveur backend** (priorité 1)
2. **Vérifier l'authentification** (priorité 2)
3. **Tester les routes des matchs** (priorité 3)
4. **Résoudre les problèmes de token** (priorité 4)

## 🔍 Diagnostic Avancé

### Test des Routes Spécifiques :

```bash
# Test GET /api/matches
curl -X GET http://localhost:5000/api/matches

# Test POST /api/matches (sans token)
curl -X POST http://localhost:5000/api/matches \
  -H "Content-Type: application/json" \
  -d '{"date":"2024-01-15","time":"14:00","venue":"Test","homeTeam":"A","awayTeam":"B","tournamentId":"1"}'

# Test POST /api/matches (avec token factice)
curl -X POST http://localhost:5000/api/matches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-token" \
  -d '{"date":"2024-01-15","time":"14:00","venue":"Test","homeTeam":"A","awayTeam":"B","tournamentId":"1"}'
```

## 📞 Support

Si le problème persiste, vérifiez :
- Les logs du serveur backend
- La console du navigateur
- Les erreurs TypeScript
- La connexion à la base de données
- Le statut de l'authentification

## 🚨 Problèmes Courants

1. **Serveur non démarré** → `npm run dev`
2. **Erreur TypeScript** → Vérifier les imports
3. **Token manquant** → Se connecter dans le frontend
4. **Permissions insuffisantes** → Vérifier le rôle utilisateur
5. **Validation échoue** → Vérifier le format des données 