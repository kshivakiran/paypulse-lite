/**
 * Task 5.2 — Structured JSON Logger (Unit-V Observability)
 * Provides consistent, machine-parseable log output for production.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  [key: string]: any;
}

class Logger {
  private service: string;

  constructor(service = 'PayPulse-API') {
    this.service = service;
  }

  private format(level: LogLevel, message: string, meta: Record<string, any> = {}): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      ...meta,
    };
  }

  info(message: string, meta?: Record<string, any>) {
    console.log(JSON.stringify(this.format('info', message, meta)));
  }

  warn(message: string, meta?: Record<string, any>) {
    console.warn(JSON.stringify(this.format('warn', message, meta)));
  }

  error(message: string, meta?: Record<string, any>) {
    console.error(JSON.stringify(this.format('error', message, meta)));
  }

  debug(message: string, meta?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify(this.format('debug', message, meta)));
    }
  }
}

export const logger = new Logger();
