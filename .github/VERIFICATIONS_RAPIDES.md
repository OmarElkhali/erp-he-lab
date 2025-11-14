# ⚡ Vérifications Rapides - Système de Demandes

**Utilisation**: Commandes à exécuter pour vérifier que tout fonctionne

---

## 🔍 Vérifications Backend

### 1. Routes actives
```bash
cd /home/kali/zn
php artisan route:list | grep -E "(demandes|sauvegardes)"
```

**Résultat attendu**:
```
POST    demandes ...................... demandes.store
GET     demandes/create ............... demandes.create
POST    sauvegardes ................... sauvegardes.store
GET     api/sauvegardes/matrice/{matrice_id}
```

---

### 2. Vérifier les migrations
```bash
php artisan migrate:status
```

**Résultat attendu**: Toutes les migrations `Ran`

---

### 3. Tester l'API composants
```bash
curl -s http://localhost:8000/api/composants | jq '. | length'
```

**Résultat attendu**: Nombre > 0 (ex: `150`)

---

### 4. Tester l'API villes
```bash
curl -s http://localhost:8000/api/villes | jq '.[0] | {id, nom}'
```

**Résultat attendu**:
```json
{
  "id": 1,
  "nom": "Casablanca"
}
```

---

### 5. Vérifier les logs (erreurs récentes)
```bash
tail -20 storage/logs/laravel.log
```

**Résultat attendu**: Pas de `ERROR` récent (< 5 min)

---

## 🌐 Vérifications Frontend

### 1. Vérifier les assets compilés
```bash
ls -lh public/build/assets/*.js | head -3
```

**Résultat attendu**: Fichiers `.js` datant d'aujourd'hui

---

### 2. Vérifier Nouveau.jsx compilé
```bash
ls -lh public/build/assets/ | grep -i nouveau
```

**Résultat attendu**: Fichier présent (si Vite compilé)

---

### 3. Tester l'accès à la page
```bash
curl -I http://localhost:8000/demandes/create?matrice_id=1 2>&1 | grep "HTTP"
```

**Résultat attendu**: `HTTP/1.1 200 OK` (ou 302 si redirection auth)

---

## 🗄️ Vérifications Base de Données

### 1. Vérifier les tables clés
```bash
cd /home/kali/zn
php artisan tinker --execute="echo 'Tables: ' . implode(', ', array_keys(DB::connection()->getDoctrineSchemaManager()->listTableNames()));"
```

**Tables attendues**: `demandes`, `sites`, `postes`, `produits`, `composants`, `produit_composant`, `sauvegardes`

---

### 2. Compter les composants
```bash
php artisan tinker --execute="echo 'Composants: ' . App\Models\Composant::count();"
```

**Résultat attendu**: Nombre > 0

---

### 3. Compter les matrices
```bash
php artisan tinker --execute="echo 'Matrices: ' . App\Models\Matrice::count();"
```

**Résultat attendu**: Nombre > 0

---

### 4. Vérifier la dernière demande créée
```bash
php artisan tinker --execute="
\$demande = App\Models\Demande::with('sites.postes.produits')->latest()->first();
if (\$demande) {
    echo 'Dernière demande: ' . \$demande->code_affaire . PHP_EOL;
    echo 'Sites: ' . \$demande->sites->count() . PHP_EOL;
    echo 'Postes: ' . \$demande->sites->sum(fn(\$s) => \$s->postes->count()) . PHP_EOL;
    echo 'Produits: ' . \$demande->sites->sum(fn(\$s) => \$s->postes->sum(fn(\$p) => \$p->produits->count())) . PHP_EOL;
} else {
    echo 'Aucune demande trouvée';
}
"
```

**Résultat attendu**:
```
Dernière demande: HT-20251114-001-XXX
Sites: 1
Postes: 1
Produits: 1
```

---

### 5. Vérifier les composants attachés aux produits
```bash
php artisan tinker --execute="
\$produit = App\Models\Produit::with('composants')->latest()->first();
if (\$produit) {
    echo 'Dernier produit: ' . \$produit->nom . PHP_EOL;
    echo 'Composants: ' . \$produit->composants->count() . PHP_EOL;
} else {
    echo 'Aucun produit trouvé';
}
"
```

