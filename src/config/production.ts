
// Production configuration for deployment
export const productionConfig = {
  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  
  // Logging Configuration
  logging: {
    level: 'error', // Only log errors in production
    enableConsole: false, // Disable console logs in production
    enableRemoteLogging: false, // Can be enabled for error tracking services
  },
  
  // Performance Configuration
  performance: {
    enableServiceWorker: true,
    enableCodeSplitting: true,
    enableLazyLoading: true,
  },
  
  // Security Configuration
  security: {
    enableCSP: true, // Content Security Policy
    enableHTTPS: true,
    enableCORS: true,
  },
  
  // Feature Flags
  features: {
    enableAnalytics: false, // Can be enabled for production analytics
    enableErrorReporting: false, // Can be enabled for error tracking
    enablePerformanceMonitoring: false,
  }
};

// Environment detection
export const isProduction = () => {
  return import.meta.env.PROD || import.meta.env.MODE === 'production';
};

// Development mode detection
export const isDevelopment = () => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

// Logging utility for production
export const logger = {
  error: (message: string, error?: any) => {
    if (isDevelopment() || productionConfig.logging.enableConsole) {
      console.error(message, error);
    }
    // In production, you might want to send to error tracking service
    if (isProduction() && productionConfig.features.enableErrorReporting) {
      // Send to error tracking service like Sentry
    }
  },
  
  warn: (message: string) => {
    if (isDevelopment()) {
      console.warn(message);
    }
  },
  
  info: (message: string) => {
    if (isDevelopment()) {
      console.info(message);
    }
  },
  
  debug: (message: string) => {
    if (isDevelopment()) {
      console.debug(message);
    }
  }
};
