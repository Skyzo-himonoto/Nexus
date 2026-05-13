import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(email: string, otp: string, name?: string): Promise<boolean> {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Verifikasi Email - Nexus Pedia</title>
        <style>
          body { font-family: 'Inter', sans-serif; background: #0a0a0a; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .card { background: linear-gradient(135deg, #1a1a2e, #0a0a0a); border-radius: 20px; padding: 40px; border: 1px solid rgba(168,85,247,0.2); }
          .logo { text-align: center; margin-bottom: 30px; }
          .logo-text { font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #a855f7, #06b6d4); -webkit-background-clip: text; background-clip: text; color: transparent; }
          h2 { color: white; text-align: center; margin-bottom: 20px; }
          p { color: #9ca3af; text-align: center; margin-bottom: 30px; line-height: 1.6; }
          .otp-code { background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(6,182,212,0.2)); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px; }
          .otp-digits { font-size: 36px; font-weight: bold; letter-spacing: 8px; background: linear-gradient(135deg, #a855f7, #06b6d4); -webkit-background-clip: text; background-clip: text; color: transparent; font-family: monospace; }
          .footer { text-align: center; color: #4b5563; font-size: 12px; margin-top: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #a855f7, #06b6d4); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">
              <span class="logo-text">✨ Nexus Pedia</span>
            </div>
            <h2>Verifikasi Email Anda</h2>
            <p>Halo ${name || 'Pengguna'},<br>Gunakan kode OTP berikut untuk memverifikasi email Anda di Nexus Pedia.</p>
            <div class="otp-code">
              <div class="otp-digits">${otp}</div>
            </div>
            <p style="text-align: center;">Kode ini berlaku selama <strong>10 menit</strong>.<br>Jangan bagikan kode ini kepada siapa pun.</p>
            <div class="footer">
              <p>© 2024 Nexus Pedia. Modern Payment Infrastructure for Developers.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Nexus Pedia" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verifikasi Email - Nexus Pedia',
      html,
    });

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendTransactionEmail(
  email: string, 
  type: 'payment_success' | 'withdraw_success' | 'balance_released',
  data: any
): Promise<boolean> {
  const titles = {
    payment_success: '✅ Pembayaran Berhasil',
    withdraw_success: '💸 Penarikan Dana Berhasil',
    balance_released: '💰 Saldo Telah Ditambah',
  };

  const messages = {
    payment_success: `Pembayaran sebesar Rp ${data.amount?.toLocaleString()} telah berhasil dan sedang dalam masa holding 24 jam.`,
    withdraw_success: `Penarikan dana sebesar Rp ${data.amount?.toLocaleString()} telah diproses dan akan dikirim ke rekening Anda.`,
    balance_released: `Saldo sebesar Rp ${data.amount?.toLocaleString()} telah dirilis ke saldo tersedia Anda.`,
  };

  try {
    await transporter.sendMail({
      from: `"Nexus Pedia" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: titles[type],
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0a;">
          <div style="background: linear-gradient(135deg, #1a1a2e, #0a0a0a); border-radius: 20px; padding: 40px; border: 1px solid rgba(168,85,247,0.2);">
            <h2 style="color: white; text-align: center;">${titles[type]}</h2>
            <p style="color: #9ca3af; text-align: center; margin: 20px 0;">${messages[type]}</p>
            <div style="background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(6,182,212,0.2)); border-radius: 12px; padding: 20px; text-align: center;">
              <span style="font-size: 24px; font-weight: bold; color: white;">Rp ${data.amount?.toLocaleString()}</span>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #06b6d4); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Lihat Dashboard</a>
            </div>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending transaction email:', error);
    return false;
  }
}
