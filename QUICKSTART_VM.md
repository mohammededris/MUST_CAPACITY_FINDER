# 🚀 Azure VM Quick Start

## Prerequisites Checklist

- [ ] Azure account created
- [ ] MongoDB Atlas connection string ready
- [ ] Firebase service account JSON downloaded
- [ ] VM public IP noted down

## 5-Minute Deploy Commands

### On Azure Portal:

1. Create Ubuntu 22.04 VM (Standard B2s minimum)
2. Open ports: 80, 443, 22
3. Note the public IP

### On Your VM (via SSH):

```bash
# 1. Run setup script
curl -sSL https://raw.githubusercontent.com/nodesource/distributions/master/deb/setup_20.x | sudo bash -
sudo apt update && sudo apt install -y nodejs nginx git
sudo npm install -g pm2

# 2. Clone/upload your code
cd /var/www
sudo git clone YOUR_REPO must-capacity-finder
# OR upload via: scp -r ./MUST_CAPACITY_FINDER azureuser@VM_IP:/home/azureuser/

# 3. Create environment file
cd must-capacity-finder
cp server/.env.example server/.env
nano server/.env  # Fill in ALL values: MONGO_URI, FIREBASE_SERVICE_ACCOUNT, Firebase client config, ALLOWED_ORIGINS

# 4. Deploy!
chmod +x scripts/*.sh
./scripts/deploy.sh
```

## Environment Variables Quick Reference

### server/.env (Required values):

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
ALLOWED_ORIGINS=http://YOUR_VM_IP
```

## Verify Deployment

```bash
# Check backend
pm2 status
curl http://localhost:5000/health

# Check nginx
sudo systemctl status nginx

# Open in browser
http://YOUR_VM_IP
```

## Common Commands

```bash
# View logs
pm2 logs must-capacity-api

# Restart app
pm2 restart must-capacity-api

# Restart nginx
sudo systemctl restart nginx

# Update app
git pull
cd client && npm run build && cd ..
pm2 restart must-capacity-api
```

## Troubleshooting

### Can't connect to app:

```bash
sudo ufw allow 80
sudo ufw status
# Check Azure NSG has port 80 open
```

### Backend errors:

```bash
pm2 logs must-capacity-api --lines 100
# Check MongoDB Atlas whitelist includes VM IP (or 0.0.0.0/0)
```

### Nginx errors:

```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

## Need Full Documentation?

See [AZURE_VM_DEPLOYMENT.md](./AZURE_VM_DEPLOYMENT.md) for complete guide.
