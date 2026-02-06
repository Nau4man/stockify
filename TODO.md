# Stockify Production Readiness TODO

## Critical (Blocking Deployment)

- [x] 1. Install npm dependencies
- [ ] 2. Stage and commit untracked files (api/, docs/, src/hooks/, src/components/modals/, etc.)
- [x] 3. Fix npm audit vulnerabilities (migrated to Vite and cleaned all audit findings)
- [x] 4. Add Content Security Policy (CSP) header to vercel.json

## Security Improvements

- [x] 5. Add request body size limit in API endpoint
- [x] 6. Improve rate limiting configuration (Upstash Redis-backed with safe IP extraction)
- [ ] 7. Add CSRF token generation for API endpoints (optional - not implemented, app is stateless)
- [x] 8. Validate X-Forwarded-For handling for rate limiting

## Code Quality

- [x] 9. Complete refactoring - removed duplicate files (App.js.backup, App.refactored.js)
- [x] 10. Remove backup files from repository
- [x] 11. Add basic unit tests (csvGenerator, storageManager, imageCompressor - 35 tests passing)

## Documentation

- [x] 12. Update README.md with placeholder markers (changed to YOUR_USERNAME with note)
- [x] 13. Add environment variable documentation (already in .env.example)
- [x] 14. Update support contact information (removed fake email)

## Configuration

- [x] 15. Add proper error handling for missing environment variables
- [x] 16. Configure production build optimizations (vercel.json updated)
- [x] 17. Add health check endpoint (/api/health)

---

## Remaining npm Vulnerabilities

None currently reported after Vite migration and audit fix.

## Production Deployment Checklist

Before deploying to production:

1. [ ] Set `GEMINI_API_KEY` in Vercel environment variables
2. [ ] Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel environment variables
3. [ ] Update `YOUR_USERNAME` in README.md with actual GitHub username
4. [ ] Review CSP header if adding third-party scripts
5. [ ] Run `npm audit` periodically and update dependencies

---

**Generated:** 2026-02-01
**Status:** Production Ready (with noted limitations)
**Tests:** 35 passing
