# ✅ Azure VM Deployment Checklist

Use this checklist to track your deployment progress.

## Before You Start

- [ ] I have an Azure account
- [ ] I have MongoDB Atlas connection string
- [ ] I have Firebase service account JSON file
- [ ] I have my application code ready

## Step 1: Create Azure VM

- [ ] Created VM in Azure Portal (Ubuntu 22.04 LTS)
- [ ] Selected size: Standard B2s or larger
- [ ] Opened ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- [ ] Saved VM public IP address: `____________________`

## Step 2: Connect to VM

- [ ] Connected via SSH: `ssh azureuser@YOUR_VM_IP`
- [ ] Confirmed I can access the VM terminal

## Step 3: Setup VM Software

- [ ] Ran setup script or installed manually:
  - [ ] Node.js 20.x
  - [ ] Nginx
  - [ ] PM2
  - [ ] Git
- [ ] Created /var/www directory

## Step 4: Upload Application

- [ ] Uploaded/cloned code to: `/var/www/must-capacity-finder`
- [ ] Verified all files are present

## Step 5: Configure Environment

- [ ] Created `server/.env` file
- [ ] Added MONGO_URI to .env
- [ ] Added FIREBASE_SERVICE_ACCOUNT to .env (single line JSON)
- [ ] Added Firebase client config to .env (FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, etc.)
- [ ] Added ALLOWED_ORIGINS with VM IP to .env

## Step 6: Install Dependencies

- [ ] Ran `npm install` in server/ directory
- [ ] Ran `npm install` in client/ directory
- [ ] Ran `npm run build` in client/ directory
- [ ] Build completed successfully

## Step 7: Configure Nginx

- [ ] Copied nginx.conf to /etc/nginx/sites-available/
- [ ] Created symbolic link in /etc/nginx/sites-enabled/
- [ ] Removed default nginx site
- [ ] Tested nginx config: `sudo nginx -t`
- [ ] Restarted nginx: `sudo systemctl restart nginx`

## Step 8: Start Application

- [ ] Started app with PM2: `pm2 start server/index.js --name must-capacity-api`
- [ ] Saved PM2 process: `pm2 save`
- [ ] Setup PM2 startup: `pm2 startup`
- [ ] Ran the command PM2 provided

## Step 9: Verify Deployment

- [ ] Checked PM2 status: `pm2 status`
- [ ] Backend health check works: `curl http://localhost:5000/health`
- [ ] Nginx is running: `sudo systemctl status nginx`
- [ ] Can access app in browser: `http://YOUR_VM_IP`
- [ ] Can log in with Google
- [ ] Application works correctly

## Step 10: MongoDB Configuration

- [ ] Added VM IP to MongoDB Atlas IP whitelist
  - OR added 0.0.0.0/0 to allow all IPs
- [ ] Tested database connection

## Step 11: Security (Recommended)

- [ ] Configured firewall: `sudo ufw enable`
- [ ] Allowed necessary ports (22, 80, 443)
- [ ] Changed default SSH port (optional)
- [ ] Setup SSH key authentication (optional)

## Optional: Custom Domain & SSL

- [ ] Registered domain name
- [ ] Added A record pointing to VM IP
- [ ] Updated nginx server_name
- [ ] Installed SSL certificate with certbot
- [ ] Updated ALLOWED_ORIGINS in server/.env
- [ ] Updated config.json with domain
- [ ] Rebuilt and restarted application

## Troubleshooting

If something doesn't work:

- [ ] Checked PM2 logs: `pm2 logs must-capacity-api`
- [ ] Checked Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- [ ] Verified all environment variables are correct
- [ ] Confirmed MongoDB Atlas allows connections from VM
- [ ] Checked Azure Network Security Group rules

## 🎉 Deployment Complete!

- Deployment Date: `____________________`
- VM IP Address: `____________________`
- Application URL: `____________________`
- Domain (if any): `____________________`

## Useful Commands for Future

```bash
# View logs
pm2 logs must-capacity-api

# Restart application
pm2 restart must-capacity-api

# Check application status
pm2 status

# Restart nginx
sudo systemctl restart nginx

# Update application
cd /var/www/must-capacity-finder
git pull
cd client && npm run build && cd ..
pm2 restart must-capacity-api
```
