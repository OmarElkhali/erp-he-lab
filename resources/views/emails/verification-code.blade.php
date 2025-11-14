<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de vérification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .email-header {
            background-color: #4F46E5;
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .email-body {
            padding: 40px 30px;
        }
        .code-box {
            background-color: #f8f9fa;
            border: 2px dashed #4F46E5;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #4F46E5;
            letter-spacing: 8px;
        }
        .email-footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>ERP HE Lab</h1>
            <p>Vérification de votre adresse e-mail</p>
        </div>

        <div class="email-body">
            <p>Bonjour <strong>{{ $user->nom_complet }}</strong>,</p>

            <p>Merci de vous être inscrit sur <strong>ERP HE Lab</strong>!</p>

            <p>Pour activer votre compte, veuillez entrer le code de vérification ci-dessous :</p>

            <div class="code-box">
                <div class="code">{{ $code }}</div>
                <p style="margin-top: 10px; color: #6c757d; font-size: 14px;">
                    Ce code expire dans 30 minutes
                </p>
            </div>

            <div class="warning">
                <strong>⚠️ Important :</strong><br>
                Si vous n'avez pas créé de compte sur ERP HE Lab, veuillez ignorer cet e-mail.
            </div>

            <p style="margin-top: 30px;">
                Cordialement,<br>
                <strong>L'équipe ERP HE Lab</strong>
            </p>
        </div>

        <div class="email-footer">
            <p>© {{ date('Y') }} ERP HE Lab. Tous droits réservés.</p>
            <p>Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
    </div>
</body>
</html>
