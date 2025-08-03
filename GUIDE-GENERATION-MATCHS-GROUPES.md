# ⚽ Guide - Génération de Matchs entre Groupes

## 🎯 Objectif

Générer automatiquement tous les matchs entre les équipes des groupes d'un tournoi, avec :
- ✅ Matchs entre toutes les équipes d'un même groupe
- ✅ Relations correctes entre matchs et équipes
- ✅ Affichage correct des noms d'équipes (home/away)
- ✅ Planning organisé par dates

## 🔧 Fonctionnement

### **1. Structure des Données**

#### **Modèle Match :**
```prisma
model Match {
  homeTeamId   String?  // ✅ ID de l'équipe domicile (relation)
  awayTeamId   String?  // ✅ ID de l'équipe extérieur (relation)
  homeTeam     String?  // ✅ Nom de l'équipe domicile (affichage)
  awayTeam     String?  // ✅ Nom de l'équipe extérieur (affichage)
  homeTeamRef  Team?    @relation("HomeMatches", fields: [homeTeamId], references: [id])
  awayTeamRef  Team?    @relation("AwayMatches", fields: [awayTeamId], references: [id])
  groupId      String?  // ✅ Groupe du match
  tournamentId String?  // ✅ Tournoi du match
}
```

#### **Relations :**
- `homeTeamId` / `awayTeamId` → Pour les relations Prisma
- `homeTeam` / `awayTeam` → Pour l'affichage
- `homeTeamRef` / `awayTeamRef` → Relations vers les équipes

### **2. Processus de Génération**

#### **Étape 1 : Récupération des Données**
```typescript
// Récupérer le tournoi avec ses groupes et équipes
const tournament = await prisma.tournament.findUnique({
  where: { id },
  include: {
    groups: {
      include: {
        groupTeams: {
          include: {
            team: true
          }
        }
      }
    }
  }
})
```

#### **Étape 2 : Génération du Planning**
```typescript
// Utiliser TournamentScheduler pour générer le planning
const schedule = await TournamentScheduler.generateTournamentSchedule(id)
```

#### **Étape 3 : Création des Matchs**
```typescript
// Pour chaque match du planning
for (const matchSchedule of schedule.groupPhase) {
  // Récupérer les équipes par nom
  const homeTeam = await prisma.team.findFirst({
    where: { name: matchSchedule.homeTeam }
  });
  
  const awayTeam = await prisma.team.findFirst({
    where: { name: matchSchedule.awayTeam }
  });

  // Créer le match avec les bonnes relations
  await prisma.match.create({
    data: {
      homeTeamId: homeTeam.id, // ✅ Relation
      awayTeamId: awayTeam.id, // ✅ Relation
      homeTeam: homeTeam.name, // ✅ Affichage
      awayTeam: awayTeam.name, // ✅ Affichage
      // ...
    }
  })
}
```

## 🧪 Test de la Solution

### **1. Préparer les Données :**
```bash
cd backend
node add-test-data.js
```

### **2. Tester la Génération :**
```bash
cd backend
node test-match-generation.js
```

### **3. Vérifier dans le Frontend :**
- Aller dans le frontend
- Créer un tournoi avec des groupes
- Ajouter des équipes aux groupes
- Générer les matchs
- Vérifier l'affichage

## 🎯 Résultat Attendu

### **Dans la Base de Données :**
- ✅ Matchs créés avec `homeTeamId` et `awayTeamId` corrects
- ✅ Noms d'équipes dans `homeTeam` et `awayTeam`
- ✅ Relations Prisma fonctionnelles
- ✅ Groupes assignés correctement

### **Dans le Frontend :**
- ✅ Affichage correct des noms d'équipes
- ✅ Distinction home/away visible
- ✅ Matchs organisés par groupes
- ✅ Planning par dates

### **Exemple de Match Créé :**
```json
{
  "id": "match-123",
  "homeTeamId": "team-456",
  "awayTeamId": "team-789",
  "homeTeam": "Équipe Rouge",
  "awayTeam": "Équipe Bleue",
  "homeTeamRef": {
    "id": "team-456",
    "name": "Équipe Rouge",
    "logo": "🔴"
  },
  "awayTeamRef": {
    "id": "team-789",
    "name": "Équipe Bleue",
    "logo": "🔵"
  },
  "groupId": "group-123",
  "tournamentId": "tournament-456",
  "date": "2024-08-02",
  "time": "15:00",
  "status": "scheduled"
}
```

## 📊 Vérifications

### **1. Relations Correctes :**
- ✅ `homeTeamId` pointe vers une équipe existante
- ✅ `awayTeamId` pointe vers une équipe existante
- ✅ `homeTeam` et `awayTeam` contiennent les noms
- ✅ `homeTeamRef` et `awayTeamRef` sont populés

### **2. Affichage Frontend :**
- ✅ Les noms d'équipes s'affichent correctement
- ✅ La distinction home/away est visible
- ✅ Les logos d'équipes s'affichent
- ✅ Les groupes sont correctement assignés

### **3. Planning :**
- ✅ Matchs répartis sur plusieurs jours
- ✅ Pas de conflit d'horaires
- ✅ Équipes ne jouent pas deux fois le même jour

## 🚀 Utilisation

### **Via l'API :**
```bash
POST /api/tournaments/{tournamentId}/generate-matches
{
  "matchTime": "15:00"
}
```

### **Via le Frontend :**
1. Aller dans la page des tournois
2. Sélectionner un tournoi
3. Cliquer sur "Générer les matchs"
4. Vérifier les matchs créés

## ⚠️ Important

### **Prérequis :**
- ✅ Tournoi créé
- ✅ Groupes créés dans le tournoi
- ✅ Équipes ajoutées aux groupes
- ✅ Au moins 2 équipes par groupe

### **Limitations :**
- Les matchs sont générés uniquement entre équipes du même groupe
- Les matchs de phase finale sont générés séparément
- Le planning respecte les contraintes d'horaires

## 📞 Support

Si le problème persiste :
1. Vérifiez que les équipes existent dans la base
2. Vérifiez que les groupes sont créés
3. Vérifiez que les équipes sont assignées aux groupes
4. Utilisez `test-match-generation.js` pour diagnostiquer 