const { v4: uuidv4 } = require('uuid');
const PuzzleGenerator = require('../utils/puzzleGenerator');

// In-memory storage
const games = new Map();
const playerSessions = new Map();

// Default config
const config = {
  game: {
    defaultCountdownTime: 10,
    maxPlayersPerGame: 50
  }
};

class GameService {
  static createGame(gameId, totalRounds = 3) {
    const id = gameId || uuidv4().substring(0, 8).toUpperCase();
    
    games.set(id, {
      id: id,
      currentRound: 1,
      totalRounds: totalRounds,
      rounds: {
        1: {
          puzzle: null, // Generated when game starts
          status: 'waiting',
          startTime: null,
          completedPlayers: new Set()
        },
        2: {
          puzzle: null,
          status: 'waiting',
          startTime: null,
          completedPlayers: new Set()
        },
        3: {
          puzzle: null,
          status: 'waiting',
          startTime: null,
          completedPlayers: new Set()
        }
      },
      status: 'waiting',
      players: new Map(),
      countdownTime: config.game.defaultCountdownTime,
      createdAt: Date.now()
    });

    return games.get(id);
  }

  static getGame(gameId) {
    return games.get(gameId);
  }

  static startGame(gameId) {
    const game = games.get(gameId);
    if (!game || game.status !== 'waiting') {
      return null;
    }

    game.status = 'countdown';
    return game;
  }

  static activateGame(gameId) {
    const game = games.get(gameId);
    if (!game) return null;

    if (game.currentRound === 1) {
      game.status = 'round1-active';
      game.rounds[1].status = 'active';
      game.rounds[1].startTime = Date.now();
    } else if (game.currentRound === 2) {
      game.status = 'round2-active';
      game.rounds[2].status = 'active';
      game.rounds[2].startTime = Date.now();
    } else if (game.currentRound === 3) {
      game.status = 'round3-active';
      game.rounds[3].status = 'active';
      game.rounds[3].startTime = Date.now();
    }

    return game;
  }

  static addPlayer(gameId, playerName, socketId) {
    const game = this.getGame(gameId);
    if (!game) return null;

    const nameExists = Array.from(game.players.values())
        .some(p => p.name.toLowerCase() === playerName.toLowerCase());

    if (nameExists) {
      return { error: 'Name already taken' };
    }

    const playerId = uuidv4();

    const player = {
      id: playerId,
      name: playerName,
      socketId,
      completionTime: null,
      round2CompletionTime: null,
      round3CompletionTime: null,
      status: 'waiting',
      round2Status: null,
      round3Status: null,
      round2StartTime: null,
      round3StartTime: null
    };

    game.players.set(playerId, player);
    return player;
  }

  static startPlayerRound2(gameId, playerId) {
    const game = games.get(gameId);
    if (!game) return null;

    const player = game.players.get(playerId);
    if (!player) return null;

    player.round2StartTime = Date.now();
    player.round2Status = 'active';
    return game;
  }

  static startPlayerRound3(gameId, playerId) {
    const game = games.get(gameId);
    if (!game) return null;

    const player = game.players.get(playerId);
    if (!player) return null;

    player.round3StartTime = Date.now();
    player.round3Status = 'active';
    return game;
  }

