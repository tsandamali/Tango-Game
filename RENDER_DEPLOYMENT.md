# 🚀 Render.com Deployment Guide (100% FREE)

Your Tango Puzzle Game is now configured for free deployment on Render.com!

## Why Render Instead of Firebase?

| Feature | Firebase Spark (Free) | Render Free Tier |
|---------|----------------------|------------------|
| Static Hosting | ✅ Yes | ✅ Yes |
| Cloud Functions | ❌ Requires Blaze plan | ✅ Free Web Service |
| WebSocket Support | ❌ Limited | ✅ Full Support |
| Node.js Backend | ❌ Not available | ✅ Free |

## Prerequisites

1. A [Render.com account](https://dashboard.render.com/register) (free)
2. A [GitHub account](https://github.com) (free)
3. Git installed on your computer

---

## Step-by-Step Deployment

### Step 1: Push Your Code to GitHub

1. Initialize Git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - Tango Puzzle Game"
```

2. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name it: `tango-puzzle-game`
   - Make it Public or Private
   - Click "Create repository"

3. Push to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/tango-puzzle-game.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)

2. Click **"New +"** → **"Web Service"**

3. Connect your GitHub repository:
   - Click "Connect GitHub"
   - Authorize Render
   - Select `tango-puzzle-game` repository

4. Configure the Web Service:

   | Setting | Value |
   |---------|-------|
   | **Name** | `tango-puzzle-game` |
   | **Region** | Oregon (or closest to you) |
   | **Branch** | `main` |
   | **Root Directory** | (leave empty) |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node src/server.js` |
   | **Instance Type** | `Free` |

5. Click **"Create Web Service"**

### Step 3: Wait for Deployment

- Render will automatically build and deploy your app
- This takes 2-3 minutes
- Watch the logs for any errors

### Step 4: Access Your App

Once deployed, your app will be available at:
```
https://tango-puzzle-game.onrender.com
```

- **Home Page**: `https://tango-puzzle-game.onrender.com/`
- **Admin Panel**: `https://tango-puzzle-game.onrender.com/admin.html`
- **Game**: `https://tango-puzzle-game.onrender.com/game/GAME_ID`

---

## Important Notes

### Free Tier Limitations
- App "sleeps" after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- 750 hours/month free (enough for 1 instance always running)

### Production Tips
1. **Keep app awake**: Use a service like UptimeRobot to ping your app every 10 minutes
2. **Custom domain**: Add your own domain in Render settings
3. **Environment variables**: Set these in Render dashboard if needed

---

## Troubleshooting

### App won't start
Check the logs in Render dashboard. Common issues:
- Missing dependencies: Run `npm install` locally to verify
- Port issues: The app uses `process.env.PORT` (Render handles this automatically)

### WebSocket connection fails
- Make sure you're using `window.location.origin` for Socket.IO (already configured)
- Check browser console for errors

### App is slow to respond
- This is normal on free tier after the app sleeps
- First request wakes the app (30s delay), subsequent requests are fast

---

## Quick Commands

### Local Development
```bash
npm install
npm start
```
Then open http://localhost:3000

### Deploy Updates
```bash
git add .
git commit -m "Your update message"
git push
```
Render automatically redeploys on push!

---

## Files Modified for Render

1. ✅ `package.json` - Updated Node.js version to 18.x
2. ✅ `render.yaml` - Added Render configuration
3. ✅ `public/game.html` - Fixed Socket.IO connection path
4. ✅ `public/admin.html` - Fixed Socket.IO connection path

Your app is now ready for FREE deployment! 🎉