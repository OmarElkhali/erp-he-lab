# ERP HE Lab - Project Setup Instructions

## ✅ Project Analysis Completed

This is a **Laravel 10 + Inertia.js + React** full-stack ERP application for laboratory management.

### 🏗️ Tech Stack
- **Backend**: Laravel 10.10 (PHP 8.1+)
- **Frontend**: React 18.3.1 + Inertia.js 2.x
- **Styling**: Tailwind CSS 3.2 + Bootstrap 5.3
- **Build Tool**: Vite 5.4
- **Database**: MySQL (erp_hse_lab)
- **Authentication**: Laravel Breeze + Sanctum

### 📦 Key Dependencies

**Backend (Composer)**:
- `laravel/framework`: ^10.10
- `inertiajs/inertia-laravel`: ^0.6.3
- `laravel/sanctum`: ^3.2
- `laravel/breeze`: ^1.29
- `tightenco/ziggy`: ^2.0 (route helpers for JS)
- `guzzlehttp/guzzle`: ^7.2

**Frontend (NPM)**:
- React 18.3.1 + React DOM
- Inertia.js (React adapter)
- Tailwind CSS + Bootstrap 5
- React Icons, React Select
- SweetAlert2, Framer Motion
- Headless UI, Popper.js

### 🗂️ Project Structure

```
erp-he-lab/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/           # Authentication controllers
│   │   │   ├── ChiffrageController.php
│   │   │   ├── ComposantController.php
│   │   │   ├── DemandeController.php
│   │   │   ├── EntrepriseController.php
│   │   │   ├── NotificationController.php
│   │   │   ├── ProfileController.php
│   │   │   ├── SauvegardeController.php
│   │   │   └── VilleController.php
│   │   ├── Middleware/
│   │   └── Requests/
│   └── Models/
│       ├── Composant.php       # Laboratory components
│       ├── Cout.php            # Cost model
│       ├── Demande.php         # Request/Order model
│       ├── Entreprise.php      # Company model
│       ├── Famille.php         # Component family
│       ├── Matrice.php         # Matrix/Type model
│       ├── Notification.php
│       ├── Poste.php           # Job position/Task
│       ├── Produit.php         # Product model
│       ├── Sauvegarde.php      # Backup/Save model
│       ├── Site.php            # Site/Location
│       ├── User.php
│       └── Ville.php           # City with travel costs
├── database/
│   ├── migrations/             # 58+ migration files
│   └── seeders/
│       ├── ComposantSeeder.php
│       ├── CoutSeeder.php
│       ├── DatabaseSeeder.php
│       ├── EntrepriseSeeder.php
│       ├── FamilleSeeder.php
│       ├── MatriceSeeder.php
│       ├── UserSeeder.php
│       └── VilleSeeder.php
├── resources/
│   ├── js/
│   │   ├── Components/         # Reusable React components
│   │   ├── Layouts/            # Layout components
│   │   ├── Pages/
│   │   │   ├── Admin/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── Auth/           # Login/Register pages
│   │   │   ├── User/
│   │   │   │   ├── Chiffrage/  # Quotation/Costing
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Notifications/
│   │   │   │   └── Sauvegardes/ # Saved drafts
│   │   │   ├── Profile/
│   │   │   └── Welcome.jsx
│   │   ├── app.jsx
│   │   └── bootstrap.js
│   ├── css/
│   └── views/                  # Blade templates
├── routes/
│   ├── web.php                 # Main routes
│   ├── api.php
│   ├── auth.php
│   └── console.php
├── public/                     # Public assets
├── storage/                    # File storage
├── tests/                      # PHPUnit tests
├── .env.example
├── composer.json
├── package.json
├── vite.config.js
├── tailwind.config.js
└── phpunit.xml
```

### 🎯 Application Features

**Core Functionality**:
1. **User Management**: Admin/User roles with authentication
2. **Company Management** (Entreprise): ICE number, contact info, sites
3. **Request/Order System** (Demande):
   - Auto-generated unique codes (HT-YYYYMMDD-XXX-ABREV)
   - Multi-site support per request
   - Status workflow: en_attente → acceptee/refusee → en_cours → terminee
4. **Costing System** (Chiffrage):
   - Component-based pricing
   - Travel cost calculation (per city)
   - Matrix/Type selection
5. **Component Library** (Composants):
   - Organized by families (Familles)
   - Product associations
6. **Saved Drafts** (Sauvegardes): Save incomplete requests
7. **Notifications**: Real-time admin/user notifications
8. **Multi-site Management**: Cities with travel costs

### 🗄️ Database Schema

**Main Tables**:
- `users` (role: admin/user)
- `entreprises` (companies with ICE)
- `demandes` (requests/orders)
- `sites` (locations per request)
- `postes` (tasks/jobs per site)
- `composants` (lab components)
- `familles` (component families)
- `produits` (products)
- `matrices` (request types)
- `villes` (cities with travel costs)
- `couts` (cost data)
- `sauvegardes` (saved drafts)
- `notifications`

### 🚀 Setup Instructions

#### 1. ✅ Prerequisites Installed
- PHP 8.1+
- Composer
- Node.js 18+ & NPM
- MySQL 8.0+

#### 2. ✅ Repository Cloned
Already completed at `/home/kali/zn`

#### 3. 📋 Environment Setup (Next Step)
```bash
cp .env.example .env
```
Edit `.env` and configure:
- `DB_DATABASE=erp_hse_lab`
- `DB_USERNAME=root`
- `DB_PASSWORD=` (your MySQL password)

#### 4. 🔧 Backend Setup
```bash
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
```

#### 5. 🎨 Frontend Setup
```bash
npm install
npm run build
```

#### 6. 🏃 Run Development Servers
```bash
# Terminal 1: Laravel backend
php artisan serve

# Terminal 2: Vite dev server (hot reload)
npm run dev
```

Access: `http://localhost:8000`

### 🔐 Default Users (After Seeding)
Check `database/seeders/UserSeeder.php` for credentials

### 🧪 Testing
```bash
php artisan test
```

### 📝 Key Routes

**Public**:
- `/` → redirects to login
- `/login`, `/register`

**User Routes** (auth required):
- `/user/dashboard`
- `/demandes/create` - New request
- `/sauvegardes` - Saved drafts
- `/user/notifications`

**Admin Routes** (admin role):
- `/admin/dashboard`
- `/admin/demandes/{id}/accepter` - Approve request
- `/admin/demandes/{id}/refuser` - Reject request

**API Routes** (some public for autocomplete):
- `/api/villes` - Cities list
- `/api/composants` - Components
- `/api/matrices` - Request types
- `/entreprises/find/{ice}` - Find company by ICE

### 🔌 VS Code Extensions Recommended
- PHP Intelephense
- Laravel Extension Pack
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier

---

## Execution Notes

- [x] Clone repo into workspace
- [x] Inspect project files
- [ ] Install recommended extensions
- [ ] Configure environment (.env)
- [ ] Install dependencies (composer + npm)
- [ ] Run migrations and seeders
- [ ] Test build and run

---

**Project Type**: Full-stack web application (ERP system)  
**Primary Language**: PHP (Laravel backend) + JavaScript (React frontend)  
**Database**: MySQL  
**Last Updated**: November 11, 2025
