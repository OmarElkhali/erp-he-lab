# 🛣️ Routes Documentation - ERP HE Lab

## ✅ Routes Corrigées

### 🔐 Authentication Routes

#### Public Routes (Guest)
| Method | URI | Name | Controller |
|--------|-----|------|------------|
| GET | `/register` | `register` | `RegisterController@create` |
| POST | `/register` | - | `RegisterController@store` |
| GET | `/login` | `login` | `AuthenticatedSessionController@create` |
| POST | `/login` | - | `AuthenticatedSessionController@store` |
| GET | `/forgot-password` | `password.request` | `PasswordResetLinkController@create` |
| POST | `/forgot-password` | `password.email` | `PasswordResetLinkController@store` |
| GET | `/reset-password/{token}` | `password.reset` | `NewPasswordController@create` |
| POST | `/reset-password` | `password.store` | `NewPasswordController@store` |

#### Email Verification Routes (Public - No Auth Required)
| Method | URI | Name | Controller | Description |
|--------|-----|------|------------|-------------|
| GET | `/verification/notice` | `verification.notice` | `RegisterController@showVerificationForm` | Display code entry page |
| POST | `/verification/verify` | `verification.verify` | `RegisterController@verify` | Verify 6-digit code |
| POST | `/verification/resend` | `verification.resend` | `RegisterController@resendCode` | Resend verification code |

#### Email Verification Routes (Auth Required - Old System)
| Method | URI | Name | Controller | Description |
|--------|-----|------|------------|-------------|
| GET | `/verify-email` | `verification.prompt` | `EmailVerificationPromptController` | Prompt for email verification |
| GET | `/verify-email/{id}/{hash}` | `verification.verify.link` | `VerifyEmailController` | Verify email via signed link |
| POST | `/email/verification-notification` | `verification.send` | `EmailVerificationNotificationController@store` | Send verification notification |

#### Protected Auth Routes
| Method | URI | Name | Controller |
|--------|-----|------|------------|
| GET | `/confirm-password` | `password.confirm` | `ConfirmablePasswordController@show` |
| POST | `/confirm-password` | - | `ConfirmablePasswordController@store` |
| PUT | `/password` | `password.update` | `PasswordController@update` |
| POST | `/logout` | `logout` | `AuthenticatedSessionController@destroy` |

---

### 🏠 Dashboard Routes (Auth + Verified)

| Method | URI | Name | Middleware | Description |
|--------|-----|------|------------|-------------|
| GET | `/dashboard` | `dashboard` | `auth, verified` | Redirects to role-based dashboard |
| GET | `/admin/dashboard` | `admin.dashboard` | `auth, verified, can:isAdmin` | Admin dashboard |
| GET | `/user/dashboard` | `user.dashboard` | `auth, verified, can:isUser` | User dashboard |

---

### 📋 Demandes Routes (User Only)

| Method | URI | Name | Middleware | Description |
|--------|-----|------|------------|-------------|
| GET | `/demandes/create` | `demandes.create` | `auth, verified, can:isUser` | Create new demande form |
| POST | `/demandes` | `demandes.store` | `auth, verified, can:isUser` | Store new demande |
| GET | `/demandes/{demande}` | `demandes.show` | `auth, verified, can:isUser` | Show demande details |
| GET | `/demandes/{demande}/edit` | `demandes.edit` | `auth, verified, can:isUser` | Edit demande form |
| PUT | `/demandes/{demande}` | `demandes.update` | `auth, verified, can:isUser` | Update demande |
| DELETE | `/demandes/{demande}` | `demandes.destroy` | `auth, verified, can:isUser` | Delete demande |
| GET | `/historique/matrice/{matrice_id}` | `historique.matrice` | `auth, verified, can:isUser` | History by matrix |

---

### 👨‍💼 Admin Demandes Routes

| Method | URI | Name | Middleware | Description |
|--------|-----|------|------------|-------------|
| POST | `/admin/demandes/{demande}/accepter` | `admin.demandes.accepter` | `auth, verified, can:isAdmin` | Accept demande |
| POST | `/admin/demandes/{demande}/refuser` | `admin.demandes.refuser` | `auth, verified, can:isAdmin` | Reject demande |
| POST | `/admin/demandes/{demande}/telecharger` | `admin.demandes.telecharger` | `auth, verified, can:isAdmin` | Download demande PDF |

