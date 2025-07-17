# TodoForge Backend Deployment on Render

## Prerequisites
1. MongoDB Atlas account (or another MongoDB hosting service)
2. Render account
3. GitHub repository with your backend code

## Environment Variables Required

Set these environment variables in your Render dashboard:

### Required Variables:
- `NODE_ENV=production`
- `PORT=10000` (Render automatically sets this)
- `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/TodoForge`
- `JWT_SECRET=your-super-secure-jwt-secret-key-here`
- `JWT_EXPIRES_IN=7d`
- `BCRYPT_SALT_ROUNDS=12`

### Optional Variables:
- `CORS_ORIGIN=*` (or your frontend URL)
- `CORS_CREDENTIALS=true`
- `OPENAI_API_KEY=your-openai-api-key` (if using AI features)

## Deployment Steps

### 1. Database Setup
1. Create a MongoDB Atlas cluster
2. Create a database user
3. Get your connection string
4. Replace `<username>`, `<password>`, and `<cluster>` in the connection string

### 2. Render Setup

1. Log into your Render dashboard
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: todoforge-backend
   - **Environment**: Node
   - **Root Directory**: `Back-end` (IMPORTANT: Set this to point to the backend folder)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)
   - **Auto-Deploy**: Yes (recommended)

### 3. Environment Variables
In the Render dashboard, go to Environment and add all the required variables listed above.

### 4. Deploy
1. Click "Create Web Service"
2. Render will automatically deploy your application
3. Monitor the logs for any errors

## Troubleshooting Common Issues

### 1. Database Connection Error
- Check your `MONGODB_URI` format
- Ensure IP address is whitelisted in MongoDB Atlas
- Verify database user permissions

### 2. JWT Token Errors
- Ensure `JWT_SECRET` is set and not the default value
- Check that the secret is long and secure

### 3. Build/Start Errors
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check logs for specific error messages

### 4. CORS Issues
- Set `CORS_ORIGIN` to your frontend URL
- Or use `*` for development (not recommended for production)

## Health Check
Your API should be accessible at: `https://your-service-name.onrender.com/`

You should see:
```json
{
  "success": true,
  "message": "Todo Forge API is working",
  "version": "1.0.0"
}
```

## Logs
Monitor your application logs in the Render dashboard under the "Logs" tab.
