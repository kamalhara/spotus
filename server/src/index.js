require('dotenv').config();
const app = require('./app');
const { startKeepAlive } = require('./utils/keepAlive');

const PORT = process.env.PORT || 8080;
let shuttingDown = false;

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);

  // Initialize keep-alive module (development only)
  startKeepAlive();
});

function shutdown(signal, exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('Server shutdown started', { signal });
  const forceExit = setTimeout(() => process.exit(1), 10000);
  forceExit.unref();
  server.close((error) => {
    clearTimeout(forceExit);
    if (error) console.error('Server shutdown failed', { message: error.message });
    process.exit(error ? 1 : exitCode);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection', { error });
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception', { message: error.message, stack: error.stack });
  shutdown('uncaughtException', 1);
});
