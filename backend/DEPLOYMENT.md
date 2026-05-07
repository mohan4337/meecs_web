# MMSR Backend Deployment Guide

## Overview
This guide covers deploying the MMSR Express.js backend to Vercel serverless functions.

## Prerequisites
- Vercel account (https://vercel.com)
- MongoDB Atlas account (https://cloud.mongodb.com)
- Gmail account for email notifications (optional)
- Groq API key for chatbot (https://console.groq.com)

## Environment Variables Setup

### 1. MongoDB Atlas
1. Create a cluster in MongoDB Atlas
2. Create a database user with read/write permissions
3. Get your connection string:
   - Format: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority`
4. Whitelist IP addresses:
   - For Vercel: Add `0.0.0.0/0` to allow all IPs (or use specific Vercel IP ranges)

### 2. Gmail App Password (for contact form emails)
⚠️ **Important**: Do NOT use your regular Gmail password.
1. Enable 2-Factor Authentication on your Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Other (Custom name)"
4. Name it "MMSR Backend" and generate
5. Copy the 16-digit password (no spaces)

### 3. Groq API Key (for chatbot)
1. Sign up at https://console.groq.com
2. Create a new API key
3. Copy the key (starts with `gsk_`)

## Vercel Deployment Steps

### Method 1: Via Vercel Dashboard

1. **Push code to GitHub/GitLab**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create Vercel Project**
   - Log into Vercel Dashboard
   - Click "New Project"
   - Import your backend repository

3. **Configure Project Settings**
   - **Root Directory**: `backend` (important!)
   - **Build Command**: Leave empty (or `npm install`)
   - **Output Directory**: Leave empty (serverless)
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   In Vercel Project Settings → Environment Variables:
   ```
   MONGO_URI = mongodb+srv://username:password@cluster.mongodb.net/meecs_db
   EMAIL_USER = your-email@gmail.com
   EMAIL_PASS = your-16-digit-app-password
   GROQ_API_KEY = gsk_your_key_here
   NODE_ENV = production
   ```

   ⚠️ **Important**: Click "Add" for each variable, then **Redeploy** for them to take effect.

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

6. **Verify Deployment**
   - Deployed URL will be `https://<project-name>.vercel.app`
   - Visit the URL to see:
     ```json
     {
       "success": true,
       "message": "Backend Running",
       "environment": "production"
     }
     ```
   - Test endpoints:
     - `https://<project-name>.vercel.app/api/status` → should show DB status
     - `https://<project-name>.vercel.app/api/contact/send` → test with Postman

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from backend directory
cd backend
vercel --prod
```

## Frontend Configuration

### Update REACT_APP_API_URL

In `frontend/.env`:
```env
REACT_APP_API_URL=https://<your-project-name>.vercel.app
```

If your frontend is also on Vercel, add the domain to CORS:
- In `backend/server.js`, add your frontend domain to `allowedOrigins`
- Example:
  ```javascript
  const allowedOrigins = [
    "http://localhost:3000",
    "https://your-frontend.vercel.app",
    "https://www.middleeastengg.com"
  ];
  ```

Rebuild and redeploy frontend after changes.

## Troubleshooting

### Issue: "404 NOT_FOUND" or "Cannot GET /"
**Cause**: Incorrect vercel.json routing configuration.

**Solution**: Ensure `backend/vercel.json` routes all requests to server.js:
```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/server.js" }]
}
```

### Issue: First request fails but second succeeds
**Cause**: Cold start - MongoDB connection not established on first request.

**Solution**: The optimized code now includes:
- Connection caching with singleton pattern
- Connection pooling optimizations
- Exponential backoff retry logic
- Request timeouts to prevent hanging

Ensure you have deployed the latest optimized files:
- `config/db.js` with connection caching
- `utils/transporter.js` with cached email transporter
- `routes/contactRoutes.js` with retry logic

### Issue: "Server Error" on contact form
**Common causes:**

1. **MongoDB connection failure**
   - Check MONGO_URI is correct
   - Verify Atlas cluster is running
   - Check IP whitelist includes `0.0.0.0/0`
   - Test connection using MongoDB Compass

2. **Email credentials incorrect**
   - Ensure EMAIL_USER matches your Gmail
   - Use App Password, not regular password
   - Check Gmail allows less secure apps (if required)

3. **CORS errors**
   - Frontend URL must be in `allowedOrigins` in server.js
   - Frontend must send credentials properly
   - Check browser console for specific CORS error

### Issue: Chatbot not responding
**Causes**: GROQ_API_KEY missing or invalid.

**Solution**:
1. Verify API key is set in Vercel environment variables
2. Test key works: https://console.groq.com
3. Redeploy after adding variable

### Issue: "Request timeout" errors
**Cause**: Serverless functions have max 60s timeout (Vercel Hobby: 10s).

**Solutions**:
1. Optimize database queries with indexes
2. Check MongoDB connection health at `/api/status`
3. Consider upgrading Vercel plan for 60s timeout
4. Implement background job queue for heavy tasks (BullMQ)

### Issue: "Rate limit exceeded"
**Cause**: Too many requests from same IP.

**Solution**: This is intentional rate limiting. Wait 15 minutes or deploy with custom rate limit config.

### Monitoring & Logs

1. **Vercel Function Logs**
   ```bash
   vercel logs <project-name> --since 1h
   ```

2. **MongoDB Atlas Monitoring**
   - View metrics at https://cloud.mongodb.com
   - Check connection count, operations/sec, latency

3. **Email Testing**
   - Use a test email to verify contact form
   - Check spam folder
   - Verify transporter at `/api/status`

## Performance Optimizations Implemented

1. **MongoDB Connection Pooling**: Cached connection reused across invocations
2. **Nodemailer Transporter Caching**: Single transporter instance
3. **Request Timeouts**: 25s timeout prevents hanging
4. **Rate Limiting**: 100 requests per 15 min per IP
5. **Retry Logic**: Exponential backoff for transient failures
6. **Health Checks**: `/` and `/api/status` endpoints
7. **Warmup**: `/_vercel/warmup` for keeping functions warm

## Security Notes

1. **Environment Variables**: Never commit `.env` files
2. **MongoDB**: Use strong passwords, enable network encryption
3. **Rate Limiting**: Prevents abuse, adjust based on traffic
4. **CORS**: Only allow trusted origins
5. **Input Validation**: All routes validate before processing
6. **Error Messages**: Development errors hidden in production

## Testing Checklist

- [ ] Backend deploys successfully to Vercel
- [ ] `GET /` returns JSON `{"success": true, "message": "Backend Running"}`
- [ ] `GET /api/status` shows DB connection status
- [ ] Contact form submits successfully on first try
- [ ] Email notification received (if configured)
- [ ] Chatbot responds within 10 seconds
- [ ] CORS headers present in responses
- [ ] No CORS errors in browser console
- [ ] Frontend can fetch from backend without errors
- [ ] Rate limiting works (test with multiple rapid requests)

## Support

For issues:
1. Check Vercel function logs
2. Test endpoints with Postman/curl
3. Verify environment variables
4. Check MongoDB Atlas connection
5. Review browser network tab

Contact: mmenggservice@gmail.com
