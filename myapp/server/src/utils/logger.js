// Logger utility for production-ready logging
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists (gracefully handle if it fails)
let logsDir;
let fileLoggingEnabled = false;

try {
  logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  fileLoggingEnabled = true;
} catch (error) {
  // In production/containers, file logging might not be available
  console.warn('⚠️  File logging disabled: Cannot create logs directory');
  console.warn(`   Reason: ${error.message}`);
  console.warn('   Logging to console only');
  fileLoggingEnabled = false;
}

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  constructor() {
    this.fileLoggingEnabled = fileLoggingEnabled;
    if (fileLoggingEnabled) {
      this.logFile = path.join(logsDir, 'app.log');
      this.errorFile = path.join(logsDir, 'error.log');
    }
  }

  _formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] [${level}] ${message} ${metaStr}\n`;
  }

  _writeToFile(filename, message) {
    if (!this.fileLoggingEnabled) return; // Skip if file logging disabled
    
    try {
      fs.appendFileSync(filename, message);
    } catch (error) {
      // Silently fail - just log to console instead
      console.error('Failed to write to log file:', error.message);
    }
  }

  _log(level, message, meta = {}) {
    const formattedMessage = this._formatMessage(level, message, meta);
    
    // Console output with colors
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[90m'  // Gray
    };
    const reset = '\x1b[0m';
    
    if (process.env.NODE_ENV !== 'test') {
      console.log(`${colors[level]}${formattedMessage.trim()}${reset}`);
    }
    
    // Write to file (only if file logging enabled)
    if (this.fileLoggingEnabled && this.logFile) {
      this._writeToFile(this.logFile, formattedMessage);
    }
    
    // Write errors to separate file (only if file logging enabled)
    if (this.fileLoggingEnabled && level === LOG_LEVELS.ERROR && this.errorFile) {
      this._writeToFile(this.errorFile, formattedMessage);
    }
  }

  error(message, meta = {}) {
    this._log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this._log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this._log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      this._log(LOG_LEVELS.DEBUG, message, meta);
    }
  }

  // Log HTTP requests
  logRequest(req) {
    this.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      body: req.method !== 'GET' ? req.body : undefined
    });
  }

  // Log HTTP responses
  logResponse(req, res, duration) {
    this.info(`${req.method} ${req.path} - ${res.statusCode}`, {
      duration: `${duration}ms`,
      ip: req.ip
    });
  }
}

module.exports = new Logger();
