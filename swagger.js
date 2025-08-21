const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerConstants = require('./constants/swaggerConstants');
const {getTokenHeaderName} = require('./utils/getTokenHeaderUtils');

const options = {
  definition: {
    openapi: swaggerConstants.openapiVersion,
    info: {
      title: swaggerConstants.projectTitle,
      version: swaggerConstants.projectVersion,
      description: swaggerConstants.projectDescription,
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: getTokenHeaderName(),
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = ({app}) => {
  app.use(
    `${swaggerConstants.apiPrefix}docs`,
    swaggerUi.serve,
    swaggerUi.setup(specs)
  );
};
