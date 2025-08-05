# Guide rapide : Configuration Supabase

## 🚀 Configuration en 5 minutes

### 1. Créer un compte Supabase
- Allez sur https://supabase.com
- Cliquez sur "Start your project"
- Connectez-vous avec GitHub ou créez un compte

### 2. Créer un nouveau projet
- Cliquez sur "New Project"
- Choisissez votre organisation
- Donnez un nom à votre projet (ex: "7oumaligue")
- Choisissez un mot de passe pour la base de données
- Cliquez sur "Create new project"

### 3. Récupérer la chaîne de connexion
- Une fois le projet créé, allez dans **Settings** → **Database**
- Copiez la **Connection string** (URI)
- Elle ressemble à : `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`

### 4. Configurer votre projet
```bash
cd backend
node setup-real-database.js
```
- Choisissez l'option 1 (Supabase)
- Collez votre chaîne de connexion

### 5. Tester la connexion
```bash
node test-database.js
npx prisma migrate deploy
```

## ✅ Avantages de Supabase
- ✅ **Gratuit** (500MB de base de données)
- ✅ **Interface web** pour gérer les données
- ✅ **API automatique** générée
- ✅ **Authentification** intégrée
- ✅ **Backup automatique**

## 🔧 Configuration GitHub Actions

Une fois Supabase configuré, mettez à jour vos secrets GitHub :

1. Allez dans votre repository GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Mettez à jour `DATABASE_URL` avec votre chaîne Supabase

## 📋 Vérification finale

Après configuration :
```bash
cd backend
node test-final.js
npm run build
```

Si tout fonctionne, votre backend est prêt pour le déploiement ! 