const successResponse = (h, data, message = 'Success') => {
  return h.response({ status: 'success', message, data }).code(200);
};

const errorResponse = (h, message, statusCode = 400) => {
  return h.response({ status: 'fail', message }).code(statusCode);
};

module.exports = { successResponse, errorResponse };