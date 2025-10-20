// src/swagger.ts
import { type Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Demo Credit API',
      version: '1.0.0',
      description: 'API documentation for Demo Credit application',
    },
    servers: [
      {
        url: 'http://localhost:3078',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // User Schema
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            first_name: { type: 'string', nullable: true },
            last_name: { type: 'string', nullable: true },
            phone_number: { type: 'string', nullable: true },
            bvn: { type: 'string', nullable: true },
            is_verified: { type: 'boolean', default: false },
            is_blacklisted: { type: 'boolean', default: false },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            deleted_at: { type: 'string', format: 'date-time', nullable: true },
          },
        },

        // Account Schema
        Account: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            bank_id: { type: 'integer' },
            account_number: { type: 'string' },
            account_name: { type: 'string' },
            bank_code: { type: 'string' },
            bank_name: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            deleted_at: { type: 'string', format: 'date-time', nullable: true },
          },
        },

        // Bank Schema
        Bank: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            code: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },

        // Wallet Schema
        Wallet: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            user_id: { type: 'integer' },
            balance: { type: 'number', format: 'double' },
            currency: { type: 'string', default: 'NGN' },
            is_active: { type: 'boolean', default: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },

        // Transaction Schema
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            reference: { type: 'string' },
            wallet_id: { type: 'integer' },
            user_id: { type: 'integer' },
            amount: { type: 'number', format: 'double' },
            type: { type: 'string', enum: ['credit', 'debit'] },
            status: { 
              type: 'string', 
              enum: ['pending', 'completed', 'failed', 'reversed'],
              default: 'pending'
            },
            category: { 
              type: 'string',
              enum: ['transfer', 'deposit', 'withdrawal', 'reversal', 'fee']
            },
            metadata: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },

     
       

      
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['error', 'fail'] },
            message: { type: 'string' },
            code: { type: 'string', format: 'uuid' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
      responses: {
        '400': {
          description: 'Bad Request - The request was invalid or cannot be served',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Invalid input data',
                errors: [
                  {
                    field: 'email',
                    message: 'Invalid email format',
                  },
                ],
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized - Authentication is needed to get the requested response',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Authentication required',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden - You do not have permission to access this resource',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        '404': {
          description: 'Not Found - The requested resource could not be found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Resource not found',
              },
            },
          },
        },
        '500': {
          description: 'Internal Server Error - Something went wrong on the server',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Internal server error',
                code: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
              },
            },
          },
        },
      },
    },
  },
  apis: [
    './src/deliverymen/*.ts',
    './src/deliverymen/*.delivery.ts',
  ],
};

export default swaggerOptions;