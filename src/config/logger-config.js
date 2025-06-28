const winston = require('winston');
const dotenv = require('dotenv');
require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const { combine, timestamp, printf, colorize } = winston.format;

// Load package.json using relative path
const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Application metadata
const APP_NAME = packageJson.name || 'ms-api';
const APP_VERSION = packageJson.version || '1.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Generate correlation ID
const generateCorrelationId = () => {
  const now = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `req-${now}-${randomStr}`;
};

// Format metadata for professional structured logging
const metadataFormatter = winston.format((info) => {
  // Add standard context to all logs
  info.service = APP_NAME;
  info.version = APP_VERSION;
  info.environment = NODE_ENV;

  // Add correlation ID if not present
  if (!info.correlationId) {
    info.correlationId = generateCorrelationId();
  }

  // Add timestamp with millisecond precision
  if (!info.timestamp) {
    info.timestamp = new Date().toISOString();
  }

  // Clean sensitive data if present
  if (info.headers && info.headers.authorization) {
    info.headers.authorization = '[REDACTED]';
  }

  // Clean sensitive cookies if present
  if (info.headers && info.headers.cookie) {
    info.headers.cookie = '[REDACTED]';
  }

  // Remove very large or circular objects
  if (info.body && Object.keys(info.body).length > 100) {
    info.body = '[BODY TOO LARGE]';
  }

  return info;
});

// Custom format for structured error logging with your preferred layout
const customFormat = printf(({ level, message, timestamp, ...meta }) => {
  const {
    correlationId,
    errorCode,
    method,
    url,
    ip,
    durationMs,
    service,
    version,
    environment,
    headers,
    ...rest
  } = meta;

  const context = {
    ...(correlationId && { correlationId }),
    ...(errorCode && { errorCode }),
    ...(method && { method }),
    ...(url && { url }),
    ...(ip && { ip }),
    ...(durationMs !== undefined && { durationMs }),
    ...(service && { service }),
    ...(version && { version }),
    ...(environment && { environment }),
    ...(headers && { headers }),
    ...rest,
  };

  const formattedContext =
    Object.keys(context).length > 0
      ? `\n${JSON.stringify(context, null, 2)}`
      : '';

  const timestampWithMs =
    timestamp && timestamp.includes('.')
      ? timestamp
      : `${timestamp}.${new Date().getMilliseconds().toString().padStart(3, '0')}`;

  return `${timestampWithMs} : ${level}: ${message} - context: ${formattedContext}`;
});

// Configure file rotation transports
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '10d',
  maxSize: '20m',
  zippedArchive: true,
  frequency: NODE_ENV === 'production' ? '1d' : '1m',
  auditFile: path.join(logsDir, 'log-audit.json'),
});

const errorFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '10d',
  maxSize: '20m',
  level: 'error',
  zippedArchive: true,
  frequency: NODE_ENV === 'production' ? '1d' : '1m',
  auditFile: path.join(logsDir, 'error-log-audit.json'),
});

// Create the logger
const logger = winston.createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    metadataFormatter(),
    customFormat,
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        metadataFormatter(),
        customFormat,
      ),
    }),
    errorFileRotateTransport,
    fileRotateTransport,
  ],
});

// Add convenience methods for enhanced logging
// Attach httpRequest middleware to logger at the top-level scope
logger.httpRequest = (req, res, next) => {
  const startTime = process.hrtime();
  const correlationId =
    req.headers['x-correlation-id'] || generateCorrelationId();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  logger.info(`${req.method} ${req.originalUrl}`, {
    correlationId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    headers: req.headers,
  });

  res.on('finish', () => {
    const hrtime = process.hrtime(startTime);
    const durationMs = Math.round(hrtime[0] * 1000 + hrtime[1] / 1000000);
    const statusCode = res.statusCode;
    const logMethod =
      statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    let errorCode = null;
    if (statusCode === 404) errorCode = 'RESOURCE_NOT_FOUND';
    else if (statusCode >= 500) errorCode = 'SERVER_ERROR';
    else if (statusCode >= 400) errorCode = 'CLIENT_ERROR';

    logger[logMethod](`${statusCode} ${req.method} ${req.originalUrl}`, {
      correlationId,
      statusCode,
      errorCode,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      durationMs,
    });
  });

  next();
};

module.exports = logger;
