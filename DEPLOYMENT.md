# Smart Job Portal - EC2 Deployment Guide

This guide provides step-by-step instructions to deploy the Smart Job Portal application on AWS EC2 using Docker Compose.

## Architecture Overview

The application consists of 6 services:
- **MongoDB** - Database (Port 27017)
- **RabbitMQ** - Message Queue (Port 5672, Management UI: 15672)
- **Server** - Main Backend API (Port 8080)
- **CV Evaluation** - AI-powered CV evaluation microservice (Port 8081)
- **Email Service** - Email notification microservice (Port 8082)
- **Queue Service** - Queue management service (Port 8083)
- **Client** - Next.js Frontend (Port 3000)

---

## Prerequisites

- AWS Account
- Basic knowledge of AWS EC2, Security Groups, and SSH

---

## Step 1: Launch EC2 Instance

### 1.1 Create EC2 Instance

1. Go to **AWS Console** → **EC2** → **Launch Instance**
2. **Name**: `smart-job-portal-server`
3. **AMI**: Ubuntu Server 22.04 LTS (HVM), SSD Volume Type
4. **Instance Type**:
   - Minimum: `t3.medium` (2 vCPU, 4 GB RAM)
   - Recommended: `t3.large` (2 vCPU, 8 GB RAM) or larger
   - For production: `t3.xlarge` or higher

5. **Key Pair**:
   - Create new or select existing key pair
   - Download `.pem` file and save securely

6. **Network Settings**:
   - Select VPC and Subnet
   - **Auto-assign Public IP**: Enable

7. **Configure Storage**:
   - Minimum: 30 GB
   - Recommended: 50 GB or more

8. **Advanced Details** (Optional):
   - You can add user data to automate initial setup (see Step 2.5)

### 1.2 Configure Security Group

Create/modify security group with these **Inbound Rules**:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | Your IP/0.0.0.0/0 | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP access |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS access |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | Frontend (Next.js) |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 | Backend API |
| Custom TCP | TCP | 8081 | 0.0.0.0/0 | CV Evaluation Service |
| Custom TCP | TCP | 8082 | 0.0.0.0/0 | Email Service |
| Custom TCP | TCP | 8083 | 0.0.0.0/0 | Queue Service |
| Custom TCP | TCP | 15672 | Your IP | RabbitMQ Management UI |

**Note**: For production, restrict access to specific IPs instead of 0.0.0.0/0

---

## Step 2: Connect to EC2 and Install Dependencies

### 2.1 Connect via SSH

```bash
# Set permissions for your key file
chmod 400 your-key-pair.pem

# Connect to EC2 instance
ssh -i your-key-pair.pem ubuntu@<EC2-PUBLIC-IP>
```

### 2.2 Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 2.3 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker ubuntu

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker installation
docker --version
```

### 2.4 Install Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 2.5 Install Git

```bash
sudo apt install git -y
git --version
```

### 2.6 Logout and Login Again

```bash
# Logout to apply docker group changes
exit

# SSH back in
ssh -i your-key-pair.pem ubuntu@<EC2-PUBLIC-IP>

# Verify docker works without sudo
docker ps
```

---

## Step 3: Deploy Application

### 3.1 Clone Repository

```bash
# Clone your repository
git clone <YOUR-REPOSITORY-URL>

# Navigate to project directory
cd smart-job-portal-main
```

**OR** if you're uploading manually:

```bash
# Create project directory
mkdir -p ~/smart-job-portal
cd ~/smart-job-portal
```

Then upload files using SCP:

```bash
# From your local machine
scp -i your-key-pair.pem -r /path/to/smart-job-portal-main ubuntu@<EC2-PUBLIC-IP>:~/
```

### 3.2 Update Environment Variables (Optional)

If you need to change any configuration, edit the `docker-compose.yml` file:

```bash
nano docker-compose.yml
```

**Important configurations to update for EC2:**

1. **Frontend URL** (in server service):
   ```yaml
   FRONTEND_URL: http://<EC2-PUBLIC-IP>:3000
   ```

2. **API Base URL** (in client service):
   ```yaml
   NEXT_PUBLIC_API_BASE_URL: http://<EC2-PUBLIC-IP>:8080
   ```

3. **Email Configuration** (in email-service):
   - Update `EMAIL_USER` and `EMAIL_PASS` with your credentials

### 3.3 Build and Start Services

```bash
# Build and start all services in detached mode
docker-compose up -d --build
```

This will:
- Build Docker images for all services
- Download MongoDB and RabbitMQ images
- Create network and volumes
- Start all containers

### 3.4 Monitor Deployment

```bash
# View all running containers
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f cv-evaluation

# Press Ctrl+C to exit logs
```

---

## Step 4: Verify Deployment

### 4.1 Check Container Status

```bash
docker-compose ps
```

All services should show as "Up" or "running".

### 4.2 Test Endpoints

```bash
# Test backend API
curl http://localhost:8080

# Test CV evaluation service
curl http://localhost:8081

# Test queue service
curl http://localhost:8083
```

### 4.3 Access Application

Open your browser and visit:

- **Frontend**: `http://<EC2-PUBLIC-IP>:3000`
- **Backend API**: `http://<EC2-PUBLIC-IP>:8080`
- **RabbitMQ Management**: `http://<EC2-PUBLIC-IP>:15672`
  - Username: `admin`
  - Password: `admin123`

---

## Step 5: Common Docker Commands

### Managing Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart server

# View logs
docker-compose logs -f

# View resource usage
docker stats
```

### Rebuilding Services

```bash
# Rebuild and restart all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build server
```

### Database Management

```bash
# Access MongoDB shell
docker exec -it smart-job-portal-mongodb mongosh -u admin -p admin123

