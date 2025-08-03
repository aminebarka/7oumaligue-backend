# 🚨 Correction Finale - Erreur 400 Création Tournoi

## 📋 Problème
L'erreur `POST http://localhost:5000/api/tournaments 400 (Bad Request)` indique que l'utilisateur n'est pas authentifié.

## ✅ Solution Rapide

### 1. Exécuter le Script de Correction Simple
```bash
cd backend
node fix-400-simple.js
```

### 2. Si le Script Ne Fonctionne Pas, Correction Manuel

#### Étape 1: Vérifier le Serveur
```bash
cd backend
npm run dev
```

#### Étape 2: Créer un Utilisateur de Test
```bash
cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: '$2b$10$test',
        role: 'admin',
        tenantId: 1
      }
    });
    console.log('✅ Utilisateur créé:', user.id);
  } catch (error) {
    console.log('⚠️ Utilisateur existe déjà ou erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
"
```

#### Étape 3: Créer un Tenant
```bash
cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTenant() {
  try {
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Tenant Principal',
        description: 'Tenant par défaut'
      }
    });
    console.log('✅ Tenant créé:', tenant.id);
  } catch (error) {
    console.log('⚠️ Tenant existe déjà ou erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTenant();
"
```

#### Étape 4: Ajouter des Stades
```bash
cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addStadiums() {
  try {
    const stadiums = [
      {
        name: 'Stade Municipal de Douz',
        address: '123 Avenue Mohammed V',
        city: 'Douz',
        region: 'Douz-Settat',
        capacity: 50000,
        fieldCount: 2,
        fieldTypes: ['Gazon naturel', 'Gazon synthétique'],
        amenities: ['Vestiaires', 'Parking', 'Éclairage'],
        description: 'Stade principal de Douz',
        isPartner: true
      },
      {
        name: 'Complexe Sportif de Douz',
        address: '456 Boulevard Hassan II',
        city: 'Douz',
        region: 'Douz-Salé-Kénitra',
        capacity: 30000,
        fieldCount: 3,
        fieldTypes: ['Gazon synthétique'],
        amenities: ['Vestiaires', 'Parking'],
        description: 'Complexe sportif moderne',
        isPartner: false
      }
    ];

    for (const stadium of stadiums) {
      await prisma.stadium.create({ data: stadium });
    }
    console.log('✅ Stades ajoutés');
  } catch (error) {
    console.log('⚠️ Stades existent déjà ou erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addStadiums();
"
```

### 3. Se Connecter dans le Frontend
1. Ouvrir http://localhost:3000
2. Aller dans "Connexion" ou "Login"
3. Se connecter avec :
   - **Email:** `test@example.com`
   - **Mot de passe:** `password123`

### 4. Vérifier l'Authentification
Dans la console du navigateur (F12) :
```javascript
console.log(localStorage.getItem("token"))
```
Si le résultat n'est pas `null`, vous êtes connecté.

### 5. Tester la Création de Tournoi
1. Aller dans "Tournois"
2. Cliquer sur "Créer un Nouveau Tournoi"
3. Remplir le formulaire
4. Vérifier que la création fonctionne

## 🔍 Diagnostic Manuel

### Tester l'API Manuellement
```bash
# Test de connectivité
curl http://localhost:5000/api/test

# Test d'authentification
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test des stades
curl http://localhost:5000/api/stadiums
```

### Vérifier la Base de Données
```bash
cd backend
npx prisma studio
```

## 🎯 Résultat Attendu

Après correction, vous devriez voir :
- ✅ Connexion réussie
- ✅ Token stocké dans localStorage
- ✅ Création de tournoi fonctionnelle
- ✅ Liste déroulante des stades affiche les stades

## 🚨 En Cas de Problème Persistant

### Vérifier les Logs du Serveur
```bash
cd backend
npm run dev
```
Regarder les logs pour voir les erreurs d'authentification.

### Vérifier le Frontend
Dans la console du navigateur :
```javascript
// Vérifier le token
console.log(localStorage.getItem("token"))

// Vérifier les requêtes
console.log('Token présent:', !!localStorage.getItem("token"))
```

### Réinitialiser l'Authentification
```javascript
// Dans la console du navigateur
localStorage.removeItem("token")
// Puis se reconnecter
```

## ✅ Checklist de Vérification

- [ ] Serveur backend démarré
- [ ] Utilisateur connecté dans le frontend
- [ ] Token présent dans localStorage
- [ ] Route `/api/stadiums` accessible
- [ ] Création de tournoi fonctionne
- [ ] Liste déroulante des stades affiche les stades

## 🎉 Problème Résolu !

L'erreur 400 devrait être résolue car :
1. L'utilisateur est authentifié
2. Le token est valide
3. Les données sont correctement envoyées
4. Le serveur peut créer le tournoi 