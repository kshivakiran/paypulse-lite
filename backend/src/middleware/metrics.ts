import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

// Collect default system metrics (CPU, Memory, Event Loop)
client.collectDefaultMetrics({ register: client.register });

// Custom Prometheus Counter & Histogram
export const httpRequestCounter = new client.Counter({
  name: 'paypulse_http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status'],
});

export const httpRequestDuration = new client.Histogram({
  name: 'paypulse_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

/**
 * Normalizes route path to avoid high-cardinality label explosion in Prometheus
 */
function normalizePath(req: Request): string {
  if (req.route && req.route.path) {
    return `${req.baseUrl || ''}${req.route.path}`;
  }
  // Replace UUIDs and numeric IDs with generic placeholder
  const rawPath = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;
  return rawPath
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id')
    .replace(/\/\d+/g, '/:id');
}

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = normalizePath(req);

    httpRequestCounter.inc({ method: req.method, route, status: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route, status: res.statusCode }, duration);
  });

  next();
};

export const getMetricsHandler = async (_req: Request, res: Response) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
};
