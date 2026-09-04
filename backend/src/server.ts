import { app } from './app.js';
import { config } from './shared/config/index.js';

const server = app.listen(config.port, () => {
  console.log(`[LegalMetrology-Backend] Server listening on port ${config.port} in ${config.env} mode`);
  console.log(`[LegalMetrology-Backend] Modules active: B21, B22, B23, B24, B25`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default server;
