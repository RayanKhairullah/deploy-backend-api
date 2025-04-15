const Joi = require("joi");
const {
  registerHandler,
  verifyEmailHandler,
  loginHandler,
  meHandler,
  logoutHandler,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const authRoutes = [
  {
    method: "POST",
    path: "/register",
    handler: registerHandler,
    options: {
      validate: {
        payload: Joi.object({
          username: Joi.string().min(3).required(),
          email: Joi.string().email().required(),
          password: Joi.string().min(6).required(),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/verify-email",
    handler: verifyEmailHandler,
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          code: Joi.string().min(6).required(),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/login",
    handler: loginHandler,
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/me",
    handler: meHandler,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
  {
    method: "POST",
    path: "/logout",
    handler: logoutHandler,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
];

module.exports = authRoutes;
