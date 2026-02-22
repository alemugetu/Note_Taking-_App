# Note Taking App - Backend Server

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account (for file uploads)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start development server:

```bash
npm run dev
```

## 📁 Project Structure

```
server/
├── config/          # Configuration files
│   ├── db.js       # MongoDB connection
│   └── cloudinary.js # Cloudinary setup
├── models/          # Database models
├── routes/          # API routes
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── utils/           # Utility functions
├── .env            # Environment variables
└── server.js       # Main server file
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Notes

- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `GET /api/notes/:id` - Get single note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Notebooks

- `GET /api/notebooks` - Get all notebooks
- `POST /api/notebooks` - Create notebook

### Tags

- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create tag

## 🌐 Environment Variables

See `.env.example` for required environment variables.

## 📝 Next Steps

1. Install dependencies
2. Setup MongoDB Atlas
3. Configure Cloudinary
4. Run the server
