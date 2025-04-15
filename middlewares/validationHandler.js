const Boom = require('@hapi/boom');

const validationHandler = (request, h, error) => {
  throw Boom.badRequest(error.details[0].message);
};

module.exports = validationHandler;