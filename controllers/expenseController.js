const prisma = require('../utils/prismaClient');
const { nanoid } = require('nanoid');
const Boom = require('@hapi/boom');

// Tambah expense baru
const addExpenseHandler = async (request, h) => {
  const userId = request.auth.credentials.id; // pastikan middleware auth mengisi credentials
  const {
    category,
    uangmasuk,
    uangkeluar,
    uangakhir,
    description,
    transaction_date,
  } = request.payload;
  
  const expenseid = nanoid(11);
  try {
    const expense = await prisma.expense.create({
      data: {
        expenseid,
        id_user: userId,
        category,
        uangmasuk,
        uangkeluar,
        uangakhir,
        description,
        transaction_date,
      },
    });
    return h.response({
      status: 'success',
      message: 'Expense berhasil ditambahkan',
      data: { expenseid: expense.expenseid },
    }).code(201);
  } catch (error) {
    console.error("Error adding expense:", error);
    throw Boom.internal("Gagal menambahkan expense");
  }
};

// Dapatkan semua expense milik user
const getExpensesByUserHandler = async (request, h) => {
  const userId = request.auth.credentials.id; // pastikan middleware auth mengisi credentials
  try {
    const expenses = await prisma.expense.findMany({
      where: { id_user: userId },
    });
    if (!expenses || expenses.length === 0) {
      return h.response({
        status: 'fail',
        message: 'Tidak ada data expense ditemukan',
      }).code(404);
    }
    return h.response({
      status: 'success',
      data: { expenses },
    }).code(200);
  } catch (error) {
    console.error("Error retrieving expenses:", error);
    throw Boom.internal("Gagal mengambil data expenses");
  }
};

// Dapatkan expense berdasarkan expenseid
const getExpenseByIdHandler = async (request, h) => {
  const { expenseid } = request.params;
  try {
    const expense = await prisma.expense.findUnique({
      where: { expenseid },
    });
    if (!expense) {
      return h.response({
        status: 'fail',
        message: 'Expense tidak ditemukan',
      }).code(404);
    }
    return h.response({
      status: 'success',
      data: { expense },
    }).code(200);
  } catch (error) {
    console.error("Error retrieving expense:", error);
    throw Boom.internal("Gagal mengambil data expense");
  }
};

// Update expense berdasarkan expenseid
const updateExpenseByIdHandler = async (request, h) => {
  const { expenseid } = request.params;
  const {
    category,
    uangmasuk,
    uangkeluar,
    uangakhir,
    description,
    transaction_date,
  } = request.payload;
  try {
    const updatedExpense = await prisma.expense.update({
      where: { expenseid },
      data: {
        category,
        uangmasuk,
        uangkeluar,
        uangakhir,
        description,
        transaction_date,
      },
    });
    return h.response({
      status: 'success',
      message: 'Expense berhasil diperbarui',
    }).code(200);
  } catch (error) {
    // Jika error disebabkan oleh expense tidak ditemukan
    if (error.code === 'P2025') {
      return h.response({
        status: 'fail',
        message: 'Expense gagal diperbarui. Id tidak ditemukan',
      }).code(404);
    }
    console.error("Error updating expense:", error);
    throw Boom.internal("Gagal memperbarui expense");
  }
};

// Delete expense berdasarkan expenseid
const deleteExpenseByIdHandler = async (request, h) => {
  const { expenseid } = request.params;
  try {
    await prisma.expense.delete({
      where: { expenseid },
    });
    return h.response({
      status: 'success',
      message: 'Expense berhasil dihapus',
    }).code(200);
  } catch (error) {
    if (error.code === 'P2025') {
      return h.response({
        status: 'fail',
        message: 'Expense gagal dihapus. Id tidak ditemukan',
      }).code(404);
    }
    console.error("Error deleting expense:", error);
    throw Boom.internal("Gagal menghapus expense");
  }
};

module.exports = {
  addExpenseHandler,
  getExpensesByUserHandler,
  getExpenseByIdHandler,
  updateExpenseByIdHandler,
  deleteExpenseByIdHandler,
};
