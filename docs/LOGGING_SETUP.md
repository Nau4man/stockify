# Production Logging Setup Guide

This guide explains how to set up production error tracking and logging for Stockify.

## Overview

Stockify includes a built-in error tracking system with two tiers:

1. **Vercel Logging (Default)** - Built-in, requires no setup
2. **Sentry Integration (Optional)** - Advanced error tracking with stack traces, user context, and replay

---

## Tier 1: Vercel Logging (Built-in)

### What's Included

- ✅ Automatic error logging to Vercel Dashboard
- ✅ Structured JSON logs with severity levels
- ✅ Client IP tracking
- ✅ Session correlation
- ✅ Environment information (browser, screen size, URL, etc.)
- ✅ Error categorization (API, UI, Network, Validation)

### How to View Logs

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Stockify project
3. Click on "Logs" or "Functions" tab
4. Filter by:
   - `[CRITICAL]` - UI crashes, critical errors
   - `[ERROR]` - API failures, processing errors
   - `[WARNING]` - Non-critical issues
   - `[INFO]` - General information

### Log Format

```json
{
  "type": "CLIENT_ERROR",
  "severity": "error",
  "category": "api",
  "message": "Failed to generate metadata",
  "stack": "Error: ...",
  "clientIp": "123.45.67.89",
  "sessionId": "1234567890-abc123",
  "url": "https://stockify.vercel.app",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-01-31T10:30:00.000Z"
}
```

---

## Tier 2: Sentry Integration (Optional)

### Why Use Sentry?

- 📊 Dashboard with charts and trends
- 🔍 Advanced search and filtering
- 📧 Email/Slack alerts for critical errors
- 🎬 Session replay to see what users did before errors
- 📈 Performance monitoring
- 👥 User context (if you add authentication later)
- 🔗 Release tracking

### Setup Instructions

#### Step 1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io) and sign up (free tier available)
2. Create a new project
3. Select "React" as the platform
4. Copy your DSN (Data Source Name) - looks like:
   ```
   https://abc123@o456789.ingest.sentry.io/987654
   ```

#### Step 2: Install Sentry SDK

```bash
npm install @sentry/react
```

#### Step 3: Configure Environment Variables

Add to your `.env.local` (for local development):

```env
REACT_APP_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

Add to Vercel Environment Variables (for production):
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `REACT_APP_SENTRY_DSN` with your DSN value
3. Redeploy

#### Step 4: Enable Sentry in Code

Edit `src/utils/sentryIntegration.js` and uncomment the code:

**Before:**
```javascript
// import * as Sentry from '@sentry/react';
```

**After:**
```javascript
import * as Sentry from '@sentry/react';
```

Then uncomment all the function implementations in the file.

#### Step 5: Initialize Sentry in App

Edit `src/index.js` and add:

```javascript
import { initSentry } from './utils/sentryIntegration';

// Initialize Sentry before React rendering
initSentry();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### Step 6: Verify Setup

1. Deploy to Vercel or run locally
2. Trigger an error intentionally (e.g., process an invalid image)
3. Check Sentry dashboard to confirm errors are appearing

---

## What Gets Tracked

### Automatic Error Tracking

1. **UI Errors**
   - Component crashes caught by ErrorBoundary
   - Severity: CRITICAL
   - Includes component stack trace

2. **API Errors**
   - Failed Gemini API calls
   - Rate limit errors
   - Network errors
   - Severity: ERROR
   - Includes request details (sanitized)

3. **Network Errors**
   - Failed fetch requests
   - Timeout errors
   - Severity: WARNING

4. **Validation Errors**
   - Invalid metadata
   - CSV generation failures
   - Severity: INFO

### Data Sanitization

Sensitive data is automatically removed from logs:
- API keys (replaced with `[REDACTED]`)
- Tokens and passwords
- Base64 images (truncated to 100 chars)

---

## Monitoring Best Practices

### 1. Set Up Alerts

In Sentry Dashboard:
- Configure alerts for critical errors (immediate notification)
- Set up weekly digest for warnings
- Monitor error rate trends

### 2. Define Error Budget

Example targets:
- Error rate: < 1% of requests
- Critical errors: 0 per day
- Average response time: < 5s

### 3. Regular Review

- Check logs weekly for patterns
- Prioritize fixes based on frequency and severity
- Monitor after deployments

### 4. Use Tags for Filtering

Errors are automatically tagged:
- `api` - API-related errors
- `gemini` - Gemini AI errors
- `ui` - UI component errors
- `network` - Network/connectivity errors
- `validation` - Data validation errors
- `csv` - CSV generation errors

---

## Troubleshooting

### Errors Not Appearing in Sentry

1. **Check DSN is set**: Verify `REACT_APP_SENTRY_DSN` in environment variables
2. **Check code is uncommented**: Ensure `sentryIntegration.js` has Sentry code uncommented
3. **Check browser console**: Look for Sentry initialization messages
4. **Check Sentry quota**: Free tier has limits (5k events/month)

### Too Many Errors

1. **Filter development errors**: Sentry is disabled in development by default
2. **Add beforeSend filters**: Edit `sentryIntegration.js` to filter specific errors
3. **Adjust sample rates**: Reduce `tracesSampleRate` in production

### Missing Context

1. **Add custom context**: Use `setUserContext()` after user actions
2. **Add breadcrumbs**: Use `addBreadcrumb()` before critical operations
3. **Add tags**: Include relevant metadata with errors

---

## Cost Considerations

### Vercel Logging
- **Free tier**: 100 log drains per project
- **Pro tier**: Unlimited logs
- Logs retained for 7 days (free) or 30 days (pro)

### Sentry
- **Free tier**: 5,000 events/month
- **Team tier**: $26/month for 50,000 events
- Recommended: Start with free tier, upgrade if needed

---

## Example: Viewing Errors

### In Vercel Dashboard

```bash
# Filter logs in Vercel dashboard
search: [ERROR]
search: CLIENT_ERROR
search: api_error
search: sessionId:1234567890-abc123
```

### In Sentry Dashboard

1. **Issues** tab: Groups similar errors together
2. **Performance** tab: View API response times
3. **Replays** tab: Watch session replays for errors
4. **Releases** tab: Track errors by deployment

---

## Next Steps

1. ✅ Vercel logging is already active (no setup needed)
2. ⭕ Optional: Set up Sentry for advanced tracking
3. 📊 Monitor logs regularly
4. 🔔 Set up alerts for critical errors
5. 📈 Review trends and optimize based on data

---

## Related Documentation

- [Vercel Logging Docs](https://vercel.com/docs/observability/logs)
- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Error Tracker Source](../src/utils/errorTracker.js)
- [Sentry Integration Source](../src/utils/sentryIntegration.js)
