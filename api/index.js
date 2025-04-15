require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('../routes/expenseRoutes');
const authRoutes = require('../routes/authRoutes');
const prisma = require('../utils/prismaClient');
const errorHandler = require('../middlewares/errorHandler');

let server;

async function initServer() {
  if (!server) {
    server = Hapi.server({ 
      port: process.env.PORT || 3000,
      compression: {
        minBytes: 1024 
      },
      routes: {
      host: '0.0.0.0',
        cors: {
          origin: ['*'],
          credentials: true,
          headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-Encoding'], 
          exposedHeaders: ['WWW-Authenticate', 'Server-Authorization', 'Content-Encoding'], 
          maxAge: 86400
        }
      }
    });

    // ... (kode cookie dan registrasi route tetap sama)

    await server.initialize();
  }
  return server;
}

module.exports = async (req, res) => {
  try {
    const server = await initServer();
    const { method, url, headers, body: payload } = req;
    
    const hapiReq = {
      method,
      url,
      headers,
      payload,
      info: {
        remoteAddress: headers['x-forwarded-for'] || req.socket.remoteAddress
      }
    };

    const response = await server.inject(hapiReq);

    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    if (response.statusCode === 302 && response.headers.location) {
      return res.redirect(response.statusCode, response.headers.location);
    }

    res.status(response.statusCode).send(response.result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error'
    });
  }
};