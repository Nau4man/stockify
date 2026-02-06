import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        include: '**/*.{js,jsx,ts,tsx}'
      })
    ],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.REACT_APP_TRACK_ERRORS_DEV': JSON.stringify(env.REACT_APP_TRACK_ERRORS_DEV),
      'process.env.REACT_APP_SENTRY_DSN': JSON.stringify(env.REACT_APP_SENTRY_DSN),
      'process.env.REACT_APP_DEBUG': JSON.stringify(env.REACT_APP_DEBUG),
      'process.env.REACT_APP_TITLE': JSON.stringify(env.REACT_APP_TITLE),
      'process.env.REACT_APP_DESCRIPTION': JSON.stringify(env.REACT_APP_DESCRIPTION)
    },
    build: {
      outDir: 'dist'
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.js'
    }
  };
});
