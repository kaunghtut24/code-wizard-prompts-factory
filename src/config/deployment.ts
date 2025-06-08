
// Deployment configuration that doesn't require package.json changes
export const deploymentConfig = {
  railway: {
    buildCommand: 'node scripts/build-production.js',
    startCommand: 'npm run preview -- --host 0.0.0.0 --port $PORT',
    healthCheck: '/health',
    environment: {
      NODE_ENV: 'production',
      VITE_APP_ENV: 'production'
    }
  },
  
  render: {
    buildCommand: 'npm run build',
    staticPublishPath: './dist',
    healthCheck: '/health'
  },
  
  vercel: {
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    framework: 'vite'
  }
};

// Runtime environment detection
export const getDeploymentEnvironment = () => {
  if (process.env.RAILWAY_ENVIRONMENT) return 'railway';
  if (process.env.RENDER) return 'render';
  if (process.env.VERCEL) return 'vercel';
  return 'development';
};

// Platform-specific optimizations
export const applyPlatformOptimizations = () => {
  const platform = getDeploymentEnvironment();
  
  switch (platform) {
    case 'railway':
      // Railway-specific optimizations
      console.log('🚂 Applying Railway optimizations...');
      return {
        chunkSizeWarningLimit: 1000,
        assetsInlineLimit: 4096
      };
      
    case 'render':
      // Render-specific optimizations  
      console.log('🎨 Applying Render optimizations...');
      return {
        chunkSizeWarningLimit: 500,
        assetsInlineLimit: 2048
      };
      
    default:
      return {};
  }
};
