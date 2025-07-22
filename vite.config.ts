
import react from '@vitejs/plugin-react';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import * as path from 'path';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { componentTagger } from 'lovable-tagger';

export default ({ mode }: { mode: string }) => {
  // Load .env files from project root instead of ./env
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    publicDir: 'public',
    plugins: [
      react(), 
      viteTsconfigPaths(), 
      svgr(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    server: {
      host: "::",
      open: true,
      port: 8080, // Hardcoded for Lovable compatibility
    },
    build: {
      outDir: './build',
      target: browserslistToEsbuild(),
      assetsInlineLimit: 0,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@ehr': path.resolve(__dirname, 'apps/ehr/src'),
        '@intake': path.resolve(__dirname, 'apps/intake/src'),
      }
    },
    define: {
      'process.env': env
    }
  });
};
