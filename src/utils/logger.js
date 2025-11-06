import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels with numeric values for priority
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Current log level from environment variable, defaults to INFO
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL || 'INFO'] || LOG_LEVELS.INFO;

// ANSI color codes for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  green: '\x1b[32m',
  magenta: '\x1b[35m'
};

// Function to get current timestamp in ISO format
const getTimestamp = () => new Date().toISOString();

// Function to format log message with color and timestamp
const formatLog = (level, message, color) => {
  const timestamp = getTimestamp();
  const logMessage = `${COLORS.gray}[${timestamp}]${COLORS.reset} ${color}${level}${COLORS.reset} - ${message}`;
  console.log(logMessage);
  return `[${timestamp}] ${level} - ${message}`;
};

// Function to write log to file
const writeLogToFile = (level, message) => {
  const timestamp = new Date().toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
  const logFilePath = path.join(logsDir, `app-${timestamp}.log`);
  
  const logEntry = `[${new Date().toISOString()}] ${level} - ${message}\n`;
  fs.appendFileSync(logFilePath, logEntry, 'utf8');
};

// Function to check if logging level is enabled
const isLogLevelEnabled = (level) => {
  return LOG_LEVELS[level] <= CURRENT_LOG_LEVEL;
};

// Enhanced logger object with different log levels
const logger = {
  error: (msg) => {
    if (isLogLevelEnabled('ERROR')) {
      const formatted = formatLog('ERROR', msg, COLORS.red);
      writeLogToFile('ERROR', msg);
    }
  },
  
  warn: (msg) => {
    if (isLogLevelEnabled('WARN')) {
      const formatted = formatLog('WARN', msg, COLORS.yellow);
      writeLogToFile('WARN', msg);
    }
  },
  
  info: (msg) => {
    if (isLogLevelEnabled('INFO')) {
      const formatted = formatLog('INFO', msg, COLORS.blue);
      writeLogToFile('INFO', msg);
    }
  },
  
  debug: (msg) => {
    if (isLogLevelEnabled('DEBUG')) {
      const formatted = formatLog('DEBUG', msg, COLORS.cyan);
      writeLogToFile('DEBUG', msg);
    }
  },
  
  trace: (msg) => {
    if (isLogLevelEnabled('TRACE')) {
      const formatted = formatLog('TRACE', msg, COLORS.gray);
      writeLogToFile('TRACE', msg);
    }
  },
  
  // Utility function to log API request details
  apiRequest: (req, statusCode, responseTime) => {
    if (isLogLevelEnabled('INFO')) {
      const logMessage = `${req.method} ${req.path} - ${statusCode} (${responseTime}ms) [${req.ip}]`;
      const formatted = formatLog('API', logMessage, COLORS.green);
      writeLogToFile('API', logMessage);
    }
  },
  
  // Utility function for ready/success messages
  ready: (msg) => {
    if (isLogLevelEnabled('INFO')) {
      const formatted = formatLog('READY', msg, COLORS.green);
      writeLogToFile('INFO', msg);
    }
  },
  
  // Utility function to log errors with stack trace
  errorWithStack: (error, context = '') => {
    if (isLogLevelEnabled('ERROR')) {
      const message = context ? `${context}: ${error.message}` : error.message;
      const logMessage = `${message}\nStack: ${error.stack}`;
      const formatted = formatLog('ERROR', message, COLORS.red);
      writeLogToFile('ERROR', logMessage);
    }
  },
  
  // Function to change log level at runtime
  setLogLevel: (level) => {
    if (LOG_LEVELS[level] !== undefined) {
      process.env.LOG_LEVEL = level;
      logger.info(`Log level changed to ${level}`);
    } else {
      logger.warn(`Invalid log level: ${level}. Valid levels: ${Object.keys(LOG_LEVELS).join(', ')}`);
    }
  },
  
  // Function to get current log level
  getLogLevel: () => process.env.LOG_LEVEL || 'INFO'
};

export default logger;