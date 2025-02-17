import swaggerJSDoc from 'swagger-jsdoc';
export const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Teacher-Student API',
      version: '1.0.0',
      description: 'API documentation for Teacher-Student management.',
    },
    servers: [
      {
        url: `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`,
      },
    ],
  },
  apis: ['src/routes/*.ts'],
};
