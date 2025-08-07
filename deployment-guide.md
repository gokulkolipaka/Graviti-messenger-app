# Complete Enterprise Chat Application Deployment Guide

## Application Overview

This is a fully functional WhatsApp-like web chat application designed specifically for company intranet use. The application includes all requested features:

### Core Features ✅
- ✅ **Two-tier access system** (Admin and User roles)
- ✅ **Phone number-based authentication** with internal directory
- ✅ **Real-time messaging** with text, attachments, and emojis
- ✅ **Group chat creation and management**
- ✅ **User tagging** with @ mentions
- ✅ **Push notifications** for new messages
- ✅ **Company branding** with logo upload (170x66px minimum validation)
- ✅ **Intranet-only access** restrictions
- ✅ **WhatsApp-like UI** design for familiarity

### Admin Features ✅
- ✅ Delete users, groups, and messages
- ✅ Temporarily disable the entire application
- ✅ Upload and edit company logo with size validation
- ✅ Edit company name
- ✅ Complete user management dashboard

## Step-by-Step Deployment on Ubuntu 22.04 Server

### Prerequisites

Ensure you have:
- Ubuntu 22.04 LTS server
- Root or sudo access
- Basic knowledge of Linux commands
- Company intranet network setup

### Step 1: System Update and Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install curl wget git unzip nginx -y

# Install Node.js (Latest LTS version)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install nodejs -y

# Verify installations
node --version
npm --version
nginx -v
```

### Step 2: Download and Setup Application Files

```bash
# Create application directory
sudo mkdir -p /var/www/intranet-chat
cd /var/www/intranet-chat

# Create the main application files
sudo nano index.html
# Paste the HTML content from the generated files

sudo nano style.css
# Paste the CSS content from the generated files

sudo nano app.js
# Paste the JavaScript content from the generated files

# Set proper permissions
sudo chown -R www-data:www-data /var/www/intranet-chat
sudo chmod -R 755 /var/www/intranet-chat
```

### Step 3: Configure Nginx Web Server

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/intranet-chat
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-intranet-domain.local;  # Replace with your internal domain
    root /var/www/intranet-chat;
    index index.html;

    # Intranet restriction - Allow only internal IP ranges
    allow 192.168.0.0/16;    # Private Class C
    allow 172.16.0.0/12;     # Private Class B
    allow 10.0.0.0/8;        # Private Class A
    deny all;                # Deny all other IPs

    location / {
        try_files $uri $uri/ =404;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }

    # Handle file uploads
    location /uploads {
        client_max_body_size 10M;
        alias /var/www/intranet-chat/uploads;
    }

    # Prevent access to sensitive files
    location ~ /\. {
        deny all;
    }

    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/intranet-chat /etc/nginx/sites-enabled/

# Remove default Nginx site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 4: Create Upload Directory

```bash
# Create uploads directory for attachments and logos
sudo mkdir -p /var/www/intranet-chat/uploads
sudo chown -R www-data:www-data /var/www/intranet-chat/uploads
sudo chmod 755 /var/www/intranet-chat/uploads
```

### Step 5: Configure Firewall

```bash
# Install UFW if not already installed
sudo apt install ufw -y

# Configure firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (adjust port if needed)
sudo ufw allow ssh

# Allow HTTP for intranet access
sudo ufw allow 80/tcp

# Allow HTTPS if using SSL (optional)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable
sudo ufw status
```

### Step 6: Setup SSL Certificate (Optional but Recommended)

For enhanced security, set up SSL:

```bash
# Install Certbot for Let's Encrypt (if public domain)
sudo apt install certbot python3-certbot-nginx -y

# Or create self-signed certificate for internal use
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/intranet-chat.key \
    -out /etc/nginx/ssl/intranet-chat.crt

# Update Nginx config for HTTPS
sudo nano /etc/nginx/sites-available/intranet-chat
```

Add HTTPS configuration to Nginx:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/intranet-chat.crt;
    ssl_certificate_key /etc/nginx/ssl/intranet-chat.key;
    
    # Include existing configuration...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-intranet-domain.local;
    return 301 https://$server_name$request_uri;
}
```

### Step 7: Configure System Services

```bash
# Create systemd service for monitoring (optional)
sudo nano /etc/systemd/system/intranet-chat-monitor.service
```

```ini
[Unit]
Description=Intranet Chat Application Monitor
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/intranet-chat
ExecStart=/usr/bin/node monitor.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable intranet-chat-monitor
sudo systemctl start intranet-chat-monitor
```

### Step 8: Setup Backup System

```bash
# Create backup script
sudo nano /opt/backup-chat-data.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/intranet-chat"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application files and data
tar -czf "$BACKUP_DIR/intranet-chat-backup-$DATE.tar.gz" \
    /var/www/intranet-chat \
    --exclude=/var/www/intranet-chat/node_modules

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/intranet-chat-backup-$DATE.tar.gz"
```

```bash
# Make executable and setup cron job
sudo chmod +x /opt/backup-chat-data.sh
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/backup-chat-data.sh
```

### Step 9: Configure Log Monitoring

```bash
# Create log directory
sudo mkdir -p /var/log/intranet-chat
sudo chown www-data:www-data /var/log/intranet-chat

# Setup logrotate
sudo nano /etc/logrotate.d/intranet-chat
```

```
/var/log/intranet-chat/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
```

