import app from './app';
import { config } from './shared/config/index';

const server = app.listen(config.port, () => {
  console.log(`[LegalMetrology-Backend] Server listening on port ${config.port} in ${config.env} mode`);
  console.log(`[LegalMetrology-Backend] Modules B01 - B40 active`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default server;
