# CUET IOTRIX Phase 2 - Deployment Guide

This guide will help you deploy the CUET IOTRIX Phase 2 system in a production or demonstration environment.

---

## System Requirements

### Backend Server
- **OS**: Linux (Ubuntu 20.04+), Windows 10+, or macOS
- **Python**: 3.10 or higher
- **RAM**: Minimum 1GB
- **Storage**: Minimum 500MB free space
- **Network**: Static IP recommended for ESP32 connectivity

### Frontend Server
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

### ESP32 Devices
- **Hardware**: ESP32 development board
- **Firmware**: MicroPython v1.19 or higher
- **Sensors**: 
  - HC-SR04 Ultrasonic sensor
  - LDR (Light Dependent Resistor)
  - OLED display (optional but recommended)
  - LEDs (White, Yellow, Red, Green)
  - Buzzer
  - Push buttons (3x)
- **WiFi**: 2.4GHz network access

---

## Quick Start Deployment

### 1. Backend Deployment

#### Option A: Local Development
```bash
# Clone/Navigate to repository
cd /path/to/CUET_IOTRIX_Phase_2

# Setup backend
cd BACKEND
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### Option B: Production with Gunicorn (Linux)
```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Option C: Docker Deployment
Create `Dockerfile` in BACKEND directory:
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t cuet-iotrix-backend .
docker run -d -p 8000:8000 cuet-iotrix-backend
```

### 2. Frontend Deployment

#### Option A: Development Server
```bash
cd FRONTEND
npm install
npm run dev
```

#### Option B: Production Build
```bash
cd FRONTEND
npm install
npm run build

# Serve with a static server
npm install -g serve
serve -s dist -l 3000
```

#### Option C: Deploy to Nginx
```bash
# Build the frontend
npm run build

