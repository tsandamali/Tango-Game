# 🎯 Tango Puzzle Game - Multi-player Online

A real-time, web-based Tango puzzle game that supports 30+ concurrent players with live leaderboards and admin controls.

**Production-ready** with Docker, PM2 support, and cloud deployment configurations.

## ✨ Features

### Player Features
- ✅ Join games via shared link
- ✅ Individual puzzle solving (no team mode)
- ✅ Automatic time tracking (starts on game start, stops on completion)
- ✅ See personal completion time and rank
- ✅ Countdown timer before start (10 seconds)
- ✅ "Completed" badge on finish
- ✅ Protection against refresh-to-reset exploits
- ✅ Solution verification (prevents incorrect submissions)
- ✅ Desktop compatible

### Admin Features
- ✅ Create game sessions with difficulty levels (Easy/Medium/Hard)
- ✅ Start games for all players simultaneously
- ✅ View full real-time leaderboard with all players
- ✅ Export results to CSV
- ✅ Live player count and completion statistics
- ✅ Auto-updating leaderboard during gameplay

### Technical Features
- ✅ Supports 30+ concurrent users without lag
- ✅ WebSocket-based real-time communication
- ✅ Session persistence (prevents refresh exploits)
- ✅ Multiple difficulty levels
- ✅ RESTful API + Socket.IO architecture

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or navigate to project directory**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your settings (optional)

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run prod
```

## 📖 How to Use

### For Admins

1. **Navigate to Admin Panel:**
   - Open `http://localhost:3000/admin.html`

2. **Create a Game:**
   - Select difficulty level (Easy/Medium/Hard)
   - Click "Create Game"
   - Copy the generated player join link

3. **Share the Link:**
   - Send the join link to all players (supports 30+)
   - Wait for players to join

4. **Start the Game:**
   - Click "Start Game" when ready
   - 10-second countdown will begin
   - All players receive the same puzzle simultaneously

5. **Monitor Progress:**
   - Watch the live leaderboard update automatically
   - See player completion times in real-time

6. **Export Results:**
   - Click "Export Results (CSV)" to download rankings

### For Players

1. **Join the Game:**
   - Click the link provided by admin
   - Enter your name
   - Click "Join Game"

2. **Wait for Start:**
   - Wait for admin to start the game
   - Watch the 10-second countdown

3. **Solve the Puzzle:**
   - Drag and drop pieces to arrange them correctly
   - Timer starts automatically when game begins
   - Submit your solution when ready

4. **View Results:**
   - See your completion time
   - See your rank (position)
   - "Completed" badge displayed

## 🎮 Game Rules

### Tango Puzzle
The game uses Tangram-style puzzles where players must arrange pieces in the correct order:

- **Easy:** 5 pieces
- **Medium:** 7 pieces
- **Hard:** 9 pieces

### Scoring
- Ranking is based solely on **completion time**
- Faster completion = higher rank
- Incorrect solutions cannot be submitted

### Anti-Cheat Measures
- Refreshing the page doesn't reset the timer
- Players must join before game starts
- Session tracking prevents multiple attempts
- Solution validation prevents guessing

## 🏗️ Project Structure

```
Tango Game/
├── src/
│   ├── server.js              # Application entry point
│   ├── app.js                 # Express app configuration
│   ├── config/
│   │   └── config.js         # Environment configuration
│   ├── controllers/
│   │   └── adminController.js # Admin API controllers
│   ├── routes/
│   │   └── adminRoutes.js    # API route definitions
│   ├── services/
│   │   ├── gameService.js    # Game logic and state
│   │   └── socketService.js  # WebSocket handlers
│   └── utils/
│       └── puzzleGenerator.js # Puzzle generation utility
├── public/
│   ├── index.html            # Home page
│   ├── admin.html            # Admin control panel
│   └── game.html             # Player game interface
├── logs/                     # Application logs
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── package.json              # Project dependencies
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose setup
├── ecosystem.config.js       # PM2 configuration
├── DEPLOYMENT.md             # Deployment guide
└── README.md                 # This file
```

## 🔧 Configuration

Configuration is managed through environment variables in the `.env` file:

```env
# Server Configuration
PORT=3000                    # Server port
NODE_ENV=development         # Environment (development/production)
ALLOWED_ORIGINS=http://localhost:3000  # CORS origins

# Game Configuration
DEFAULT_COUNTDOWN_TIME=10    # Countdown before game starts (seconds)
MAX_PLAYERS_PER_GAME=50     # Maximum players per game

# Session Configuration
SESSION_TIMEOUT=3600000      # Session timeout (milliseconds)
```

### Add More Difficulty Levels
Edit `src/utils/puzzleGenerator.js` to add custom difficulty levels

## 🌐 Deployment

This application is production-ready with multiple deployment options:

### Quick Deployment Options

**1. Docker (Recommended):**
```bash
docker-compose up -d
```

**2. PM2 (Process Manager):**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

**3. Direct Node.js:**
```bash
npm run prod
```

### Cloud Platforms

- ✅ **Heroku** - Ready to deploy
- ✅ **AWS EC2** - With PM2 + Nginx
- ✅ **DigitalOcean** - App Platform or Droplet
- ✅ **Railway/Render** - Auto-deploy from GitHub

📖 **Full deployment guide:** See [DEPLOYMENT.md](DEPLOYMENT.md)

## 🔒 Security Notes

- All game sessions are stored in memory (restart clears games)
- No authentication required (designed for private sessions)
- For production: Consider adding admin authentication
- For persistence: Add database (MongoDB, PostgreSQL, etc.)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Change port in server.js
```

### Players Can't Connect
- Ensure server is running
- Check firewall settings
- Verify correct IP/URL is shared

### Game Not Starting
- Ensure admin clicked "Start Game"
- Check browser console for errors
- Refresh admin panel

## 📊 API Endpoints

### Admin Endpoints
- `POST /api/admin/create-game` - Create new game session
- `GET /api/admin/game/:gameId` - Get game details
- `POST /api/admin/start-game/:gameId` - Start game
- `GET /api/admin/export/:gameId` - Export CSV results

### Socket.IO Events
- `join-game` - Player/admin joins
- `game-start` - Game begins
- `submit-solution` - Player submits answer
- `player-completed` - Completion notification
- `countdown-start` - Countdown initiated

## 📝 License

This project is open source and available for educational purposes.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure all dependencies are installed

---

**Built with:** Node.js, Express, Socket.IO, HTML5, CSS3, JavaScript

**Supports:** 30+ concurrent players | Real-time updates | Cross-browser compatible
