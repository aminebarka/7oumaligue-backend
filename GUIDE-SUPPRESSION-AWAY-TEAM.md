# 🗑️ Guide - Suppression des Champs AwayTeam

## 🎯 Objectif

Simplifier la logique des matchs en supprimant les champs `awayTeam` et `awayTeamId` pour avoir une structure plus simple avec seulement une équipe par match.

## 🔧 Changements Appliqués

### **1. Schéma Prisma Modifié**

#### **AVANT :**
```prisma
model Match {
  homeTeamId   String?
  awayTeamId   String?
  homeTeam     String?
  awayTeam     String?
  homeScore    Int?
  awayScore    Int?
  homeTeamRef  Team?    @relation("HomeMatches", fields: [homeTeamId], references: [id])
  awayTeamRef  Team?    @relation("AwayMatches", fields: [awayTeamId], references: [id])
}
```

#### **APRÈS :**
```prisma
model Match {
  homeTeamId   String?
  homeTeam     String?
  homeScore    Int?
  homeTeamRef  Team?    @relation("HomeMatches", fields: [homeTeamId], references: [id])
}
```

### **2. Modèle Team Modifié**

#### **AVANT :**
```prisma
model Team {
  homeMatches  Match[]  @relation("HomeMatches")
  awayMatches  Match[]  @relation("AwayMatches")
}
```

#### **APRÈS :**
```prisma
model Team {
  homeMatches  Match[]  @relation("HomeMatches")
}
```

### **3. Contrôleurs Mis à Jour**

#### **`match.controller.ts` :**
- ✅ Suppression des références à `awayTeam` et `awayTeamId`
- ✅ Simplification de la validation
- ✅ Suppression des relations `awayTeamRef`
- ✅ Mise à jour des statistiques d'équipe

#### **`tournament.controller.ts` :**
- ✅ Suppression des références à `awayTeam` dans la génération de matchs
- ✅ Simplification de la création de matchs

## 🧪 Test de la Migration

### **1. Migrer la Base de Données :**
```bash
cd backend
node migrate-remove-away-team.js
```

### **2. Régénérer le Client Prisma :**
```bash
cd backend
npx prisma generate
```

### **3. Tester avec de Nouvelles Données :**
```bash
cd backend
node add-test-data.js
```

### **4. Tester la Création de Matchs :**
```bash
cd backend
node test-match-creation.js
```

## 🎯 Résultat Attendu

### **Structure Simplifiée :**
- ✅ Un seul champ d'équipe par match (`homeTeam`)
- ✅ Une seule relation Prisma (`homeTeamRef`)
- ✅ Logique simplifiée dans les contrôleurs
- ✅ Base de données plus légère

### **Exemple de Match Créé :**
```json
{
  "id": "match-123",
  "homeTeamId": "team-456",
  "homeTeam": "Équipe Rouge",
  "homeScore": 2,
  "homeTeamRef": {
    "id": "team-456",
    "name": "Équipe Rouge",
    "logo": "🔴"
  },
  "groupId": "group-123",
  "tournamentId": "tournament-456",
  "date": "2024-08-02",
  "time": "15:00",
  "status": "scheduled"
}
```

## 📊 Vérifications

### **1. Base de Données :**
- ✅ Plus de champs `awayTeam` ou `awayTeamId`
- ✅ Relations simplifiées
- ✅ Matchs créés avec succès

### **2. API :**
- ✅ Création de matchs fonctionnelle
- ✅ Récupération de matchs fonctionnelle
- ✅ Mise à jour de matchs fonctionnelle

### **3. Frontend :**
- ✅ Affichage des matchs adapté
- ✅ Génération de matchs fonctionnelle
- ✅ Interface simplifiée

## 🚀 Utilisation

### **Créer un Match :**
```bash
POST /api/matches
{
  "date": "2024-08-02",
  "time": "15:00",
  "venue": "Stade Principal",
  "homeTeam": "team-id",
  "tournamentId": "tournament-id",
  "groupId": "group-id"
}
```

### **Récupérer les Matchs :**
```bash
GET /api/matches
```

## ⚠️ Important

### **Migration Requise :**
- ✅ Exécuter `migrate-remove-away-team.js`
- ✅ Régénérer le client Prisma
- ✅ Tester avec de nouvelles données

### **Impact sur le Frontend :**
- Les composants d'affichage des matchs doivent être adaptés
- Suppression des références à `awayTeam` dans l'interface
- Simplification de la logique d'affichage

## 📞 Support

Si le problème persiste :
1. Vérifiez que la migration a été exécutée
2. Régénérez le client Prisma
3. Testez avec de nouvelles données
4. Adaptez le frontend si nécessaire 