# Copy to nginx web root
sudo cp -r dist/* /var/www/html/

# Nginx config (/etc/nginx/sites-available/cuet-iotrix)
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. ESP32 Deployment

#### Consumer Device Setup
1. Flash MicroPython to ESP32:
   ```bash
   esptool.py --port /dev/ttyUSB0 erase_flash
   esptool.py --port /dev/ttyUSB0 write_flash -z 0x1000 esp32-micropython.bin
   ```

2. Upload code:
   ```bash
   # Using ampy
   ampy --port /dev/ttyUSB0 put consumer_side_esp_code.py main.py
   
   # Or using Thonny IDE
   # Open consumer_side_esp_code.py
   # File → Save as → MicroPython device → main.py
   ```

3. Configure WiFi in code:
   ```python
   sta_if.connect('YOUR_WIFI_SSID', 'YOUR_PASSWORD')
   SERVER_IP = 'YOUR_BACKEND_SERVER_IP'
   CONSUMER_ID = 1  # Unique per device
   ```

4. Wire the components according to pin definitions

#### Puller Device Setup
1. Follow same flashing process as consumer
2. Upload `puller_side_esp_code.py` as `main.py`
3. Configure WiFi and server IP
4. Set unique `PULLER_ID`
5. Wire components as specified

---

## Network Configuration

### Local Network Setup
1. Ensure all devices (server, ESP32s) are on same network
2. Find your server's local IP:
   ```bash
   # Linux/Mac
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```
3. Update ESP32 code with server IP
4. Update frontend API URL in `src/utils/api.js`

### Public Deployment
1. Setup domain name (optional)
2. Configure firewall rules:
   ```bash
   # Allow HTTP/HTTPS
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   
   # Allow backend port
   sudo ufw allow 8000/tcp
   ```
3. Setup SSL certificate (recommended):
   ```bash
   # Using Let's Encrypt
   sudo certbot --nginx -d your-domain.com
   ```

---

## Database Setup

### SQLite (Default)
- Database file created automatically: `database.db`
- No additional configuration needed
- Suitable for small to medium deployments

### Upgrade to PostgreSQL (Production)
1. Install PostgreSQL:
   ```bash
   sudo apt install postgresql postgresql-contrib
   ```

2. Create database:
   ```sql
   CREATE DATABASE cuet_iotrix;
   CREATE USER iotrix_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE cuet_iotrix TO iotrix_user;
   ```

3. Update `db.py`:
   ```python
   DATABASE_URL = "postgresql://iotrix_user:secure_password@localhost/cuet_iotrix"
   ```

4. Install psycopg2:
   ```bash
   pip install psycopg2-binary
   ```

---

## Environment Variables

Create `.env` file in BACKEND directory:
```env
# Database
DATABASE_URL=sqlite:///./database.db

# Security
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000,http://your-domain.com

# Server
HOST=0.0.0.0
PORT=8000
```

Update `main.py` to use environment variables:
```python
import os
from dotenv import load_dotenv

load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Monitoring and Logging

### Backend Logging
1. Configure logging in `main.py`:
   ```python
   import logging
   
   logging.basicConfig(
       level=logging.INFO,
       format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
       handlers=[
           logging.FileHandler('app.log'),
           logging.StreamHandler()
       ]
   )
   ```

### System Monitoring
```bash
# Monitor backend process
pm2 start "uvicorn main:app --host 0.0.0.0" --name cuet-iotrix-backend

# View logs
pm2 logs cuet-iotrix-backend

# Monitor status
pm2 status
```

---

## Backup and Recovery

### Database Backup
```bash
# SQLite backup
cp database.db database_backup_$(date +%Y%m%d).db

# PostgreSQL backup
pg_dump cuet_iotrix > backup_$(date +%Y%m%d).sql
```

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
cp /path/to/database.db $BACKUP_DIR/database_$DATE.db

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "database_*.db" -mtime +7 -delete
```

Add to crontab:
```bash
# Run backup daily at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## Performance Optimization

### Backend Optimization
1. Use connection pooling for database
2. Enable response caching for analytics endpoints
3. Implement rate limiting:
   ```bash
   pip install slowapi
   ```

### Frontend Optimization
1. Lazy load components
2. Optimize bundle size:
   ```bash
   npm run build -- --minify
   ```
3. Enable compression in Nginx:
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

---

## Security Checklist

- [ ] Change default admin credentials
- [ ] Use HTTPS in production
- [ ] Enable CORS only for trusted domains
- [ ] Implement rate limiting
- [ ] Regular security updates
- [ ] Secure database credentials
- [ ] Use environment variables for sensitive data
- [ ] Regular backups
- [ ] Monitor logs for suspicious activity
- [ ] Implement user session management (JWT)

---

## Troubleshooting

### Backend Issues
**Issue**: Server won't start
- Check port 8000 is not in use: `lsof -i :8000`
- Verify Python version: `python --version`
- Check database permissions

**Issue**: Database errors
- Delete database.db and restart (WARNING: loses data)
- Check SQLAlchemy logs
- Verify database URL in db.py

### Frontend Issues
**Issue**: Can't connect to backend
- Verify backend is running
- Check API_BASE_URL in `src/utils/api.js`
- Check CORS configuration
- Verify network connectivity

### ESP32 Issues
**Issue**: WiFi connection fails
- Verify SSID and password
- Check 2.4GHz network availability
- Ensure signal strength is adequate
- Try manual IP configuration

**Issue**: Can't reach server
- Ping server IP from another device
- Check firewall rules
- Verify server is listening on 0.0.0.0
- Check network routing

---

## Scaling Considerations

### Horizontal Scaling
- Deploy multiple backend instances behind load balancer
- Use Redis for session management
- Implement message queue for notifications

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize database queries
- Use database indexes

### Load Balancing
```nginx
upstream backend {
    server 127.0.0.1:8000;
    server 127.0.0.1:8001;
    server 127.0.0.1:8002;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

---

## Testing Checklist

### Backend Testing
- [ ] All API endpoints respond correctly
- [ ] User authentication works
- [ ] Database operations succeed
- [ ] CORS is properly configured
- [ ] Error handling works

### Frontend Testing
- [ ] Login/signup functionality
- [ ] Dashboard displays correctly
- [ ] Real-time updates work
- [ ] Rating system functions
- [ ] Responsive on mobile devices

### ESP32 Testing
- [ ] WiFi connection establishes
- [ ] Sensor readings are accurate
- [ ] Request creation works
- [ ] Status updates received
- [ ] LED indicators function
- [ ] Buzzer alerts work

### Integration Testing
- [ ] End-to-end ride request flow
- [ ] Rating submission and display
- [ ] Notification delivery
- [ ] Analytics update correctly
- [ ] Multi-user scenarios

---

## Maintenance

### Regular Tasks
- **Daily**: Check logs for errors
- **Weekly**: Review analytics, backup database
- **Monthly**: Update dependencies, security patches
- **Quarterly**: Performance review, capacity planning

### Update Procedure
```bash
# Backup first
./backup.sh

# Pull latest code
git pull origin main

# Update backend
cd BACKEND
pip install -r requirements.txt
pm2 restart cuet-iotrix-backend

# Update frontend
cd FRONTEND
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

---

## Support and Documentation

- **API Documentation**: See `API_DOCUMENTATION.md`
- **Main README**: See `README.md`
- **Issues**: Create GitHub issue for bug reports
- **Questions**: Contact development team

---

## Production Checklist

Before going live:
- [ ] All tests passing
- [ ] Security review completed
- [ ] Backups configured
- [ ] Monitoring in place
- [ ] Documentation updated
- [ ] User training completed
- [ ] Rollback plan prepared
- [ ] Performance tested
- [ ] SSL certificates installed
- [ ] Environment variables configured

---

**Last Updated**: November 2025  
**Version**: 2.0
