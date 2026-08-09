import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Load .env manually to extract JWT_SECRET and admin credentials securely
let envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  envPath = path.join(process.cwd(), 'backend', '.env');
}

const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      env[match[1]] = val.trim();
    }
  });
}

const SECRET = env.JWT_SECRET || process.env.JWT_SECRET || 'rexpo-super-secret-key-123456';
const SALT = 'rexposalt123';

export const ADMIN_EMAIL = env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@example.com';
export const ADMIN_PASSWORD = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';

export function hashPassword(password) {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex');
}

export function generateToken(payload) {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const key = crypto.scryptSync(SECRET, 'salt-scrypt', 32);
  const iv = Buffer.alloc(16, 0); // Static IV for stateless token verification simplicity
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string' || token === 'undefined' || token === 'null') {
    return null;
  }
  try {
    const key = crypto.scryptSync(SECRET, 'salt-scrypt', 32);
    const iv = Buffer.alloc(16, 0);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(token, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const payload = JSON.parse(decrypted);
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (err) {
    return null;
  }
}