---

### 💾 Sauvegardes Routes (User Only)

| Method | URI | Name | Middleware | Description |
|--------|-----|------|------------|-------------|
| GET | `/sauvegardes` | `sauvegardes.index` | `auth, verified, can:isUser` | List all saved drafts |
| POST | `/sauvegardes` | `sauvegardes.store` | `auth, verified, can:isUser` | Save draft |
| GET | `/sauvegardes/{sauvegarde}` | `sauvegardes.show` | `auth, verified, can:isUser` | Show draft |
| PUT | `/sauvegardes/{sauvegarde}` | `sauvegardes.update` | `auth, verified, can:isUser` | Update draft |
| DELETE | `/sauvegardes/{sauvegarde}` | `sauvegardes.destroy` | `auth, verified, can:isUser` | Delete draft |

---

### 🔔 Notifications Routes (Auth)

| Method | URI | Name | Middleware | Description |
|--------|-----|------|------------|-------------|
| GET | `/notifications` | `notifications` | `auth, verified` | List notifications |
| GET | `/admin/notifications` | `admin.notifications` | `auth, verified` | Admin notifications |
| GET | `/user/notifications` | `user.notifications` | `auth, verified` | User notifications |
| POST | `/notifications` | - | `auth, verified` | Create notification |
| PUT | `/notifications/{notification}` | - | `auth, verified` | Update notification |
| PUT | `/notifications/mark-all-read` | - | `auth, verified` | Mark all as read |
| GET | `/notifications/unread-count` | - | `auth, verified` | Get unread count |

---

### 🌐 API Routes (Public)

| Method | URI | Description |
|--------|-----|-------------|
| GET | `/api/villes` | Get all cities with travel costs |
| GET | `/api/composants` | Get all components |
| GET | `/api/matrices` | Get all matrices/types |
| GET | `/entreprises/find/{ice}` | Find company by ICE number |

---

### 📊 API Routes (Protected)

| Method | URI | Middleware | Description |
|--------|-----|------------|-------------|
| GET | `/api/demandes/{demande}/cout` | `auth, verified, can:isUser` | Get demande cost |
| GET | `/api/demandes/{demande}/cout-sans-deplacement` | `auth, verified, can:isUser` | Get cost without travel |
| GET | `/api/sauvegardes/count` | `auth, verified, can:isUser` | Get saved drafts count |
| GET | `/api/sauvegardes/matrice/{matrice_id}` | `auth, verified, can:isUser` | Get drafts by matrix |
| GET | `/api/user-notifications` | `auth, verified` | Get user notifications |
| GET | `/api/admin-notifications` | `auth, verified` | Get admin notifications |

---

### 👤 Profile Routes (Auth)

| Method | URI | Name | Description |
|--------|-----|------|-------------|
| GET | `/profile` | `profile.edit` | Edit profile form |
| PATCH | `/profile` | `profile.update` | Update profile |
| DELETE | `/profile` | `profile.destroy` | Delete account |

---

## ⚠️ Important Notes

### Fixed Issues:
1. ✅ **Route Conflict Resolved**: Changed `verify-email/{id}/{hash}` route name from `verification.verify` to `verification.verify.link` to avoid conflict with code-based verification
2. ✅ **Email Verification**: Now uses 6-digit code system instead of signed URL
3. ✅ **CSRF Protection**: All POST/PUT/DELETE routes require CSRF token (automatically handled by Axios/Inertia)

### Security:
- All routes except public API and auth routes require `auth` middleware
- Dashboard and feature routes require `verified` middleware (email must be verified)
- Role-based access control via `can:isAdmin` and `can:isUser` gates

### Email Verification Flow:
1. User registers → `POST /register`
2. System creates user and sends 6-digit code
3. User redirected to → `GET /verification/notice`
4. User enters code → `POST /verification/verify`
5. On success → Redirect to `/login`
6. User logs in → Blocked if not verified (checked in `LoginRequest`)
7. After verification → Full access to dashboard

---

## 🧪 Testing Routes

```bash
# List all routes
php artisan route:list

# Clear route cache
php artisan route:clear

# Cache routes for production
php artisan route:cache

# Test a specific route
php artisan route:list | grep verification
```

---

**Last Updated**: November 14, 2025  
**Laravel Version**: 10.49.1  
**PHP Version**: 8.4.11
