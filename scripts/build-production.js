
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Starting production build process...');

try {
  // Set production environment
  process.env.NODE_ENV = 'production';
  process.env.VITE_APP_ENV = 'production';
  
  // Clean previous build
  console.log('🧹 Cleaning previous build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  
  // Run Vite build with production optimizations
  console.log('⚡ Running Vite build...');
  execSync('npx vite build --mode production', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  });
  
  // Create health check endpoint
  console.log('❤️  Creating health check...');
  const healthDir = path.join('dist', 'health');
  if (!fs.existsSync(healthDir)) {
    fs.mkdirSync(healthDir, { recursive: true });
  }
  
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'production'
  };
  
  fs.writeFileSync(
    path.join(healthDir, 'index.json'),
    JSON.stringify(healthCheck, null, 2)
  );
  
  // Create a simple HTML health check page
  const healthHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Health Check</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>✅ Application Healthy</h1>
    <p>Status: OK</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
    <p>Environment: Production</p>
</body>
</html>`;
  
  fs.writeFileSync(path.join(healthDir, 'index.html'), healthHtml);
  
  console.log('✅ Production build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