  static submitSolution(gameId, playerId, solution, round) {
    const game = games.get(gameId);
    const currentRound = round || game.currentRound;

    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    const roundData = game.rounds[currentRound];
    if (!roundData) {
      return { success: false, error: 'Round not found' };
    }

    const player = game.players.get(playerId);
    if (!player) {
      return { success: false, error: 'Invalid player' };
    }

    // Check if already completed
    let isAlreadyCompleted = false;
    if (currentRound === 1) {
      isAlreadyCompleted = player.status === 'completed';
    } else if (currentRound === 2) {
      isAlreadyCompleted = player.round2Status === 'completed';
    } else if (currentRound === 3) {
      isAlreadyCompleted = player.round3Status === 'completed';
    }

    if (isAlreadyCompleted) {
      return { success: false, error: 'Already completed' };
    }

    // Validate solution using PuzzleGenerator
    const validation = PuzzleGenerator.validateSolution(solution, roundData.puzzle);
    if (!validation.valid) {
      return { 
        success: false, 
        error: 'Incorrect solution', 
        validationError: validation.message, 
        validationErrors: validation.errors 
      };
    }

    // Calculate completion time
    let completionTime;
    if (currentRound === 1) {
      completionTime = Date.now() - game.rounds[1].startTime;
      player.completionTime = completionTime;
      player.status = 'completed';
      roundData.completedPlayers.add(playerId);
    } else if (currentRound === 2) {
      completionTime = Date.now() - player.round2StartTime;
      player.round2CompletionTime = completionTime;
      player.round2Status = 'completed';
      roundData.completedPlayers.add(playerId);
    } else if (currentRound === 3) {
      completionTime = Date.now() - player.round3StartTime;
      player.round3CompletionTime = completionTime;
      player.round3Status = 'completed';
      roundData.completedPlayers.add(playerId);
      player.totalTime = player.completionTime + player.round2CompletionTime + player.round3CompletionTime;
      this.calculateFinalRankings(game);
    }
    
    const completedPlayers = Array.from(game.players.values())
      .filter(p => {
        if (currentRound === 1) return p.status === 'completed';
        if (currentRound === 2) return p.round2Status === 'completed';
        if (currentRound === 3) return p.round3Status === 'completed';
        return false;
      })
      .sort((a, b) => {
        const timeA = currentRound === 1 ? a.completionTime : currentRound === 2 ? a.round2CompletionTime : a.round3CompletionTime;
        const timeB = currentRound === 1 ? b.completionTime : currentRound === 2 ? b.round2CompletionTime : b.round3CompletionTime;
        return timeA - timeB;
      });

    completedPlayers.forEach((p, index) => {
      const rankIndex = index + 1;
      if (currentRound === 1) p.rank = rankIndex;
      else if (currentRound === 2) p.round2Rank = rankIndex;
      else if (currentRound === 3) p.round3Rank = rankIndex;
    });

    const allCompleted = roundData.completedPlayers.size === game.players.size;

    return {
      success: true,
      player,
      round: currentRound,
      totalPlayers: game.players.size,
      allCompleted,
      moveToRound2: currentRound === 1,
      moveToRound3: currentRound === 2
    };
  }

  static calculateFinalRankings(game) {
    Array.from(game.players.values())
      .filter(p => p.totalTime !== null)
      .sort((a, b) => a.totalTime - b.totalTime)
      .forEach((player, index) => player.totalRank = index + 1);
  }

  static getLeaderboard(gameId) {
    const game = games.get(gameId);
    if (!game) return null;

    return Array.from(game.players.values())
      .filter(p => p.status === 'completed')
      .sort((a, b) => a.completionTime - b.completionTime)
      .map(p => ({
        name: p.name,
        completionTime: p.completionTime,
        rank: p.rank
      }));
  }

  static getPlayerSession(socketId) {
    return playerSessions.get(socketId);
  }

  static removePlayerSession(socketId) {
    playerSessions.delete(socketId);
  }

  static getGamePlayers(gameId) {
    const game = games.get(gameId);
    if (!game) return [];

    return Array.from(game.players.values()).map(p => {
      const r1 = p.completionTime || null;
      const r2 = p.round2CompletionTime || null;
      const r3 = p.round3CompletionTime || null;

      const statusR1 = p.status || 'waiting';
      const statusR2 = p.round2Status || null;
      const statusR3 = p.round3Status || null;

      let overallStatus = 'waiting';
      let displayStatus = 'Waiting';
      let displayCompletionTime = null;

      if (statusR3 === 'completed') {
        overallStatus = 'completed';
        displayStatus = 'Completed';
        displayCompletionTime = (r1 || 0) + (r2 || 0) + (r3 || 0);
      } else if (statusR2 === 'completed') {
        overallStatus = 'round2-completed';
        displayStatus = 'Round 2 Completed';
        displayCompletionTime = (r1 || 0) + (r2 || 0);
      } else if (statusR1 === 'completed') {
        overallStatus = 'round1-completed';
        displayStatus = 'Round 1 Completed';
        displayCompletionTime = r1;
      } else if (statusR2 === 'active' || p.round2StartTime) {
        overallStatus = 'round2-active';
        displayStatus = 'Round 2 Active';
        displayCompletionTime = r1;
      } else if (statusR1 === 'active' || (game.rounds[1] && game.rounds[1].status === 'active')) {
        overallStatus = 'round1-active';
        displayStatus = 'Round 1 Active';
        displayCompletionTime = null;
      }

      return {
        id: p.id,
        name: p.name,
        status: overallStatus,
        displayStatus,
        completionTime: r1,
        round2CompletionTime: r2,
        round3CompletionTime: r3,
        displayCompletionTime,
        rank: p.rank || null,
        round2Rank: p.round2Rank || null,
        round3Rank: p.round3Rank || null,
        totalTime: (r1 || 0) + (r2 || 0) + (r3 || 0),
        totalRank: p.totalRank || null
      };
    });
  }
}

module.exports = GameService;