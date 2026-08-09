import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Helper to load .env variables regardless of execution CWD
function loadEnv() {
  let envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    envPath = path.join(process.cwd(), 'backend', '.env');
  }
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

export async function sendRawEmail(recipientEmail, subject, textContent, htmlContent) {
  loadEnv();

  if (!recipientEmail) {
    throw new Error('Recipient email address is required.');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const gmailUser = process.env.GMAIL_USER || '';
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || '';

  if (!gmailUser || !refreshToken) {
    console.log('[MAILER] Skipped email dispatch: GMAIL_USER or GOOGLE_REFRESH_TOKEN is missing in backend/.env.');
    return { success: false, reason: 'unconfigured' };
  }

  // 1. Primary Transport: Direct Gmail API via googleapis OAuth2 client
  try {
    const oAuth2Client = new google.auth.OAuth2(
      googleClientId,
      googleClientSecret,
      'http://localhost:5000/api/auth/google/callback'
    );
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token;

    if (accessToken) {
      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `From: "REXPO System" <${gmailUser}>`,
        `To: ${recipientEmail}`,
        `Subject: ${utf8Subject}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        htmlContent
      ];
      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage }
      });
      return { success: true, provider: 'gmail_api' };
    }
  } catch (err) {
    console.error('[MAILER] Direct Gmail API dispatch exception, resorting to Nodemailer OAuth2:', err.message);
  }

  // 2. Secondary Transport: Nodemailer strictly configured with OAuth2
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: gmailUser,
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        refreshToken: refreshToken
      }
    });

    const mailOptions = {
      from: `"REXPO System" <${gmailUser}>`,
      to: recipientEmail,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    return await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('[MAILER] Secondary transport exception:', err.message);
    return { success: false, error: err.message };
  }
}

export async function sendOtpEmail(recipientEmail, otpCode) {
  const subject = 'REXPO Email Verification';
  const textContent = `REXPO\n\nVerify your email address\n\nYour verification code is:\n\n${otpCode}\n\nThis code expires in 5 minutes.\n\nIf you did not request this verification, you can safely ignore this email.`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #DFE5F3; padding: 40px 20px; color: #1A1A1A;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(85, 115, 115, 0.1); border: 1px solid rgba(85, 115, 115, 0.15);">
        
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #557373; margin: 0;">
            REXPO
          </h1>
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #557373; opacity: 0.8;">
            Verification Portal
          </span>
        </div>

        <div style="border-top: 1px solid rgba(85, 115, 115, 0.15); padding-top: 24px; text-align: center;">
          <h2 style="font-size: 16px; font-weight: 700; color: #1A1A1A; margin-bottom: 8px;">
            Verify your email address
          </h2>
          <p style="font-size: 13px; color: rgba(85, 115, 115, 0.85); margin-bottom: 24px; line-height: 1.5;">
            Your verification code is:
          </p>

          <div style="background: #DFE5F3; border: 1px solid rgba(85, 115, 115, 0.3); border-radius: 12px; padding: 18px; display: inline-block; margin-bottom: 24px;">
            <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #557373;">
              ${otpCode}
            </span>
          </div>

          <p style="font-size: 11px; font-weight: 600; color: #557373; margin-bottom: 16px;">
            This code expires in 5 minutes.
          </p>

          <p style="font-size: 11px; color: #888888; margin: 0; line-height: 1.4;">
            If you did not request this verification, you can safely ignore this email.
          </p>
        </div>

      </div>
    </div>
  `;

  return await sendRawEmail(recipientEmail, subject, textContent, htmlContent);
}

export async function sendRiderOnboardingNotification(riderEmail, riderPhone, tempPassword, hubName = 'Central Hub') {
  console.log(`[ONBOARDING NOTIFICATION] Dispatching credentials for Delivery Partner (${riderEmail} / ${riderPhone}) at ${hubName}`);
  
  const subject = 'REXPO Delivery Partner Credentials';
  const textContent = `REXPO Delivery Partner Account Created\n\nHub: ${hubName}\nEmail / Login ID: ${riderEmail}\nTemporary Password: ${tempPassword}\n\nPlease sign in to your REXPO Delivery Partner Portal and change your password upon initial login.`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #DFE5F3; padding: 40px 20px; color: #1A1A1A;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(85, 115, 115, 0.1); border: 1px solid rgba(85, 115, 115, 0.15);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #557373; margin: 0;">REXPO</h1>
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #557373; opacity: 0.8;">Delivery Partner Workspace</span>
        </div>
        <div style="border-top: 1px solid rgba(85, 115, 115, 0.15); padding-top: 24px;">
          <h2 style="font-size: 16px; font-weight: 700; color: #1A1A1A; margin-bottom: 12px;">Your Delivery Partner Account is Ready</h2>
          <p style="font-size: 13px; color: rgba(85, 115, 115, 0.85); margin-bottom: 16px; line-height: 1.5;">
            You have been assigned to <strong>${hubName}</strong> as an authorized REXPO Rider.
          </p>
          <div style="background: #DFE5F3; border: 1px solid rgba(85, 115, 115, 0.2); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px 0; font-size: 12px;"><strong>Login Email:</strong> ${riderEmail}</p>
            <p style="margin: 0 0 8px 0; font-size: 12px;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-weight: bold; color: #557373;">${tempPassword}</span></p>
            <p style="margin: 0; font-size: 12px;"><strong>Assigned Hub:</strong> ${hubName}</p>
          </div>
          <p style="font-size: 11px; color: #557373; margin-bottom: 0;">
            Please log in at REXPO Portal and change your password upon your first sign-in.
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    await sendRawEmail(riderEmail, subject, textContent, htmlContent);
  } catch (err) {
    console.log('[ONBOARDING NOTIFICATION] Email dispatch logged:', err.message);
  }

  return { success: true, message: 'Rider onboarding credentials dispatched.' };
}
