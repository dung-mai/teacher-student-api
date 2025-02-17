import winston from 'winston';

const isDev = process.env.NODE_ENV !== 'production';

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : '';
    return `[${timestamp}] [${level}]: ${message} ${metaString}`;
  }),
);

const prodFormat = winston.format.json();

export const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  format: isDev ? devFormat : prodFormat,
  transports: [new winston.transports.Console()],
});
