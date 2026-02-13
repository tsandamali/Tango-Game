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
        rank: p.totalRank || p.rank || null,
        round2Rank: p.round2Rank || null,
        totalTime: p.totalTime || null
      }));

      const completedCount = players.filter(p => p.status === 'completed').length;

      res.json({
        gameId: game.id,
        status: game.status,
        playerCount: game.players.size,
        completedCount,
        players: players.sort((a, b) => {
          const ta = a.completionTime || Infinity;
          const tb = b.completionTime || Infinity;
          return ta - tb;
        })
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

      const players = Array.from(game.players.values())
          .map(player => {
            const r1 = player.completionTime || 0;
            const r2 = player.round2CompletionTime || 0;
            const r3 = player.round3CompletionTime || 0;

            const totalTime = r1 + r2 + r3;

            return {
              ...player,
              calculatedTotalTime: totalTime
            };
          })
          .filter(p => p.calculatedTotalTime > 0)
          .sort((a, b) => a.calculatedTotalTime - b.calculatedTotalTime);

      let csv = 'Final Rank,Player Name,Round 1 (s),Round 2 (s),Round 3 (s),Total Time (s),Status\n';
      players.forEach((player) => {
        const r1Time = player.completionTime ? (player.completionTime / 1000).toFixed(2) : 'N/A';
        const r2Time = player.round2CompletionTime ? (player.round2CompletionTime / 1000).toFixed(2) : 'N/A';
        const r3Time = player.round3CompletionTime ? (player.round3CompletionTime / 1000).toFixed(2) : 'N/A';
        const totalTime = player.calculatedTotalTime
            ? (player.calculatedTotalTime / 1000).toFixed(2)
            : 'Incomplete';
        const finalRank = player.totalRank || 'N/A';
        const status = player.round3Status === 'completed' ? 'Completed All' : 'In Progress';

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
