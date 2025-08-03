# 🔗 Guide de Résolution - Clés Étrangères Matchs

## 🚨 Problème Identifié

**Erreur :**
```
Foreign key constraint violated on the (not available)
code: 'P2003'
```

**Cause :**
- Le modèle `Match` a deux types de champs pour les équipes :
  - `homeTeam` et `awayTeam` (String) - pour l'affichage
  - `homeTeamId` et `awayTeamId` (String) - pour les relations Prisma
- Le contrôleur utilisait les mauvais champs pour les relations
- Les clés étrangères ne correspondaient pas aux données existantes

## ✅ Solution Appliquée

### **Correction dans `backend/src/controllers/match.controller.ts` :**

```typescript
// AVANT (problématique)
const match = await prisma.match.create({
  data: {
    homeTeam, // ❌ Utilisait le champ String au lieu de la relation
    awayTeam, // ❌ Utilisait le champ String au lieu de la relation
    // ...
  }
});

// APRÈS (corrigé)
const match = await prisma.match.create({
  data: {
    homeTeamId: homeTeam, // ✅ Utilise la relation Prisma
    awayTeamId: awayTeam, // ✅ Utilise la relation Prisma
    homeTeam: homeTeamExists.name, // ✅ Garde le nom pour l'affichage
    awayTeam: awayTeamExists.name, // ✅ Garde le nom pour l'affichage
    // ...
  }
});
```

## 🔧 Détails de la Correction

### **1. Structure du Modèle Match :**
```prisma
model Match {
  homeTeamId   String?  // ✅ Pour la relation Prisma
  awayTeamId   String?  // ✅ Pour la relation Prisma
  homeTeam     String?  // ✅ Pour l'affichage
  awayTeam     String?  // ✅ Pour l'affichage
  homeTeamRef  Team?    @relation("HomeMatches", fields: [homeTeamId], references: [id])
  awayTeamRef  Team?    @relation("AwayMatches", fields: [awayTeamId], references: [id])
}
```

### **2. Correction du Contrôleur :**
- ✅ Utilise `homeTeamId` et `awayTeamId` pour les relations
- ✅ Garde `homeTeam` et `awayTeam` pour l'affichage
- ✅ Récupère les noms des équipes depuis la base de données

### **3. Correction du Script de Test :**
- ✅ Utilise les bons champs de relation
- ✅ Maintient la cohérence des données

## 🧪 Test de la Solution

### **1. Diagnostic des Relations :**
```bash
cd backend
node debug-relations.js
```

### **2. Nettoyer et Recréer les Données :**
```bash
cd backend
node clean-test-data.js
node add-test-data.js
```

### **3. Tester la Création :**
```bash
cd backend
node test-match-creation.js
```

## 🎯 Résultat Attendu

- ✅ Plus d'erreur `Foreign key constraint violated`
- ✅ Relations Prisma correctement établies
- ✅ Matchs créés avec succès
- ✅ Données cohérentes entre affichage et relations

## 📊 Vérifications

### **Dans la Console :**
- ✅ Pas d'erreur Prisma P2003
- ✅ Messages de succès pour la création
- ✅ Relations correctement établies

### **Dans la Base de Données :**
- ✅ `homeTeamId` et `awayTeamId` pointent vers des équipes existantes
- ✅ `homeTeam` et `awayTeam` contiennent les noms d'équipes
- ✅ Relations Prisma fonctionnelles

### **Dans le Frontend :**
- ✅ Génération de matchs fonctionnelle
- ✅ Affichage correct des noms d'équipes
- ✅ Plus d'erreur 400 ou 500

## 🚀 Prochaines Étapes

1. **Diagnostiquer les relations :**
   ```bash
   cd backend
   node debug-relations.js
   ```

2. **Nettoyer et recréer les données :**
   ```bash
   cd backend
   node clean-test-data.js
   node add-test-data.js
   ```

3. **Tester la création :**
   ```bash
   cd backend
   node test-match-creation.js
   ```

4. **Tester dans le frontend :**
   - Créer un tournoi
   - Générer des matchs
   - Vérifier qu'ils se créent sans erreur

## ⚠️ Important

### **Structure Correcte :**
- `homeTeamId` / `awayTeamId` → Pour les relations Prisma (obligatoire)
- `homeTeam` / `awayTeam` → Pour l'affichage (optionnel mais recommandé)

### **Validation :**
- ✅ Vérifier que les équipes existent avant création
- ✅ Vérifier que le tournoi existe
- ✅ Vérifier que le groupe existe (si fourni)

## 📞 Support

Si le problème persiste :
1. Utilisez `debug-relations.js` pour diagnostiquer
2. Vérifiez que toutes les données existent
3. Nettoyez et recréez les données de test
4. Vérifiez les logs du serveur pour plus de détails 