const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.static('public'));

// Game route - serve game.html for /game/:gameId
app.get('/game/:gameId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

// In-memory storage
const games = new Map();
const playerSessions = new Map();

// Generate Tango puzzle
function generateTangoPuzzle(difficulty = 'medium') {
  const puzzles = {
    easy: {
      pieces: 5,
      solution: [0, 1, 2, 3, 4],
      shapes: ['triangle', 'square', 'parallelogram', 'trapezoid', 'triangle2']
    },
    medium: {
      pieces: 7,
      solution: [0, 1, 2, 3, 4, 5, 6],
      shapes: ['triangle1', 'triangle2', 'triangle3', 'triangle4', 'square', 'parallelogram', 'rhomboid']
    },
    hard: {
      pieces: 9,
      solution: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      shapes: ['triangle1', 'triangle2', 'triangle3', 'triangle4', 'square1', 'square2', 'parallelogram', 'rhomboid', 'trapezoid']
    }
  };

  const puzzle = puzzles[difficulty] || puzzles.medium;
  return {
    ...puzzle,
    scrambled: [...puzzle.solution].sort(() => Math.random() - 0.5)
  };
}

// API Routes
app.post('/api/admin/create-game', (req, res) => {
  const { difficulty = 'medium' } = req.body;
  const gameId = uuidv4();
  const puzzle = generateTangoPuzzle(difficulty);

  games.set(gameId, {
    id: gameId,
    puzzle,
    difficulty,
    status: 'waiting', // waiting, countdown, active, finished
    players: new Map(),
    startTime: null,
    countdownTime: 10,
    createdAt: Date.now()
  });

  res.json({ gameId, joinLink: `/game/${gameId}` });
});

app.get('/api/admin/game/:gameId', (req, res) => {
  const game = games.get(req.params.gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const players = Array.from(game.players.values()).map(p => ({
    id: p.id,
    name: p.name,
    status: p.status,
    completionTime: p.completionTime,
    rank: p.rank
  }));

  res.json({
    gameId: game.id,
    status: game.status,
    difficulty: game.difficulty,
    playerCount: game.players.size,
    players: players.sort((a, b) => {
      if (a.completionTime && b.completionTime) {
        return a.completionTime - b.completionTime;
      }
      if (a.completionTime) return -1;
      if (b.completionTime) return 1;
      return 0;
    })
  });
});

app.post('/api/admin/start-game/:gameId', (req, res) => {
  const game = games.get(req.params.gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  if (game.status !== 'waiting') {
    return res.status(400).json({ error: 'Game already started' });
  }

  game.status = 'countdown';
  io.to(game.id).emit('countdown-start', { seconds: game.countdownTime });

  setTimeout(() => {
    game.status = 'active';
    game.startTime = Date.now();
    io.to(game.id).emit('game-start', { puzzle: game.puzzle });
  }, game.countdownTime * 1000);

  res.json({ success: true });
});

app.get('/api/admin/export/:gameId', (req, res) => {
  const game = games.get(req.params.gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const players = Array.from(game.players.values())
    .filter(p => p.completionTime)
    .sort((a, b) => a.completionTime - b.completionTime);

  let csv = 'Rank,Player Name,Completion Time (seconds),Completion Time (mm:ss)\n';
  players.forEach((player, index) => {
    const seconds = player.completionTime / 1000;
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    csv += `${index + 1},${player.name},${seconds.toFixed(2)},${minutes}:${secs.padStart(5, '0')}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=game-${game.id}-results.csv`);
  res.send(csv);
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-game', ({ gameId, playerName, isAdmin }) => {
    const game = games.get(gameId);

    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    socket.join(gameId);

    if (isAdmin) {
      socket.emit('admin-joined', {
        gameId: game.id,
        status: game.status,
        playerCount: game.players.size
      });
      return;
    }

    // Check if player already joined with a different socket
    let player = null;
    for (let p of game.players.values()) {
      if (p.name === playerName) {
        player = p;
        player.socketId = socket.id;
        break;
      }
    }

    // New player
    if (!player) {
      player = {
        id: uuidv4(),
        socketId: socket.id,
        name: playerName,
        gameId,
        status: 'waiting',
        startTime: null,
        completionTime: null,
        rank: null
      };
      game.players.set(player.id, player);
    }

    playerSessions.set(socket.id, { playerId: player.id, gameId });

    socket.emit('game-joined', {
      playerId: player.id,
      gameStatus: game.status,
      playerCount: game.players.size
    });

    // Notify admin of new player
    io.to(gameId).emit('player-joined', {
      playerCount: game.players.size,
      playerName: player.name
    });

    // If game is already active, send puzzle
    if (game.status === 'active') {
      socket.emit('game-start', { puzzle: game.puzzle });
    }
  });

  socket.on('submit-solution', ({ playerId, gameId, solution }) => {
    const game = games.get(gameId);
    if (!game || game.status !== 'active') {
      socket.emit('error', { message: 'Game not active' });
      return;
    }

    const player = game.players.get(playerId);
    if (!player || player.status === 'completed') {
      return;
    }

    // Verify solution
    const isCorrect = JSON.stringify(solution) === JSON.stringify(game.puzzle.solution);

    if (!isCorrect) {
      socket.emit('solution-incorrect');
      return;
    }

    // Calculate completion time
    player.completionTime = Date.now() - game.startTime;
    player.status = 'completed';

    // Calculate rank
    const completedPlayers = Array.from(game.players.values())
      .filter(p => p.status === 'completed')
      .sort((a, b) => a.completionTime - b.completionTime);

    completedPlayers.forEach((p, index) => {
      p.rank = index + 1;
    });

    socket.emit('solution-correct', {
      completionTime: player.completionTime,
      rank: player.rank,
      totalPlayers: game.players.size
    });

    // Notify admin of completion
    io.to(gameId).emit('player-completed', {
      playerName: player.name,
      completionTime: player.completionTime,
      rank: player.rank
    });
  });

  socket.on('admin-get-leaderboard', ({ gameId }) => {
    const game = games.get(gameId);
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const leaderboard = Array.from(game.players.values())
      .filter(p => p.status === 'completed')
      .sort((a, b) => a.completionTime - b.completionTime)
      .map(p => ({
        name: p.name,
        completionTime: p.completionTime,
        rank: p.rank
      }));

    socket.emit('leaderboard-update', { leaderboard });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    playerSessions.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
