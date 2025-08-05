# Guide de dépannage - Erreur DATABASE_URL

## Problème : "DATABASE_URL resolved to an empty string"

### 🔍 Diagnostic

Exécutez ce script pour diagnostiquer le problème :
```bash
cd backend
node verify-setup.js
```

### 🛠️ Solutions par environnement

#### **1. Environnement local (Windows/Linux/macOS)**

**Problème :** Fichier `.env` manquant ou mal configuré

**Solution :**
```bash
# Utiliser le script de correction
node fix-database-connection.js

# Ou PowerShell
.\fix-env.ps1
```

#### **2. GitHub Actions**

**Problème :** Secrets non configurés dans GitHub

**Solution :**
1. Allez dans votre repository GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Ajoutez ces secrets :

**`DATABASE_URL`**
```
postgresql://ftms_user:password@localhost:5432/ftms_db
```

**`JWT_SECRET`**
```
your-super-secret-jwt-key-for-production
```

#### **3. Base de données cloud**

Si vous utilisez une base de données cloud :

**Supabase :**
```
postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

**Railway :**
```
postgresql://postgres:[password]@containers-us-west-[id].railway.app:5432/railway
```

**Neon :**
```
postgresql://[user]:[password]@[host]/[database]
```

### 🔧 Vérifications étape par étape

#### **Étape 1 : Vérifier le fichier .env**
```bash
# Vérifier que le fichier existe
ls -la .env

# Vérifier le contenu
cat .env
```

#### **Étape 2 : Vérifier les variables d'environnement**
```bash
# Tester le chargement
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET')"
```

#### **Étape 3 : Tester la connexion**
```bash
# Tester la base de données
node test-database.js
```

#### **Étape 4 : Vérifier Prisma**
```bash
# Générer le client
npx prisma generate

# Tester les migrations
npx prisma migrate deploy
```

### 🚨 Erreurs courantes et solutions

#### **Erreur 1 : "Cannot find module 'dotenv'"`
```bash
npm install dotenv
```

#### **Erreur 2 : "Connection refused"**
- Vérifiez que PostgreSQL est démarré
- Vérifiez les paramètres de connexion
- Testez avec `psql` ou un client PostgreSQL

#### **Erreur 3 : "Authentication failed"**
- Vérifiez le nom d'utilisateur et mot de passe
- Vérifiez les permissions de la base de données

#### **Erreur 4 : "Database does not exist"**
```sql
CREATE DATABASE ftms_db;
```

### 📋 Checklist de résolution

- [ ] Fichier `.env` existe dans le dossier `backend`
- [ ] `DATABASE_URL` est défini dans `.env`
- [ ] `DATABASE_URL` n'est pas vide
- [ ] Base de données PostgreSQL est accessible
- [ ] Utilisateur a les permissions nécessaires
- [ ] Secrets GitHub Actions sont configurés (si applicable)
- [ ] Dépendances npm sont installées
- [ ] Client Prisma est généré

### 🎯 Test final

Après avoir appliqué toutes les corrections :

```bash
cd backend
node verify-setup.js
npm run build
npx prisma migrate deploy
```

Si tous les tests passent, votre configuration est correcte ! 