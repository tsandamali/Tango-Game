# 🚀 Glitch.com Deployment Guide (100% FREE - No Card Required!)

Glitch is a free hosting platform that doesn't require a credit card!

## Why Glitch?

| Feature | Glitch Free Tier |
|---------|------------------|
| Price | 100% FREE |
| Credit Card | ❌ NOT Required |
| Node.js | ✅ Full Support |
| WebSocket | ✅ Full Support |
| Custom Domain | ✅ Yes |

---

## Step-by-Step Deployment

### Step 1: Go to Glitch

1. Visit [glitch.com](https://glitch.com)
2. Click **"Sign in"** (top right)
3. Sign in with **GitHub** or **Google** (no credit card needed!)

### Step 2: Create a New Project

1. Click **"New Project"**
2. Select **"Import from GitHub"** (if you have your code on GitHub)
   - OR select **"glitch-hello-website"** to start fresh

### Step 3: If Starting Fresh (Recommended)

1. Create a new project from template
2. Delete all existing files
3. Upload your project files:

**Option A: Import from GitHub (Easiest)**
```
In the project, go to Tools → Import and Export → Import from GitHub
Enter your GitHub repo URL
```

**Option B: Create files manually**

You need these files:

### `package.json` (already configured)
### `server.js` or `src/server.js`
### `public/` folder with all HTML/JS files

### Step 4: Configure for Glitch

Glitch expects `server.js` in the root directory. Let me update the configuration:

---

## Quick Method: Direct Import

1. Go to: https://glitch.com/import/github/
2. After the `/github/` add your GitHub username and repo:
   ```
   https://glitch.com/import/github/YOUR_USERNAME/tango-puzzle-game
   ```
3. Glitch will automatically import and set up your project!

### Step 5: Your App is Live!

Once imported, your app will be available at:
```
https://your-project-name.glitch.me
```

- **Home**: `https://your-project-name.glitch.me/`
- **Admin**: `https://your-project-name.glitch.me/admin.html`
- **Game**: `https://your-project-name.glitch.me/game/GAME_ID`

---

## Important Notes

### Glitch Limitations
- Projects sleep after 5 minutes of inactivity
- 4000 requests/hour limit (plenty for most games)
- Project name is random (you can rename it)

### Keeping Your App Awake
Glitch projects sleep when inactive. To keep awake:
1. Use a free service like [UptimeRobot](https://uptimerobot.com) to ping every 5 minutes
2. Or use [cron-job.org](https://cron-job.org) for free scheduled pings

### Renaming Your Project
1. Go to Project Settings (top left)
2. Click "Edit Project Details"
3. Change the project name
4. Your URL will be: `https://new-name.glitch.me`

---

## Troubleshooting

### App won't start
Check the Glitch logs:
1. Click "Tools" → "Logs" in the left sidebar
2. Look for error messages

### Port issues
Glitch automatically sets the PORT environment variable. Your app already handles this with:
```javascript
const PORT = process.env.PORT || 3000;
```

### WebSocket issues
Glitch fully supports WebSockets. If you have issues:
1. Make sure you're using `window.location.origin` for Socket.IO (already configured)
2. Check browser console for errors

---

## Files Structure for Glitch

```
├── package.json        # Dependencies
├── src/
│   ├── server.js       # Main server file
│   ├── app.js          # Express app
│   ├── config/
│   ├── routes/
│   ├── services/
│   └── utils/
├── public/
│   ├── index.html
│   ├── admin.html
│   ├── game.html
│   └── js/
│       └── tangoGame.js
```

---

## Quick Commands

Glitch has a terminal! Click "Tools" → "Terminal"

```bash
# Install dependencies (auto-runs on deploy)
npm install

# Start server (auto-runs)
npm start

# View logs
# Click "Tools" → "Logs"
```

---

## Next Steps

1. **Import your project** from GitHub using:
   ```
   https://glitch.com/import/github/YOUR_USERNAME/tango-puzzle-game
   ```

2. **Or create manually** by copying files

3. **Rename your project** to get a nice URL

4. **Set up UptimeRobot** to keep it awake

Your app will be live in minutes! 🎉