/**
 * Health Check Endpoint
 *
 * Returns service status for monitoring and load balancers.
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString()
  };

  if (!isProduction) {
    health.version = process.env.npm_package_version || '1.0.0';
    health.environment = process.env.NODE_ENV || 'development';
    health.checks = {
      api: 'ok',
      gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing'
    };
  }

  // Return unhealthy status if critical config is missing
  if (!process.env.GEMINI_API_KEY) {
    health.status = 'degraded';
    health.message = isProduction ? 'Service misconfigured' : 'GEMINI_API_KEY not configured';
    return res.status(503).json(health);
  }

  return res.status(200).json(health);
}
