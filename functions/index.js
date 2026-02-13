const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const uuid = require('uuid');

// Initialize Firebase Admin
admin.initializeApp();

// Configuration
const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'production',
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['*']
  },
  game: {
    defaultCountdownTime: parseInt(process.env.DEFAULT_COUNTDOWN_TIME) || 10,
    maxPlayersPerGame: parseInt(process.env.MAX_PLAYERS_PER_GAME) || 50
  },
  session: {
    timeout: parseInt(process.env.SESSION_TIMEOUT) || 3600000
  }
};

// Import services (inline for Cloud Functions)
const PuzzleGenerator = require('./src/utils/puzzleGenerator');
const GameService = require('./src/services/gameService');
const SocketService = require('./src/services/socketService');

// Create Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  path: '/api/socket.io',
  cors: {
    origin: config.server.allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes for admin
app.post('/api/admin/create-game', (req, res) => {
  try {
    const { totalRounds = 3 } = req.body;
    const gameId = uuid.v4().substring(0, 8).toUpperCase();
    
    const game = GameService.createGame(gameId, parseInt(totalRounds));
    
    res.json({
      success: true,
      gameId: game.id,
      gameUrl: `/game/${game.id}`,
      joinLink: `/game/${game.id}`,
      totalRounds: game.totalRounds
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/game/:gameId', (req, res) => {
  try {
    const game = GameService.getGame(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({
      success: true,
      game: {
        id: game.id,
        status: game.status,
        currentRound: game.currentRound,
        totalRounds: game.totalRounds,
        playerCount: game.players.size,
        players: Array.from(game.players.values()).map(p => ({
          id: p.id,
          name: p.name,
          round1Completed: !!p.completionTime,
          round2Completed: !!p.round2CompletionTime,
          round3Completed: !!p.round3CompletionTime
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/game/:gameId/start', (req, res) => {
  try {
    const { round } = req.body;
    const game = GameService.getGame(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    const targetRound = round || 1;
    
    // Generate puzzles for all rounds upfront
    for (let r = targetRound; r <= game.totalRounds; r++) {
      if (!game.rounds[r].puzzle) {
        const gridSize = r === 1 ? 4 : (r === 2 ? 6 : 8);
        game.rounds[r].puzzle = PuzzleGenerator.generateTangoPuzzle(gridSize);
      }
    }
    
    game.status = `active-round-${targetRound}`;
    game.currentRound = targetRound;
    
    // Countdown and emit to all players
    let countdown = config.game.defaultCountdownTime;
    io.to(game.id).emit('countdown-start', { seconds: countdown, round: targetRound });
    
    const countdownInterval = setInterval(() => {
      countdown--;
      io.to(game.id).emit('countdown-tick', { seconds: countdown });
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        io.to(game.id).emit('game-start', {
          puzzle: game.rounds[targetRound].puzzle,
          round: targetRound
        });
      }
    }, 1000);
    
    res.json({
      success: true,
      status: game.status,
      currentRound: game.currentRound
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/game/:gameId/leaderboard', (req, res) => {
  try {
    const leaderboard = GameService.getLeaderboard(req.params.gameId);
    
    if (leaderboard === null) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize Socket.IO
SocketService.initialize(io);

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);

// Note: Socket.IO has limitations with Firebase Cloud Functions (1st gen)
// For production with WebSockets, consider:
// 1. Using Firebase Realtime Database for game state sync
// 2. Upgrading to Cloud Functions 2nd gen
// 3. Using a dedicated WebSocket service

// For local development with emulators, use: firebase emulators:start
// The function will be available at http://127.0.0.1:5001/tango-gaming/us-central1/api
