/**
 * Configuration file for application logging settings
 * 
 * This file contains logging configuration that can be used throughout the application
 */

// Default logging configuration
const logConfig = {
  // Log level (ERROR, WARN, INFO, DEBUG, TRACE)
  level: process.env.LOG_LEVEL || 'INFO',
  
  // Log format options
  format: {
    // Include timestamp in logs
    timestamp: true,
    
    // Include log level in logs
    level: true,
    
    // Include request details in API logs
    requestDetails: true,
  },
  
  // File logging options
  file: {
    // Enable file logging
    enabled: process.env.LOG_TO_FILE !== 'false',
    
    // Maximum file size before rotation (in MB)
    maxSize: parseInt(process.env.LOG_MAX_SIZE || '10'),
    
    // Number of rotated files to keep
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
    
    // Directory for log files
    directory: process.env.LOG_DIR || './logs',
  },
  
  // Console logging options
  console: {
    // Enable console logging
    enabled: process.env.LOG_TO_CONSOLE !== 'false',
  },
  
  // Sensitive data masking
  masking: {
    // Fields to mask in logs (passwords, tokens, etc.)
    fields: [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'auth',
      'cookie'
    ]
  }
};

export default logConfig;