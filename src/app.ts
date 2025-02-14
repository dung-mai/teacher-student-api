import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import appRoutes from './routes';
import { ROUTE_PREFIX } from './constants';
import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerOptions } from './config/swagger';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './errors/errorHandler';
import { requestIdMiddleware } from './middlewares/requestId.middleware';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
// Generate & attach a unique requestId to each request for log correlation
app.use(requestIdMiddleware);

// Setup swagger
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount app routes
app.use(ROUTE_PREFIX, appRoutes);

// Global error handling
app.use(errorHandler);

export { app };
