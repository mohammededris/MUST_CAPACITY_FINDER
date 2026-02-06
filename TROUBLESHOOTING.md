# 🔧 Azure VM Deployment - Troubleshooting Guide

Quick solutions for common deployment issues.

## 🚫 Cannot Access Application (HTTP)

### Problem: Browser shows "Can't reach this site" or "Connection timeout"

**Solution 1: Check Azure Network Security Group (NSG)**

```bash
# On Azure Portal:
1. Go to your VM
2. Click "Networking" in left menu
3. Check "Inbound port rules"
4. Ensure these ports are open:
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 22 (SSH)
```

**Solution 2: Check VM Firewall**

```bash
# On your VM:
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
sudo ufw reload
```

**Solution 3: Check Nginx is Running**

```bash
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t  # Test configuration
```

---

## ⚠️ Backend Not Starting

### Problem: PM2 shows app as "errored" or "stopped"

**Check Logs:**

```bash
pm2 logs must-capacity-api --lines 50
```

**Common Causes:**

### 1. Missing Environment Variables

```bash
# Check if .env file exists
ls -la /var/www/must-capacity-finder/server/.env

# Verify content
cat /var/www/must-capacity-finder/server/.env

# Required variables:
# - MONGO_URI
# - FIREBASE_SERVICE_ACCOUNT
# - ALLOWED_ORIGINS
```

### 2. MongoDB Connection Failed

```bash
# Error: "MongooseServerSelectionError"
# Solution: Add VM IP to MongoDB Atlas whitelist

1. Go to MongoDB Atlas
2. Navigate to Network Access
3. Click "Add IP Address"
4. Add your VM's public IP
   OR add 0.0.0.0/0 for testing (allow from anywhere)
```

### 3. Firebase Authentication Error

```bash
# Error: "Firebase service account error"
# Solution: Check FIREBASE_SERVICE_ACCOUNT format

# Must be single line JSON:
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...",...}

# NOT multi-line:
# FIREBASE_SERVICE_ACCOUNT={
#   "type": "service_account"  ← WRONG!
# }
```

### 4. Port Already in Use

```bash
# Error: "EADDRINUSE: address already in use :::5000"

# Check what's using port 5000
sudo lsof -i :5000

# Kill the process
sudo kill -9 <PID>

# Or change PORT in server/.env
```

---

## 🔄 Frontend Shows White Screen

### Problem: Application loads but shows blank page

**Solution 1: Check Backend Config Endpoint**

```bash
# Test if backend is serving config
curl http://localhost:5000/api/config

# Should return Firebase config JSON
# If error, check server/.env has all Firebase client variables
```

**Solution 2: Rebuild Frontend**

```bash
cd /var/www/must-capacity-finder/client
npm run build
sudo systemctl restart nginx
```

**Solution 3: Check Browser Console**

```
Open browser DevTools (F12)
Check Console tab for errors
Common issues:
- API URL incorrect
- CORS errors
- Firebase config missing
```

---

## ❌ API Requests Failing (CORS Errors)

### Problem: Browser console shows "CORS policy blocked"

**Solution: Update ALLOWED_ORIGINS**

```bash
# Edit server/.env
nano /var/www/must-capacity-finder/server/.env

# Make sure ALLOWED_ORIGINS includes your VM IP or domain:
ALLOWED_ORIGINS=http://YOUR_VM_IP,https://YOUR_DOMAIN

# Save and restart
pm2 restart must-capacity-api
```

---

## 🔐 Google Login Not Working

### Problem: "Firebase: Error (auth/...)" or "Redirect URI mismatch"

**Solution 1: Update Firebase Console**

```
1. Go to Firebase Console
2. Authentication > Settings > Authorized domains
3. Add your VM IP or domain:
   - YOUR_VM_IP (without http://)
   - yourdomain.com
```

**Solution 2: Check Firebase Config in Client**

```bash
# Verify config.json has correct API URL
cat /var/www/must-capacity-finder/client/public/config.json
```

---

## 💾 Database Connection Issues

### Problem: "MongoNetworkError" or "Connection timeout"

**Solution Checklist:**

1. **Check MongoDB Atlas is Running**
   - Log into MongoDB Atlas
   - Verify cluster is active (not paused)

2. **Whitelist VM IP**

   ```bash
   # Get your VM's public IP
   curl ifconfig.me

   # Add this IP to MongoDB Atlas Network Access
   ```

