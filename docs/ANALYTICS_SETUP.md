# Vercel Web Analytics Setup Guide

This guide explains how to set up Vercel Web Analytics and Speed Insights for Stockify.

## Overview

Vercel Web Analytics provides privacy-friendly analytics without cookies:

- ✅ Page views and unique visitors
- ✅ Core Web Vitals monitoring (LCP, FID, CLS, FCP, TTFB)
- ✅ Real-time performance metrics
- ✅ Geographic distribution
- ✅ Top pages and referrers
- ✅ Custom events (optional)

**Benefits:**
- No cookies required (GDPR/CCPA compliant)
- No impact on page performance (<1KB script)
- Real-time dashboard
- Free on Vercel Pro plan

---

## Setup Instructions

### Step 1: Install Package

```bash
npm install @vercel/analytics @vercel/speed-insights
```

### Step 2: Enable in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Stockify project
3. Navigate to **Analytics** tab
4. Click **Enable Web Analytics**
5. Click **Enable Speed Insights**

### Step 3: Enable in Code

Edit `src/utils/analyticsIntegration.js` and uncomment the imports:

**Before:**
```javascript
// import { Analytics } from '@vercel/analytics/react';
// import { SpeedInsights } from '@vercel/speed-insights/react';
```

**After:**
```javascript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
```

Then uncomment the components in the `AnalyticsProvider`:

**Before:**
```javascript
{/* <Analytics /> */}
{/* <SpeedInsights /> */}
```

**After:**
```javascript
<Analytics />
<SpeedInsights />
```

### Step 4: Add to App

Edit `src/index.js`:

```javascript
import { AnalyticsProvider } from './utils/analyticsIntegration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AnalyticsProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AnalyticsProvider>
  </React.StrictMode>
);
```

### Step 5: Deploy and Verify

1. Commit and push changes
2. Deploy to Vercel
3. Visit your site
4. Check Vercel Dashboard → Analytics (data appears within minutes)

---

## Core Web Vitals Explained

### LCP (Largest Contentful Paint)
- **What**: Time until largest content element is visible
- **Target**: < 2.5 seconds
- **Impact**: User perception of load speed

### FID (First Input Delay)
- **What**: Time from first user interaction to browser response
- **Target**: < 100 milliseconds
- **Impact**: Responsiveness

### CLS (Cumulative Layout Shift)
- **What**: Visual stability during page load
- **Target**: < 0.1
- **Impact**: User experience (no unexpected shifts)

### FCP (First Contentful Paint)
- **What**: Time until first content is rendered
- **Target**: < 1.8 seconds
- **Impact**: Perceived load speed

### TTFB (Time to First Byte)
- **What**: Server response time
- **Target**: < 600 milliseconds
- **Impact**: Backend performance

---

## Custom Events (Optional)

### Built-in Event Tracking

The analytics integration includes pre-built tracking for:

1. **Image Upload**
   - Event: `image_upload`
   - Properties: `count`, `totalSize`

2. **Processing Start**
   - Event: `processing_start`
   - Properties: `imageCount`, `model`, `platform`

3. **Processing Complete**
   - Event: `processing_complete`
   - Properties: `imageCount`, `successCount`, `failureCount`, `durationSeconds`

4. **CSV Download**
   - Event: `csv_download`
   - Properties: `rowCount`, `platform`

5. **Error Tracking**
   - Event: `error`
   - Properties: `errorType`, `errorMessage`

6. **Platform/Model Changes**
   - Events: `platform_change`, `model_change`
   - Properties: `from`, `to`

### Enable Custom Event Tracking

Edit `src/utils/analyticsIntegration.js` and uncomment in `trackEvent()`:

```javascript
export const trackEvent = (eventName, properties = {}) => {
  if (typeof window !== 'undefined' && window.va) {
    window.va('event', eventName, properties);
  }
};
```

### Add Tracking to App

Edit `src/App.js` to import and use event tracking:

```javascript
import {
  trackImageUpload,
  trackProcessingStart,
  trackProcessingComplete,
  trackCSVDownload
} from './utils/analyticsIntegration';

// In handleFilesAdded:
trackImageUpload(validImages.length, totalSize);

// In handleProcessImages:
trackProcessingStart(images.length, selectedModel, selectedPlatform);

// After processing completes:
trackProcessingComplete(
  result.length,
  result.filter(r => !r.error).length,
  Date.now() - startTime
);

// In handleDownloadCSV:
trackCSVDownload(validForCsv.length, selectedPlatform);
```

---

## Viewing Analytics

### 1. Web Analytics Dashboard

**Access:** Vercel Dashboard → Your Project → Analytics

