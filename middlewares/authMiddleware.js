const Jwt = require("jsonwebtoken");
const Boom = require("@hapi/boom");

const authMiddleware = async (request, h) => {
  try {
    // Try to get token from cookie first
    let token = request.state.token;
    
    // in cookie, check Authorization header
    if (!token && request.headers.authorization) {
      const authHeader = request.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) throw Boom.unauthorized("Token tidak ditemukan");
    const decoded = Jwt.verify(token, process.env.JWT_SECRET);
    request.auth = { credentials: decoded };
    return h.continue;
  } catch (err) {
    throw Boom.unauthorized("Token tidak valid atau kadaluarsa");
  }
};

module.exports = authMiddleware;