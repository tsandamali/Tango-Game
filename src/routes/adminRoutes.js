const express = require('express');
const AdminController = require('../controllers/adminController');

function createAdminRoutes(io) {
  const router = express.Router();

  router.post('/create-game', AdminController.createGame);
  router.get('/game/:gameId', AdminController.getGame);
  router.post('/start-game/:gameId', (req, res) => AdminController.startGame(req, res, io));
  router.get('/export/:gameId', AdminController.exportResults);

  return router;
}

module.exports = createAdminRoutes;
