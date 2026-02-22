# Backend Setup Guide

## ✅ Phase 1 - Day 1-2: COMPLETED

### What We've Built:

- ✅ Server directory structure
- ✅ Express server setup
- ✅ Environment configuration
- ✅ MongoDB connection setup
- ✅ Cloudinary configuration
- ✅ Utility functions (JWT, error handling)
- ✅ All dependencies installed

### Server Structure:

```
server/
├── config/
│   ├── db.js              # MongoDB connection
│   └── cloudinary.js      # Cloudinary setup
├── controllers/           # (Ready for next phase)
├── middleware/            # (Ready for next phase)
├── models/                # (Ready for next phase)
├── routes/                # (Ready for next phase)
├── utils/
│   ├── errorHandler.js    # Custom error class
│   └── generateToken.js   # JWT token generator
├── .env                   # Environment variables
├── .env.example           # Environment template
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies
├── README.md             # Documentation
└── server.js             # Main server file
```

## 🚀 Server Status

**Current Status**: ✅ Running on http://localhost:5000

**Test Endpoints**:

- GET http://localhost:5000 → API info
- GET http://localhost:5000/api/health → Health check

## 📋 Next Steps (Phase 1 - Day 3-4)

### MongoDB Atlas Setup:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create new cluster (M0 Free tier)
4. Create database user
5. Whitelist IP address (0.0.0.0/0 for development)
6. Get connection string
7. Update MONGODB_URI in server/.env

### Cloudinary Setup (for later):

1. Go to https://cloudinary.com
2. Create free account
3. Get credentials from dashboard
4. Update .env with:
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET

## 🔧 Running the Server

### Development mode:

```bash
cd server
npm run dev
```

### Run both frontend and backend:

```bash
# From root directory
npm run dev:all
```

## 📝 Environment Variables

Current configuration in `server/.env`:

- PORT=5000
- NODE_ENV=development
- MONGODB_URI=mongodb://localhost:27017/notesdb (needs MongoDB Atlas URL)
- JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
- CLIENT_URL=http://localhost:5173

## ⚠️ Important Notes

1. **MongoDB**: Currently set to local MongoDB. You need to:
   - Install MongoDB locally, OR
   - Setup MongoDB Atlas (recommended)

2. **Security**: Change JWT_SECRET before production

3. **CORS**: Configured for http://localhost:5173 (Vite default)

## 🎯 Phase 1 Progress

- [x] Backend initialization
- [x] Server directory structure
- [x] Dependencies installed
- [x] Basic server running
- [ ] MongoDB Atlas setup (next)
- [ ] Authentication system (next)
- [ ] Database models (next)
- [ ] API routes (next)
