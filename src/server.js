require('dotenv').config();
const Hapi = require('@hapi/hapi');
const routes = require('../routes/expenseRoutes');
const authRoutes = require('../routes/authRoutes');
const prisma = require('../utils/prismaClient');
const errorHandler = require('../middlewares/errorHandler');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 9000,
    host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
    compression: {
      minBytes: 1024 
    },
    routes: {
      cors: {
        origin: ['*'],
        credentials: true,
          headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-Encoding'], 
          exposedHeaders: ['WWW-Authenticate', 'Server-Authorization', 'Content-Encoding'], 
          maxAge: 86400
      }
    }
  });

  // Register cookie support
  server.state('token', {
    ttl: 1000 * 60 * 60 * 4, // 4 hours
    isSecure: process.env.NODE_ENV === 'production',
    isHttpOnly: true,
    encoding: 'none',
    clearInvalid: false,
    strictHeader: true,
    path: '/'
  });

  server.app.db = prisma;

  server.route([...authRoutes, ...routes]);

  server.ext('onPreResponse', (request, h) => {
    const response = request.response;
    if (response.isBoom) {
      return errorHandler(response, h);
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
  return server;
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

if (require.main === module) {
  init();
}

module.exports = { 
  init 
};