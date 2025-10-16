import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react(), // place-le avant pour éviter certains bugs
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: true,
        }),
    ],
});
