import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.startsWith('/Landingpage/')) {
          const fileName = req.url.split('/').pop().split('?')[0];
          const filePath = path.join(process.cwd(), 'Landingpage', fileName);
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'image/jpeg');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
        next();
      });
    }
  }
})
