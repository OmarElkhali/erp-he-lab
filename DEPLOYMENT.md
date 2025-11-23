# 🚀 Guide de Déploiement - ERP HE Lab

## 📋 Prérequis
- Compte GitHub (déjà fait ✅)
- Compte sur plateforme de déploiement (Railway/Render)

---

## 🎯 Option 1 : Railway.app (RECOMMANDÉ)

### Pourquoi Railway ?
- ✅ **Gratuit** : $5 de crédit/mois (suffisant pour petit projet)
- ✅ **Simple** : Déploiement en 1 clic depuis GitHub
- ✅ **Complet** : MySQL inclus gratuitement
- ✅ **Rapide** : Pas de mise en veille
- ✅ **SSL** : HTTPS automatique

### 🔧 Étapes de déploiement :

#### 1. Créer un compte Railway
1. Allez sur https://railway.app
2. Cliquez "Start a New Project"
3. Connectez-vous avec GitHub

#### 2. Déployer depuis GitHub
1. Cliquez "Deploy from GitHub repo"
2. Sélectionnez `OmarElkhali/erp-he-lab`
3. Railway détectera automatiquement Laravel

#### 3. Ajouter une base de données MySQL
1. Dans votre projet, cliquez "+ New"
2. Sélectionnez "Database" → "MySQL"
3. Railway créera automatiquement la base de données

#### 4. Configurer les variables d'environnement
Allez dans Settings → Variables et ajoutez :

```env
APP_NAME="ERP HE Lab"
APP_ENV=production
APP_KEY=base64:e0kRve43YTcmo1oHdIKhA8Co7l8Z9cOv0I7oQPbt1UI=
APP_DEBUG=false
APP_URL=https://votre-app.railway.app

DB_CONNECTION=mysql
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_DATABASE=${{MySQL.MYSQL_DATABASE}}
DB_USERNAME=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=omarelkhali@gmail.com
MAIL_PASSWORD=gbecadhohttbyste
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=omarelkhali@gmail.com
MAIL_FROM_NAME="ERP HE Lab"

SESSION_DRIVER=database
QUEUE_CONNECTION=database
```

#### 5. Déployer !
1. Railway déploiera automatiquement
2. Attendez 3-5 minutes
3. Votre app sera disponible sur : `https://votre-app.railway.app`

---

## 🎯 Option 2 : Render.com

### Pourquoi Render ?
- ✅ **100% Gratuit**
- ✅ **SSL automatique**
- ⚠️ Se met en veille après 15min d'inactivité
- ⚠️ Redémarre lentement (50 secondes)

### 🔧 Étapes de déploiement :

#### 1. Créer un compte Render
1. Allez sur https://render.com
2. Connectez-vous avec GitHub

#### 2. Créer un Web Service
1. Cliquez "New +"
2. Sélectionnez "Web Service"
3. Connectez le repo `OmarElkhali/erp-he-lab`

#### 3. Configuration du service
```
Name: erp-he-lab
Region: Oregon (US West)
Branch: main
Runtime: PHP
Build Command: bash render-build.sh
Start Command: php artisan serve --host=0.0.0.0 --port=$PORT
Plan: Free
```

#### 4. Créer une base de données PostgreSQL
1. Cliquez "New +"
2. Sélectionnez "PostgreSQL"
3. Name: erp-db
4. Plan: Free

#### 5. Variables d'environnement
Ajoutez dans le Web Service :
```env
APP_NAME="ERP HE Lab"
APP_ENV=production
APP_KEY=base64:e0kRve43YTcmo1oHdIKhA8Co7l8Z9cOv0I7oQPbt1UI=
APP_DEBUG=false
APP_URL=https://votre-app.onrender.com

DB_CONNECTION=pgsql
DB_HOST=[host depuis la base de données]
DB_PORT=5432
DB_DATABASE=[database depuis la base de données]
DB_USERNAME=[user depuis la base de données]
DB_PASSWORD=[password depuis la base de données]

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=omarelkhali@gmail.com
MAIL_PASSWORD=gbecadhohttbyste
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=omarelkhali@gmail.com
```

#### 6. Déployer !
Cliquez "Create Web Service"

---

## 🎯 Option 3 : Vercel (Frontend) + Railway (Backend)

### Pour séparer frontend et backend :

#### Backend sur Railway
Suivez les étapes de l'Option 1

#### Frontend sur Vercel
1. Allez sur https://vercel.com
2. Importez le repo GitHub
3. Framework Preset: Vite
4. Build Command: `npm run build`
5. Output Directory: `public/build`

---

## ✅ Vérifications après déploiement

### 1. Tester l'application
- Ouvrez l'URL fournie
- Créez un compte
- Vérifiez l'email de code
- Testez la création de demande

### 2. Vérifier les logs
- Railway : Onglet "Deployments" → Logs
- Render : Onglet "Logs"

### 3. Configurer le domaine personnalisé (optionnel)
- Railway : Settings → Domains
- Render : Settings → Custom Domain

---

## 🔧 Commandes utiles

### Redéployer
```bash
git add .
git commit -m "Update"
git push omar main
```

### Voir les logs en temps réel
```bash
# Railway CLI
railway logs

# Render
# Depuis le dashboard web
```

### Exécuter des migrations manuellement
```bash
# Railway CLI
railway run php artisan migrate

# Render
# Depuis le Shell dans le dashboard
```

---

## 📊 Comparaison des plateformes

| Critère | Railway | Render | Vercel+Railway |
|---------|---------|--------|----------------|
| **Prix** | $5/mois crédit | Gratuit | Gratuit |
| **Base de données** | MySQL inclus | PostgreSQL inclus | MySQL séparé |
| **Performances** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mise en veille** | Non | Oui (15min) | Non |
| **Facilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **SSL** | Oui | Oui | Oui |

---

## 🎉 Recommandation finale

**Utilisez Railway.app** pour la meilleure expérience :
1. Simple et rapide
2. MySQL inclus
3. Pas de mise en veille
4. SSL automatique
5. Monitoring inclus

---

## 🆘 Problèmes courants

### Erreur 500
```bash
# Vérifier les logs
# Souvent dû à APP_KEY manquante
```

### Erreur de base de données
```bash
# Vérifier les variables DB_*
# S'assurer que MySQL est bien connecté
```

### Assets non chargés
```bash
# Vérifier que npm run build a été exécuté
# Vérifier APP_URL dans .env
```

---

## 📧 Support

En cas de problème :
1. Vérifiez les logs de déploiement
2. Consultez la documentation de Railway/Render
3. Vérifiez que toutes les variables d'environnement sont définies

---

**Bon déploiement ! 🚀**
