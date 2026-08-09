import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// Read .env manually to load credentials securely on the backend
const envPath = path.join(process.cwd(), '.env');
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

const dbConfig = {
  host: env.DB_HOST || '127.0.0.1',
  port: Number(env.DB_PORT) || 3306,
  user: env.DB_USER || 'root',
  password: env.DB_PASSWORD || '',
  database: env.DB_NAME || 'rental',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Secure random alphanumeric string generator (12 characters)
export function generatePublicId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Initialize schema on startup
export async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    console.log('Verifying table schemas in MySQL database...');
    
    // 1. Create Users Table (with public_id & is_verified)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        public_id VARCHAR(50) UNIQUE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        is_verified TINYINT DEFAULT 1,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Dynamic migration for users: add public_id and is_verified columns if missing
    const [columns] = await connection.query('SHOW COLUMNS FROM users');
    const hasPublicId = columns.some(col => col.Field === 'public_id');
    const hasIsVerified = columns.some(col => col.Field === 'is_verified');
    
    if (!hasPublicId) {
      console.log("Migrating users table: adding 'public_id' column...");
      await connection.query('ALTER TABLE users ADD COLUMN public_id VARCHAR(50) UNIQUE AFTER id');
      
      const [existingUsers] = await connection.query('SELECT id FROM users');
      for (const u of existingUsers) {
        await connection.query('UPDATE users SET public_id = ? WHERE id = ?', [generatePublicId(), u.id]);
      }
      
      await connection.query('ALTER TABLE users MODIFY COLUMN public_id VARCHAR(50) UNIQUE NOT NULL');
      console.log("Migration complete: 'public_id' populated and set to UNIQUE NOT NULL.");
    }

    if (!hasIsVerified) {
      console.log("Migrating users table: adding 'is_verified' column...");
      await connection.query('ALTER TABLE users ADD COLUMN is_verified TINYINT DEFAULT 1 AFTER role');
    }

    // 2. Create Email OTPs Table (with attempts tracking)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS email_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        is_verified TINYINT DEFAULT 0,
        attempts INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )
    `);

    const [otpColumns] = await connection.query('SHOW COLUMNS FROM email_otps');
    const hasAttempts = otpColumns.some(col => col.Field === 'attempts');
    if (!hasAttempts) {
      await connection.query('ALTER TABLE email_otps ADD COLUMN attempts INT DEFAULT 0 AFTER is_verified');
    }

    // 3. Create Hubs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hubs (
        id VARCHAR(50) PRIMARY KEY,
        owner_id VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 4. Create Products Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        hub_id VARCHAR(50) NOT NULL,
        owner_id VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        rental_price DECIMAL(10, 2) NOT NULL,
        security_deposit DECIMAL(10, 2) NOT NULL,
        quantity INT DEFAULT 1,
        available_quantity INT DEFAULT 1,
        pickup_available TINYINT DEFAULT 1,
        delivery_available TINYINT DEFAULT 1,
        image_url TEXT,
        cloudinary_public_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (hub_id) REFERENCES hubs(id) ON DELETE CASCADE,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Dynamic migration for products table: add image_url & cloudinary_public_id if missing
    const [prodColumns] = await connection.query('SHOW COLUMNS FROM products');
    const hasImageUrl = prodColumns.some(col => col.Field === 'image_url');
    const hasCloudinaryId = prodColumns.some(col => col.Field === 'cloudinary_public_id');

    if (!hasImageUrl) {
      console.log("Migrating products table: adding 'image_url' column...");
      await connection.query('ALTER TABLE products ADD COLUMN image_url TEXT AFTER delivery_available');
    }
    if (!hasCloudinaryId) {
      console.log("Migrating products table: adding 'cloudinary_public_id' column...");
      await connection.query('ALTER TABLE products ADD COLUMN cloudinary_public_id VARCHAR(255) AFTER image_url');
    }

    // 5. Create Bookings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(50) PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL,
        product_name VARCHAR(100) NOT NULL,
        product_price DECIMAL(10, 2) NOT NULL,
        product_deposit DECIMAL(10, 2) NOT NULL,
        product_hub_name VARCHAR(100) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        delivery_choice VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'PROCESSING',
        user_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        user_phone VARCHAR(20) NOT NULL,
        hub_id VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (hub_id) REFERENCES hubs(id) ON DELETE CASCADE
      )
    `);

    // Dynamic migration for users table: add hub_id column if missing
    const hasHubId = columns.some(col => col.Field === 'hub_id');
    if (!hasHubId) {
      console.log("Migrating users table: adding 'hub_id' column...");
      await connection.query('ALTER TABLE users ADD COLUMN hub_id VARCHAR(50) AFTER role');
    }

    // Dynamic migration for bookings table: add assigned_rider_id column if missing
    const [bkColumns] = await connection.query('SHOW COLUMNS FROM bookings');
    const hasAssignedRider = bkColumns.some(col => col.Field === 'assigned_rider_id');
    if (!hasAssignedRider) {
      console.log("Migrating bookings table: adding 'assigned_rider_id' column...");
      await connection.query('ALTER TABLE bookings ADD COLUMN assigned_rider_id VARCHAR(50) AFTER hub_id');
    }

    // Dynamic migration for hubs table: add latitude and longitude columns if missing
    const [hubCols] = await connection.query('SHOW COLUMNS FROM hubs');
    const hasLat = hubCols.some(col => col.Field === 'latitude');
    const hasLng = hubCols.some(col => col.Field === 'longitude');
    if (!hasLat) {
      console.log("Migrating hubs table: adding 'latitude' column...");
      await connection.query('ALTER TABLE hubs ADD COLUMN latitude DECIMAL(10, 8) NULL AFTER address');
    }
    if (!hasLng) {
      console.log("Migrating hubs table: adding 'longitude' column...");
      await connection.query('ALTER TABLE hubs ADD COLUMN longitude DECIMAL(11, 8) NULL AFTER latitude');
    }

    // 6. Create Logs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id VARCHAR(50) PRIMARY KEY,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables verified successfully.');
  } catch (err) {
    console.error('Failed to initialize database schema:', err.message);
  } finally {
    connection.release();
  }
}

export { pool };
