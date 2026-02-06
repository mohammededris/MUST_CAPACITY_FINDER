#!/bin/bash

# MUST Capacity Finder - Azure VM Setup Script
# This script installs all necessary software on Ubuntu 22.04 LTS

set -e  # Exit on any error

echo "========================================="
echo "MUST Capacity Finder - VM Setup"
echo "========================================="
echo ""

# Check if running as root/sudo
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run with sudo: sudo ./setup-vm.sh"
    exit 1
fi

echo "✅ Running as root/sudo"
echo ""

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y
echo "✅ System updated"
echo ""

# Install Node.js 20.x LTS
echo "📦 Installing Node.js 20.x LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version
echo "✅ Node.js installed"
echo ""

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx
echo "✅ Nginx installed and started"
echo ""

# Install Git
echo "📦 Installing Git..."
apt install -y git
git --version
echo "✅ Git installed"
echo ""

# Install PM2 globally
echo "📦 Installing PM2 (Process Manager)..."
npm install -g pm2
pm2 --version
echo "✅ PM2 installed"
echo ""

# Install additional useful tools
echo "📦 Installing additional tools..."
apt install -y curl wget unzip htop ufw
echo "✅ Additional tools installed"
echo ""

# Configure firewall
echo "🔧 Configuring firewall..."
ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw status
echo "✅ Firewall configured"
echo ""

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /var/www/must-capacity-finder
chown -R $SUDO_USER:$SUDO_USER /var/www/must-capacity-finder
echo "✅ Application directory created: /var/www/must-capacity-finder"
echo ""

# Setup log directory
echo "📁 Creating log directory..."
mkdir -p /var/log/must-capacity-finder
chown -R $SUDO_USER:$SUDO_USER /var/log/must-capacity-finder
echo "✅ Log directory created"
echo ""

echo "========================================="
echo "✅ VM Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Upload your application to /var/www/must-capacity-finder"
echo "2. Create .env file in server/ directory"
echo "3. Install dependencies: npm install in server/ and client/"
echo "4. Build frontend: npm run build in client/"
echo "5. Configure Nginx (copy scripts/nginx.conf)"
echo "6. Start backend with PM2"
echo ""
echo "Installed Software:"
echo "- Node.js: $(node --version)"
echo "- npm: $(npm --version)"
echo "- Nginx: $(nginx -v 2>&1)"
echo "- PM2: $(pm2 --version)"
echo "- Git: $(git --version)"
echo ""
