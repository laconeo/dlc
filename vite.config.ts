import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8'));

  // Only mount the Express API middleware in dev (Supabase handles data in production)
  const devPlugins: any[] = [];
  if (isDev) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { apiApp } = require('./api-router.ts');
      devPlugins.push({
        name: 'api-server-middleware',
        configureServer(server: any) {
          server.middlewares.use(apiApp);
        },
      });
    } catch {
      // api-router not available — fine, Supabase is the data source
    }
  }

  return {
    // GitHub Pages serves from https://laconeo.github.io/dlc/
    base: isDev ? '/' : '/dlc/',
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [react(), tailwindcss(), ...devPlugins],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      port: 5173,
      host: true,
    },
  };
});
