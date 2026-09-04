import app from './app';
import { config } from './config';
import { initializeDatabase } from './db';

const startServer = async () => {
  await initializeDatabase();
  app.listen(config.port, () => {
    console.log(`[SERVER] Legal Metrology Backend listening on port ${config.port} (${config.nodeEnv})`);
  });
};

startServer();
