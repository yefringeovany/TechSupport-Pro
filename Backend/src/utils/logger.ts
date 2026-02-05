import winston from 'winston';
import mongoose from 'mongoose';

// Schema para logs en MongoDB
const logSchema = new mongoose.Schema({
  level: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  meta: mongoose.Schema.Types.Mixed
});

// Evitar error de modelo duplicado
const LogModel = mongoose.models.Log || mongoose.model('Log', logSchema);

// Funcion para guardar log en MongoDB
const saveToMongoDB = async (level: string, message: string, meta?: object) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await LogModel.create({
        level,
        message,
        timestamp: new Date(),
        meta: meta || {}
      });
    }
  } catch (error) {
    // Silenciar errores de MongoDB para no interrumpir el flujo
  }
};

// Formato personalizado para consola
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Formato para archivos (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Crear logger de Winston
const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat
    }),
    // File transport para errores
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // File transport para todos los logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Wrapper del logger que tambien guarda en MongoDB
const logger = {
  info: (message: string, meta?: object) => {
    winstonLogger.info(message, meta);
    saveToMongoDB('info', message, meta);
  },
  error: (message: string, meta?: object) => {
    winstonLogger.error(message, meta);
    saveToMongoDB('error', message, meta);
  },
  warn: (message: string, meta?: object) => {
    winstonLogger.warn(message, meta);
    saveToMongoDB('warn', message, meta);
  },
  debug: (message: string, meta?: object) => {
    winstonLogger.debug(message, meta);
    saveToMongoDB('debug', message, meta);
  }
};

// Funciones helper para logging
export const logInfo = (message: string, meta?: object) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error | unknown, meta?: object) => {
  const errorMeta = {
    ...meta,
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : error
  };
  logger.error(message, errorMeta);
};

export const logWarn = (message: string, meta?: object) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: object) => {
  logger.debug(message, meta);
};

// Log de acciones de tickets (para supervisor)
export const logTicketAction = (action: string, ticketId: number, userId?: number, details?: object) => {
  logger.info(`Ticket Action: ${action}`, {
    action,
    ticketId,
    userId,
    ...details
  });
};

// Log de supervisor notification
export const logSupervisorNotification = (message: string, ticketIds: number[]) => {
  logger.warn(`Supervisor Notification: ${message}`, {
    notificationType: 'supervisor_alert',
    ticketIds,
    timestamp: new Date().toISOString()
  });
};

export default logger;
