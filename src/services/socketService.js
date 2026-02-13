const GameService = require('./gameService');

class SocketService {
  static initialize(io) {
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-game', ({ gameId, playerName, isAdmin }) => {
        this.handleJoinGame(socket, io, gameId, playerName, isAdmin);
      });

      socket.on('submit-solution', ({ playerId, gameId, solution, round }) => {
        this.handleSubmitSolution(socket, io, playerId, gameId, solution, round);
      });

      socket.on('admin-get-leaderboard', ({ gameId }) => {
        this.handleGetLeaderboard(socket, gameId);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        GameService.removePlayerSession(socket.id);
      });
    });
  }

  static handleJoinGame(socket, io, gameId, playerName, isAdmin) {
    const game = GameService.getGame(gameId);

    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    socket.join(gameId);

    if (isAdmin) {
      socket.emit('admin-joined', {
        gameId: game.id,
        status: game.status,
        currentRound: game.currentRound,
        totalRounds: game.totalRounds,
        playerCount: game.players.size
      });
      return;
    }

    // Check duplicate name (case insensitive)
    const nameExists = Array.from(game.players.values())
        .some(p => p.name.toLowerCase() === playerName.toLowerCase());

    if (nameExists) {
      socket.emit('error', { message: 'Name already taken. Please choose another name.' });
      return;
    }

    const player = GameService.addPlayer(gameId, playerName, socket.id);

    if (!player || player.error) {
      socket.emit('error', {
        message: player?.error || 'Failed to join game'
      });
      return;
    }
    
    socket.emit('game-joined', {
      playerId: player.id,
      gameStatus: game.status,
      currentRound: game.currentRound,
      totalRounds: game.totalRounds,
      playerCount: game.players.size
    });

    // Notify admin of new player
    io.to(gameId).emit('player-joined', {
      playerCount: game.players.size,
      playerName: player.name
    });

    // If game is already active, send puzzle with start time for elapsed time calculation
    const currentRound = game.currentRound;
    if (game.status.includes('active') && game.rounds[currentRound].puzzle) {
      socket.emit('game-start', {
        puzzle: game.rounds[currentRound].puzzle,
        round: currentRound,
        roundStartTime: game.rounds[currentRound].startTime // Send start time for elapsed time calculation
      });
    }
  }

  static handleSubmitSolution(socket, io, playerId, gameId, solution, round) {
    const result = GameService.submitSolution(gameId, playerId, solution, round);

    if (!result.success) {
      if (result.error === 'Incorrect solution') {
        socket.emit('solution-incorrect', { round: round || result.round, validationError: result.validationError, validationErrors: result.validationErrors });
      } else {
        socket.emit('error', { message: result.error });
      }
      return;
    }

    const currentRound = result.round;
    let completionTime, rank;

    if (currentRound === 1) {
      completionTime = result.player.completionTime;
      rank = result.player.rank;
    } else if (currentRound === 2) {
      completionTime = result.player.round2CompletionTime;
      rank = result.player.round2Rank;
    } else if (currentRound === 3) {
      completionTime = result.player.round3CompletionTime;
      rank = result.player.round3Rank;
    }

    // If Round 1 complete, immediately start Round 2 for this player
    if (currentRound === 1 && result.moveToRound2) {
      const game = GameService.getGame(gameId);

      socket.emit('solution-correct', {
        completionTime,
        rank,
        round: currentRound,
        totalPlayers: result.totalPlayers,
        moveToRound2: true // Signal to immediately move to Round 2
      });

      // Start Round 2 for this player immediately
      GameService.startPlayerRound2(gameId, playerId);

      // Send Round 2 puzzle immediately (no countdown)
      socket.emit('start-round2-individual', {
        puzzle: game.rounds[2].puzzle,
        round: 2
      });
    } else if (currentRound === 2 && result.moveToRound3) {
      // Round 2 complete - immediately start Round 3 for this player
      const game = GameService.getGame(gameId);

      socket.emit('solution-correct', {
        completionTime,
        rank,
        round: currentRound,
        totalPlayers: result.totalPlayers,
        moveToRound3: true // Signal to immediately move to Round 3
      });

      // Start Round 3 for this player immediately
      GameService.startPlayerRound3(gameId, playerId);

      // Send Round 3 puzzle immediately (no countdown)
      socket.emit('start-round3-individual', {
        puzzle: game.rounds[3].puzzle,
        round: 3
      });
    } else if (currentRound === 3) {
      // Round 3 complete - show final results (all 3 rounds)
      socket.emit('solution-correct', {
        completionTime,
        rank,
        round: currentRound,
        totalTime: result.player.totalTime,
        totalRank: result.player.totalRank,
        totalPlayers: result.totalPlayers,
        allCompleted: result.allCompleted
      });
    }

    // Notify admin of completion
    io.to(gameId).emit('player-completed', {
      playerName: result.player.name,
      completionTime,
      rank,
      round: currentRound,
      totalTime: result.player.totalTime,
      totalRank: result.player.totalRank,
      allCompleted: result.allCompleted
    });
  }

  static handleGetLeaderboard(socket, gameId) {
    const leaderboard = GameService.getLeaderboard(gameId);

    if (leaderboard === null) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    socket.emit('leaderboard-update', { leaderboard });
  }
}

module.exports = SocketService;
