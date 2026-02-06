# MUST Capacity Finder - Azure Deployment Guide

## 📋 Prerequisites

1. **Azure Account** with an active subscription
2. **Azure CLI** installed ([Download](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
3. **Node.js 18+** installed locally for testing
4. **MongoDB Atlas** account (or Azure Cosmos DB)
5. **Firebase Project** with Admin SDK credentials

## 🚀 Deployment Options

### Option 1: Azure App Service (Recommended for Node.js)

#### Backend Deployment

1. **Login to Azure CLI**

```bash
az login
```

2. **Create Resource Group**

```bash
az group create --name must-capacity-finder-rg --location eastus
```

3. **Create App Service Plan**

```bash
az appservice plan create \
  --name must-capacity-plan \
  --resource-group must-capacity-finder-rg \
  --sku B1 \
  --is-linux
```

4. **Create Web App for Backend**

```bash
az webapp create \
  --resource-group must-capacity-finder-rg \
  --plan must-capacity-plan \
  --name must-capacity-api \
  --runtime "NODE|18-lts"
```

5. **Configure Environment Variables**

```bash
# Set Node environment
az webapp config appsettings set \
  --resource-group must-capacity-finder-rg \
  --name must-capacity-api \
  --settings NODE_ENV=production

# Set MongoDB URI
az webapp config appsettings set \
  --resource-group must-capacity-finder-rg \
  --name must-capacity-api \
  --settings MONGO_URI="your_mongodb_connection_string"

# Set Firebase Service Account (paste entire JSON as single line)
az webapp config appsettings set \
  --resource-group must-capacity-finder-rg \
  --name must-capacity-api \
  --settings FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

# Set CORS allowed origins
az webapp config appsettings set \
  --resource-group must-capacity-finder-rg \
  --name must-capacity-api \
  --settings ALLOWED_ORIGINS="https://your-frontend.azurestaticapps.net"

# Set rate limiting (optional)
az webapp config appsettings set \
  --resource-group must-capacity-finder-rg \
  --name must-capacity-api \
  --settings RATE_LIMIT_WINDOW_MS=900000 RATE_LIMIT_MAX_REQUESTS=100 LOG_LEVEL=info
```

6. **Deploy Backend Code**

```bash
cd server
zip -r deploy.zip . -x "*.git*" "node_modules/*" "*.log"
az webapp deployment source config-zip \
  --resource-group must-capacity-finder-rg \
  --name must-capacity-api \
  --src deploy.zip
```

7. **Enable Logs**

```bash
az webapp log config \
  --resource-group must-capacity-finder-rg \
  --name must-capacity-api \
  --application-logging filesystem \
  --detailed-error-messages true \
  --failed-request-tracing true
```

8. **View Logs**

```bash
az webapp log tail \
  --resource-group must-capacity-finder-rg \
  --name must-capacity-api
```

#### Frontend Deployment (Azure Static Web Apps)

1. **Create Static Web App**

```bash
az staticwebapp create \
  --name must-capacity-frontend \
  --resource-group must-capacity-finder-rg \
  --location eastus2
```

2. **Configure Client Environment**

Create `.env.production` in client folder:

```env
VITE_API_URL=https://must-capacity-api.azurewebsites.net
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

3. **Build and Deploy Frontend**

```bash
cd client
npm install
npm run build

# Deploy to Azure Static Web Apps
az staticwebapp upload \
  --name must-capacity-frontend \
  --resource-group must-capacity-finder-rg \
  --source ./dist
```

### Option 2: Docker Containers (Azure Container Instances)

#### Build and Push Images

1. **Create Azure Container Registry**

```bash
az acr create \
  --resource-group must-capacity-finder-rg \
  --name mustcapacityregistry \
  --sku Basic
```

2. **Login to ACR**

```bash
az acr login --name mustcapacityregistry
```

3. **Build and Push Backend**

```bash
cd server
docker build -t mustcapacityregistry.azurecr.io/backend:latest .
docker push mustcapacityregistry.azurecr.io/backend:latest
```

4. **Build and Push Frontend**

```bash
cd ../client
docker build -t mustcapacityregistry.azurecr.io/frontend:latest .
docker push mustcapacityregistry.azurecr.io/frontend:latest
```

5. **Deploy Container Instances**

```bash
# Backend
az container create \
  --resource-group must-capacity-finder-rg \
  --name backend-api \
  --image mustcapacityregistry.azurecr.io/backend:latest \
  --cpu 1 \
  --memory 1 \
  --registry-username mustcapacityregistry \
  --registry-password $(az acr credential show --name mustcapacityregistry --query "passwords[0].value" -o tsv) \
  --dns-name-label must-capacity-api \
  --ports 5000 \
  --environment-variables \
    NODE_ENV=production \
    MONGO_URI="your_connection_string" \
    ALLOWED_ORIGINS="https://your-frontend-url"

# Frontend
az container create \
  --resource-group must-capacity-finder-rg \
  --name frontend-web \
  --image mustcapacityregistry.azurecr.io/frontend:latest \
  --cpu 0.5 \
  --memory 0.5 \
  --registry-username mustcapacityregistry \
  --registry-password $(az acr credential show --name mustcapacityregistry --query "passwords[0].value" -o tsv) \
  --dns-name-label must-capacity-web \
  --ports 80
```

## 🔒 Security Checklist

- [ ] **Environment Variables**: Never commit `.env` files
- [ ] **Firebase Credentials**: Use Azure Key Vault for secrets
- [ ] **MongoDB**: Enable IP whitelisting and authentication
- [ ] **CORS**: Configure allowed origins to only your frontend domain
- [ ] **HTTPS**: Azure App Service provides free SSL certificates
- [ ] **Rate Limiting**: Configured and tested
- [ ] **Firewall**: Configure Azure network security groups if needed

## 📊 Post-Deployment Testing

1. **Health Check**

```bash
curl https://must-capacity-api.azurewebsites.net/health
```

Expected response:

```json
{
  "status": "OK",
  "timestamp": "2026-02-05T...",
  "uptime": 123.45,
  "database": "Connected",
  "firebase": "Connected",
  "environment": "production"
}
```

2. **Test API Endpoints**

```bash
# Test authentication (should return 401)
curl https://must-capacity-api.azurewebsites.net/api/alerts

# Test CORS
curl -H "Origin: https://your-frontend.azurestaticapps.net" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS https://must-capacity-api.azurewebsites.net/api/alerts
```

3. **Check Logs**

```bash
az webapp log tail --resource-group must-capacity-finder-rg --name must-capacity-api
```

## 🔧 MongoDB Atlas Setup

1. **Create MongoDB Atlas Cluster**
   - Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free M0 cluster
   - Choose Azure as cloud provider (same region as your app)

2. **Configure Network Access**
   - Go to "Network Access" in Atlas
   - Add IP Address: `0.0.0.0/0` (Azure App Service uses dynamic IPs)
   - Or use Azure Private Link for better security

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Use this as `MONGO_URI` environment variable

## 🔥 Firebase Setup

1. **Generate Service Account Key**
   - Go to Firebase Console → Project Settings
   - Navigate to "Service Accounts"
   - Click "Generate new private key"
   - Save the JSON file securely

2. **Convert to Single Line**

```bash
# Linux/Mac
cat firebase-key.json | jq -c

# Windows PowerShell
Get-Content firebase-key.json | ConvertFrom-Json | ConvertTo-Json -Compress
```

3. **Add to Azure App Settings**
   - Copy the single-line JSON
   - Add as `FIREBASE_SERVICE_ACCOUNT` environment variable

## 📈 Monitoring & Maintenance

### Enable Application Insights

```bash
az monitor app-insights component create \
  --app must-capacity-insights \
  --location eastus \
  --resource-group must-capacity-finder-rg

# Link to Web App
az webapp config appsettings set \
  --resource-group must-capacity-finder-rg \
  --name must-capacity-api \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=$(az monitor app-insights component show --app must-capacity-insights --resource-group must-capacity-finder-rg --query instrumentationKey -o tsv)
```

### Set Up Alerts

```bash
# Alert on high error rate
az monitor metrics alert create \
  --name high-error-rate \
  --resource-group must-capacity-finder-rg \
  --scopes /subscriptions/{subscription-id}/resourceGroups/must-capacity-finder-rg/providers/Microsoft.Web/sites/must-capacity-api \
  --condition "avg Http5xx > 10" \
  --description "Alert when 5xx errors exceed 10"
```

### Backup Strategy

- **MongoDB**: Enable Atlas automatic backups
- **Configuration**: Store in version control (Git)
- **Secrets**: Use Azure Key Vault

## 🐛 Troubleshooting

### Backend not responding

```bash
# Check if app is running
az webapp show --resource-group must-capacity-finder-rg --name must-capacity-api --query state

# Restart app
az webapp restart --resource-group must-capacity-finder-rg --name must-capacity-api

# Check logs
az webapp log download --resource-group must-capacity-finder-rg --name must-capacity-api
```

### MongoDB connection failed

- Verify IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure password is URL-encoded
- Test connection locally first

### CORS errors

- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check browser console for actual origin
- Ensure no trailing slashes in origin URLs

## 💰 Cost Estimation (Monthly)

- **App Service B1**: ~$13/month
- **MongoDB Atlas M0**: Free
- **Static Web Apps**: Free tier (100GB bandwidth)
- **Total**: ~$13-20/month

## 📚 Additional Resources

- [Azure App Service Docs](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Static Web Apps Docs](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
