<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle inscription</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .email-header {
            background: linear-gradient(135deg, #26658C 0%, #1a4d6d 100%);
            padding: 30px;
            text-align: center;
        }
        .email-header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
        }
        .email-body {
            padding: 40px 30px;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #26658C;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-row {
            margin: 10px 0;
            line-height: 1.6;
        }
        .info-label {
            font-weight: bold;
            color: #26658C;
            display: inline-block;
            min-width: 120px;
        }
        .info-value {
            color: #333;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-success {
            background-color: #d4edda;
            color: #155724;
        }
        .email-footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #dee2e6;
        }
        .icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <div class="icon">🎉</div>
            <h1>Nouvelle inscription</h1>
        </div>

        <div class="email-body">
            <h2 style="color: #26658C; margin-top: 0;">Un nouvel utilisateur vient de s'inscrire</h2>

            <p style="color: #555; line-height: 1.6;">
                Un nouvel utilisateur a complété son inscription sur la plateforme <strong>ERP HE Lab</strong>
                et a vérifié son adresse email avec succès.
            </p>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">👤 Nom complet :</span>
                    <span class="info-value">{{ $user->nom_complet }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">📧 Email :</span>
                    <span class="info-value">{{ $user->email }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">📱 Téléphone :</span>
                    <span class="info-value">{{ $user->telephone ?? 'Non fourni' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">🏢 Société :</span>
                    <span class="info-value">{{ $user->societe ?? 'Non fournie' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">🔑 Rôle :</span>
                    <span class="badge badge-success">{{ ucfirst($user->role) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">📅 Date d'inscription :</span>
                    <span class="info-value">{{ $user->created_at->format('d/m/Y à H:i') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">✅ Email vérifié :</span>
                    <span class="info-value">{{ $user->email_verified_at->format('d/m/Y à H:i') }}</span>
                </div>
            </div>

            <p style="color: #555; line-height: 1.6; margin-top: 30px;">
                <strong>Action requise :</strong> Vous pouvez maintenant consulter le profil de cet utilisateur
                et gérer ses permissions depuis le panneau d'administration.
            </p>

            <div style="text-align: center; margin-top: 30px;">
                <a href="{{ config('app.url') }}/admin/dashboard"
                   style="display: inline-block; padding: 12px 30px; background-color: #26658C; color: #ffffff;
                          text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Accéder au Dashboard Admin
                </a>
            </div>
        </div>

        <div class="email-footer">
            <p style="margin: 5px 0;">
                <strong>ERP HE Lab</strong> - Système de gestion de laboratoire
            </p>
            <p style="margin: 5px 0; color: #999;">
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
            <p style="margin: 5px 0; color: #999;">
                © {{ date('Y') }} ERP HE Lab. Tous droits réservés.
            </p>
        </div>
    </div>
</body>
</html>
