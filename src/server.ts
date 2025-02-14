import { app } from './app';
import { logger } from './config/logger';
import { LOCAL_HOST, LOCAL_PORT } from './constants';

const host = process.env.HOST ?? LOCAL_HOST;
const port = process.env.PORT ? Number(process.env.PORT) : LOCAL_PORT;

app.listen(port, host, () => {
  logger.info(`Server is running on http://${host}:${port}`);
});
