#!/bin/bash
# Railway.app deployment script

echo "🚀 Starting deployment..."

# Install PHP dependencies
echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

# Install Node dependencies and build frontend
echo "📦 Installing NPM dependencies..."
npm ci

echo "🏗️ Building frontend assets..."
npm run build

# Clear and cache config
echo "⚙️ Optimizing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force

# Set permissions
echo "🔐 Setting permissions..."
chmod -R 775 storage bootstrap/cache

echo "✅ Deployment completed successfully!"
