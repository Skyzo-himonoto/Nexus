# Nexus Pedia - Payment Gateway Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-cyan?logo=tailwindcss" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Prisma-5.7-blue?logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Upstash-Redis-red?logo=redis" alt="Redis">
</p>

<p align="center">
  <strong>✨ models Payment integration ✨</strong>
</p>

<p align="center">
  Nexus Pedia adalah platform payment gateway modern yang memungkinkan developer menerima pembayaran online dengan mudah. 
  Support QRIS, Virtual Account, E-Wallet, Bank Transfer, dan 20+ metode pembayaran lainnya.
</p>

## 📱 Demo & Preview

<p align="center">
  <img src="https://via.placeholder.com/800x450?text=Nexus+Pedia+Dashboard" alt="Dashboard Preview" width="80%">
</p>

## ✨ Features

### 🚀 Core Features
- **🔐 Authentication** - Login dengan Google OAuth, OTP Email Verification
- **💳 Multiple Payment Methods** - QRIS, Virtual Account, E-Wallet, Bank Transfer
- **📊 Merchant Dashboard** - Analytics real-time, grafik transaksi, statistik lengkap
- **🔑 API Key Management** - Generate public/secret key, IP whitelisting
- **🕐 Holding Balance System** - Dana ditahan 24 jam untuk keamanan
- **💸 Withdrawal System** - Tarik saldo dengan fee Rp 3.000
- **📨 Webhook System** - Notifikasi real-time ke endpoint Anda
- **🤖 Bot Integration** - Support WhatsApp, Telegram, Discord bot
- **📈 Analytics** - Grafik transaksi, success rate, revenue tracking
- **🛡️ Security** - Rate limiting, signature validation, audit logs

### 👑 Admin Features
- User management
- Withdrawal request approval/rejection
- Platform analytics & fee income tracking
- System logs & audit trail

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 15, TypeScript, TailwindCSS, Framer Motion, Recharts |
| **Backend** | Next.js API Routes, Prisma ORM |
| **Database** | PostgreSQL (Neon / Supabase) |
| **Authentication** | NextAuth.js, Google OAuth |
| **Realtime** | Pusher / Socket.IO |
| **Rate Limiting** | Upstash Redis |
| **Storage** | Cloudflare R2 |
| **Deployment** | Vercel |

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials
- (Optional) Payment provider accounts (Duitku/Midtrans/Tripay)

### Step by Step

```bash
# 1. Clone repository
git clone https://github.com/your-username/nexus-pedia.git
cd nexus-pedia

# 2. Install dependencies
npm install

# 3. Install shadcn/ui components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input dialog badge toast

# 4. Copy environment variables
cp .env.example .env.local

# 5. Edit .env.local with your credentials
# - DATABASE_URL
# - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET
# - NEXTAUTH_SECRET
# - UPSTASH_REDIS_URL & TOKEN

# 6. Setup database
npx prisma db push
npx prisma generate

# 7. Run development server
npm run dev
