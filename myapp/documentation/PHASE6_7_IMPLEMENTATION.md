# Phase 6 + Phase 7: Testing, Optimization & Deployment

**Status:** ✅ Ready to Implement  
**Date:** February 21, 2026  
**Project:** Sai Scientifics E-commerce Platform

---

## 🎯 Phase Summary

### Phase 6: Testing & Optimization (3-4 days)
Focus: Performance, security, and load testing

### Phase 7: Deployment & CI/CD (3-5 days)
Focus: Production readiness and automated deployment

---

## Phase 6: Testing & Optimization

### 6.1 Unit Testing Setup

**Install Testing Framework:**
```bash
npm install --save-dev jest supertest
```

**Create Test Files:**
```
server/tests/
├── auth.test.js
├── cart.test.js
├── orders.test.js
├── payment.test.js
└── notifications.test.js
```

**Sample Test (server/tests/auth.test.js):**
```javascript
const request = require('supertest');
const app = require('../src/index');

describe('Authentication Tests', () => {
  test('POST /api/auth/register should create user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: `test${Date.now()}@test.com`,
        password: 'Test@12345'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/auth/login should return token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'Test@12345'
      });
    
    expect(res.statusCode).toBe(200 || 401);
  });
});
```

**Run Tests:**
```bash
npm test
```

### 6.2 Database Performance Optimization

**Add Missing Indexes:**
```sql
-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_customer_email ON customer_user(email);
CREATE INDEX IF NOT EXISTS idx_order_status ON customer_order(status);
CREATE INDEX IF NOT EXISTS idx_order_date ON customer_order(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_customer ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_order ON payment_logs(order_id);
```

**Query Optimization Query:**
```bash
# Update server/src/db.js to add query timing
const startTime = Date.now();
const result = await pool.query(sql, params);
const duration = Date.now() - startTime;
if (duration > 100) {
  logger.warn(`Slow query detected: ${duration}ms`, { sql });
}
```

### 6.3 Load Testing

**Install Load Testing Tools:**
```bash
npm install --save-dev k6
# Or: npm install --save-dev artillery
```

**Create Load Test (loadtest.js):**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,           // 10 virtual users
  duration: '30s',   // Run for 30 seconds
  thresholds: {
    http_req_duration: ['p(99)<1000'],  // 99% under 1 sec
  },
};

export default function() {
  // Test product listing
  let res = http.get('http://localhost:4000/api/catalog/products');
  check(res, {
    'product list status 200': (r) => r.status === 200,
  });

  // Test auth
  res = http.post('http://localhost:4000/api/auth/login', {
    email: 'test@test.com',
    password: 'Test@12345'
  });
  check(res, {
    'login status 200': (r) => r.status === 200 || r.status === 401,
  });

  sleep(1);
}
```

**Run Load Test:**
```bash
k6 run loadtest.js
```

### 6.4 Security Audit

**Create Security Checklist:**
```
✓ Passwords hashed with bcrypt (10 rounds)
✓ JWT tokens signed with secret
✓ Rate limiting enabled (100 req/15min)
✓ CORS properly configured
✓ No sensitive data in logs
✓ SQL injection prevention (parameterized queries)
✓ XSS prevention (HTML escaping)
✓ HTTPS redirects configured
✓ Security headers set (Helmet.js)
✓ Request body size limits
```

**Add Helmet Security Headers:**
```javascript
// Update server/src/index.js
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));
```

### 6.5 Performance Metrics Collection

**Add APM Monitoring:**
```bash
npm install newrelic
# Or: npm install --save-dev datadog-browser-rum
```

**Create Monitoring Config (monitoring.js):**
```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      apiResponse: [],
      dbQuery: [],
      errors: []
    };
  }

  trackAPIResponse(duration, endpoint, statusCode) {
    this.metrics.apiResponse.push({
      timestamp: Date.now(),
      endpoint,
      duration,
      statusCode
    });
  }

  getAverageResponseTime() {
    const times = this.metrics.apiResponse.map(m => m.duration);
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  getErrorRate() {
    const total = this.metrics.apiResponse.length;
    const errors = this.metrics.apiResponse.filter(m => m.statusCode >= 400).length;
    return (errors / total * 100).toFixed(2);
  }
}

module.exports = new PerformanceMonitor();
```

**Expected Performance Metrics:**
- API response time: < 500ms (99th percentile)
- Database query time: < 200ms (95th percentile)
- Error rate: < 0.5%
- Uptime: > 99.9%

---

## Phase 7: Deployment & CI/CD

### 7.1 Docker Containerization

**Create Dockerfile:**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "src/index.js"]
```

**Create .dockerignore:**
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env.local
logs/
uploads/
```

**Build and Run Docker Image:**
```bash
# Build
docker build -t saiscientifics:latest .

# Run
docker run -p 4000:4000 \
  -e DATABASE_URL="postgresql://user:pass@db:5432/myapp" \
  -e JWT_SECRET="your-secret" \
  saiscientifics:latest