**Résultat attendu**:
```
Dernier produit: Produit Test
Composants: 3
```

---

## 🔐 Vérifications Sécurité

### 1. Vérifier le token CSRF
```bash
curl -s http://localhost:8000/demandes/create?matrice_id=1 | grep -o 'csrf-token" content="[^"]*"' | head -1
```

**Résultat attendu**: `csrf-token" content="xxxxxxxxxx"`

---

### 2. Vérifier le middleware CSRF
```bash
grep -r "VerifyCsrfToken" app/Http/Middleware/
```

**Résultat attendu**: Fichier `VerifyCsrfToken.php` présent

---

### 3. Tester POST sans CSRF (doit échouer)
```bash
curl -X POST http://localhost:8000/sauvegardes \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Résultat attendu**: `HTTP Status: 419` (CSRF protection active)

---

## 📊 Vérifications Performance

### 1. Temps de réponse page
```bash
time curl -s http://localhost:8000/demandes/create?matrice_id=1 > /dev/null
```

**Résultat attendu**: < 2 secondes (real time)

---

### 2. Temps de réponse API composants
```bash
time curl -s http://localhost:8000/api/composants > /dev/null
```

**Résultat attendu**: < 1 seconde

---

### 3. Taille réponse API composants
```bash
curl -s http://localhost:8000/api/composants | wc -c
```

**Résultat attendu**: < 500KB (500000 bytes)

---

## 🧹 Commandes de Nettoyage

### En cas de problème, exécuter:

```bash
cd /home/kali/zn

# 1. Nettoyer tous les caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 2. Reconstruire les caches
php artisan config:cache
php artisan route:cache

# 3. Vider les sessions (attention: déconnecte tous les utilisateurs)
# php artisan session:clear

# 4. Recompiler les assets frontend
npm run build

# 5. Recharger l'autoloader
composer dump-autoload

echo "✅ Nettoyage complet effectué"
```

---

## 🚨 Diagnostic d'Urgence

### Si rien ne fonctionne:

```bash
#!/bin/bash
cd /home/kali/zn

echo "=== DIAGNOSTIC SYSTÈME ==="

echo -e "\n1. Serveurs actifs:"
ps aux | grep -E "(php artisan serve|npm run dev)" | grep -v grep

echo -e "\n2. Port 8000 disponible:"
lsof -i :8000 || echo "Port 8000 libre"

echo -e "\n3. Permissions storage:"
ls -ld storage/logs

echo -e "\n4. Dernière erreur Laravel:"
tail -3 storage/logs/laravel.log

echo -e "\n5. Fichier .env présent:"
ls -l .env

echo -e "\n6. Connexion base de données:"
php artisan tinker --execute="try { DB::connection()->getPdo(); echo 'DB OK'; } catch(Exception \$e) { echo 'DB ERREUR: ' . \$e->getMessage(); }"

echo -e "\n7. Espace disque:"
df -h . | tail -1

echo -e "\n=== FIN DIAGNOSTIC ==="
```

**Sauvegarder dans**: `diagnostic.sh`

**Exécuter**: `bash diagnostic.sh`

---

## ✅ Checklist Rapide de Démarrage

Avant de commencer les tests, vérifier:

```bash
cd /home/kali/zn

# 1. Serveur Laravel actif
curl -s http://localhost:8000 > /dev/null && echo "✅ Laravel OK" || echo "❌ Laravel DOWN"

# 2. Base de données connectée
php artisan tinker --execute="DB::connection()->getPdo(); echo '✅ DB OK';" || echo "❌ DB ERREUR"

# 3. Routes compilées
php artisan route:list | wc -l | xargs -I {} echo "✅ {} routes chargées"

# 4. Composants disponibles
curl -s http://localhost:8000/api/composants | jq '. | length' | xargs -I {} echo "✅ {} composants disponibles"

# 5. Villes disponibles
curl -s http://localhost:8000/api/villes | jq '. | length' | xargs -I {} echo "✅ {} villes disponibles"

echo -e "\n🎯 Système prêt pour les tests!"
```

---

**Dernière mise à jour**: 14 Novembre 2025  
**Utilisation**: Copier-coller les commandes dans le terminal
