const http = require('http');
const { pathToFileURL } = require('url');
const fs = require('fs');
const path = require('path');

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const PORT = process.env.API_PORT ? Number(process.env.API_PORT) : 3001;
const isVerbose = process.argv.includes('--verbose');

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const normalized = trimmed.startsWith('export ') ? trimmed.slice(7) : trimmed;
    const separatorIndex = normalized.indexOf('=');
    if (separatorIndex === -1) return;

    const key = normalized.slice(0, separatorIndex).trim();
    if (!key) return;

    let value = normalized.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
};

const envMode = process.env.NODE_ENV || 'development';
const envFiles = [
  `.env.${envMode}.local`,
  `.env.${envMode}`,
  '.env.local',
  '.env'
];

envFiles.forEach((file) => loadEnvFile(path.join(process.cwd(), file)));

const routes = {
  '/api/generate-metadata': path.join(__dirname, '../api/generate-metadata.js'),
  '/api/log-error': path.join(__dirname, '../api/log-error.js'),
  '/api/health': path.join(__dirname, '../api/health.js')
};

const loadHandler = async (filePath) => {
  const moduleUrl = pathToFileURL(filePath).href;
  const mod = await import(moduleUrl);
  return mod.default;
};

const parseJsonBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        resolve(null);
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
};

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = requestUrl.pathname;
  const handlerPath = routes[pathname];

  res.status = (code) => {
    res.statusCode = code;
    return res;
  };

  res.json = (payload) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
  };

  if (!handlerPath) {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }

  try {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      req.body = await parseJsonBody(req);
    }

    if (isVerbose) {
      console.log(`[api] ${req.method} ${pathname}`);
    }

    const handler = await loadHandler(handlerPath);
    await handler(req, res);
  } catch (error) {
    if (error instanceof SyntaxError) {
      res.status(400).json({ error: 'Invalid JSON payload' });
      return;
    }

    console.error('[api] Handler error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`[api] Local API server listening on http://localhost:${PORT}`);
  if (isVerbose) {
    console.log('[api] Verbose logging enabled');
  }
});
