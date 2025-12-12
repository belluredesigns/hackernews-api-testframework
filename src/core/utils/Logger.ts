/**
 * Log level enumeration.
 * Defines the severity levels for logging messages.
 */
export enum LogLevel {
  /** Debug level - most verbose, for detailed debugging information */
  DEBUG = 'DEBUG',
  /** Info level - general informational messages */
  INFO = 'INFO',
  /** Warning level - warning messages for potentially problematic situations */
  WARN = 'WARN',
  /** Error level - error messages for serious problems */
  ERROR = 'ERROR'
}

/**
 * Logger (Singleton).
 * Provides centralized logging functionality with configurable log levels.
 * Outputs timestamped log messages to the console.
 */
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;

  /**
   * Private constructor to enforce singleton pattern.
   */
  private constructor() {}

  /**
   * Gets the singleton instance of Logger.
   * Creates a new instance if one doesn't exist.
   * @returns The Logger singleton instance
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Sets the minimum log level for output.
   * Only messages at this level or higher will be logged.
   * @param level - The minimum LogLevel to output
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Determines if a message at the given level should be logged.
   * @private
   * @param level - The LogLevel to check
   * @returns True if the message should be logged, false otherwise
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  /**
   * Internal logging method that formats and outputs log messages.
   * @private
   * @param level - The LogLevel for this message
   * @param message - The message to log
   * @param data - Optional additional data to include
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data || '');
        break;
      case LogLevel.DEBUG:
      case LogLevel.INFO:
      default:
        console.log(logMessage, data || '');
    }
  }

  /**
   * Logs a debug message.
   * Only outputs if log level is DEBUG or more verbose.
   * @param message - The debug message to log
   * @param data - Optional additional data to include
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Logs an informational message.
   * Only outputs if log level is INFO or more verbose.
   * @param message - The informational message to log
   * @param data - Optional additional data to include
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Logs a warning message.
   * Only outputs if log level is WARN or more verbose.
   * @param message - The warning message to log
   * @param data - Optional additional data to include
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Logs an error message.
   * Only outputs if log level is ERROR or more verbose.
   * @param message - The error message to log
   * @param data - Optional additional data to include
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }
}

export default Logger.getInstance();
