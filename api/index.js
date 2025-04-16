require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('../routes/expenseRoutes');
const authRoutes = require('../routes/authRoutes');
const prisma = require('../utils/prismaClient');
const errorHandler = require('../middlewares/errorHandler');
const Inert = require('@hapi/inert');
const path = require('path');

let server;

async function initServer() {
  if (!server) {
    server = Hapi.server({ 
      port: process.env.PORT || 3000,
      host: '0.0.0.0',
      routes: {
        cors: {
          origin: ['*'],
          credentials: true,
          headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'],
          exposedHeaders: ['WWW-Authenticate', 'Server-Authorization'],
          maxAge: 86400
        }
      }
    });

    await server.register(Inert);

    server.route({
      method: 'GET',
      path: '/',
      handler: {
        file: path.join(__dirname, '../docs/docs.html')
      }
    });

    server.state('token', {
      ttl: 1000 * 60 * 60 * 4,
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

    await server.initialize();
  }
  return server;
}

module.exports = async (req, res) => {
  try {
    const server = await initServer();
    const response = await server.inject({
      method: req.method,
      url: req.url,
      headers: req.headers,
      payload: req.body,
    });

    res.setHeader('Content-Type', response.headers['content-type']);
    Object.entries(response.headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'content-type') { // Avoid duplicate
        res.setHeader(key, value);
      }
    });

    // Send the correct status and payload
    res.status(response.statusCode).send(response.result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal Server Error' 
    });
  }
};
