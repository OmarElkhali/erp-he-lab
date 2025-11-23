#!/bin/bash
# Render.com build script

echo "🚀 Starting build..."

# Install dependencies
composer install --no-dev --optimize-autoloader
npm ci
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Build completed!"
