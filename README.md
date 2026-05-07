# ❄️ Cold Storage Management System

A full-stack web application for managing cold storage operations — including inward/outward entries, stock tracking, billing, and analytics.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Cloud) |
| Auth | JWT + bcryptjs |
| Styling | Vanilla CSS |

## 🔐 Default Login

```
Email:    admin@coldstorage.com
Password: Admin@123
```

## 📦 Features

- ✅ Inward Entry Management
- ✅ Outward Entry Management
- ✅ Stock Tracking
- ✅ Billing & PDF Export
- ✅ Analytics Dashboard
- ✅ Role-based Access (Admin / Staff)
- ✅ Multi-language Support (i18n)
- ✅ QR Code Generation
- ✅ Excel & PDF Reports

## 🛠️ Local Setup

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (backend/.env)
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

## 🌐 Deployment

- **Frontend** → Vercel
- **Backend** → Vercel (serverless)
- **Database** → MongoDB Atlas
