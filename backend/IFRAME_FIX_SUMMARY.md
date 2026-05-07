# Vercel Dashboard Preview 403 Fix — Summary

## Problem
Vercel dashboard's embedded preview iframe showed **403 Forbidden** while direct URLs worked fine.

## Cause
`X-Frame-Options: SAMEORIGIN` header blocked embedding from `vercel.com` (different origin).

## Solution
- ✅ Installed `helmet` middleware
- ✅ Disabled Helmet's `frameguard` and `CSP` to set headers manually
- ✅ Added conditional logic:
  - **Vercel preview** (`*.vercel.app`): `X-Frame-Options: ALLOWALL`, `frame-ancestors *`
  - **Production custom domain**: `X-Frame-Options: SAMEORIGIN`, restricted `frame-ancestors`
  - **Development**: Permissive for easy debugging

## Files Changed
- `backend/package.json` — added `helmet` dependency
- `backend/server.js` — replaced manual security headers with Helmet + conditional logic

## Environment Variables (Vercel)
Add to backend environment:
```
CUSTOM_DOMAIN=true
FRONTEND_URL=https://www.middleeastengg.com
```

## Expected After Deploy
- ✅ Vercel dashboard preview loads without 403
- ✅ Direct URLs still work normally
- ✅ Custom domain stays secure (SAMEORIGIN)
- ✅ APIs unaffected
- ✅ CORS unaffected

## How to Verify
1. Wait for Vercel backend deployment to complete
2. Open Vercel dashboard → Deployments → Preview
3. Preview iframe should load your site
4. Check headers:
   ```bash
   curl -I https://meecs-web.vercel.app
   # X-Frame-Options: ALLOWALL (preview) or SAMEORIGIN (production)
   ```

## Security Impact
- **Low risk**: Vercel preview is authenticated, temporary, not public
- **Production remains secure**: Strict headers on custom domain
- **Development easier**: No iframe restrictions locally

## No Frontend Changes Required
All fix is backend-only. Deploy backend → done.
