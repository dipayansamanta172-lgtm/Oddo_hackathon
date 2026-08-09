import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_FILE = path.join(__dirname, 'superadmin_config.json');

// Helper to hash password securely using SHA-256
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 1. One-time Super Admin Initialization
export function initSuperAdmin() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      if (data && data.initialized) {
        console.log(`◇ Super Admin already initialized for username: ${data.username} (preserving existing credentials).`);
        return data;
      }
    }

    const username = (process.env.SUPER_ADMIN_USERNAME || 'superadmin').trim();
    const plainPassword = (process.env.SUPER_ADMIN_PASSWORD || 'superadmin123').trim();

    const initialConfig = {
      initialized: true,
      username: username,
      passwordHash: hashPassword(plainPassword),
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(initialConfig, null, 2), 'utf8');
    console.log(`◇ Super Admin initialized once for username: ${username}.`);
    return initialConfig;
  } catch (err) {
    console.error('Failed to initialize Super Admin:', err.message);
  }
}

// 2. Server-side Super Admin Authentication (No OTP)
export function loginSuperAdmin(username, password) {
  try {
    initSuperAdmin(); // Ensure config exists
    if (!fs.existsSync(CONFIG_FILE)) {
      return { success: false, error: 'Super Admin state not initialized' };
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    const inputUsername = (username || '').trim();

    if (inputUsername.toLowerCase() !== config.username.toLowerCase()) {
      return { success: false, error: 'Invalid Super Admin username or password' };
    }

    if (hashPassword(password) !== config.passwordHash) {
      return { success: false, error: 'Invalid Super Admin username or password' };
    }

    return {
      success: true,
      user: {
        id: 'super_admin_1',
        username: config.username,
        email: `${config.username}@rexpo.admin`,
        role: 'SUPER_ADMIN'
      }
    };
  } catch (err) {
    return { success: false, error: 'Super Admin authentication failed: ' + err.message };
  }
}

// 3. Server-side Password Change with Current Password Verification
export function updateSuperAdminPassword(currentPassword, newPassword) {
  try {
    initSuperAdmin();
    if (!fs.existsSync(CONFIG_FILE)) {
      return { success: false, error: 'Super Admin state file missing' };
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));

    if (hashPassword(currentPassword) !== config.passwordHash) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    config.passwordHash = hashPassword(newPassword);
    config.updatedAt = new Date().toISOString();

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    console.log(`◇ Super Admin password changed successfully for ${config.username}.`);
    return { success: true, message: 'Super Admin password updated successfully.' };
  } catch (err) {
    return { success: false, error: 'Failed to update Super Admin password: ' + err.message };
  }
}

// Run initialization at module import time
initSuperAdmin();
