import swaggerJsdoc, { Options } from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Address Book API',
    version: '1.0.0',
    description: 'API Documentation for Address Book',
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local server',
    },
  ],
  paths: {
    '/graphql': {
      post: {
        summary: 'GraphQL API Endpoint',
        description: 'Use this endpoint to interact with the Address Book API.',
        responses: {
          200: {
            description: 'Successful response',
          },
          400: {
            description: 'Bad Request',
          },
        }
      }
    }
  }
};

const options: Options = {
  swaggerDefinition,
  apis: ['./src/resolvers/*.ts'], 
};

export const swaggerDocs = swaggerJsdoc(options);
