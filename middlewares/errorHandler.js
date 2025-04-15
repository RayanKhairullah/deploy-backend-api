const logger = require('../utils/logger');
const Boom = require('@hapi/boom');

const errorHandler = (error, h) => {
  if (Boom.isBoom(error)) {
    return h.response({
      status: 'fail',
      statusCode: error.output.statusCode,
      message: error.output.payload.message,
    }).code(error.output.statusCode);
  }
  logger.error('Unhandled error:', error);
  return h.response({
    status: 'error',
    message: 'Terjadi kesalahan pada server',
  }).code(500);
};

module.exports = errorHandler;