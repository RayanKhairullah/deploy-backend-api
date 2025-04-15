const Joi = require("joi");
const {
  addExpenseHandler,
  getExpensesByUserHandler,
  getExpenseByIdHandler,
  updateExpenseByIdHandler,
  deleteExpenseByIdHandler,
} = require("../controllers/expenseController");
const authMiddleware = require("../middlewares/authMiddleware");

const expenseRoutes = [
  {
    method: "POST",
    path: "/expenses",
    handler: addExpenseHandler,
    options: {
      pre: [{ method: authMiddleware }],
      validate: {
        payload: Joi.object({
          category: Joi.string().required(),
          uangmasuk: Joi.number().precision(2).default(0.0),
          uangkeluar: Joi.number().precision(2).default(0.0),
          uangakhir: Joi.number().precision(2).required(),
          description: Joi.string().allow(null, ""),
          transaction_date: Joi.date().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/expenses",
    handler: getExpensesByUserHandler,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
  {
    method: "GET",
    path: "/expenses/{expenseid}",
    handler: getExpenseByIdHandler,
    options: {
      pre: [{ method: authMiddleware }],
      validate: {
        params: Joi.object({
          expenseid: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "PUT",
    path: "/expenses/{expenseid}",
    handler: updateExpenseByIdHandler,
    options: {
      pre: [{ method: authMiddleware }],
      validate: {
        params: Joi.object({
          expenseid: Joi.string().required(),
        }),
        payload: Joi.object({
          category: Joi.string().required(),
          uangmasuk: Joi.number().precision(2).default(0.0),
          uangkeluar: Joi.number().precision(2).default(0.0),
          uangakhir: Joi.number().precision(2).required(),
          description: Joi.string().allow(null, ""),
          transaction_date: Joi.date().required(),
        }),
      },
    },
  },
  {
    method: "DELETE",
    path: "/expenses/{expenseid}",
    handler: deleteExpenseByIdHandler,
    options: {
      pre: [{ method: authMiddleware }],
      validate: {
        params: Joi.object({
          expenseid: Joi.string().required(),
        }),
      },
    },
  },
];

module.exports = expenseRoutes;