3. **Test Connection String**

   ```bash
   # The MONGO_URI should look like:
   # mongodb+srv://username:password@cluster.mongodb.net/dbname

   # Common mistakes:
   # - Wrong password (URL encode special characters)
   # - Wrong database name
   # - Cluster name typo
   ```

4. **Test from VM**

   ```bash
   # Install mongo shell
   sudo apt install mongodb-clients

   # Test connection (replace with your URI)
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/dbname"
   ```

---

## 📊 Nginx 502 Bad Gateway

### Problem: Nginx shows "502 Bad Gateway" error

**Cause: Backend is not running or not accessible**

**Solution:**

```bash
# 1. Check if backend is running
pm2 status

# 2. Check backend is responding
curl http://localhost:5000/health

# 3. Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# 4. Verify nginx config
sudo nginx -t

# 5. Restart everything
pm2 restart must-capacity-api
sudo systemctl restart nginx
```

---

## 🔍 Nginx 404 Not Found

### Problem: All pages show 404 except homepage

**Cause: SPA routing not configured properly**

**Solution:**

```bash
# Check nginx config has try_files directive
sudo nano /etc/nginx/sites-available/must-capacity-finder

# Should have:
# location / {
#     try_files $uri $uri/ /index.html;
# }

# If missing, add it and restart:
sudo systemctl restart nginx
```

---

## 💻 PM2 Doesn't Start on Reboot

### Problem: Application stops after VM restart

**Solution:**

```bash
# Setup PM2 startup script
pm2 startup

# Copy and run the command PM2 shows

# Save current PM2 process list
pm2 save

# Test by rebooting
sudo reboot

# After reboot, verify:
pm2 status
```

---

## 📝 Can't Find Logs

**All Log Locations:**

```bash
# Application logs (PM2)
pm2 logs must-capacity-api
pm2 logs must-capacity-api --lines 100

# Application log files
/var/log/must-capacity-finder/api-error.log
/var/log/must-capacity-finder/api-out.log
/var/log/must-capacity-finder/api-combined.log

# Backend internal logs
/var/www/must-capacity-finder/server/error.log
/var/www/must-capacity-finder/server/combined.log

# Nginx logs
/var/log/nginx/must-capacity-access.log
/var/log/nginx/must-capacity-error.log
/var/log/nginx/error.log

# System logs
sudo journalctl -u nginx
```

---

## 🛠️ General Debugging Process

**When something doesn't work:**

1. **Check application status:**

   ```bash
   pm2 status
   sudo systemctl status nginx
   ```

2. **Check logs:**

   ```bash
   pm2 logs must-capacity-api --lines 50
   sudo tail -100 /var/log/nginx/error.log
   ```

3. **Check network:**

   ```bash
   # Test backend locally
   curl http://localhost:5000/health

   # Test from outside
   curl http://YOUR_VM_IP/health
   ```

4. **Check configuration:**

   ```bash
   # Verify .env
   cat /var/www/must-capacity-finder/server/.env

   # Verify config.json
   cat /var/www/must-capacity-finder/client/public/config.json

   # Test nginx config
   sudo nginx -t
   ```

5. **Restart everything:**
   ```bash
   pm2 restart must-capacity-api
   sudo systemctl restart nginx
   ```

---

## 🆘 Still Having Issues?

### Check System Resources

```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU and processes
htop

# If resources are low:
# - Upgrade VM size
# - Clean up logs: pm2 flush
```

### Verify All Prerequisites

- [ ] Node.js 18+ installed: `node --version`
- [ ] Nginx installed: `nginx -v`
- [ ] PM2 installed: `pm2 --version`
- [ ] MongoDB Atlas accessible
- [ ] Firebase project configured
- [ ] Environment variables set correctly

### Fresh Start

If all else fails, start over:

```bash
# Stop everything
pm2 delete all

# Remove installation
sudo rm -rf /var/www/must-capacity-finder

# Follow the deployment guide again from Step 4
```

---

## 📞 Getting Help

When asking for help, provide:

1. Error messages from logs
2. PM2 status output
3. Nginx test output: `sudo nginx -t`
4. What you were trying to do when it failed

```bash
# Collect diagnostic info
echo "=== PM2 Status ===" && pm2 status
echo "=== PM2 Logs ===" && pm2 logs must-capacity-api --lines 20 --nostream
echo "=== Nginx Test ===" && sudo nginx -t
echo "=== Backend Test ===" && curl -s http://localhost:5000/health
```