**Metrics:**
- Visitors (total and unique)
- Page views
- Top pages
- Referrers
- Countries
- Browsers
- Devices

**Time Ranges:**
- Last 24 hours
- Last 7 days
- Last 30 days
- Custom range

### 2. Speed Insights Dashboard

**Access:** Vercel Dashboard → Your Project → Speed Insights

**Metrics:**
- Core Web Vitals scores
- Performance over time
- Geographic performance
- Device-specific metrics

### 3. Custom Events

**Access:** Vercel Dashboard → Your Project → Analytics → Events tab

**View:**
- Event counts
- Event properties
- Trends over time
- Funnels and conversions

---

## Optimization Tips

### Improve LCP (Largest Contentful Paint)

1. **Optimize images:**
   - Use next-generation formats (WebP)
   - Lazy load images
   - Use responsive images

2. **Reduce render-blocking resources:**
   - Defer non-critical CSS
   - Minimize JavaScript

3. **Improve server response time:**
   - Use edge caching
   - Optimize API calls

### Improve FID (First Input Delay)

1. **Reduce JavaScript execution time:**
   - Code splitting
   - Remove unused code
   - Defer non-critical scripts

2. **Optimize event handlers:**
   - Use passive event listeners
   - Debounce expensive operations

### Improve CLS (Cumulative Layout Shift)

1. **Reserve space for dynamic content:**
   - Set dimensions on images
   - Use skeleton loaders
   - Avoid injecting content above existing content

2. **Avoid layout shifts:**
   - Load fonts properly
   - Use CSS aspect-ratio

### Improve TTFB (Time to First Byte)

1. **Optimize backend:**
   - Use serverless functions efficiently
   - Implement caching
   - Reduce API calls

2. **Use CDN:**
   - Leverage Vercel's Edge Network
   - Cache static assets

---

## Privacy and Compliance

### GDPR/CCPA Compliance

Vercel Analytics is privacy-first:
- ✅ No cookies
- ✅ No personal data collected
- ✅ No cross-site tracking
- ✅ Aggregated data only
- ✅ No consent banner required

### Data Retention

- Analytics data: 30 days
- Speed Insights: 30 days
- Can be exported via API

---

## Cost

### Hobby Plan (Free)
- ❌ Web Analytics not included
- ❌ Speed Insights not included

### Pro Plan ($20/month)
- ✅ Web Analytics included
- ✅ Speed Insights included
- ✅ Unlimited events
- ✅ Custom events
- ✅ Export data

### Enterprise Plan
- ✅ All Pro features
- ✅ Advanced analytics
- ✅ Custom retention
- ✅ SLA guarantees

---

## Troubleshooting

### Analytics Not Showing Data

1. **Check if enabled**: Verify in Vercel Dashboard → Analytics
2. **Check plan**: Analytics requires Pro plan
3. **Wait for data**: First data appears within 5-10 minutes
4. **Check code**: Ensure `<Analytics />` component is rendered
5. **Check deployment**: Verify latest code is deployed

### Speed Insights Not Working

1. **Enable in dashboard**: Go to Speed Insights tab → Enable
2. **Check plan**: Requires Pro plan
3. **Visit site**: Metrics collected from real user visits
4. **Wait**: Needs ~100 visits for meaningful data

### Custom Events Not Appearing

1. **Check code**: Ensure `trackEvent()` is uncommented
2. **Verify calls**: Check browser console for `[Analytics]` logs in development
3. **Check dashboard**: Navigate to Analytics → Events tab
4. **Wait**: Events may take a few minutes to appear

---

## Best Practices

### 1. Monitor Regularly

- Check Core Web Vitals weekly
- Review trends after deployments
- Set performance budgets

### 2. Set Performance Targets

**Example targets:**
- LCP: < 2.0s (all devices)
- FID: < 50ms
- CLS: < 0.05
- Page load: < 3s

### 3. Track Key User Flows

Use custom events to track:
- Image upload success rate
- Processing completion rate
- CSV download rate
- Error rates by type

### 4. Optimize Based on Data

- Focus on pages with poor metrics
- Optimize for slowest regions
- Target device-specific issues

---

## Next Steps

1. ✅ Install packages: `npm install @vercel/analytics @vercel/speed-insights`
2. ✅ Enable in Vercel Dashboard
3. ✅ Uncomment code in `analyticsIntegration.js`
4. ✅ Add `<AnalyticsProvider>` to `src/index.js`
5. ✅ Deploy and verify
6. ⭕ Optional: Enable custom event tracking
7. 📊 Monitor and optimize

---

## Related Documentation

- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [Vercel Speed Insights Docs](https://vercel.com/docs/speed-insights)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Analytics Integration Source](../src/utils/analyticsIntegration.js)
