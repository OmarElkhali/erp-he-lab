# 🧪 Guide de Test - Système de Création de Demande

**URL de test**: `http://localhost:8000/demandes/create?matrice_id=1`

---

## ✅ Checklist de Test Rapide

### 🔹 Test 1: Création Simple (5 min)

**Objectif**: Vérifier que la création basique fonctionne

**Étapes**:
1. ✅ Ouvrir `http://localhost:8000/demandes/create?matrice_id=1`
2. ✅ Remplir **Étape 1 - Entreprise**:
   - ICE: `123456789` (ou un ICE existant)
   - Raison sociale: `Test Company`
   - Adresse: `123 Test Street`
   - Nom et prénom: `John Doe`
   - Fonction: `Manager`
   - Téléphone: `0612345678`
   - Email: `john@test.com`
3. ✅ Cliquer "Suivant"
4. ✅ Remplir **Étape 2 - Sites**:
   - Responsable site: `Jane Doe`
   - Ville: Sélectionner une ville
   - Nom de site: `SITE01`
5. ✅ Cliquer "Suivant"
6. ✅ Remplir **Étape 3 - Postes**:
   - Poste de travail: `Opérateur`
   - Zone/atelier: `Atelier A`
   - **Produit 1**:
     - Nom: `Produit Test`
     - Description: `Description du produit`
     - Sélectionner au moins 1 composant par nom ou CAS
7. ✅ Cliquer "Soumettre"

**✅ Résultat attendu**:
- Message de confirmation: "Demande créée avec succès! Code affaire: HT-YYYYMMDD-XXX-XXX"
- Redirection vers `/user/dashboard`
- Notification visible pour les admins

**❌ Si erreur 419**:
- Vérifier le token CSRF dans la console
- Vérifier que la session n'est pas expirée
- Recharger la page et réessayer

---

### 🔹 Test 2: Sauvegarde et Reprise (3 min)

**Objectif**: Vérifier que la sauvegarde locale/serveur fonctionne

**Étapes**:
1. ✅ Ouvrir `http://localhost:8000/demandes/create?matrice_id=1`
2. ✅ Remplir **Étape 1** (entreprise uniquement)
3. ✅ Cliquer "Sauvegarder" (bouton gris)
4. ✅ Attendre le message: "Brouillon sauvegardé!"
5. ✅ Fermer l'onglet
6. ✅ Rouvrir `http://localhost:8000/demandes/create?matrice_id=1`

**✅ Résultat attendu**:
- Message automatique: "Brouillon chargé"
- Données de l'étape 1 pré-remplies
- Retour à l'étape où vous étiez

**🔍 Vérifications**:
- Console navigateur: Pas d'erreurs JavaScript
- DevTools > Application > LocalStorage: Clé `demande_draft_1` présente
- Si sauvegarde serveur OK: `/sauvegardes` doit lister le brouillon

---

### 🔹 Test 3: Multi-Produits (7 min)

**Objectif**: Vérifier la gestion de plusieurs produits par poste

**Étapes**:
1. ✅ Remplir **Étape 1** et **Étape 2**
2. ✅ À l'**Étape 3**, sur le premier poste:
   - Remplir Produit 1
   - Cliquer "Ajouter un produit"
   - Remplir Produit 2 avec d'autres composants
3. ✅ Cliquer "Ajouter un poste"
4. ✅ Remplir Poste 2 avec 1 produit
5. ✅ Soumettre

**✅ Résultat attendu**:
- Confirmation avec résumé: "2 postes, 3 produits"
- Création réussie dans la base de données
- Vérifier dans `Show` de la demande que tous les produits sont présents

**🔍 Vérifications base de données**:
```sql
-- Vérifier la dernière demande
SELECT * FROM demandes ORDER BY id DESC LIMIT 1;

-- Vérifier les produits créés
SELECT p.*, po.nom_poste 
FROM produits p 
JOIN postes po ON p.poste_id = po.id 
ORDER BY p.id DESC LIMIT 10;

-- Vérifier les composants attachés
SELECT pc.*, c.nom as composant_nom 
FROM produit_composant pc 
JOIN composants c ON pc.composant_id = c.id 
ORDER BY pc.produit_id DESC LIMIT 10;
```

---

### 🔹 Test 4: Validation des Erreurs (5 min)

**Objectif**: Vérifier que les validations fonctionnent

**Test 4.1: Champs manquants**
1. ✅ Laisser ICE vide
2. ✅ Cliquer "Suivant"
3. **Résultat attendu**: Message "Veuillez remplir tous les champs obligatoires"

**Test 4.2: Site sans poste**
1. ✅ Remplir Étape 1 et 2
2. ✅ À l'Étape 3, supprimer le seul poste
3. ✅ Essayer de soumettre
4. **Résultat attendu**: Erreur "Veuillez ajouter au moins un poste"

**Test 4.3: Produit sans composant**
1. ✅ Remplir Étape 1, 2, et 3 jusqu'au produit
2. ✅ Laisser les composants vides
3. ✅ Essayer de soumettre
4. **Résultat attendu**: Erreur détaillée avec position (Site X, Poste Y, Produit Z)

