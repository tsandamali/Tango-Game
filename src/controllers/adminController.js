const GameService = require('../services/gameService');

class AdminController {
  static createGame(req, res) {
    try {
      const { gameId } = GameService.createGame();
      res.json({
        gameId,
        joinLink: `/game/${gameId}`
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create game' });
    }
  }

  static getGame(req, res) {
    try {
      const game = GameService.getGame(req.params.gameId);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      const playersRaw = GameService.getGamePlayers(req.params.gameId);

      // Map to values expected by frontend
      const players = playersRaw.map(p => ({
        id: p.id,
        name: p.name,
        // normalize status for frontend classes: 'waiting', 'active', 'completed', or specific
        status: p.status === 'completed' ? 'completed' : p.status,
        displayStatus: p.displayStatus || (p.status ? p.status : 'Waiting'),
        completionTime: p.displayCompletionTime, // ms or null
        totalTime: p.totalTime || null,
        rank: p.totalRank || p.rank || null,
        round2Rank: p.round2Rank || null
      }));

      const completedCount = players.filter(p => p.status === 'completed').length;

      // Sort players: completed first (sorted by lowest time), then others
      const sortedPlayers = players.sort((a, b) => {
        // Completed players come first, sorted by time (lowest first = rank 1)
        const aTime = a.totalTime || a.completionTime;
        const bTime = b.totalTime || b.completionTime;
        
        // If both have times, sort by time (ascending - lowest first)
        if (aTime && bTime) {
          return aTime - bTime;
        }
        // If only one has time, that one comes first
        if (aTime) return -1;
        if (bTime) return 1;
        // If neither has time, maintain original order
        return 0;
      });

      // Re-assign ranks based on sorted position for completed players
      // This ensures the rank matches the display order when a faster player finishes later
      let rankCounter = 1;
      sortedPlayers.forEach((player) => {
        if (player.status === 'completed') {
          player.rank = rankCounter++;
        }
      });

      res.json({
        gameId: game.id,
        status: game.status,
        playerCount: game.players.size,
        completedCount,
        players: sortedPlayers
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch game' });
    }
  }

  static startGame(req, res, io) {
    try {
      const game = GameService.startGame(req.params.gameId);
      if (!game) {
        return res.status(400).json({ error: 'Game not found or already started' });
      }

      io.to(game.id).emit('countdown-start', {
        seconds: game.countdownTime,
        round: game.currentRound
      });

      setTimeout(() => {
        const activeGame = GameService.activateGame(game.id);
        if (activeGame) {
          const currentRound = activeGame.currentRound;
          io.to(game.id).emit('game-start', {
            puzzle: activeGame.rounds[currentRound].puzzle,
            round: currentRound
          });
        }
      }, game.countdownTime * 1000);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start game' });
    }
  }

  static exportResults(req, res) {
    try {
      const game = GameService.getGame(req.params.gameId);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      // Get all players and calculate total times
      const allPlayers = Array.from(game.players.values()).map(player => {
        const r1 = player.completionTime || 0;
        const r2 = player.round2CompletionTime || 0;
        const r3 = player.round3CompletionTime || 0;
        const totalTime = r1 + r2 + r3;

        return {
          ...player,
          r1,
          r2,
          r3,
          calculatedTotalTime: totalTime
        };
      });

      // Sort all players by total time (lowest first = rank 1)
      const sortedPlayers = allPlayers.sort((a, b) => {
        const aTime = a.calculatedTotalTime || Infinity;
        const bTime = b.calculatedTotalTime || Infinity;
        return aTime - bTime;
      });

      // Assign ranks based on sorted position
      let csv = 'Final Rank,Player Name,Round 1 (s),Round 2 (s),Round 3 (s),Total Time (s),Status\n';
      
      sortedPlayers.forEach((player, index) => {
        const r1Time = player.r1 ? (player.r1 / 1000).toFixed(2) : 'N/A';
        const r2Time = player.r2 ? (player.r2 / 1000).toFixed(2) : 'N/A';
        const r3Time = player.r3 ? (player.r3 / 1000).toFixed(2) : 'N/A';
        const totalTime = player.calculatedTotalTime > 0
            ? (player.calculatedTotalTime / 1000).toFixed(2)
            : 'Incomplete';
        
        // Rank is based on position in sorted array (index + 1)
        // Only assign rank to players who have completed
        const finalRank = player.calculatedTotalTime > 0 ? (index + 1) : 'N/A';
        
        const status = player.round3Status === 'completed' ? 'Completed All' : 
                       player.round2Status === 'completed' ? 'Round 2 Completed' :
                       player.status === 'completed' ? 'Round 1 Completed' : 'In Progress';

        csv += `${finalRank},${player.name},${r1Time},${r2Time},${r3Time},${totalTime},${status}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=game-${game.id}-results.csv`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: 'Failed to export results' });
    }
  }
}

module.exports = AdminController;
