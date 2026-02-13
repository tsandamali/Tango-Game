# Deployment Guide

## 📋 Prerequisites

- Node.js >= 14.0.0
- npm >= 6.0.0
- Docker (optional, for containerized deployment)
- PM2 (optional, for process management)

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=http://your-domain.com
DEFAULT_COUNTDOWN_TIME=10
MAX_PLAYERS_PER_GAME=50
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm run prod
```

**Standard Start:**
```bash
npm start
```

## 🐳 Docker Deployment

### Build and Run with Docker

**Build the image:**
```bash
docker build -t tango-puzzle-game .
```

**Run the container:**
```bash
docker run -d -p 3000:3000 --env-file .env --name tango-game tango-puzzle-game
```

### Using Docker Compose (Recommended)

**Start services:**
```bash
docker-compose up -d
```

**Stop services:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f
```

**Rebuild and restart:**
```bash
docker-compose up -d --build
```

## 🔧 PM2 Deployment (Production)

PM2 is a production process manager for Node.js applications.

### Install PM2

```bash
npm install -g pm2
```

### Start Application

```bash
pm2 start ecosystem.config.js
```

### Common PM2 Commands

```bash
# View running processes
pm2 list

# View logs
pm2 logs tango-puzzle-game

# Restart application
pm2 restart tango-puzzle-game

# Stop application
pm2 stop tango-puzzle-game

# Delete from PM2
pm2 delete tango-puzzle-game

# Monitor resources
pm2 monit

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

## ☁️ Cloud Deployment

### Deploy to Heroku

1. **Install Heroku CLI:**
```bash
npm install -g heroku
```

2. **Login and create app:**
```bash
heroku login
heroku create tango-puzzle-game
```

3. **Set environment variables:**
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=80
```

4. **Deploy:**
```bash
git push heroku main
```

### Deploy to AWS EC2

1. **SSH into your EC2 instance**

2. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Clone repository:**
```bash
git clone <your-repo-url>
cd tango-puzzle-game
```

4. **Install dependencies and start:**
```bash
npm install
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

5. **Configure Nginx (optional):**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Deploy to DigitalOcean

1. **Create Droplet** (Ubuntu 20.04+)

2. **Follow AWS EC2 steps above**

3. **Or use App Platform:**
   - Connect GitHub repository
   - Set build command: `npm install`
   - Set run command: `npm start`
   - Add environment variables

### Deploy to Railway/Render

1. **Connect GitHub repository**
2. **Set environment variables in dashboard**
3. **Deploy automatically on push**

## 🔒 Security Checklist

- [ ] Change default ports in production
- [ ] Set strong environment variables
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Use reverse proxy (Nginx/Apache)
- [ ] Implement rate limiting
- [ ] Add authentication for admin panel
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

## 📊 Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### Application Logs

Logs are stored in the `logs/` directory:
- `error.log` - Error logs
- `out.log` - Standard output
- `combined.log` - Combined logs

### Monitor with PM2

```bash
pm2 monit
pm2 logs
```

## 🔄 Updates and Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Restart with PM2
pm2 restart tango-puzzle-game

# Or with Docker
docker-compose up -d --build
```

### Backup

Important files to backup:
- `.env` file (configuration)
- `logs/` directory (application logs)
- Custom game configurations

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F

# Kill process (Linux/Mac)
kill -9 <PID>
```

### Application Won't Start

1. Check logs: `pm2 logs` or `docker-compose logs`
2. Verify environment variables
3. Ensure port is available
4. Check Node.js version compatibility

### WebSocket Connection Issues

1. Verify firewall settings allow WebSocket connections
2. Check reverse proxy configuration (Nginx/Apache)
3. Ensure CORS settings are correct
4. Verify ALLOWED_ORIGINS in .env

## 📞 Support

For issues or questions:
- Check logs first
- Review environment configuration
- Verify all dependencies are installed
- Ensure correct Node.js version

---

**Production Checklist:**
- ✅ Environment variables configured
- ✅ Dependencies installed
- ✅ Application tested locally
- ✅ SSL/HTTPS configured
- ✅ Monitoring setup
- ✅ Backup strategy in place
