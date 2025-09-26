const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { PORT, HOST, NODE_ENV } = require('./server-config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flyvisto Flight Booking API',
      version: '1.0.0',
      description: `
        A comprehensive flight booking and management system API.
        
        ## Features
        - User authentication and authorization
        - Flight search and booking
        - Seat selection and management
        - Payment processing
        - Real-time flight status updates
        - Admin management tools
        
        ## Authentication
        This API uses JWT Bearer tokens for authentication. Include the token in the Authorization header:
        \`Authorization: Bearer <your-jwt-token>\`
        
        ## Rate Limiting
        API endpoints are rate-limited to prevent abuse:
        - General endpoints: 100 requests per 15 minutes
        - Auth endpoints: 10 requests per 15 minutes
        - Search endpoints: 30 requests per minute
        - Booking endpoints: 5 requests per 15 minutes
        
        ## Error Handling
        All endpoints return consistent error responses with the following structure:
        \`\`\`json
        {
          "success": false,
          "message": "Error description",
          "code": "ERROR_CODE",
          "errors": [] // Array of detailed errors (optional)
        }
        \`\`\`
        
        ## Pagination
        List endpoints support pagination with the following query parameters:
        - \`page\`: Page number (default: 1)
        - \`limit\`: Items per page (default: 20, max: 100)
        - \`sortBy\`: Field to sort by
        - \`sortOrder\`: Sort direction (asc/desc)
      `,
      contact: {
        name: 'Flyvisto API Support',
        email: 'api-support@flyvisto.com',
        url: 'https://flyvisto.com/support',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: NODE_ENV === 'production' 
          ? 'https://api.flyvisto.com'
          : `http://${HOST}:${PORT}`,
        description: NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'Authentication required',
                  },
                  code: {
                    type: 'string',
                    example: 'AUTHENTICATION_ERROR',
                  },
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Access denied - insufficient permissions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'Access denied',
                  },
                  code: {
                    type: 'string',
                    example: 'AUTHORIZATION_ERROR',
                  },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'Validation failed',
                  },
                  code: {
                    type: 'string',
                    example: 'VALIDATION_ERROR',
                  },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string',
                          example: 'email',
                        },
                        message: {
                          type: 'string',
                          example: 'Invalid email format',
                        },
                        code: {
                          type: 'string',
                          example: 'INVALID_EMAIL',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'Resource not found',
                  },
                  code: {
                    type: 'string',
                    example: 'NOT_FOUND',
                  },
                },
              },
            },
          },
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'Too many requests, please try again later',
                  },
                  code: {
                    type: 'string',
                    example: 'RATE_LIMIT_EXCEEDED',
                  },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'An unexpected error occurred',
                  },
                  code: {
                    type: 'string',
                    example: 'INTERNAL_SERVER_ERROR',
                  },
                },
              },
            },
          },
        },
      },
      parameters: {
        PageParam: {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
          description: 'Page number for pagination',
        },
        LimitParam: {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
          },
          description: 'Number of items per page',
        },
        SortByParam: {
          in: 'query',
          name: 'sortBy',
          schema: {
            type: 'string',
          },
          description: 'Field to sort by',
        },
        SortOrderParam: {
          in: 'query',
          name: 'sortOrder',
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'asc',
          },
          description: 'Sort direction',
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Flights',
        description: 'Flight search, management, and information endpoints',
      },
      {
        name: 'Bookings',
        description: 'Flight booking and reservation management',
      },
      {
        name: 'Users',
        description: 'User profile and account management',
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints (admin access required)',
      },
      {
        name: 'Airports',
        description: 'Airport information and management',
      },
      {
        name: 'Airlines',
        description: 'Airline information and management',
      },
      {
        name: 'Payments',
        description: 'Payment processing and transaction management',
      },
    ],
  },
  apis: [
    './src/routes/v1/*.js',
    './src/models/*.js',
  ],
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {
      req.headers['X-Correlation-ID'] = Math.random().toString(36).substring(7);
      return req;
    },
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #1976d2 }
    .swagger-ui .scheme-container { background: #fafafa; padding: 15px }
  `,
  customSiteTitle: 'Flyvisto API Documentation',
  customfavIcon: '/favicon.ico',
};

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, swaggerOptions),
  specs,
};
