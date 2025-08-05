# GitHub Actions Secrets Configuration

## Required Secrets

Pour que votre workflow GitHub Actions fonctionne correctement, vous devez configurer ces secrets dans votre repository :

### 1. Aller aux paramètres du repository
- Naviguez vers votre repository GitHub
- Allez dans **Settings** → **Secrets and variables** → **Actions**

### 2. Ajouter ces secrets :

#### `DATABASE_URL`
Votre chaîne de connexion PostgreSQL :
```
postgresql://username:password@host:port/database
```

**Exemples :**
- **Supabase** : `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`
- **Railway** : `postgresql://postgres:[password]@containers-us-west-[id].railway.app:5432/railway`
- **Neon** : `postgresql://[user]:[password]@[host]/[database]`

#### `JWT_SECRET`
Une chaîne aléatoire sécurisée pour la signature des tokens JWT :
```
your-super-secret-jwt-key-for-production-change-this
```

#### `AZUREAPPSERVICE_PUBLISHPROFILE_F2EFC73E8FD9481CA208D4847CDB20A2`
Votre profil de publication Azure Web App (déjà configuré)

## Corrections apportées au workflow

### ✅ Problèmes corrigés :
1. **Ajout du cache npm** pour accélérer les builds
2. **Correction de la création du fichier .env** (utilisation de `>` au lieu de `>>`)
3. **Installation des dépendances de développement** avec `--production=false`
4. **Installation des dépendances système** pour canvas
5. **Ordre correct des étapes** (génération Prisma avant build)

### 🔧 Étapes du workflow corrigé :
1. **Checkout du code**
2. **Installation des dépendances système** (canvas)
3. **Setup Node.js 20.x avec cache**
4. **Création du fichier .env** depuis les secrets
5. **Installation des dépendances npm** (incluant devDependencies)
6. **Génération du client Prisma**
7. **Build TypeScript**
8. **Migration de la base de données**
9. **Upload des artifacts**
10. **Déploiement vers Azure**

## Test du workflow

### Test local avant push :
```bash
cd backend
npm install
npm run build
npx prisma generate
```

### Vérification dans GitHub :
1. Poussez vers la branche main
2. Vérifiez l'onglet Actions
3. Surveillez les logs pour détecter les erreurs

## Dépannage

### Erreurs courantes :
1. **"DATABASE_URL resolved to an empty string"** → Vérifiez le secret `DATABASE_URL`
2. **"Cannot find module 'canvas'"** → Dépendances système manquantes
3. **"TypeScript compilation failed"** → Erreurs de types non résolues
4. **"Prisma generate failed"** → Problème de schéma ou de connexion DB

### Solutions :
1. Vérifiez que tous les secrets sont configurés
2. Assurez-vous que la base de données est accessible
3. Testez localement avant de pousser
4. Vérifiez les logs GitHub Actions pour les détails d'erreur 