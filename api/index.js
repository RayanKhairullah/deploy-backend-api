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
      host: '0.0.0.0',
      compression: {
        minBytes: 1024 
      },
      routes: {
        cors: {
          origin: ['*'],
          credentials: true,
          headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match', 'Accept-Encoding'], // <-- Tambah Accept-Encoding
          exposedHeaders: ['WWW-Authenticate', 'Server-Authorization', 'Content-Encoding'], // <-- Tambah Content-Encoding
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
    const response = await server.inject({
      method: req.method,
      url: req.url,
      headers: req.headers,
      payload: req.body,
    });

    // Set headers from the Hapi response
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Send status and result
    res.status(response.statusCode).json(response.result);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal Server Error' 
    });
  }
};