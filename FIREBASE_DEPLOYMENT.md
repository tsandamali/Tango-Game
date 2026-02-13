# Firebase Deployment Guide

This project has been restructured for Firebase Hosting with Cloud Functions.

## Project Structure

```
├── firebase.json           # Firebase configuration
├── .firebaserc            # Firebase project settings
├── public/                # Static files (Firebase Hosting)
│   ├── index.html        # Landing page
│   ├── admin.html        # Admin panel
│   ├── game.html         # Game page
│   └── js/
│       └── tangoGame.js  # Frontend game logic
├── functions/             # Cloud Functions (Backend)
│   ├── index.js          # Main function entry point
│   ├── package.json      # Functions dependencies
│   └── src/
│       ├── services/
│       │   ├── gameService.js
│       │   └── socketService.js
│       └── utils/
│           └── puzzleGenerator.js
└── src/                   # Original source (kept for reference)
```

## Prerequisites

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

## Deployment Steps

### 1. Install Dependencies

Install root dependencies (for local development):
```bash
npm install
```

Install Cloud Functions dependencies:
```bash
cd functions
npm install
cd ..
```

### 2. Local Testing (Optional)

Test with Firebase emulators:
```bash
firebase emulators:start
```

### 3. Deploy to Firebase

Deploy everything (hosting + functions):
```bash
firebase deploy
```

Deploy only hosting:
```bash
firebase deploy --only hosting
```

Deploy only functions:
```bash
firebase deploy --only functions
```

## Important Notes

### Socket.IO Limitations

⚠️ **Important**: Firebase Cloud Functions (1st gen) have limitations with WebSocket connections. Socket.IO will work but may fall back to HTTP polling.

For better real-time performance, consider:
1. Using Firebase Realtime Database or Firestore for game state
2. Upgrading to Cloud Functions 2nd gen
3. Using a dedicated WebSocket service

### Environment Variables

Set environment variables for Cloud Functions:
```bash
firebase functions:config:set server.allowed_origins="https://your-app.web.app"
```

### API Endpoints

After deployment, your API will be available at:
- `https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api/`

Or with Firebase Hosting rewrites:
- `https://your-app.web.app/api/`

## Troubleshooting

### Function Timeout
If functions timeout, increase the timeout in `functions/index.js`:
```javascript
exports.api = functions.runWith({ timeoutSeconds: 120 }).https.onRequest(app);
```

### CORS Issues
Make sure allowed origins are configured properly in the function.

### Cold Starts
Cloud Functions may have cold starts. Consider using min instances for production:
```javascript
exports.api = functions.runWith({ minInstances: 1 }).https.onRequest(app);
```

## Alternative: Static Hosting Only

If you want to use Firebase Hosting without Cloud Functions (static files only):

1. Remove the `functions` section from `firebase.json`
2. Host the frontend statically
3. Deploy the backend separately (Docker, VPS, etc.)

## Current Configuration

- **Project ID**: `tango-gaming`
- **Hosting**: Public files from `/public`
- **Functions**: Express + Socket.IO server from `/functions`