---

### 🔹 Test 5: Multi-Sites (10 min)

**Objectif**: Vérifier la gestion complexe

**Étapes**:
1. ✅ Remplir Étape 1
2. ✅ À l'Étape 2:
   - Remplir Site 1 (Casablanca)
   - Cliquer "Ajouter un site"
   - Remplir Site 2 (Rabat)
   - Cliquer "Ajouter un site"
   - Remplir Site 3 (Tanger)
3. ✅ À l'Étape 3:
   - Site 1: 2 postes, chacun avec 1 produit
   - Site 2: 1 poste avec 2 produits
   - Site 3: 3 postes, chacun avec 1 produit
4. ✅ Sauvegarder (tester la persistance)
5. ✅ Recharger la page
6. ✅ Vérifier que tout est restauré
7. ✅ Soumettre

**✅ Résultat attendu**:
- Confirmation: "3 sites, 6 postes, X produits"
- Création réussie
- Chaque site correctement lié à sa ville
- Coûts de déplacement calculés correctement

---

## 🐛 Problèmes Connus et Solutions

### ❌ Erreur 419 PAGE EXPIRED

**Symptômes**:
- Page blanche avec "419 PAGE EXPIRED"
- Ou popup SweetAlert avec "Session expirée"

**Causes**:
1. Session Laravel expirée (> 2 heures d'inactivité)
2. Token CSRF non synchronisé
3. Middleware CSRF bloquant

**Solutions**:
1. **Recharger la page** (F5)
2. **Vérifier dans la console**:
   ```javascript
   // Ouvrir DevTools > Console
   document.querySelector('meta[name="csrf-token"]').content
   // Doit retourner un token de 40 caractères
   ```
3. **Si le problème persiste**:
   ```bash
   # Terminal
   cd /home/kali/zn
   php artisan cache:clear
   php artisan session:clear
   ```

### ❌ Composants non chargés

**Symptômes**:
- Champ "Composants par nom" vide
- Message "Chargement..." qui ne finit pas

**Solutions**:
1. Vérifier l'API:
   ```bash
   curl http://localhost:8000/api/composants
   ```
2. Vérifier la console navigateur pour erreurs CORS
3. Vérifier que le serveur Laravel tourne:
   ```bash
   ps aux | grep "php artisan serve"
   ```

### ❌ Brouillon non chargé

**Symptômes**:
- Pas de message "Brouillon chargé"
- Données non restaurées

**Solutions**:
1. **Vérifier localStorage**:
   ```javascript
   // Console DevTools
   localStorage.getItem('demande_draft_1')
   ```
2. **Vérifier API sauvegarde**:
   ```bash
   curl http://localhost:8000/api/sauvegardes/matrice/1 \
     -H "Cookie: laravel_session=YOUR_SESSION"
   ```
3. **Forcer le chargement**:
   - Supprimer tous les localStorage
   - Recharger la page
   - Créer un nouveau brouillon

---

## 📊 Métriques de Performance

### ⚡ Temps de chargement acceptables:
- **Chargement initial**: < 2 secondes
- **Chargement composants (API)**: < 1 seconde
- **Sauvegarde brouillon**: < 500ms
- **Soumission finale**: < 3 secondes

### 🔍 Outils de monitoring:
```javascript
// Console DevTools
// Mesurer le temps de soumission
console.time('submit');
// ... cliquer soumettre ...
console.timeEnd('submit'); // Doit afficher < 3000ms
```

---

## ✅ Checklist Finale

Avant de considérer le système comme validé:

- [ ] Test 1 réussi (création simple)
- [ ] Test 2 réussi (sauvegarde/reprise)
- [ ] Test 3 réussi (multi-produits)
- [ ] Test 4 réussi (validations)
- [ ] Test 5 réussi (multi-sites)
- [ ] Pas d'erreurs 419 pendant les tests
- [ ] Pas d'erreurs JavaScript dans la console
- [ ] Base de données cohérente (vérifications SQL)
- [ ] Notifications admins créées
- [ ] Code affaire unique généré
- [ ] Performances acceptables (< 3s)

---

## 🚨 Alerte Problème Critique

Si vous rencontrez un de ces symptômes, **STOP** et contactez l'équipe:

1. **Perte de données**: Soumission réussie mais données manquantes en BD
2. **Doublons**: Même demande créée plusieurs fois
3. **Corruption**: Données incohérentes (composants attachés au mauvais produit)
4. **Crash serveur**: Erreur 500 récurrente
5. **Timeouts**: Chargement > 10 secondes

**Rollback immédiat**:
```bash
cd /home/kali/zn
git log --oneline -5  # Trouver le commit avant corrections
git revert HEAD  # Annuler le dernier commit
php artisan route:cache
npm run build
```

---

**Dernière mise à jour**: 14 Novembre 2025  
**Testé par**: À compléter  
**Status**: ✅ Prêt pour tests
