# 🚀 Railway.app Deployment Guide (FREE - $5/month credit)

Railway gives you **$5 free credit every month** which is enough to run a small app 24/7!

## Why Railway?

| Feature | Railway Free Tier |
|---------|------------------|
| Free Credit | $5/month (auto-renews) |
| Credit Card | ❌ NOT Required (GitHub signup) |
| Node.js | ✅ Full Support |
| WebSocket | ✅ Full Support |
| Custom Domain | ✅ Yes |

---

## Step-by-Step Deployment

### Step 1: Go to Railway

1. Visit [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Click **"Login with GitHub"** (no credit card needed!)
4. Authorize Railway to access your GitHub

### Step 2: Deploy from GitHub

1. Click **"Deploy from GitHub repo"**
2. Select your repository: `Tango-Game`
3. Click **"Deploy Now"**

### Step 3: Configure the Service

Railway will auto-detect Node.js. You just need to set:

1. Click on your deployed service
2. Go to **"Settings"** tab
3. Scroll to **"Build"** section:
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`

### Step 4: Add Environment Variables (if needed)

1. Go to **"Variables"** tab
2. Add if needed:
   - `NODE_ENV` = `production`

### Step 5: Get Your URL

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Your app will be live at: `https://tango-game.up.railway.app`

---

## Your App URLs

- **Home**: `https://your-app.up.railway.app/`
- **Admin Panel**: `https://your-app.up.railway.app/admin.html`
- **Game**: `https://your-app.up.railway.app/game/GAME_ID`

---

## Important Notes

### Free Tier
- $5 credit per month (auto-renews)
- Enough for ~500 hours of runtime
- No credit card required when signing up with GitHub

### Keeping Track
- Check your usage in the Railway dashboard
- You'll get notified before running out of credit

---

## Troubleshooting

### App won't start
1. Check the **"Deployments"** tab for logs
2. Make sure Start Command is: `node src/server.js`

### Port issues
Railway automatically sets PORT. Your app already handles this:
```javascript
const PORT = process.env.PORT || 3000;
```

### WebSocket issues
Railway fully supports WebSockets. Your Socket.IO is already configured correctly.

---

## Alternative: Replit.com (100% Free, No Card)

If Railway doesn't work, try **Replit**:

1. Go to [replit.com](https://replit.com)
2. Sign in with GitHub
3. Click **"Create Repl"** → **"Import from GitHub"**
4. Paste: `https://github.com/tsandamali/Tango-Game`
5. Click **"Import"**
6. Run `npm start` in the Shell
7. Your app gets a URL like: `https://tango-game.your-username.repl.co`

---

## Quick Links

- **Railway**: https://railway.app
- **Replit**: https://replit.com
- **Your GitHub Repo**: https://github.com/tsandamali/Tango-Game

Choose one and deploy! 🎉