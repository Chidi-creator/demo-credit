import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi, { SwaggerOptions } from 'swagger-ui-express';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import swaggerOptions from '../swagger';

// Initialize swagger-jsdoc
const specs = swaggerJsdoc(swaggerOptions);

// Create a wrapper for the Swagger UI handler
const createSwaggerHandler = () => {
  const handler = swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Demo Credit API Documentation',
  });
  
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req, res, next);
  };
};

// Create a wrapper for the Swagger UI middleware
const createSwaggerMiddleware = () => {
  return swaggerUi.serve;
};

const swaggerUiHandler = createSwaggerHandler();
const swaggerUiMiddleware = createSwaggerMiddleware();

export { swaggerUiMiddleware, swaggerUiHandler };

// This file sets up Swagger UI for your API documentation, providing an interactive interface to explore and test your endpoints.
