# MicroStore - Scalable E-Commerce Platform

A modern, full-stack e-commerce platform built with microservices architecture.

![MicroStore](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green.svg)

> **Live Demo:** [https://scalable-ecommerce-microservices.vercel.app](https://scalable-ecommerce-microservices.vercel.app)
> **Live Backend API:** [https://microstore-backend-service.onrender.com](https://microstore-backend-service.onrender.com)

## 🛍️ Features

### Customer Facing
- **Browse Products** - View catalog with categories, filters, and search
- **Shopping Cart** - Add, update, and remove items
- **Secure Checkout** - Order placement with payment simulation
- **Order History** - Track past orders
- **User Profiles** - Manage account settings

### Authentication
- **Clerk Integration** - Secure OAuth with Google, Email/Password
- **Protected Routes** - Cart, checkout, profile require login
- **Role-Based Access** - Admin-only product management

### Technical
- **Mock Mode** - Works offline using FakeStoreAPI
- **Real Backend** - MongoDB + Express when deployed
- **Admin Controls** - Product CRUD, order status management

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, React Router |
| **Authentication** | Clerk |
| **Backend** | Node.js, Express |
| **Database** | MongoDB (Mongoose) |
| **Styling** | Vanilla CSS (Custom Design System) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (local or Atlas) - optional for mock mode

### Local Development

```bash
# Clone repository
git clone https://github.com/Ravi-667/Scalable-Ecommerce-Microservices.git
cd Scalable-Ecommerce-Microservices

# Frontend (runs with mock data by default)
cd frontend
npm install
npm run dev
# Open http://localhost:5173

# Backend (optional - for real data)
cd ../backend
npm install
# Create .env file (see below)
npm run dev
```

### Environment Variables

**Frontend** (`frontend/.env.local`):
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_USE_MOCKS=false              # Set to 'false' to use real backend
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`backend/.env`):
```env
JWT_SECRET=your-secure-secret-key-min-32-characters
MONGO_URI=mongodb://localhost:27017/microstore
PORT=5000
```

## 📦 Deployment

### Recommended Stack

| Component | Platform | Why |
|-----------|----------|-----|
| **Frontend** | [Vercel](https://vercel.com) | Free, fast, automatic deploys |
| **Backend** | [Render](https://render.com) | Free tier, easy Node.js hosting |
| **Database** | [MongoDB Atlas](https://mongodb.com/atlas) | Free 512MB cluster |
| **Auth** | [Clerk](https://clerk.com) | Already integrated |

### Step-by-Step Deployment

#### 1. Database (MongoDB Atlas)
1. Create free account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create new cluster (M0 Free Tier)
3. Create database user with password
4. Add `0.0.0.0/0` to Network Access (or specific IPs)
5. Copy connection string: `mongodb+srv://user:pass@cluster.mongodb.net/microstore`

#### 2. Backend (Render)
1. Push code to GitHub
2. Create account at [render.com](https://render.com)
3. New → Web Service → Connect your repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `JWT_SECRET`: Your secure secret
     - `MONGO_URI`: Atlas connection string
     - `PORT`: `5000`
5. Deploy and note the URL (e.g., `https://your-app.onrender.com`)

#### 3. Frontend (Vercel)
1. Create account at [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Environment Variables**:
     - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk key
     - `VITE_USE_MOCKS`: `false`
     - `VITE_API_URL`: Your Render backend URL + `/api`
4. Deploy!

#### 4. Clerk Setup
1. Go to [clerk.com](https://clerk.com) → Your Application
2. Add your Vercel domain to **Allowed Origins**
3. Configure OAuth providers (Google, etc.)

### Alternative Platforms

| Platform | Best For |
|----------|----------|
| [Railway](https://railway.app) | All-in-one (backend + MongoDB) |
| [Fly.io](https://fly.io) | Global edge deployment |
| [DigitalOcean App Platform](https://digitalocean.com) | More control |
| [Netlify](https://netlify.com) | Frontend alternative to Vercel |

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend E2E tests
cd frontend
npm run test:e2e
```

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config.js        # Centralized configuration
│   │   ├── middleware/      # Auth, admin middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API endpoints
│   │   └── utils/           # Helpers
│   └── index.js             # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── services/        # API client
│   │   └── styles/          # CSS
│   └── vite.config.js
└── docker-compose.yml       # Local dev with Docker
```

## 🔐 Security Notes

- Never commit `.env` files with secrets
- Use environment variables on hosting platforms
- JWT secrets should be 32+ characters
- MongoDB passwords should be unique per environment
- Enable IP whitelisting on MongoDB Atlas for production

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

Made with ❤️ by [Ravi Keservani](https://github.com/Ravi-667)