# Deployment Checklist

## Pre-deployment Verification

### Backend (Node.js/Express)
- [x] CORS properly configured with allowed origins
- [x] Environment variables set (MONGO_URI, EMAIL_USER, EMAIL_PASS, GROQ_API_KEY)
- [x] NODE_ENV=production enabled
- [x] MongoDB connection verified
- [x] API routes validated and tested
- [x] Error handling implemented
- [x] Request validation added
- [x] Security headers configured

### Frontend (React)
- [x] REACT_APP_API_URL points to production domain
- [x] Manifest.json properly configured
- [x] SEO metadata (title, description, keywords) added
- [x] Mobile responsiveness verified
- [x] All images and assets loading correctly
- [x] No console warnings/errors
- [x] Build completes successfully
- [x] React Strict Mode compatibility

### Deployment Configuration
- [x] Root vercel.json created with proper routing
- [x] Backend vercel.json configured
- [x] Static build configuration set
- [x] API routes properly routed to backend
- [x] Frontend build directory specified

### Testing
- [x] Contact form validation working
- [x] API endpoints responding correctly
- [x] CORS requests from frontend domain allowed
- [x] Email notification system tested
- [x] Chatbot API integration functional
- [x] Mobile viewport testing completed
- [x] Form error/success states working

## Deployment Steps

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Verify Build Output**
   ```bash
   ls -la build/
   ```

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard**
   - MONGO_URI
   - EMAIL_USER
   - EMAIL_PASS  
   - GROQ_API_KEY
   - NODE_ENV=production
   - FRONTEND_URL=https://www.middleeastengg.com

5. **Configure Custom Domain**
   - Add domain: www.middleeastengg.com
   - Verify DNS records
   - Enable SSL certificate

6. **Post-Deployment Testing**
   - Test contact form submission
   - Verify API responses
   - Check mobile responsiveness
   - Validate SEO metadata
   - Test chatbot functionality

## Environment Variables Required

### Backend (.env)
```
MONGO_URI=<your-mongodb-connection-string>
PORT=5000
NODE_ENV=production
JWT_SECRET=<your-jwt-secret>
FRONTEND_URL=https://www.middleeastengg.com
GROQ_API_KEY=<your-groq-api-key>
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASS=<your-app-password>
```

### Frontend (.env)
```
REACT_APP_API_URL=https://www.middleeastengg.com
```

## Monitoring

- Check Vercel dashboard for deployment status
- Monitor API response times
- Set up error tracking (optional: Sentry)
- Enable logging for failed requests

## Rollback Plan

If deployment fails:
```bash
vercel --prod --rollback
```

## Domain Configuration

For www.middleeastengg.com:
- Add A record pointing to Vercel IPs
- Add CNAME record for www subdomain
- Enable automatic SSL in Vercel
- Wait for DNS propagation (up to 48 hours)
