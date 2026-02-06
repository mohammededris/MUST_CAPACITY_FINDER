# 📦 Azure VM Deployment - Complete Package

## 🎯 What's Included

This deployment package contains everything you need to deploy MUST Capacity Finder on Azure VM:

### 📚 Documentation Files

1. **[AZURE_VM_DEPLOYMENT.md](./AZURE_VM_DEPLOYMENT.md)**
   - Complete step-by-step deployment guide
   - Detailed instructions for beginners
   - All steps from VM creation to going live

2. **[QUICKSTART_VM.md](./QUICKSTART_VM.md)**
   - 5-minute quick start guide
   - Essential commands only
   - For experienced users

3. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)**
   - Interactive checklist
   - Track your deployment progress
   - Ensure nothing is missed

4. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**
   - Solutions to common problems
   - Error messages and fixes
   - Debugging commands

### 🛠️ Scripts & Configuration

5. **scripts/setup-vm.sh**
   - Automated VM setup script
   - Installs Node.js, Nginx, PM2, Git
   - Configures firewall

6. **scripts/deploy.sh**
   - One-command deployment
   - Builds and starts application
   - Runs on your VM

7. **scripts/nginx.conf**
   - Production-ready Nginx configuration
   - Reverse proxy setup
   - Security headers included

8. **ecosystem.config.js**
   - PM2 process configuration
   - Auto-restart settings
   - Log management

### 📝 Template Files

9. **server/.env.example**
   - Backend configuration template
   - Includes both backend and frontend Firebase config
   - Fill in your MongoDB, Firebase credentials, and VM IP

## 🚀 Quick Start Path

```
Choose your path:

┌─────────────────────────────────────────────────────┐
│  New to deployment?                                  │
│  → Follow AZURE_VM_DEPLOYMENT.md (complete guide)    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Experienced with Azure?                             │
│  → Follow QUICKSTART_VM.md (fast track)             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Want to track progress?                             │
│  → Use DEPLOYMENT_CHECKLIST.md                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Something not working?                              │
│  → Check TROUBLESHOOTING.md                         │
└─────────────────────────────────────────────────────┘
```

## 📋 Prerequisites Summary

Before starting, make sure you have:

- ✅ Azure account (free tier works!)
- ✅ MongoDB Atlas connection string
- ✅ Firebase service account JSON file
- ✅ SSH client (built into Windows/Mac/Linux)

## 🎬 Deployment Flow

```
Azure Portal                  Your VM (Ubuntu)              Your Browser
─────────────                 ────────────────              ────────────

1. Create VM
   (Ubuntu 22.04)
   Open ports: 80,443,22
        │
        ├────────2. SSH Connect────→  3. Run setup script
        │                                  - Install Node.js
        │                                  - Install Nginx
        │                                  - Install PM2
        │
        ├────────4. Upload code────→  5. Configure
        │                                  - server/.env
        │                                  - config.json
        │
        │                             6. Deploy
        │                                  - npm install
        │                                  - npm build
        │                                  - pm2 start
        │                                  - nginx start
        │
        └─────────────7. Access───────────────────────────→  http://VM_IP
                                                              🎉 Live!
```

## ⏱️ Time Estimates

- **VM Creation**: 5 minutes
- **VM Setup**: 10 minutes
- **Code Upload**: 5 minutes
- **Configuration**: 5 minutes
- **Deployment**: 10 minutes

**Total: ~35 minutes** (first time)
**Subsequent deployments: ~5 minutes**

## 🔑 Key Files You'll Edit

### On Azure Portal:

- Create VM
- Configure Network Security Group

### On Your VM:

```
/var/www/must-capacity-finder/
├── server/.env                    ← YOUR MongoDB & Firebase credentials
├── client/public/config.json      ← YOUR VM IP address
└── (everything else is automatic)
```

### That's it! Just 2 files to configure!

## 💡 Pro Tips

1. **Save your VM IP** - You'll need it multiple times
2. **Test locally first** - Make sure app works before deploying
3. **Use checklist** - Prevents missing steps
4. **Check logs often** - `pm2 logs` is your friend
5. **MongoDB whitelist** - Don't forget to add VM IP!

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Can access http://YOUR_VM_IP in browser
- ✅ Can log in with Google
- ✅ Backend API responds to requests
- ✅ No errors in PM2 logs
- ✅ Nginx shows application
- ✅ MongoDB connection works

## 📞 Support

If you get stuck:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) first
2. Look at error logs: `pm2 logs must-capacity-api`
3. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify configuration files

## 🌟 Next Steps After Deployment

1. **Add Custom Domain** (Optional)
   - Point domain to VM IP
   - Update nginx configuration
   - Install SSL certificate with certbot

2. **Setup Monitoring**
   - pm2.io for app monitoring
   - Azure Monitor for VM metrics

3. **Backup Strategy**
   - Regular database backups
   - Code repository (Git)

4. **Auto-scaling** (If needed)
   - Create VM image
   - Deploy multiple instances
   - Load balancer setup

## 🔗 Related Documentation

- [Main README](./README.md) - Project overview
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Alternative Azure deployments
- [PRODUCTION_READY_REPORT.md](./PRODUCTION_READY_REPORT.md) - Production checklist

---

## 📦 File Manifest

All files created for Azure VM deployment:

| File                    | Purpose           | Use               |
| ----------------------- | ----------------- | ----------------- |
| AZURE_VM_DEPLOYMENT.md  | Full guide        | Read first        |
| QUICKSTART_VM.md        | Fast guide        | Experienced users |
| DEPLOYMENT_CHECKLIST.md | Progress tracking | During deployment |
| TROUBLESHOOTING.md      | Fix problems      | When issues occur |
| scripts/setup-vm.sh     | VM setup          | Run on fresh VM   |
| scripts/deploy.sh       | App deployment    | Run on VM         |
| scripts/nginx.conf      | Web server        | Copy to nginx     |
| ecosystem.config.js     | PM2 config        | Used by PM2       |
| server/.env.example     | Config template   | Copy to .env      |

---

**Ready to deploy? Start with [AZURE_VM_DEPLOYMENT.md](./AZURE_VM_DEPLOYMENT.md)! 🚀**
