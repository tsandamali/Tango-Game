const { httpServer } = require('./app');
const config = require('./config/config');

const PORT = config.server.port;

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║        Tango Puzzle Game Server                        ║
╚════════════════════════════════════════════════════════╝

Server running on: http://localhost:${PORT}
Environment: ${config.server.env}
Max Players per Game: ${config.game.maxPlayersPerGame}
Default Countdown: ${config.game.defaultCountdownTime}s

Admin Panel: http://localhost:${PORT}/admin.html
Home Page: http://localhost:${PORT}

Press Ctrl+C to stop the server
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
