import { app } from './app';
import { logger } from './config/logger';
import { LOCAL_HOST, LOCAL_PORT } from './constants/config.constants';

const host = LOCAL_HOST;
const port = process.env.SERVER_PORT
  ? Number(process.env.SERVER_PORT)
  : LOCAL_PORT;

app.listen(port, host, () => {
  logger.info(`Server is running on http://${host}:${port}`);
});
