import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { v2 as cloudinary } from 'cloudinary';
import Razorpay from 'razorpay';
import { pool, generatePublicId } from './db.js';
import { hashPassword, generateToken, verifyToken, ADMIN_EMAIL, ADMIN_PASSWORD } from './crypto.js';
import { sendOtpEmail, sendRiderOnboardingNotification } from './mailer.js';
import { loginSuperAdmin, updateSuperAdminPassword } from './superadmin.js';

// Helper to dynamically configure Razorpay instance from process.env
function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : '';

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing from backend/.env.');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

// Helper to dynamically configure Cloudinary server-side from process.env (supports CLOUDINARY_URL or discrete keys)
function getCloudinary() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudinaryUrl) {
    cloudinary.config({
      cloudinary_url: cloudinaryUrl,
      secure: true
    });
  } else if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
  } else {
    throw new Error('Cloudinary credentials (CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing from backend/.env.');
  }

  return cloudinary;
}

// Helper to parse JSON request body
function parseJsonBody(req) {
  return new Promise((resolve) => {
    if (req.method === 'GET' || req.method === 'DELETE') {
      return resolve({});
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({});
      }
    });
  });
}

// Helper to write JSON responses
function sendJson(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

// Helper to get authenticated user from authorization header
function getAuthUser(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  return verifyToken(token);
}

export async function handleApi(req, res, next) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const rawPathname = url.pathname;
  const pathname = rawPathname.length > 1 && rawPathname.endsWith('/') ? rawPathname.slice(0, -1) : rawPathname;

  // Intercept CORS preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end();
    return;
  }

  if (!pathname.startsWith('/api/')) {
    if (next) return next();
    return;
  }

  const body = await parseJsonBody(req);
  const user = getAuthUser(req);

  try {
    // 0. TEMPORARY STANDALONE GMAIL OAUTH AUTHORIZATION ROUTE
    if (pathname === '/api/auth/google' && req.method === 'GET') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = 'http://localhost:5000/api/auth/google/callback';

      const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/gmail.send'
      });

      res.writeHead(302, { Location: authUrl });
      res.end();
      return;
    }

    // 0B. TEMPORARY OAUTH CALLBACK & REFRESH TOKEN SAVER ROUTE
    if (pathname === '/api/auth/google/callback' && req.method === 'GET') {
      const code = url.searchParams.get('code');
      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>Google Authorization Failed</h1><p>Missing authorization code from Google.</p>');
        return;
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = 'http://localhost:5000/api/auth/google/callback';

      const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      const refreshToken = tokens.refresh_token;

      // Write refresh token to backend/.env securely
      let envFilePath = path.join(process.cwd(), '.env');
      if (!fs.existsSync(envFilePath)) {
        envFilePath = path.join(process.cwd(), 'backend', '.env');
      }

      if (fs.existsSync(envFilePath)) {
        let envContent = fs.readFileSync(envFilePath, 'utf8');
        
        if (refreshToken) {
          if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
            envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=.*/g, `GOOGLE_REFRESH_TOKEN=${refreshToken}`);
          } else {
            envContent += `\nGOOGLE_REFRESH_TOKEN=${refreshToken}`;
          }
        }

        fs.writeFileSync(envFilePath, envContent, 'utf8');
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <div style="font-family: Arial, sans-serif; background-color: #DFE5F3; padding: 50px 20px; color: #1A1A1A; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
          <div style="max-width: 500px; width: 100%; background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 20px 60px rgba(85, 115, 115, 0.12); border: 1px solid rgba(85, 115, 115, 0.15); text-align: center;">
            <h1 style="font-size: 24px; font-weight: 900; color: #557373; margin-bottom: 12px;">REXPO</h1>
            <div style="display: inline-block; padding: 8px 16px; background: rgba(85, 115, 115, 0.1); border-radius: 8px; font-size: 11px; font-weight: 800; color: #557373; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px;">
              Gmail Authorization Successful
            </div>
            <p style="font-size: 14px; color: #1A1A1A; margin-bottom: 16px; font-weight: 600;">
              Google Gmail authorization completed successfully.
            </p>
            <p style="font-size: 12px; color: rgba(85, 115, 115, 0.85); line-height: 1.5; margin-bottom: 0;">
              The OAuth refresh token has been securely configured for your backend <code>.env</code> file.
            </p>
          </div>
        </div>
      `);
      return;
    }

    // 1B. ISOLATED SUPER ADMIN LOGIN (USERNAME + PASSWORD, NO OTP)
    if ((pathname === '/api/auth/super-admin/login' || pathname === '/api/auth/super-admin/login/') && req.method === 'POST') {
      const { username, password } = body;
      if (!username || !password) {
        return sendJson(res, { error: 'Username and password are required' }, 400);
      }

      const authResult = loginSuperAdmin(username, password);
      if (!authResult.success) {
        return sendJson(res, { error: authResult.error }, 401);
      }

      const token = generateToken({
        id: authResult.user.id,
        email: authResult.user.email,
        role: 'SUPER_ADMIN',
        username: authResult.user.username,
        publicId: 'super_admin_id'
      });

      return sendJson(res, {
        token,
        user: {
          id: authResult.user.id,
          fullName: 'Super Admin',
          username: authResult.user.username,
          email: authResult.user.email,
          role: 'SUPER_ADMIN',
          publicId: 'super_admin_id'
        }
      });
    }

    // 1. PUBLIC AUTH: LOGIN
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = body;
      if (!email || !password) {
        return sendJson(res, { error: 'Email and password are required' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();

      // A. Check against Super Admin env credentials
      if (cleanEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
        const token = generateToken({ id: 'admin', email: ADMIN_EMAIL, role: 'SUPER_ADMIN', publicId: 'admin_id' });
        return sendJson(res, {
          token,
          user: { fullName: 'Super Admin', email: ADMIN_EMAIL, role: 'SUPER_ADMIN', publicId: 'admin_id' }
        });
      }

      // B. Check against MySQL database users
      const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
      const matchedUser = users[0];

      if (matchedUser && matchedUser.password_hash === hashPassword(password)) {
        if (matchedUser.is_verified === 0) {
          return sendJson(res, { error: 'Email address is not verified. Please verify your email before logging in.' }, 403);
        }

        let hubId = null;
        if (matchedUser.role === 'HUB_OWNER') {
          const [hubs] = await pool.query('SELECT id FROM hubs WHERE owner_id = ?', [matchedUser.id]);
          if (hubs[0]) hubId = hubs[0].id;
        }

        const token = generateToken({
          id: matchedUser.id,
          email: matchedUser.email,
          role: matchedUser.role,
          hubId,
          publicId: matchedUser.public_id
        });

        return sendJson(res, {
          token,
          user: {
            fullName: matchedUser.name,
            email: matchedUser.email,
            role: matchedUser.role,
            hubId,
            publicId: matchedUser.public_id
          }
        });
      }

      return sendJson(res, { error: 'Invalid email or password' }, 401);
    }

    // 2. PUBLIC AUTH: SEND GMAIL OTP
    if (pathname === '/api/auth/send-otp' && req.method === 'POST') {
      const { email } = body;
      if (!email || !email.includes('@')) {
        return sendJson(res, { error: 'Please enter a valid email address.' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();

      // Check if email is already registered in MySQL
      const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
      if (existingUsers.length > 0 || cleanEmail === ADMIN_EMAIL.toLowerCase()) {
        return sendJson(res, { error: 'Email is already registered. Please sign in.' }, 400);
      }

      // 60-second Rate Limiting Cooldown Check
      const [recentOtps] = await pool.query(
        'SELECT id FROM email_otps WHERE email = ? AND created_at > NOW() - INTERVAL 60 SECOND',
        [cleanEmail]
      );
      if (recentOtps.length > 0) {
        return sendJson(res, { error: 'Please wait 60 seconds before requesting a new verification code.' }, 429);
      }

      // Generate cryptographically secure 6-digit OTP
      const otpCode = crypto.randomInt(100000, 999999).toString();
      const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');

      // Invalidate previous unverified OTP records for this email
      await pool.query('DELETE FROM email_otps WHERE email = ? AND is_verified = 0', [cleanEmail]);

      // Store hashed OTP in database with 5-minute expiration
      await pool.query(
        'INSERT INTO email_otps (email, otp_hash, expires_at, attempts) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 0)',
        [cleanEmail, otpHash]
      );

      // Send OTP via Gmail API / OAuth
      try {
        await sendOtpEmail(cleanEmail, otpCode);
        return sendJson(res, { success: true, message: 'Verification code sent to your email.' });
      } catch (err) {
        console.error('Failed to send Gmail OTP:', err.message);
        return sendJson(res, { error: 'Failed to send verification email. Please check backend mailer settings.' }, 500);
      }
    }

    // 3. PUBLIC AUTH: VERIFY OTP
    if (pathname === '/api/auth/verify-otp' && req.method === 'POST') {
      const { email, otp } = body;
      if (!email || !otp) {
        return sendJson(res, { error: 'Email and verification code are required.' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();
      const otpHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');

      const [otpRows] = await pool.query(
        'SELECT * FROM email_otps WHERE email = ? AND is_verified = 0 ORDER BY created_at DESC LIMIT 1',
        [cleanEmail]
      );
      const otpRecord = otpRows[0];

      if (!otpRecord) {
        return sendJson(res, { error: 'Invalid verification code.' }, 400);
      }

      // Check max attempt limit (max 5 attempts allowed)
      if (otpRecord.attempts >= 5) {
        await pool.query('DELETE FROM email_otps WHERE id = ?', [otpRecord.id]);
        return sendJson(res, { error: 'Too many failed attempts. Please request a new verification code.' }, 429);
      }

      // Verify OTP hash match
      if (otpRecord.otp_hash !== otpHash) {
        await pool.query('UPDATE email_otps SET attempts = attempts + 1 WHERE id = ?', [otpRecord.id]);
        return sendJson(res, { error: 'Invalid verification code.' }, 400);
      }

      // Verify expiration window (5 minutes)
      if (new Date(otpRecord.expires_at) < new Date()) {
        return sendJson(res, { error: 'Verification code has expired. Please request a new code.' }, 400);
      }

      // Mark OTP as verified
      await pool.query('UPDATE email_otps SET is_verified = 1 WHERE id = ?', [otpRecord.id]);
      return sendJson(res, { success: true, message: 'Email verified successfully.' });
    }

    // 4. PUBLIC AUTH: SIGNUP (With Enforced Server-Side OTP Verification)
    if (pathname === '/api/auth/signup' && req.method === 'POST') {
      const { role, fullName, email, phone, password, hubName, location, address, otp } = body;
      
      if (!role || !fullName || !email || !phone || !password || !otp) {
        return sendJson(res, { error: 'Missing required fields or verification code.' }, 400);
      }

      const cleanEmail = email.toLowerCase().trim();

      if (role !== 'USER' && role !== 'HUB_OWNER') {
        return sendJson(res, { error: 'Invalid account role selection' }, 400);
      }

      if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
        return sendJson(res, { error: 'Email already exists' }, 400);
      }

      // Check if email already exists in MySQL
      const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
      if (existingUsers.length > 0) {
        return sendJson(res, { error: 'Email already exists' }, 400);
      }

      // Server-side verification of OTP hash
      const otpHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');
      const [otpRows] = await pool.query(
        'SELECT * FROM email_otps WHERE email = ? AND otp_hash = ? ORDER BY created_at DESC LIMIT 1',
        [cleanEmail, otpHash]
      );
      const otpRecord = otpRows[0];

      if (!otpRecord) {
        return sendJson(res, { error: 'Invalid or unverified verification code.' }, 400);
      }

      if (new Date(otpRecord.expires_at) < new Date()) {
        return sendJson(res, { error: 'Verification code has expired. Please request a new code.' }, 400);
      }

      const userId = 'u_' + Date.now();
      const publicId = generatePublicId();
      const hashedPassword = hashPassword(password);

      // Perform atomic insertion transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        await connection.query(
          'INSERT INTO users (id, public_id, name, email, phone, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
          [userId, publicId, fullName, cleanEmail, phone, hashedPassword, role]
        );

        if (role === 'HUB_OWNER') {
          if (!hubName || !location || !address) {
            throw new Error('Hub name, location, and address are required');
          }
          const hubId = 'hub_' + Date.now();
          await connection.query(
            'INSERT INTO hubs (id, owner_id, name, location, address) VALUES (?, ?, ?, ?, ?)',
            [hubId, userId, hubName, location, address]
          );
        }

        // Clean up verified OTP records for this email
        await connection.query('DELETE FROM email_otps WHERE email = ?', [cleanEmail]);

        await connection.query(
          'INSERT INTO logs (id, message) VALUES (?, ?)',
          ['log_' + Date.now(), `${role} account registered & email verified: ${cleanEmail}`]
        );

        await connection.commit();
        connection.release();
        return sendJson(res, { success: true, message: 'Account registered successfully!' });
      } catch (err) {
        await connection.rollback();
        connection.release();
        return sendJson(res, { error: err.message || 'Registration transaction failed' }, 400);
      }
    }

    // 5. PUBLIC ROUTE: PRODUCTS CATALOG
    if (pathname === '/api/products' && req.method === 'GET') {
      const [activeProducts] = await pool.query(`
        SELECT p.id, p.name, p.description, p.rental_price as price, p.security_deposit as deposit, 
               p.quantity, p.available_quantity, p.pickup_available as pickup, p.delivery_available as delivery, 
               p.image_url as imageUrl, p.cloudinary_public_id as cloudinaryPublicId,
               p.status, h.name as hubName, h.location as hubLocation, p.hub_id as hubId
        FROM products p
        LEFT JOIN hubs h ON p.hub_id = h.id
        WHERE p.status = 'ACTIVE'
        ORDER BY p.created_at DESC
      `);
      return sendJson(res, activeProducts);
    }

    const cleanPathname = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

    // 5B. RAZORPAY TEST-MODE CONNECTION & TEST ORDER ENDPOINTS
    if ((cleanPathname === '/api/payments/razorpay-test' || cleanPathname === '/api/payment/razorpay-test') && req.method === 'GET') {
      try {
        const razorpay = getRazorpay();
        const orders = await razorpay.orders.all({ count: 1 });
        return sendJson(res, {
          success: true,
          message: 'Razorpay Test API connection verified successfully.',
          keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TNDaZSZ',
          mode: 'TEST',
          ordersCount: orders?.items?.length || 0
        });
      } catch (err) {
        console.error('Razorpay Test Connection Error:', err);
        return sendJson(res, {
          success: false,
          error: 'Razorpay Test API connection failed.',
          details: err.error?.description || err.message || 'Authentication error'
        }, 401);
      }
    }

    if ((cleanPathname === '/api/payments/create-order' || cleanPathname === '/api/payment/create-order' || cleanPathname === '/api/create-order') && req.method === 'POST') {
      const { amount, currency, productId } = body;
      if (!amount) {
        return sendJson(res, { error: 'Payment amount is required.' }, 400);
      }

      try {
        const razorpay = getRazorpay();
        const amountInPaise = Math.round(Number(amount) * 100);
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: currency || 'INR',
          receipt: 'rcpt_' + Date.now(),
          notes: {
            productId: productId || 'unknown',
            userId: user ? user.id : 'guest'
          }
        });

        return sendJson(res, {
          success: true,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: (process.env.RAZORPAY_KEY_ID || '').trim()
        });
      } catch (err) {
        console.error('Razorpay Order Creation Error:', err);
        return sendJson(res, { error: err.error?.description || err.message || 'Failed to create Razorpay test order' }, 500);
      }
    }

    if ((cleanPathname === '/api/payments/verify-signature' || cleanPathname === '/api/payment/verify-signature') && req.method === 'POST') {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return sendJson(res, { error: 'Missing payment signature verification parameters.' }, 400);
      }

      try {
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) throw new Error('Razorpay key secret not configured');
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');

        if (expectedSignature === razorpaySignature) {
          return sendJson(res, { success: true, message: 'Razorpay payment signature verified successfully.' });
        } else {
          return sendJson(res, { success: false, error: 'Invalid Razorpay payment signature.' }, 400);
        }
      } catch (err) {
        return sendJson(res, { error: 'Failed to verify payment signature.' }, 500);
      }
    }

    // ============================================
    // ALL ROUTES BELOW REQUIRE AUTHENTICATION
    // ============================================
    if (!user) {
      return sendJson(res, { error: 'Unauthorized. Authentication token required.' }, 401);
    }

    // 5C. ISOLATED SUPER ADMIN PASSWORD CHANGE
    if ((cleanPathname === '/api/auth/super-admin/change-password' || cleanPathname === '/api/auth/super-admin/change-password/') && req.method === 'POST') {
      if (user.role !== 'SUPER_ADMIN') {
        return sendJson(res, { error: 'Forbidden. Super Admin access required.' }, 403);
      }

      const { currentPassword, newPassword, confirmPassword } = body;
      if (!currentPassword || !newPassword || !confirmPassword) {
        return sendJson(res, { error: 'Current password, new password, and confirmation password are required.' }, 400);
      }

      if (newPassword !== confirmPassword) {
        return sendJson(res, { error: 'New password and confirmation password do not match.' }, 400);
      }

      const changeResult = updateSuperAdminPassword(currentPassword, newPassword);
      if (!changeResult.success) {
        return sendJson(res, { error: changeResult.error }, 400);
      }

      return sendJson(res, { success: true, message: changeResult.message });
    }

    // 5D. ISOLATED SUPER ADMIN OVERSIGHT & READ-ONLY MARKETPLACE OVERVIEW
    if ((cleanPathname === '/api/super-admin/overview' || cleanPathname === '/api/super-admin/overview/') && req.method === 'GET') {
      if (user.role !== 'SUPER_ADMIN') {
        return sendJson(res, { error: 'Forbidden. Super Admin access required.' }, 403);
      }

      const [admins] = await pool.query(`
        SELECT id, public_id, name, email, phone, role, is_verified, created_at 
        FROM users 
        WHERE role IN ('SUPER_ADMIN', 'HUB_OWNER', 'ADMIN', 'MANAGER')
        ORDER BY created_at DESC
      `);

      const [hubs] = await pool.query(`
        SELECT h.id, h.owner_id as ownerId, h.name, h.location, h.address, h.created_at,
               u.name as ownerName, u.email as ownerEmail, u.public_id as ownerPublicId
        FROM hubs h
        LEFT JOIN users u ON h.owner_id = u.id
        ORDER BY h.created_at DESC
      `);

      const [marketplaceListings] = await pool.query(`
        SELECT p.id, p.name, p.description, p.rental_price as price, p.security_deposit as deposit, 
               p.quantity, p.available_quantity as availableQuantity, p.pickup_available as pickup, p.delivery_available as delivery, 
               p.image_url as imageUrl, p.cloudinary_public_id as cloudinaryPublicId,
               p.status, p.created_at as createdAt,
               h.name as hubName, h.location as hubLocation, 
               u.name as ownerName, u.email as ownerEmail, u.role as ownerRole
        FROM products p
        LEFT JOIN hubs h ON p.hub_id = h.id
        LEFT JOIN users u ON p.owner_id = u.id
        ORDER BY p.created_at DESC
      `);

      const [users] = await pool.query('SELECT id, public_id as publicId, name, email, phone, role, is_verified as isVerified, created_at as createdAt FROM users');
      const [logs] = await pool.query('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50');

      return sendJson(res, {
        admins,
        hubs,
        marketplaceListings,
        users,
        logs
      });
    }

    // 5B. CLOUDINARY IMAGE UPLOAD (HUB_OWNER or SUPER_ADMIN required)
    if (pathname === '/api/upload' && req.method === 'POST') {
      if (user.role !== 'HUB_OWNER' && user.role !== 'SUPER_ADMIN') {
        return sendJson(res, { error: 'Forbidden. Hub Owner permission required to upload product images.' }, 403);
      }

      const { image } = body;
      if (!image) {
        return sendJson(res, { error: 'Image file data is required.' }, 400);
      }

      if (typeof image !== 'string' || (!image.startsWith('data:image/') && !image.startsWith('http'))) {
        return sendJson(res, { error: 'Invalid image format. Please upload a valid image file.' }, 400);
      }

      if (image.length > 14 * 1024 * 1024) {
        return sendJson(res, { error: 'Image file size exceeds the 10MB limit.' }, 400);
      }

      try {
        const cloudClient = getCloudinary();
        const uploadResult = await cloudClient.uploader.upload(image, {
          folder: 'rexpo/products'
        });

        return sendJson(res, {
          success: true,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        });
      } catch (err) {
        console.error('Cloudinary Upload Error:', err);
        const errorMsg = err.message || 'Failed to upload image to Cloudinary.';
        return sendJson(res, { error: `Cloudinary Upload Error: ${errorMsg}` }, 500);
      }
    }

    // 6. GET PROTECTED USER PROFILE (via public identifier check)
    if (pathname.startsWith('/api/profile/') || pathname === '/api/profile') {
      const publicId = pathname.split('/').pop() || url.searchParams.get('publicId');
      
      if (!publicId) {
        return sendJson(res, { error: 'Missing public identifier' }, 400);
      }

      if (user.role !== 'SUPER_ADMIN' && user.publicId !== publicId) {
        return sendJson(res, { error: 'Forbidden. You do not own this profile record.' }, 403);
      }

      const [profiles] = await pool.query(
        'SELECT name, email, phone, role, created_at as createdAt FROM users WHERE public_id = ?', 
        [publicId]
      );
      const profile = profiles[0];
      if (!profile) {
        return sendJson(res, { error: 'User profile not found' }, 404);
      }

      let hub = null;
      if (profile.role === 'HUB_OWNER') {
        const [ownerRows] = await pool.query('SELECT id FROM users WHERE public_id = ?', [publicId]);
        if (ownerRows[0]) {
          const [hubs] = await pool.query('SELECT name, location, address FROM hubs WHERE owner_id = ?', [ownerRows[0].id]);
          if (hubs[0]) hub = hubs[0];
        }
      }

      return sendJson(res, { ...profile, hub });
    }

    // 7. HUB OWNER: GET HUB SPECIFIC PRODUCTS
    if (pathname === '/api/hub/products' && req.method === 'GET') {
      if (user.role !== 'HUB_OWNER') {
        return sendJson(res, { error: 'Forbidden. Hub Owner permission required.' }, 403);
      }
      const [myProducts] = await pool.query(`
        SELECT id, name, description, rental_price as price, security_deposit as deposit, 
               quantity, available_quantity, pickup_available as pickup, delivery_available as delivery, 
               image_url as imageUrl, cloudinary_public_id as cloudinaryPublicId, status
        FROM products 
        WHERE owner_id = ?
        ORDER BY created_at DESC
      `, [user.id]);
      return sendJson(res, myProducts);
    }

    // 8. HUB OWNER: CREATE PRODUCT
    if (pathname === '/api/products' && req.method === 'POST') {
      if (user.role !== 'HUB_OWNER') {
        return sendJson(res, { error: 'Forbidden. Hub Owner permission required.' }, 403);
      }

      const { name, description, price, deposit, quantity, pickup, delivery, status, imageUrl, cloudinaryPublicId } = body;
      if (!name || !price || !deposit) {
        return sendJson(res, { error: 'Product name, price, and deposit are required' }, 400);
      }

      const prodId = 'prod_' + Date.now();
      const qty = quantity !== undefined ? Number(quantity) : 1;

      await pool.query(`
        INSERT INTO products 
        (id, hub_id, owner_id, name, description, rental_price, security_deposit, quantity, available_quantity, pickup_available, delivery_available, image_url, cloudinary_public_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prodId, user.hubId, user.id, name, description || '', 
        Number(price), Number(deposit), qty, qty,
        pickup ? 1 : 0, delivery ? 1 : 0,
        imageUrl || null, cloudinaryPublicId || null,
        status || 'ACTIVE'
      ]);

      await pool.query('INSERT INTO logs (id, message) VALUES (?, ?)', [
        'log_' + Date.now(), `Product added by ${user.email}: ${name}`
      ]);

      return sendJson(res, { id: prodId, name, price, deposit, imageUrl, cloudinaryPublicId, status });
    }

    // 9. HUB OWNER & ADMIN: UPDATE / DELETE PRODUCT
    if (pathname.startsWith('/api/products/') || (pathname === '/api/products' && url.searchParams.get('id'))) {
      const prodId = pathname.split('/').pop() || url.searchParams.get('id');
      const [existingProds] = await pool.query('SELECT * FROM products WHERE id = ?', [prodId]);
      const existing = existingProds[0];
      
      if (!existing) {
        return sendJson(res, { error: 'Product not found' }, 404);
      }

      if (user.role !== 'SUPER_ADMIN' && (user.role !== 'HUB_OWNER' || existing.owner_id !== user.id)) {
        return sendJson(res, { error: 'Forbidden. Owner permissions required.' }, 403);
      }

      if (req.method === 'PUT') {
        const { name, description, price, deposit, quantity, pickup, delivery, status, imageUrl, cloudinaryPublicId } = body;
        
        // If image is updated and an old Cloudinary public ID exists, remove old Cloudinary asset
        if (cloudinaryPublicId && existing.cloudinary_public_id && existing.cloudinary_public_id !== cloudinaryPublicId) {
          try {
            await cloudinary.uploader.destroy(existing.cloudinary_public_id);
          } catch (cErr) {
            console.error('Failed to cleanup old Cloudinary image:', cErr.message);
          }
        }

        await pool.query(`
          UPDATE products SET
            name = COALESCE(?, name),
            description = COALESCE(?, description),
            rental_price = COALESCE(?, rental_price),
            security_deposit = COALESCE(?, security_deposit),
            quantity = COALESCE(?, quantity),
            available_quantity = COALESCE(?, available_quantity),
            pickup_available = COALESCE(?, pickup_available),
            delivery_available = COALESCE(?, delivery_available),
            image_url = COALESCE(?, image_url),
            cloudinary_public_id = COALESCE(?, cloudinary_public_id),
            status = COALESCE(?, status)
          WHERE id = ?
        `, [
          name, description, price ? Number(price) : null, deposit ? Number(deposit) : null,
          quantity !== undefined ? Number(quantity) : null, quantity !== undefined ? Number(quantity) : null,
          pickup !== undefined ? (pickup ? 1 : 0) : null, delivery !== undefined ? (delivery ? 1 : 0) : null,
          imageUrl || null, cloudinaryPublicId || null,
          status, prodId
        ]);

        return sendJson(res, { success: true, message: 'Product updated successfully' });
      }

      if (req.method === 'DELETE') {
        if (existing.cloudinary_public_id) {
          try {
            await cloudinary.uploader.destroy(existing.cloudinary_public_id);
          } catch (cErr) {
            console.error('Failed to delete Cloudinary image on product deletion:', cErr.message);
          }
        }

        await pool.query('DELETE FROM products WHERE id = ?', [prodId]);
        await pool.query('INSERT INTO logs (id, message) VALUES (?, ?)', [
          'log_' + Date.now(), `Product deleted: ${existing.name}`
        ]);
        return sendJson(res, { success: true, message: 'Product deleted' });
      }
    }

    // 10. GET BOOKINGS (Scoped by Role)
    if (pathname === '/api/bookings' && req.method === 'GET') {
      let result = [];
      if (user.role === 'USER') {
        const [bookings] = await pool.query('SELECT * FROM bookings WHERE user_id = ?', [user.id]);
        result = bookings;
      } else if (user.role === 'HUB_OWNER') {
        const [bookings] = await pool.query('SELECT * FROM bookings WHERE hub_id = ?', [user.hubId]);
        result = bookings;
      } else if (user.role === 'SUPER_ADMIN') {
        const [bookings] = await pool.query('SELECT * FROM bookings');
        result = bookings;
      }
      return sendJson(res, result);
    }

    // 11. CUSTOMER: BOOK A RENTAL
    if (pathname === '/api/bookings' && req.method === 'POST') {
      if (user.role !== 'USER') {
        return sendJson(res, { error: 'Forbidden. Customer accounts only.' }, 403);
      }

      const { productId, duration, deliveryChoice } = body;
      if (!productId || !duration || !deliveryChoice) {
        return sendJson(res, { error: 'Missing booking details' }, 400);
      }

      const [prods] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
      const product = prods[0];
      if (!product || product.status !== 'ACTIVE' || product.available_quantity <= 0) {
        return sendJson(res, { error: 'Product is currently unavailable' }, 400);
      }

      const [hubs] = await pool.query('SELECT * FROM hubs WHERE id = ?', [product.hub_id]);
      const hub = hubs[0];

      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [user.id]);
      const customer = users[0];

      const bookingId = 'bk_' + Date.now();
      const bookingDate = new Date().toISOString().split('T')[0];

      await pool.query(`
        INSERT INTO bookings 
        (id, product_id, product_name, product_price, product_deposit, product_hub_name, duration, delivery_choice, status, user_id, user_name, user_phone, hub_id, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        bookingId, product.id, product.name, product.rental_price, product.security_deposit,
        hub ? hub.name : 'Central Depot', duration, deliveryChoice, 'PROCESSING',
        user.id, customer ? customer.name : 'Client', customer ? customer.phone : 'N/A',
        product.hub_id, bookingDate
      ]);

      await pool.query('UPDATE products SET available_quantity = available_quantity - 1 WHERE id = ?', [product.id]);

      await pool.query('INSERT INTO logs (id, message) VALUES (?, ?)', [
        'log_' + Date.now(), `Booking #${bookingId} created by ${user.email}`
      ]);

      return sendJson(res, { success: true, bookingId });
    }

    // 12. HUB OWNER / ADMIN: APPROVE BOOKING
    if (pathname === '/api/bookings/approve' && req.method === 'POST') {
      const { bookingId } = body;
      if (!bookingId) {
        return sendJson(res, { error: 'Booking ID is required' }, 400);
      }

      const [bks] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
      const bk = bks[0];
      if (!bk) return sendJson(res, { error: 'Booking not found' }, 404);

      if (user.role !== 'SUPER_ADMIN' && (user.role !== 'HUB_OWNER' || bk.hub_id !== user.hubId)) {
        return sendJson(res, { error: 'Forbidden' }, 403);
      }

      await pool.query("UPDATE bookings SET status = 'CONFIRMED' WHERE id = ?", [bookingId]);
      return sendJson(res, { success: true, message: 'Booking confirmed' });
    }

    // 13. HUB OWNER / ADMIN: SETTLE / RELEASE RETURN
    if (pathname === '/api/bookings/settle' && req.method === 'POST') {
      const { bookingId } = body;
      if (!bookingId) {
        return sendJson(res, { error: 'Booking ID is required' }, 400);
      }

      const [bks] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
      const bk = bks[0];
      if (!bk) return sendJson(res, { error: 'Booking not found' }, 404);

      if (user.role !== 'SUPER_ADMIN' && (user.role !== 'HUB_OWNER' || bk.hub_id !== user.hubId)) {
        return sendJson(res, { error: 'Forbidden' }, 403);
      }

      await pool.query("UPDATE bookings SET status = 'RELEASED' WHERE id = ?", [bookingId]);
      await pool.query('UPDATE products SET available_quantity = available_quantity + 1 WHERE id = ?', [bk.product_id]);

      await pool.query('INSERT INTO logs (id, message) VALUES (?, ?)', [
        'log_' + Date.now(), `Booking #${bookingId} returned and settled by ${user.email}`
      ]);

      return sendJson(res, { success: true, message: 'Return settled and deposit released' });
    }

    // 14. SUPER ADMIN DATA DASHBOARD ENDPOINT
    if (pathname === '/api/admin/data' && req.method === 'GET') {
      if (user.role !== 'SUPER_ADMIN') {
        return sendJson(res, { error: 'Forbidden. Super Admin access required.' }, 403);
      }

      const [products] = await pool.query('SELECT * FROM products');
      const [bookings] = await pool.query('SELECT * FROM bookings');
      const [hubs] = await pool.query('SELECT * FROM hubs');
      const [users] = await pool.query('SELECT id, name, email, phone, role, created_at FROM users');
      const [logs] = await pool.query('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50');

      return sendJson(res, { products, bookings, hubs, users, logs });
    }

    // 15. SUB-ADMIN / HUB OWNER — ADD DELIVERY PARTNER
    if ((pathname === '/api/hub/delivery-partners' || pathname === '/api/hub/delivery-partner') && req.method === 'POST') {
      console.log('[DELIVERY DEBUG] Request received');
      console.log('[DELIVERY DEBUG] Method:', req.method);
      console.log('[DELIVERY DEBUG] URL:', req.url);

      if (user.role !== 'HUB_OWNER' && user.role !== 'SUPER_ADMIN') {
        console.error('[DELIVERY DEBUG] FAILED AT STEP: Authorization check');
        return sendJson(res, { error: 'Forbidden. Sub-Admin or Super Admin access required.' }, 403);
      }

      try {
        console.log('[DELIVERY DEBUG] Body keys:', Object.keys(body || {}));
        const { email, phone, name } = body || {};

        console.log('[DELIVERY DEBUG] Rider email:', email);
        console.log('[DELIVERY DEBUG] Rider phone:', phone);
        console.log('[DELIVERY DEBUG] Step 1: validation started');

        if (!email || !phone) {
          console.error('[DELIVERY DEBUG] FAILED AT STEP: Input validation (missing email or phone)');
          return sendJson(res, { error: 'Email ID and phone number are required.' }, 400);
        }

        console.log('[DELIVERY DEBUG] Step 2: validation passed');
        console.log('[DELIVERY DEBUG] Step 3: checking existing rider/email');

        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
          console.error('[DELIVERY DEBUG] FAILED AT STEP: Duplicate email check');
          return sendJson(res, { error: 'An account with this email address already exists.' }, 400);
        }

        console.log('[DELIVERY DEBUG] Step 4: duplicate check completed');
        console.log('[DELIVERY DEBUG] Step 5: generating temporary password');

        const randomDigits = Math.floor(100000 + Math.random() * 900000);
        const tempPassword = `Rider#${randomDigits}`;
        const passwordHash = hashPassword(tempPassword);
        const riderId = `rider_${Date.now()}`;
        const riderPublicId = generatePublicId();
        const riderName = name || `Rider ${email.split('@')[0]}`;

        console.log('[DELIVERY DEBUG] Step 6: password generated');

        let hubId = user.hubId;
        let hubName = 'Central Depot';
        if (!hubId) {
          const [hubs] = await pool.query('SELECT id, name FROM hubs WHERE owner_id = ?', [user.id]);
          if (hubs.length > 0) {
            hubId = hubs[0].id;
            hubName = hubs[0].name;
          }
        } else {
          const [hubs] = await pool.query('SELECT name FROM hubs WHERE id = ?', [hubId]);
          if (hubs.length > 0) hubName = hubs[0].name;
        }

        console.log('[DELIVERY DEBUG] Step 7: creating database account');

        await pool.query(
          'INSERT INTO users (id, public_id, name, email, phone, password_hash, role, hub_id, is_verified, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, "ACTIVE")',
          [riderId, riderPublicId, riderName, email, phone, passwordHash, 'DELIVERY_PARTNER', hubId || 'hub_default']
        );

        console.log('[DELIVERY DEBUG] Step 8: database account created');
        console.log('[DELIVERY DEBUG] Step 9: dispatching onboarding notification');
        console.log('[DELIVERY DEBUG] Existing login email service detected: sendOtpEmail');
        console.log('[DELIVERY DEBUG] Rider notification function: sendRiderOnboardingNotification');
        console.log('[DELIVERY DEBUG] Existing login email function: sendOtpEmail');
        console.log('[DELIVERY DEBUG] Same transport: YES');
        console.log('[DELIVERY DEBUG] Same provider: YES');
        console.log('[DELIVERY DEBUG] Before notification call');

        sendRiderOnboardingNotification(email, phone, tempPassword, hubName)
          .then(() => console.log('[DELIVERY DEBUG] Notification promise resolved successfully'))
          .catch(err => console.error('[DELIVERY DEBUG] ONBOARDING NOTIFICATION ERROR:', err.message));

        console.log('[DELIVERY DEBUG] After notification call');
        console.log('[DELIVERY DEBUG] Step 10: onboarding notification completed');

        await pool.query('INSERT INTO logs (id, message) VALUES (?, ?)', [
          'log_' + Date.now(), `Delivery Partner (${email}) created by ${user.email} for Hub: ${hubName}`
        ]);

        console.log('[DELIVERY DEBUG] Step 11: sending HTTP success response');

        return sendJson(res, {
          success: true,
          message: 'Delivery Partner account created successfully and onboarding credentials sent.',
          rider: {
            id: riderId,
            public_id: riderPublicId,
            name: riderName,
            email,
            phone,
            hub_id: hubId || 'hub_default',
            role: 'DELIVERY_PARTNER'
          }
        }, 201);
      } catch (err) {
        console.error('[DELIVERY DEBUG] FAILED AT STEP: Account Creation Handler');
        console.error('[DELIVERY DEBUG] ERROR:', err.message);
        return sendJson(res, { success: false, error: err.message }, 500);
      }
    }

    // 16. SUB-ADMIN / HUB OWNER — GET DELIVERY PARTNERS FOR HUB
    if (pathname === '/api/hub/delivery-partners' && req.method === 'GET') {
      if (user.role !== 'HUB_OWNER' && user.role !== 'SUPER_ADMIN') {
        return sendJson(res, { error: 'Forbidden. Sub-Admin access required.' }, 403);
      }

      let hubId = user.hubId;
      if (!hubId) {
        const [hubs] = await pool.query('SELECT id FROM hubs WHERE owner_id = ?', [user.id]);
        if (hubs.length > 0) hubId = hubs[0].id;
      }

      const [riders] = await pool.query(
        'SELECT id, public_id, name, email, phone, role, hub_id, status, created_at FROM users WHERE role = "DELIVERY_PARTNER" AND (hub_id = ? OR ? = "SUPER_ADMIN")',
        [hubId || '', user.role]
      );

      return sendJson(res, { success: true, deliveryPartners: riders });
    }

    // 17. DELIVERY PARTNER — GET ASSIGNED/HUB DELIVERIES (ISOLATED ROLE WORKSPACE)
    if (pathname === '/api/rider/deliveries' && req.method === 'GET') {
      if (user.role !== 'DELIVERY_PARTNER' && user.role !== 'SUPER_ADMIN') {
        return sendJson(res, { error: 'Forbidden. Delivery Partner access required.' }, 403);
      }

      // Fetch rider's assigned hub
      let riderHubId = user.hub_id || user.hubId;
      if (!riderHubId) {
        const [u] = await pool.query('SELECT hub_id FROM users WHERE id = ?', [user.id]);
        if (u.length > 0) riderHubId = u[0].hub_id;
      }

      const [deliveries] = await pool.query(
        'SELECT * FROM bookings WHERE hub_id = ? OR assigned_rider_id = ? ORDER BY created_at DESC',
        [riderHubId || '', user.id]
      );

      return sendJson(res, { success: true, deliveries });
    }

    // 18. DELIVERY PARTNER — UPDATE DELIVERY STATUS (DISPATCHED / OUT FOR DELIVERY)
    if (pathname.match(/^\/api\/rider\/deliveries\/[^/]+\/dispatch$/) && (req.method === 'PUT' || req.method === 'POST')) {
      if (user.role !== 'DELIVERY_PARTNER' && user.role !== 'HUB_OWNER' && user.role !== 'SUPER_ADMIN') {
        return sendJson(res, { error: 'Forbidden. Authorized rider access required.' }, 403);
      }

      const bookingId = pathname.split('/')[4];
      const [bks] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
      if (bks.length === 0) return sendJson(res, { error: 'Booking not found' }, 404);

      // Verify rider belongs to same hub
      let riderHubId = user.hub_id || user.hubId;
      if (user.role === 'DELIVERY_PARTNER' && riderHubId && bks[0].hub_id !== riderHubId) {
        return sendJson(res, { error: 'Forbidden. Delivery belongs to another hub.' }, 403);
      }

      await pool.query('UPDATE bookings SET status = "DISPATCHED", assigned_rider_id = ? WHERE id = ?', [user.id, bookingId]);
      await pool.query('INSERT INTO logs (id, message) VALUES (?, ?)', [
        'log_' + Date.now(), `Booking #${bookingId} marked OUT FOR DELIVERY by rider ${user.email}`
      ]);

      return sendJson(res, { success: true, message: 'Delivery status updated to OUT FOR DELIVERY' });
    }

    // 19. DELIVERY PARTNER — UPDATE DELIVERY STATUS (DELIVERED)
    if (pathname.match(/^\/api\/rider\/deliveries\/[^/]+\/deliver$/) && (req.method === 'PUT' || req.method === 'POST')) {
      if (user.role !== 'DELIVERY_PARTNER' && user.role !== 'HUB_OWNER' && user.role !== 'SUPER_ADMIN') {
        return sendJson(res, { error: 'Forbidden. Authorized rider access required.' }, 403);
      }

      const bookingId = pathname.split('/')[4];
      const [bks] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
      if (bks.length === 0) return sendJson(res, { error: 'Booking not found' }, 404);

      // Verify rider belongs to same hub
      let riderHubId = user.hub_id || user.hubId;
      if (user.role === 'DELIVERY_PARTNER' && riderHubId && bks[0].hub_id !== riderHubId) {
        return sendJson(res, { error: 'Forbidden. Delivery belongs to another hub.' }, 403);
      }

      await pool.query('UPDATE bookings SET status = "DELIVERED", assigned_rider_id = ? WHERE id = ?', [user.id, bookingId]);
      await pool.query('INSERT INTO logs (id, message) VALUES (?, ?)', [
        'log_' + Date.now(), `Booking #${bookingId} marked DELIVERED by rider ${user.email}`
      ]);

      return sendJson(res, { success: true, message: 'Delivery completed successfully.' });
    }

    // 20. NEAREST ELIGIBLE HUB DETERMINATION ENDPOINT
    if ((pathname === '/api/hubs/nearest' || pathname === '/api/hubs/find-eligible') && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { customerLocation, productId, customerLat, customerLng } = body;

      // 1. Fetch active hubs
      const [allHubs] = await pool.query('SELECT * FROM hubs WHERE status = "ACTIVE"');
      if (allHubs.length === 0) {
        return sendJson(res, { available: false, message: 'No active equipment hubs available.' }, 404);
      }

      // 2. Filter hubs capable of fulfilling order (must have product in stock)
      let eligibleHubs = [];
      if (productId) {
        const [prods] = await pool.query('SELECT hub_id, available_quantity, status FROM products WHERE (id = ? OR name LIKE ?) AND status = "ACTIVE" AND available_quantity > 0', [productId, `%${productId}%`]);
        const stockHubIds = new Set(prods.map(p => p.hub_id));
        eligibleHubs = allHubs.filter(h => stockHubIds.has(h.id));
      } else {
        eligibleHubs = allHubs;
      }

      if (eligibleHubs.length === 0) {
        return sendJson(res, { available: false, message: 'Product is currently unavailable at nearest eligible hubs.' }, 200);
      }

      // 3. Calculate distance between Customer location and eligible hubs
      function haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      }

      let nearestHub = eligibleHubs[0];
      let minDistanceKm = 999999;

      if (customerLat && customerLng) {
        for (const h of eligibleHubs) {
          const lat = h.latitude ? Number(h.latitude) : 22.5726; // Default Kolkata coords if unassigned
          const lng = h.longitude ? Number(h.longitude) : 88.3639;
          const dist = haversineDistance(Number(customerLat), Number(customerLng), lat, lng);
          if (dist < minDistanceKm) {
            minDistanceKm = dist;
            nearestHub = h;
          }
        }
      } else if (customerLocation) {
        // String similarity / exact match fallback
        const locLower = String(customerLocation).toLowerCase();
        for (const h of eligibleHubs) {
          const hubLoc = String(h.location || h.address || '').toLowerCase();
          if (hubLoc.includes(locLower) || locLower.includes(hubLoc)) {
            nearestHub = h;
            minDistanceKm = 2.5; // Direct neighborhood match
            break;
          }
        }
        if (minDistanceKm === 999999) minDistanceKm = 5.0; // Default estimate
      }

      return sendJson(res, {
        success: true,
        available: true,
        nearestHub: {
          id: nearestHub.id,
          name: nearestHub.name,
          location: nearestHub.location,
          address: nearestHub.address
        },
        distanceKm: Math.round(minDistanceKm * 10) / 10
      });
    }

    return sendJson(res, { error: 'Endpoint not found' }, 404);
  } catch (err) {
    console.error('API Error:', err);
    return sendJson(res, { error: 'Internal server error: ' + err.message }, 500);
  }
}
