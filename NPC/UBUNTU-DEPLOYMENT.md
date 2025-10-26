# Ubuntu Server Deployment Guide
Complete guide for deploying NPC website to Ubuntu server

## 🚀 Quick Start (Recommended - Docker Method)

### Prerequisites
- Ubuntu 20.04+ server
- Domain pointing to your server IP
- SSH access to server

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install docker-compose -y

# Install other tools
sudo apt install git nginx-utils certbot python3-certbot-nginx -y
```

### 2. Deploy Application
```bash
# Clone your repository
git clone https://github.com/yourusername/npc-website.git
cd npc-website

# Set up environment
cp .env.production.template .env.production
nano .env.production  # Fill in your actual API keys

# Create logs directory
mkdir -p logs/nginx

# Build and start
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f npc-app
```

### 3. Set Up SSL (Let's Encrypt)
```bash
# Stop docker temporarily
docker-compose down

# Get SSL certificate
sudo certbot certonly --nginx -d nerdchurchpartners.org -d www.nerdchurchpartners.org

# Update nginx config for SSL
sudo cp ssl-nginx.conf /etc/nginx/sites-available/npc
sudo ln -s /etc/nginx/sites-available/npc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Start docker again
docker-compose up -d
```

---

## 🔧 Manual Installation (Alternative Method)

### 1. Install Node.js
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be 18+
npm --version
```

### 2. Install and Configure Nginx
```bash
sudo apt install nginx -y

# Create nginx config
sudo nano /etc/nginx/sites-available/npc
```

**Nginx Configuration** (`/etc/nginx/sites-available/npc`):
```nginx
server {
    listen 80;
    server_name nerdchurchpartners.org www.nerdchurchpartners.org;
    root /var/www/npc/dist;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check
    location /health {
        return 200 "healthy";
        add_header Content-Type text/plain;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/npc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Deploy Application
```bash
# Create application directory
sudo mkdir -p /var/www/npc
sudo chown $USER:$USER /var/www/npc

# Clone and build
cd /var/www/npc
git clone https://github.com/yourusername/npc-website.git .

# Use production config
cp package.prod.json package.json
cp vite.config.prod.js vite.config.js

# Set environment
cp .env.production.template .env.production
nano .env.production  # Add your actual API keys

# Install and build
npm install
npm run build

# Set permissions
sudo chown -R www-data:www-data /var/www/npc/dist
```

### 4. Process Management with PM2
```bash
# Install PM2
npm install -g pm2

# Create PM2 config
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'npc-website',
    script: 'npm',
    args: 'run preview',
    cwd: '/var/www/npc',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    error_file: '/var/log/npc-error.log',
    out_file: '/var/log/npc-out.log',
    log_file: '/var/log/npc.log',
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the instructions
```

---

## 🔒 Security Setup

### 1. Firewall
```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d nerdchurchpartners.org -d www.nerdchurchpartners.org

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 3. Additional Security
```bash
# Install fail2ban
sudo apt install fail2ban -y

# Configure SSH (optional but recommended)
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no (if using key auth)
sudo systemctl restart ssh
```

---

## 📊 Monitoring & Maintenance

### 1. Log Monitoring
```bash
# Application logs (Docker)
docker-compose logs -f npc-app

# Application logs (PM2)
pm2 logs npc-website

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -f -u nginx
```

### 2. Health Checks
```bash
# Check application health
curl http://localhost/health

# Check services
sudo systemctl status nginx
docker-compose ps  # If using Docker
pm2 status  # If using PM2
```

### 3. Backup Strategy
```bash
# Create backup script
cat > /home/$USER/backup-npc.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/npc-app-$DATE.tar.gz /var/www/npc

# Backup nginx config
tar -czf $BACKUP_DIR/nginx-config-$DATE.tar.gz /etc/nginx/sites-available/npc

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /home/$USER/backup-npc.sh

# Schedule daily backup
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$USER/backup-npc.sh") | crontab -
```

---

## 🔄 Updates & Maintenance

### Docker Method Updates
```bash
cd /path/to/npc-website

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f npc-app
```

### Manual Method Updates
```bash
cd /var/www/npc

# Pull latest changes
git pull origin main

# Rebuild
npm install
npm run build

# Restart application
pm2 restart npc-website

# Reload nginx if config changed
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🐛 Troubleshooting

### Common Issues

**Site not loading**
```bash
# Check nginx
sudo nginx -t
sudo systemctl status nginx

# Check application
curl http://localhost:3000  # If using PM2
docker-compose logs npc-app  # If using Docker
```

**SSL issues**
```bash
# Renew certificate manually
sudo certbot renew --dry-run
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

**Performance issues**
```bash
# Check resource usage
htop
df -h
free -m

# Check nginx status
sudo systemctl status nginx

# Application metrics
pm2 monit  # If using PM2
docker stats  # If using Docker
```

**Database connection issues**
- Verify Supabase credentials in `.env.production`
- Check firewall rules for outbound connections
- Test connection manually from server

---

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Domain DNS pointing to server IP
- [ ] SSL certificate obtained
- [ ] Environment variables configured
- [ ] Supabase project accessible
- [ ] Stripe keys (production) added
- [ ] Buttondown API key configured

### Deployment
- [ ] Application built successfully
- [ ] Nginx configured and running
- [ ] SSL working (https://)
- [ ] Health check responding
- [ ] All pages loading correctly
- [ ] Newsletter signup working
- [ ] Contact forms functional

### Post-deployment
- [ ] Monitoring setup
- [ ] Backup script configured
- [ ] Log rotation configured
- [ ] Update procedures documented
- [ ] Team access configured

---

## 🔗 Quick Commands Reference

```bash
# Docker commands
docker-compose up -d          # Start services
docker-compose down           # Stop services  
docker-compose logs -f        # View logs
docker-compose restart       # Restart services

# PM2 commands
pm2 start ecosystem.config.js # Start app
pm2 restart npc-website      # Restart app
pm2 logs npc-website         # View logs
pm2 monit                    # Monitor resources

# Nginx commands
sudo nginx -t                # Test config
sudo systemctl reload nginx  # Reload config
sudo systemctl restart nginx # Restart service

# SSL commands  
sudo certbot renew          # Renew certificates
sudo certbot certificates   # List certificates
```

Your NPC website is now production-ready for Ubuntu server deployment! 🎉