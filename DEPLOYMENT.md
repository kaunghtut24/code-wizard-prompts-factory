
# Deployment Guide

This guide covers deploying CodeCraft AI using configuration-based methods that don't require modifying package.json.

## 🚂 Railway Deployment (Recommended)

### Method 1: Configuration-Based Deployment (No package.json changes)

Railway deployment using `railway.json` and `nixpacks.toml` configuration files.

#### Prerequisites
- GitHub repository with your code
- Railway account (free tier available)

#### Steps

1. **Push Configuration Files**
   ```bash
   git add railway.json nixpacks.toml scripts/
   git commit -m "Add Railway deployment configuration"
   git push origin main
   ```

2. **Deploy to Railway**
   - Go to [Railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically use the `railway.json` configuration

3. **Environment Variables**
   Railway will automatically set:
   - `NODE_ENV=production`
   - `VITE_APP_ENV=production`
   - `PORT` (automatically assigned)

#### Configuration Files Overview

- **`railway.json`**: Main Railway configuration
- **`nixpacks.toml`**: Build system configuration
- **`scripts/pre-deploy.sh`**: Pre-deployment optimization script
- **`scripts/build-production.js`**: Production build script

### Method 2: Environment Variables Only

If you prefer minimal configuration, you can deploy with just environment variables:

```bash
# Set in Railway dashboard under Variables
NODE_ENV=production
VITE_APP_ENV=production
BUILD_COMMAND=npm run build
START_COMMAND=npm run preview -- --host 0.0.0.0 --port $PORT
```

### Method 3: Pre-Deployment Script

Use the pre-deployment script for custom build optimization:

```bash
# Railway will automatically detect and run scripts/pre-deploy.sh
chmod +x scripts/pre-deploy.sh
```

## 🎨 Render Deployment

### Configuration-Based Method

1. **Create `render.yaml`** (optional):
   ```yaml
   services:
     - type: web
       name: codecraft-ai
       env: static
       buildCommand: npm run build
       staticPublishPath: ./dist
       routes:
         - type: rewrite
           source: /*
           destination: /index.html
   ```

2. **Deploy**:
   - Connect GitHub repository to Render
   - Render auto-detects Vite configuration

## ⚡ Vercel Deployment

### Zero-Config Method

1. **Create `vercel.json`**:
   ```json
   {
     "framework": "vite",
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "routes": [
       { "handle": "filesystem" },
       { "src": "/.*", "dest": "/index.html" }
     ]
   }
   ```

2. **Deploy**:
   ```bash
   npx vercel --prod
   ```

## 🔧 Production Optimizations

### Automatic Optimizations (No Code Changes Required)

1. **Build-Time Optimizations**:
   - Automatic code splitting
   - Tree shaking
   - Asset optimization
   - Gzip compression

2. **Runtime Optimizations**:
   - Service worker caching
   - CDN distribution
   - HTTP/2 push hints

3. **Health Monitoring**:
   - `/health` endpoint for monitoring
   - Automatic restart on failure
   - Performance tracking

### Platform-Specific Features

#### Railway Features
- Automatic HTTPS
- Global CDN
- Zero-downtime deployments
- Built-in monitoring

#### Render Features  
- Free SSL certificates
- DDoS protection
- Global CDN
- Pull request previews

#### Vercel Features
- Edge functions
- Image optimization
- Analytics
- A/B testing

## 🛡️ Security Configuration

All deployment methods include:

- Content Security Policy (CSP)
- HTTPS enforcement
- CORS configuration
- Rate limiting (platform-dependent)

## 📊 Monitoring and Analytics

### Health Checks
Access health status at: `https://your-app.railway.app/health`

### Performance Monitoring
- Core Web Vitals tracking
- Error rate monitoring  
- Response time tracking

## 🚀 Advanced Deployment Features

### 1. Multi-Environment Support
```bash
# Staging environment
railway deploy --environment staging

# Production environment  
railway deploy --environment production
```

### 2. Custom Build Optimization
The `scripts/build-production.js` provides:
- Custom asset optimization
- Health check generation
- Platform-specific tweaks

### 3. Zero-Downtime Deployments
All platforms support rolling deployments with zero downtime.

## 💰 Cost Optimization

### Railway
- Free tier: 500 hours/month
- Automatic scaling based on usage
- Pay-per-use pricing

### Render
- Static sites: Free with limitations
- Automatic scaling
- Fixed pricing tiers

### Vercel
- Hobby plan: Free for personal projects
- Pro plan: $20/month per team member
- Enterprise: Custom pricing

## 🆘 Troubleshooting

### Build Issues
```bash
# Check build logs
railway logs --deployment

# Test build locally
npm run build:production
```

### Runtime Issues
```bash
# Check application logs
railway logs --follow

# Check health endpoint
curl https://your-app.railway.app/health
```

### Environment Issues
- Verify environment variables are set correctly
- Check build command configuration
- Validate start command

---

**Key Advantages of Configuration-Based Deployment:**
- ✅ No package.json modifications required
- ✅ Platform-specific optimizations
- ✅ Easy environment management
- ✅ Automated health checks
- ✅ Zero-config deployments
