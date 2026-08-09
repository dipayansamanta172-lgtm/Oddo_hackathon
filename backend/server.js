import http from 'http';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Robust .env configuration loader
let envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  envPath = path.join(process.cwd(), 'backend', '.env');
}
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import { handleApi } from './server/api.js';
import { initializeDatabase } from './server/db.js';
import { initSuperAdmin } from './server/superadmin.js';

// Perform one-time Super Admin initialization on startup
initSuperAdmin();

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(process.cwd(), '../frontend/dist');
const LANDINGPAGE_DIR = path.join(process.cwd(), '../frontend/Landingpage');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // 1. API routes
  if (pathname.startsWith('/api/')) {
    handleApi(req, res);
    return;
  }

  // 2. Landingpage frames
  if (pathname.startsWith('/Landingpage/')) {
    const fileName = pathname.split('/').pop().split('?')[0];
    const filePath = path.join(LANDINGPAGE_DIR, fileName);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // 3. Static assets from dist/
  let filePath = path.join(PUBLIC_DIR, pathname);
  
  // Default to index.html if root path
  if (pathname === '/') {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  // Check if file exists, if not fallback to index.html (SPA routing)
  let fileExists = fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  if (!fileExists) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
    fileExists = fs.existsSync(filePath);
  }

  if (fileExists) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Auto-initialize schema on production start
initializeDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`REXPO Production Server active on http://localhost:${PORT}`);
  });
});
