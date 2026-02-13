require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000']
  },
  game: {
    defaultCountdownTime: parseInt(process.env.DEFAULT_COUNTDOWN_TIME) || 10,
    maxPlayersPerGame: parseInt(process.env.MAX_PLAYERS_PER_GAME) || 50
  },
  session: {
    timeout: parseInt(process.env.SESSION_TIMEOUT) || 3600000 // 1 hour
  }
};