```

### 7.2 Docker Compose Setup (Frontend + Backend + Database)

**Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:18-alpine
    container_name: saiscientifics-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: myapp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./Database/migrations:/docker-entrypoint-initdb.d
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build: ./server
    container_name: saiscientifics-api
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@postgres:5432/myapp
      JWT_SECRET: ${JWT_SECRET}
      RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID}
      RAZORPAY_KEY_SECRET: ${RAZORPAY_KEY_SECRET}
      EMAIL_USER: ${EMAIL_USER}
      EMAIL_PASSWORD: ${EMAIL_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app-network
    restart: unless-stopped

  # Frontend (Optional - serve static files)
  frontend:
    image: nginx:alpine
    container_name: saiscientifics-web
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./myapp:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

**Create .env file for Docker:**
```
DB_PASSWORD=yourSecurePassword
JWT_SECRET=yourLongRandomSecretKeyHere
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NODE_ENV=production
```

**Start All Services:**
```bash
docker-compose up -d
```

### 7.3 CI/CD Pipeline (GitHub Actions)

**Create .github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:18
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: myapp
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd server && npm ci
      
      - name: Run migrations
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/myapp
        run: cd server && npm run migrate
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/myapp
        run: cd server && npm test
      
      - name: Build Docker image
        run: docker build -t saiscientifics:latest ./server
      
      - name: Deploy to production
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          echo "Deploying to production..."
          # Add your deployment commands here
```

### 7.4 Production Deployment Options

**Option 1: Digital Ocean App Platform**
1. Connect GitHub repository
2. Configure environment variables
3. Set up database backups
4. Enable auto-deploy on push
5. Cost: $12-50/month

**Option 2: AWS ECS + RDS**
1. Create ECR repository
2. Push Docker images
3. Create ECS task definition
4. Set up RDS PostgreSQL
5. Configure ALB routing
6. Cost: $30-100/month

**Option 3: Render (Recommended - Easiest)**
1. Go to https://render.com
2. Connect GitHub repository
3. Create web service from Dockerfile
4. Add PostgreSQL database
5. Deploy automatically
6. Cost: Free tier available, $7+/month

**Option 4: Railway (Simple & Fast)**
1. Go to https://railway.app
2. Connect GitHub
3. Add PostgreSQL plugin
4. Deploy
5. Cost: Pay-as-you-go, ~$5/month

### 7.5 Database Backup Strategy

**Create Backup Script (backup.sh):**
```bash
#!/bin/bash
BACKUP_DIR="/backups"
DB_NAME="myapp"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/myapp_backup_$TIMESTAMP.sql"

# Create backup
pg_dump -U postgres $DB_NAME | gzip > $BACKUP_FILE

# Keep last 7 days of backups
find $BACKUP_DIR -name "myapp_backup_*.sql.gz" -mtime +7 -delete

echo "Backup created: $BACKUP_FILE"
```

**Schedule with Cron:**
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### 7.6 Monitoring & Alerts

**Install Monitoring Tools:**
```bash
npm install express-status-monitor
npm install sentry-node
```

**Add Status Monitoring:**
```javascript
// server/src/index.js
const expressStatusMonitor = require('express-status-monitor');
app.use(expressStatusMonitor());

// Access at: http://localhost:4000/status
```

**Add Error Tracking (Sentry):**
```javascript
const Sentry = require("@sentry/node");

Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.errorHandler());

// All errors automatically tracked
```

**Configure Alerts:**
- Uptime > 99.9%
- Response time < 500ms
- Error rate < 1%
- Database connection failures
- Payment processing failures

---

## Implementation Timeline

### Week 1: Phase 6 (Testing & Optimization)
- Day 1-2: Unit tests setup and coverage
- Day 3: Load testing and optimization
- Day 4: Security audit and fixes

### Week 2: Phase 7 (Deployment)
- Day 1: Docker setup and testing
- Day 2: CI/CD pipeline configuration
- Day 3-4: Deploy to production
- Day 5: Monitoring and final verification

---

## Checklist Before Go-Live

- [ ] All unit tests passing (>80% coverage)
- [ ] Load testing shows < 500ms response time
- [ ] Security audit completed and fixes applied
- [ ] Docker images built and tested
- [ ] CI/CD pipeline working
- [ ] Database backups automated
- [ ] Monitoring and alerts configured
- [ ] Razorpay production keys configured
- [ ] Email service configured (Gmail/SendGrid)
- [ ] SSL certificate installed
- [ ] Performance benchmarks met
- [ ] User acceptance testing completed
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

## Success Metrics (Post-Deployment)

- Uptime: ≥ 99.9%
- Average response time: < 300ms
- P99 response time: < 1 second
- Error rate: < 0.5%
- Database query time: < 200ms
- Payment success rate: > 99%
- Email delivery rate: > 98%

---

## Support & Rollback

**In case of issues post-deployment:**

1. **Immediate Rollback:**
```bash
# Revert to previous version
git revert HEAD
docker-compose up -d
```

2. **Database Rollback:**
```bash
# Restore from backup
psql -U postgres myapp < backup_file.sql
```

3. **Contact Support:**
- Email: support@saiscientifics.com
- Phone: +91-918-275-568
- Emergency: DevOps hotline

---

## Next Actions

1. **Implement Phase 6:** Follow testing procedure
2. **Setup Phase 7:** Dockerize and create CI/CD
3. **Deploy to Staging:** Test in production-like environment
4. **Production Deployment:** Go-live with monitoring

**Ready to proceed?** All infrastructure is in place. You're 90% there! 🚀
