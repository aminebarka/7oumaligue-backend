# 🔧 Guide de Dépannage - Problèmes de Dépendances

## 🚨 Problème de Boucle Infinie Résolu

### ✅ Solution Implémentée
- **Script `postinstall` sécurisé** : Vérifie seulement les dépendances
- **Installation conditionnelle** : Évite la réinstallation récursive
- **Scripts séparés** : `check-dependencies.js` et `install-dependencies.js`

## 🛠️ Scripts de Dépannage

### 1. Vérifier les Dépendances
```bash
npm run check-deps
```
Vérifie si les dépendances critiques sont présentes.

### 2. Installer Complètement (Local)
```bash
npm run install:full
```
Installe toutes les dépendances sans boucle infinie.

### 3. Corriger les Dépendances
```bash
npm run fix-deps
```
Nettoie et réinstalle tout (en cas de problème grave).

### 4. Diagnostiquer
```bash
npm run diagnose:deps
```
Diagnostic complet des dépendances et binaires.

## 🔄 Workflow de Correction

### Si vous avez des erreurs de dépendances :

1. **Vérification rapide** :
   ```bash
   npm run check-deps
   ```

2. **Si des dépendances manquent** :
   ```bash
   npm run install:full
   ```

3. **Si le problème persiste** :
   ```bash
   npm run fix-deps
   ```

4. **Vérification finale** :
   ```bash
   npm run diagnose:deps
   ```

## 🚀 Pour Azure

### Configuration Correcte
- **Script `postinstall`** : Vérifie seulement les dépendances
- **Workflow GitHub Actions** : Utilise `npm ci` + `npm run install:full`
- **Pas de boucle infinie** : Installation conditionnelle

### Logs Attendus
```
🔧 Checking dependencies...
✅ node_modules already exists. Skipping installation.
⚙️ Generating Prisma client...
✅ Prisma client generated successfully
```

## ⚠️ Problèmes Courants

### 1. Boucle Infinie
**Symptôme** : Installation qui ne se termine jamais
**Solution** : Utiliser `npm run fix-deps`

### 2. Dépendances Manquantes
**Symptôme** : Erreurs "module not found"
**Solution** : `npm run install:full`

### 3. Problèmes de Prisma
**Symptôme** : Erreurs de génération du client
**Solution** : `npx prisma generate`

## 📋 Checklist de Vérification

- [ ] `node_modules` existe
- [ ] TypeScript est installé
- [ ] Prisma client est généré
- [ ] Tous les binaires sont présents
- [ ] Pas d'erreurs de boucle infinie

## 🎯 Résultat Attendu

Après correction, vous devriez voir :
```
🔍 Checking critical dependencies...
✅ All critical dependencies are present
```

L'application devrait démarrer sans erreurs de dépendances manquantes. 