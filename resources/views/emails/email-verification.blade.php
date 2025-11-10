{{-- resources/views/emails/email-verification.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Vérification d'email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #26658C; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .code { font-size: 24px; font-weight: bold; text-align: center; color: #26658C; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Hse-Lab Online</h1>
            <p>Vérification de votre adresse email</p>
        </div>
        
        <div class="content">
            <p>Bonjour,</p>
            
            <p>Merci de vous être inscrit sur Hse-Lab Online. Pour activer votre compte, veuillez utiliser le code de vérification suivant :</p>
            
            <div class="code">
                {{ $verificationCode }}
            </div>
            
            <p>Ce code est valable pendant 24 heures.</p>
            
            <p>Si vous n'avez pas créé de compte, veuillez ignorer cet email.</p>
            
            <p>Cordialement,<br>L'équipe Hse-Lab Online</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Hse-Lab Online. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>