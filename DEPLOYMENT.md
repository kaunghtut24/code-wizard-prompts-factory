
# Deployment Guide

This guide covers deploying CodeCraft AI to Railway and Render cloud platforms.

## 🚂 Railway Deployment

Railway offers automatic deployments from GitHub with zero configuration.

### Prerequisites
- GitHub account with your code repository
- Railway account (free tier available)

### Steps

1. **Connect Repository**
   ```bash
   # Push your code to GitHub first
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```

2. **Deploy to Railway**
   - Go to [Railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect it's a Vite app and deploy

3. **Environment Variables** (if needed)
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add any environment variables your app needs

4. **Custom Domain** (optional)
   - In Railway dashboard, go to "Settings"
   - Add your custom domain
   - Update your DNS records

### Railway Configuration
Railway automatically detects Vite and uses these build commands:
```json
{
  "build": "npm run build",
  "start": "npm run preview"
}
```

## 🎨 Render Deployment

Render provides free static site hosting with automatic builds.

### Prerequisites
- GitHub account with your code repository
- Render account (free tier available)

### Steps

1. **Connect Repository**
   - Go to [Render.com](https://render.com)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Publish Directory: dist
   ```

3. **Deploy**
   - Click "Create Static Site"
   - Render will automatically build and deploy your app
   - You'll get a `.onrender.com` subdomain

4. **Custom Domain** (optional)
   - In Render dashboard, go to "Settings"
   - Add your custom domain
   - Update your DNS records

## 🔧 Production Optimizations

### 1. Environment Configuration
The app includes production configurations in `src/config/production.ts`:

- API timeouts and retry logic
- Error handling and logging
- Performance optimizations
- Security settings

### 2. Build Optimizations
Vite automatically includes:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

### 3. Performance Monitoring
Consider adding:
- Error tracking (Sentry)
- Analytics (Google Analytics)
- Performance monitoring (Web Vitals)

## 🛡️ Security Considerations

### 1. API Key Management
- Never commit API keys to your repository
- Use environment variables or Supabase secrets
- Implement proper validation

### 2. CORS Configuration
For custom API endpoints, ensure proper CORS settings:
```javascript
// Example CORS headers
Access-Control-Allow-Origin: your-domain.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 3. Content Security Policy
Add CSP headers to prevent XSS attacks:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline';">
```

## 📊 Monitoring and Analytics

### 1. Health Checks
Both platforms provide health check endpoints:
- Railway: Automatic health checks
- Render: Custom health check routes

### 2. Logs
Access application logs:
- Railway: Built-in log viewer
- Render: Log streaming in dashboard

### 3. Performance
Monitor key metrics:
- Page load times
- API response times
- Error rates
- User engagement

## 🚀 Continuous Deployment

Both platforms support automatic deployments:

1. **Push to main branch** → Automatic deployment
2. **Pull request previews** → Test changes before merging
3. **Rollback capabilities** → Revert to previous versions

## 💰 Cost Considerations

### Railway
- Free tier: 500 hours/month
- Pro: $5/month per user
- Usage-based pricing for resources

### Render
- Static sites: Free with limitations
- Web services: $7/month minimum
- Database: $7/month minimum

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check Node.js version compatibility
   npm run build
   ```

2. **API Connectivity**
   - Verify API endpoints are accessible
   - Check CORS configuration
   - Validate API keys

3. **Environment Variables**
   - Ensure all required variables are set
   - Check variable naming (case-sensitive)

4. **Memory Issues**
   - Optimize bundle size
   - Enable code splitting
   - Use lazy loading

### Support Resources
- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)
- Vite: [vitejs.dev/guide](https://vitejs.dev/guide/)

---

**Need help?** Check the deployment logs and error messages for specific issues.
