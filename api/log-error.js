/**
 * Vercel Serverless Function: Log Errors
 *
 * Receives error reports from the client and logs them.
 * In production, this could forward to Sentry, LogRocket, etc.
 */

import { checkRateLimit, getClientIp, rateLimitConfig } from './_utils/rateLimit.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Reject oversized payloads (100KB limit for error logs)
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > 100 * 1024) {
      return res.status(413).json({ error: 'Payload too large' });
    }

    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      if (rateLimit.errorType === 'config') {
        return res.status(500).json({
          error: 'Rate limiting not configured',
          errorType: 'config'
        });
      }

      res.setHeader('Retry-After', rateLimit.retryAfter || rateLimitConfig.windowSeconds);
      return res.status(429).json({
        error: `Rate limit exceeded. Please wait ${rateLimit.retryAfter || rateLimitConfig.windowSeconds} seconds.`,
        errorType: 'rate_limit',
        retryAfterSeconds: rateLimit.retryAfter || rateLimitConfig.windowSeconds
      });
    }

    const { errors } = req.body;

    if (!Array.isArray(errors) || errors.length === 0) {
      return res.status(400).json({ error: 'No errors provided' });
    }

    // Limit batch size to prevent log flooding
    if (errors.length > 50) {
      return res.status(400).json({ error: 'Too many errors in single batch (max 50)' });
    }

    // Truncate strings to prevent log injection with oversized data
    const truncate = (val, max = 1000) =>
      typeof val === 'string' ? val.slice(0, max) : val;

    // Log errors with structured format for Vercel logging
    errors.forEach((error, index) => {
      if (!error || typeof error !== 'object') return;

      const logEntry = {
        type: 'CLIENT_ERROR',
        clientIp,
        severity: truncate(error.severity, 20),
        category: truncate(error.category, 50),
        message: truncate(error.message, 500),
        stack: truncate(error.stack, 2000),
        tags: Array.isArray(error.tags) ? error.tags.slice(0, 10).map(t => truncate(t, 50)) : [],
        context: truncate(JSON.stringify(error.context || {}), 2000),
        timestamp: truncate(error.environment?.timestamp, 30),
        sessionId: truncate(error.environment?.sessionId, 50),
        url: truncate(error.environment?.url, 500),
        userAgent: truncate(error.environment?.userAgent, 300),
        platform: truncate(error.environment?.platform, 50),
        language: truncate(error.environment?.language, 10),
        screenResolution: `${error.environment?.screenWidth}x${error.environment?.screenHeight}`
      };

      // Use appropriate log level based on severity
      switch (error.severity) {
        case 'critical':
          console.error('[CRITICAL]', JSON.stringify(logEntry, null, 2));
          break;
        case 'error':
          console.error('[ERROR]', JSON.stringify(logEntry, null, 2));
          break;
        case 'warning':
          console.warn('[WARNING]', JSON.stringify(logEntry, null, 2));
          break;
        default:
          console.log('[INFO]', JSON.stringify(logEntry, null, 2));
      }
    });

    // In a real production setup, you would forward to:
    // - Sentry: Sentry.captureException(error)
    // - LogRocket: LogRocket.captureException(error)
    // - Custom logging service: await fetch('https://logs.example.com/ingest', ...)

    return res.status(200).json({
      success: true,
      logged: errors.length
    });

  } catch (error) {
    console.error('Error logging client errors:', error);
    return res.status(500).json({ error: 'Failed to log errors' });
  }
}
