# 🎓 MUST Capacity Finder

A production-ready web application that helps students monitor course availability at Misr University for Science and Technology (MUST). Students can register for alerts when specific courses have available seats.

## � Deploy to Azure VM (Easiest Option)

**✅ Ready to deploy? [START HERE - DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)**

**Deployment guides:**

- **[Quick Start (5 min)](./QUICKSTART_VM.md)** - Fast deployment
- **[Complete Guide](./AZURE_VM_DEPLOYMENT.md)** - Step-by-step instructions
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Fix common issues

**Other deployment options:**

- [Azure App Service / Containers](./DEPLOYMENT.md) - Alternative Azure deployments

## �📋 Features

- 🔐 **Google Authentication** via Firebase
- 📱 **WhatsApp Notifications** for course availability
- 👤 **User Dashboard** to manage alert requests
- 🛡️ **Rate Limiting** to prevent abuse
- 📊 **Real-time Monitoring** of course capacity
- ⚡ **Production-Ready** with security best practices

## 🏗️ Architecture

### Frontend (React + Vite)

- React 19.2 with React Router
- Firebase Authentication
- Responsive UI
- Environment-based configuration

### Backend (Node.js + Express)

- RESTful API with JWT authentication
- MongoDB for data persistence
- Firebase Admin SDK for auth verification
- Rate limiting and security headers
- Comprehensive logging with Winston
- Health check endpoints

### Database (MongoDB)

- Optimized indexes for performance
- User alert requests storage
- Firestore for user limits configuration

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Firebase project with Authentication enabled

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd MUST_CAPACITY_FINDER
```

2. **Setup Backend**

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

3. **Setup Frontend**

```bash
cd client
npm install
cp .env.example .env
# Edit .env with your Firebase config
npm run dev
```

### Environment Variables

#### Server (.env)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/must_capacity
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
ALLOWED_ORIGINS=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

#### Client (.env)

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 📦 Project Structure

```
MUST_CAPACITY_FINDER/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── config.js      # Configuration
│   │   └── firebase.js    # Firebase setup
│   ├── Dockerfile         # Docker configuration
│   ├── nginx.conf         # Nginx configuration
│   └── package.json
├── server/                # Backend Node.js application
│   ├── models/           # Mongoose models
│   │   └── AlertRequest.js
│   ├── scripts/          # Utility scripts
│   ├── index.js          # Main server file
│   ├── Dockerfile        # Docker configuration
│   ├── web.config        # Azure App Service config
│   └── package.json
├── DEPLOYMENT.md         # Azure deployment guide
├── PRODUCTION_CHECKLIST.md
└── README.md
```

## 🔒 Security Features

- ✅ **Helmet.js** for security headers
- ✅ **Rate limiting** to prevent DDoS
- ✅ **CORS** configuration
- ✅ **Input validation** with express-validator
- ✅ **JWT authentication** via Firebase
- ✅ **Compression** for response optimization
- ✅ **Graceful shutdown** handling
- ✅ **Request logging** with Morgan
- ✅ **Error handling** middleware

## 📊 API Endpoints

### Health Check

```http
GET /health
```

Returns server status and service availability.

### Alert Management

```http
GET /api/alerts              # Get user's alerts
POST /api/alerts             # Create new alert
PUT /api/alerts/:id          # Update alert
```

All endpoints require Firebase authentication token in header:

```
Authorization: Bearer <firebase_id_token>
```

## 🐳 Docker Support

### Build and Run with Docker

**Backend:**

```bash
cd server
docker build -t must-capacity-api .
docker run -p 5000:5000 --env-file .env must-capacity-api
```

**Frontend:**

```bash
cd client
docker build -t must-capacity-web .
docker run -p 80:80 must-capacity-web
```

## ☁️ Azure Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive Azure deployment instructions.

### Quick Deploy to Azure

```bash
# Login to Azure
az login

# Deploy backend
cd server
az webapp up --name must-capacity-api --runtime "NODE:18-lts"

# Deploy frontend
cd client
npm run build
az staticwebapp create --name must-capacity-frontend
```

## 🧪 Testing

### Test Health Endpoint

```bash
curl http://localhost:5000/health
```

### Test API (requires auth token)

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/alerts
```

## 📝 Development

### Start Development Servers

**Backend (with auto-reload):**

```bash
cd server
npm run dev
```

**Frontend (with HMR):**

```bash
cd client
npm run dev
```

### Linting

```bash
cd client
npm run lint
```

## 🔧 Database Indexes

Optimized indexes are automatically created:

- `userId` (single field)
- `createdAt` (single field)
- `stopped` (single field)
- `userId + createdAt` (compound)
- `userId + stopped` (compound)

## 📈 Monitoring

### View Logs (Local)

- Backend logs: `server/combined.log` and `server/error.log`
- Frontend: Browser console

### View Logs (Azure)

```bash
az webapp log tail -g must-capacity-finder-rg -n must-capacity-api
```

### Metrics

- Health endpoint: `/health`
- Application Insights (Azure)
- MongoDB Atlas monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Development Team

## 🙏 Acknowledgments

- Firebase for authentication
- MongoDB Atlas for database hosting
- Azure for cloud hosting
- React and Vite teams

## 📞 Support

For issues and questions:

- Check [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
- Review [DEPLOYMENT.md](./DEPLOYMENT.md)
- Open an issue on GitHub

## 🔄 Updates

- **v1.0.0** (Feb 2026): Initial production release
  - Firebase authentication
  - Alert management system
  - Azure deployment support
  - Production security features

---

**Made with ❤️ for MUST students**
