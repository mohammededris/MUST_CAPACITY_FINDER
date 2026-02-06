#!/bin/bash

# Quick Deploy Script for MUST Capacity Finder
# Run this script on your Azure VM after initial setup

set -e

echo "========================================="
echo "MUST Capacity Finder - Quick Deploy"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "server/package.json" ] || [ ! -f "client/package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    echo "   Expected: /var/www/must-capacity-finder"
    exit 1
fi

# Check for .env file
if [ ! -f "server/.env" ]; then
    echo "❌ Error: server/.env file not found!"
    echo "   Copy server/.env.example to server/.env and fill in your values"
    echo "   Required: MONGO_URI, FIREBASE_SERVICE_ACCOUNT, Firebase client config, ALLOWED_ORIGINS"
    exit 1
fi

echo "✅ Configuration files found"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install --production
cd ..
echo "✅ Backend dependencies installed"
echo ""

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
cd client
npm install
echo "✅ Frontend dependencies installed"
echo ""

echo "🔨 Building frontend..."
npm run build
echo "✅ Frontend built successfully"
cd ..
echo ""

# Setup Nginx if not already done
if [ ! -f "/etc/nginx/sites-enabled/must-capacity-finder" ]; then
    echo "🔧 Setting up Nginx..."
    sudo cp scripts/nginx.conf /etc/nginx/sites-available/must-capacity-finder
    sudo ln -s /etc/nginx/sites-available/must-capacity-finder /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
    echo "✅ Nginx configured"
    echo ""
fi

# Start/Restart application with PM2
echo "🚀 Starting application..."

# Check if app is already running
if pm2 list | grep -q "must-capacity-api"; then
    echo "   Restarting existing application..."
    pm2 restart must-capacity-api
else
    echo "   Starting new application..."
    pm2 start server/index.js --name must-capacity-api
    pm2 save
fi

echo "✅ Application started"
echo ""

# Show status
echo "📊 Application Status:"
pm2 list
echo ""

# Test the backend
echo "🧪 Testing backend health..."
sleep 2
HEALTH_CHECK=$(curl -s http://localhost:5000/health || echo "failed")
if [[ $HEALTH_CHECK == *"healthy"* ]] || [[ $HEALTH_CHECK == *"ok"* ]]; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️  Backend health check returned: $HEALTH_CHECK"
    echo "   Check logs with: pm2 logs must-capacity-api"
fi
echo ""

echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "Your application should be accessible at:"
echo "http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_VM_IP')"
echo ""
echo "Useful commands:"
echo "  pm2 logs must-capacity-api  - View application logs"
echo "  pm2 restart must-capacity-api  - Restart application"
echo "  pm2 status  - Check application status"
echo "  sudo systemctl status nginx  - Check web server status"
echo ""
