# 🚀 Azure VM Deployment Guide - Simple & Clear

This guide will help you deploy MUST Capacity Finder on an Azure VM.

## 📋 What You Need

1. Azure account
2. SSH key or password for VM access
3. MongoDB connection string (from MongoDB Atlas)
4. Firebase service account JSON file

## Step 1: Create Azure VM

1. **Go to Azure Portal** (https://portal.azure.com)

2. **Create a new Virtual Machine:**
   - Click "Create a resource" > "Virtual Machine"
   - **Basics:**
     - Resource Group: Create new `must-capacity-rg`
     - VM Name: `must-capacity-vm`
     - Region: Choose closest to your users
     - Image: **Ubuntu Server 22.04 LTS**
     - Size: **Standard B2s** (2 vCPUs, 4 GB RAM) - Minimum recommended
   - **Administrator account:**
     - Authentication: SSH public key (or password)
     - Username: `azureuser`
   - **Inbound port rules:**
     - Select: SSH (22), HTTP (80), HTTPS (443)

3. **Review + Create** > Wait for deployment

4. **Note your VM's Public IP address** (you'll see it in the VM overview page)

## Step 2: Connect to Your VM

Open PowerShell or Terminal:

```bash
ssh azureuser@YOUR_VM_PUBLIC_IP
```

## Step 3: Setup VM Software

Once connected to your VM, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# Install Nginx, Git, PM2
sudo apt install -y nginx git
sudo npm install -g pm2

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create app directory
sudo mkdir -p /var/www/must-capacity-finder
sudo chown -R $USER:$USER /var/www/must-capacity-finder
```

## Step 4: Upload Your Application

**From your local machine**, upload the code to your VM:

```bash
# Using SCP (replace YOUR_VM_IP with your actual IP)
scp -r "c:/Users/Mohammed Nasser/Desktop/Any Labs/MUST_CAPACITY_FINDER"/* azureuser@YOUR_VM_IP:/var/www/must-capacity-finder/
```

**OR** use Git if you have your code in a repository:

```bash
# On your VM
cd /var/www/must-capacity-finder
git clone YOUR_REPO_URL .
```

## Step 5: Configure Environment Variables

```bash
cd /var/www/must-capacity-finder

# Create backend .env file
nano server/.env
```

**Paste this and fill in YOUR values from Firebase Console:**

```env
NODE_ENV=production
PORT=5000

# MongoDB (from MongoDB Atlas)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Firebase Admin SDK - single line JSON (from Firebase Console > Service Accounts)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"..."}

# Firebase Client Config (from Firebase Console > Project Settings > Your apps)
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123

# CORS - Replace with your VM's actual public IP
ALLOWED_ORIGINS=http://YOUR_VM_PUBLIC_IP

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

**Note:** Get Firebase values from Firebase Console:

- Admin SDK: Project Settings > Service Accounts > Generate new private key
- Client Config: Project Settings > Your apps > Config

## Step 6: Install Dependencies and Build

```bash
cd /var/www/must-capacity-finder

# Install backend dependencies
cd server
npm install --production
cd ..

# Install and build frontend
cd client
npm install
npm run build
cd ..
```

## Step 7: Setup Nginx

```bash
# Copy nginx configuration
sudo cp scripts/nginx.conf /etc/nginx/sites-available/must-capacity-finder

# Enable the site
sudo ln -s /etc/nginx/sites-available/must-capacity-finder /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## Step 8: Start the Application with PM2

```bash
cd /var/www/must-capacity-finder

# Start the backend with PM2
pm2 start server/index.js --name must-capacity-api

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command that PM2 shows you
```

## Step 9: Verify Everything Works

```bash
# Check if backend is running
pm2 status

# Check backend health
curl http://localhost:5000/health

# Check nginx
sudo systemctl status nginx

# Check application logs
pm2 logs must-capacity-api
```

**Open your browser and go to:**

- `http://YOUR_VM_PUBLIC_IP` - Your application should be live!

## 🔧 Useful Commands

### PM2 (Backend Management)

```bash
pm2 status                    # Check app status
pm2 logs must-capacity-api    # View logs
pm2 restart must-capacity-api # Restart app
pm2 stop must-capacity-api    # Stop app
pm2 delete must-capacity-api  # Remove app from PM2
```

### Nginx (Web Server)

```bash
sudo systemctl status nginx   # Check nginx status
sudo systemctl restart nginx  # Restart nginx
sudo nginx -t                 # Test configuration
sudo tail -f /var/log/nginx/error.log  # View error logs
```

### System

```bash
df -h                         # Check disk space
free -h                       # Check memory
top                           # View running processes
```

## 🔄 Updating Your Application

```bash
cd /var/www/must-capacity-finder

# Pull latest changes (if using git)
git pull

# Update backend
cd server
npm install --production
pm2 restart must-capacity-api

# Update frontend
cd ../client
npm install
npm run build

# Restart nginx
sudo systemctl restart nginx
```

## 🌐 Adding a Custom Domain (Optional)

1. **Point your domain to VM's public IP** (in your domain registrar's DNS settings)
   - Add an A record: `@` or `www` → Your VM's Public IP

2. **Update nginx configuration:**

   ```bash
   sudo nano /etc/nginx/sites-available/must-capacity-finder
   ```

   Change `server_name _;` to `server_name yourdomain.com www.yourdomain.com;`

3. **Install SSL Certificate (Let's Encrypt):**

   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

4. **Update environment variables:**
   - Update `ALLOWED_ORIGINS` in `server/.env`
   - Rebuild frontend and restart

## ❗ Troubleshooting

### Application not accessible:

```bash
# Check if port 80 is open
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443

# Check Azure Network Security Group - ensure ports 80, 443 are open
```

### Backend not working:

```bash
pm2 logs must-capacity-api  # Check for errors
pm2 restart must-capacity-api
```

### Database connection issues:

- Verify MongoDB Atlas allows connections from your VM's IP
- Check `MONGO_URI` in `server/.env`

### Firebase authentication issues:

- Verify `FIREBASE_SERVICE_ACCOUNT` is properly formatted (single line JSON)
- Check Firebase console for any API restrictions

## 📞 Need Help?

- **Check logs:** `pm2 logs must-capacity-api`
- **Check nginx logs:** `sudo tail -f /var/log/nginx/error.log`
- **Check system resources:** `htop` or `top`

---

**Your application should now be running on Azure VM! 🎉**