# Backup MongoDB
docker exec smart-job-portal-mongodb mongodump -u admin -p admin123 --out /backup

# Restore MongoDB
docker exec smart-job-portal-mongodb mongorestore -u admin -p admin123 /backup
```

### Cleaning Up

```bash
# Stop and remove containers, networks
docker-compose down

# Remove volumes as well (WARNING: This deletes all data)
docker-compose down -v

# Remove unused images
docker image prune -a

# Remove everything (containers, networks, volumes, images)
docker system prune -a --volumes
```

---

## Step 6: Production Optimizations

### 6.1 Set Up Domain Name (Optional)

1. Purchase domain from Route 53 or other registrar
2. Create A record pointing to EC2 Public IP
3. Update `docker-compose.yml`:
   ```yaml
   FRONTEND_URL: https://yourdomain.com
   NEXT_PUBLIC_API_BASE_URL: https://api.yourdomain.com
   ```

### 6.2 Set Up Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/smart-job-portal
```

Add this configuration:

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/smart-job-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6.3 Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal (certbot creates a cron job automatically)
sudo certbot renew --dry-run
```

### 6.4 Set Up Auto-Start on Reboot

```bash
# Create systemd service
sudo nano /etc/systemd/system/smart-job-portal.service
```

Add this content:

```ini
[Unit]
Description=Smart Job Portal Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/smart-job-portal-main
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

Enable the service:

```bash
sudo systemctl enable smart-job-portal.service
sudo systemctl start smart-job-portal.service
```

### 6.5 Set Up Monitoring

```bash
# Install htop for resource monitoring
sudo apt install htop -y

# Run htop
htop

# Monitor Docker logs
docker-compose logs -f --tail=100
```

---

## Step 7: Backup and Recovery

### 7.1 Create Backup Script

```bash
# Create backup directory
mkdir -p ~/backups

# Create backup script
nano ~/backup.sh
```

Add this content:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups/$DATE

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec smart-job-portal-mongodb mongodump -u admin -p admin123 --out /backup
docker cp smart-job-portal-mongodb:/backup $BACKUP_DIR/mongodb

# Backup uploaded files
cp -r ~/smart-job-portal-main/server/Uploads $BACKUP_DIR/uploads

# Create archive
cd ~/backups
tar -czf backup_$DATE.tar.gz $DATE
rm -rf $DATE

echo "Backup completed: backup_$DATE.tar.gz"
```

Make it executable:

```bash
chmod +x ~/backup.sh
```

### 7.2 Schedule Automated Backups

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/ubuntu/backup.sh
```

---

## Step 8: Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Check container status
docker-compose ps

# Restart service
docker-compose restart <service-name>
```

### Out of Memory

```bash
# Check memory usage
free -h
docker stats

# Increase EC2 instance size or add swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :8080

# Kill process
sudo kill -9 <PID>
```

### Database Connection Issues

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Access MongoDB shell
docker exec -it smart-job-portal-mongodb mongosh -u admin -p admin123
```

### Permission Denied Errors

```bash
# Fix permissions
sudo chown -R ubuntu:ubuntu ~/smart-job-portal-main
chmod -R 755 ~/smart-job-portal-main
```

---

## Step 9: Scaling and Performance

### Horizontal Scaling

To handle more traffic, you can:

1. **Use AWS Load Balancer** to distribute traffic across multiple EC2 instances
2. **Use managed services**:
   - MongoDB Atlas instead of containerized MongoDB
   - Amazon MQ instead of containerized RabbitMQ
   - Amazon S3 for file storage (already configured)

### Update docker-compose for External Services

```yaml
# Use MongoDB Atlas
DB: mongodb+srv://username:password@cluster.mongodb.net/dbname

# Use Amazon MQ
RABBITMQ_URL: amqps://username:password@your-amazonmq-url.amazonaws.com:5671
```

---

## Step 10: Security Best Practices

1. **Change default passwords** in docker-compose.yml:
   - MongoDB admin password
   - RabbitMQ admin password

2. **Use environment variables** for sensitive data:
   ```bash
   # Create .env file
   nano .env
   ```

3. **Enable firewall**:
   ```bash
   sudo ufw enable
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   ```

4. **Regular updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   docker-compose pull
   docker-compose up -d
   ```

5. **Monitor logs** for suspicious activity:
   ```bash
   docker-compose logs -f | grep -i error
   ```

---

## Support and Maintenance

### Updating Application

```bash
# Pull latest code
cd ~/smart-job-portal-main
git pull origin main

# Rebuild and restart
docker-compose up -d --build
```

### Monitoring

- **Application Logs**: `docker-compose logs -f`
- **System Resources**: `htop` or `docker stats`
- **Disk Usage**: `df -h`
- **RabbitMQ Management UI**: `http://<EC2-IP>:15672`

---

## Quick Reference Commands

```bash
# Start application
docker-compose up -d

# Stop application
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart <service-name>

# Rebuild and start
docker-compose up -d --build

# Check status
docker-compose ps

# Access MongoDB
docker exec -it smart-job-portal-mongodb mongosh -u admin -p admin123
```

---

## Cost Estimation (AWS EC2)

| Instance Type | vCPU | RAM | Storage | Monthly Cost (us-east-1) |
|---------------|------|-----|---------|--------------------------|
| t3.medium | 2 | 4 GB | 30 GB | ~$30 |
| t3.large | 2 | 8 GB | 50 GB | ~$60 |
| t3.xlarge | 4 | 16 GB | 50 GB | ~$120 |

*Prices are approximate and may vary by region*

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)

---

## Contact

For issues or questions, please refer to the project repository or contact the development team.
