// Swagger configuration for express-jsdoc-swagger

export const getSwaggerOptions = (BASE_URL: string, baseDir: string) => ({
  info: {
    version: '1.0.0',
    title: 'Team Project Manager API',
    description: 'API documentation for Team Project Manager',
  },
  security: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
  servers: [
    {
      url: `${BASE_URL}`,
      description: 'Development server',
    }
  ],
  baseDir: baseDir,
  filesPattern: ['./routes/*.{ts,js}'], // scans all .ts and .js routes
  swaggerUIPath: '/api-docs',
  exposeSwaggerUI: true,
  exposeApiDocs: false,
  notRequiredAsNullable: false,
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Team Project Manager API',
      version: '1.0.0',
      description: 'API documentation for Team Project Manager',
    },
    servers: [
      {
        url: `${BASE_URL}`,
        description: 'Development server',
      },
    ],
  },
});