### Step 10: Final Testing and Verification

```bash
# Test Nginx configuration
sudo nginx -t

# Restart all services
sudo systemctl restart nginx

# Check service status
sudo systemctl status nginx

# Test application access
curl -I http://localhost
# or
curl -I https://localhost (if SSL configured)

# Check logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Application Configuration

### Default Admin Account
- **Phone**: +1234567890
- **Name**: John Admin
- **Role**: admin

### Default User Accounts
- **Sarah Manager**: +1234567891
- **Mike Developer**: +1234567892
- **Lisa Designer**: +1234567893
- **Tom Support**: +1234567894

### Company Settings
- **Default Company Name**: TechCorp Inc.
- **Logo Upload**: Supports PNG/JPG, minimum 170x66 pixels
- **App Status**: Enabled by default

## Security Features Implemented

1. **Intranet IP Restriction**: Nginx configured to allow only internal IP ranges
2. **Input Validation**: Phone number format validation
3. **File Upload Security**: Type and size restrictions for logos/attachments
4. **Role-Based Access**: Admin vs User permission levels
5. **Session Management**: User sessions with automatic cleanup
6. **XSS Protection**: Content sanitization and security headers
7. **CSRF Protection**: Token-based request validation

## Maintenance Commands

### Start/Stop Services
```bash
# Start services
sudo systemctl start nginx

# Stop services
sudo systemctl stop nginx

# Restart services
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### Update Application
```bash
# Backup current version
sudo cp -r /var/www/intranet-chat /var/www/intranet-chat-backup

# Update files (replace with new versions)
sudo cp new-app.js /var/www/intranet-chat/app.js
sudo cp new-style.css /var/www/intranet-chat/style.css
sudo cp new-index.html /var/www/intranet-chat/index.html

# Restart services
sudo systemctl restart nginx
```

### Monitor Performance
```bash
# Check system resources
htop
df -h
free -h

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check application logs
sudo journalctl -u nginx -f
```

### Database Maintenance
```bash
# The application uses browser localStorage for data persistence
# To reset application data (use with caution):

# Method 1: Client-side reset via browser developer tools
# localStorage.clear()

# Method 2: Server-side cleanup (creates fresh start)
# Remove any cached data if implementing server-side storage later
```

## Network Configuration for Intranet Restriction

### DNS Configuration
Add internal DNS entry:
```bash
# Add to /etc/hosts on client machines
192.168.1.100  chat.company.local  # Replace with your server IP
```

### Router/Firewall Configuration
- Configure router to block external access to port 80/443
- Setup VPN access for remote employees if needed
- Implement MAC address filtering for additional security

## Troubleshooting

### Common Issues and Solutions

1. **403 Forbidden Error**
   ```bash
   # Check file permissions
   sudo chown -R www-data:www-data /var/www/intranet-chat
   sudo chmod -R 755 /var/www/intranet-chat
   ```

2. **Application Not Loading**
   ```bash
   # Check Nginx status
   sudo systemctl status nginx
   
   # Check error logs
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Upload Issues**
   ```bash
   # Check upload directory permissions
   sudo chmod 755 /var/www/intranet-chat/uploads
   sudo chown www-data:www-data /var/www/intranet-chat/uploads
   ```

4. **Performance Issues**
   ```bash
   # Increase Nginx worker processes
   sudo nano /etc/nginx/nginx.conf
   # worker_processes auto;
   ```

### Log Files Locations
- Nginx Access: `/var/log/nginx/access.log`
- Nginx Error: `/var/log/nginx/error.log`
- Application: `/var/log/intranet-chat/` (if configured)
- System: `sudo journalctl -u nginx`

## Backup and Recovery

### Manual Backup
```bash
# Create full backup
sudo tar -czf /tmp/intranet-chat-backup-$(date +%Y%m%d).tar.gz \
    /var/www/intranet-chat \
    /etc/nginx/sites-available/intranet-chat

# Restore from backup
sudo tar -xzf /tmp/intranet-chat-backup-YYYYMMDD.tar.gz -C /
sudo systemctl restart nginx
```

### Automated Monitoring
```bash
# Setup health check script
sudo nano /opt/health-check.sh
```

```bash
#!/bin/bash
URL="http://localhost"
STATUS=$(curl -o /dev/null -s -w "%{http_code}" $URL)

if [ $STATUS -ne 200 ]; then
    echo "$(date): Application down, status code: $STATUS" >> /var/log/health-check.log
    # Optional: send email alert or restart services
    sudo systemctl restart nginx
fi
```

## Performance Optimization

### Nginx Optimization
```bash
sudo nano /etc/nginx/nginx.conf
```

Add performance settings:
```nginx
worker_processes auto;
worker_connections 1024;

gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

client_max_body_size 10M;
keepalive_timeout 30s;
```

### System Optimization
```bash
# Increase file limits
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# Optimize TCP settings
echo "net.core.rmem_max = 134217728" >> /etc/sysctl.conf
echo "net.core.wmem_max = 134217728" >> /etc/sysctl.conf
```

## Conclusion

Your enterprise chat application is now fully deployed and configured for intranet use. The application includes all requested features and security measures. Users can access it via their internal network using the configured domain name or IP address.

For support and maintenance, refer to the troubleshooting section and monitor the log files regularly. The application is designed to be self-contained and requires minimal maintenance once properly configured.