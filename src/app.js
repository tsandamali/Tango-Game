const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const config = require('./config/config');
const createAdminRoutes = require('./routes/adminRoutes');
const SocketService = require('./services/socketService');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.server.allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/game/:gameId', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'game.html'));
});

// Redirect /admin.html to home page (admin panel is now the home page)
app.get('/admin.html', (req, res) => {
  res.redirect('/');
});

app.use('/api/admin', createAdminRoutes(io));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Socket.IO
SocketService.initialize(io);

module.exports = { app, httpServer };
