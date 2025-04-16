const prisma = require('../utils/prismaClient');
const Bcrypt = require('bcrypt');
const { sendEmail } = require('../utils/email');
const Jwt = require('jsonwebtoken');
const Boom = require('@hapi/boom');
const { nanoid } = require('nanoid'); 

const registerHandler = async (request, h) => {
  const { username, email, password } = request.payload;
  
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return h.response({
        status: 'fail',
        message: 'Email sudah terdaftar',
      }).code(400);
    }
  
    const hashedPassword = await Bcrypt.hash(password, 10);
    const verificationCode = nanoid(10);
  
    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        verificationCode,
      },
    });
  
    try {
      await sendEmail(
        email,
        'Verifikasi Email Kamu - NeuroFin',
        `Halo! Terima kasih sudah mendaftar di NeuroFin. Kode verifikasi kamu adalah: ${verificationCode}`
      );
    } catch (emailError) {
      console.error('Error sending email:', emailError.message);
      return h.response({
        status: 'fail',
        message: 'Gagal mengirim email verifikasi',
      }).code(500);
    }
  
    return h.response({
      status: 'success',
      message: 'Registrasi berhasil, cek email untuk verifikasi',
    }).code(201);
  } catch (error) {
    console.error('Error during registration:', error.message);
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
};

const verifyEmailHandler = async (request, h) => {
  const { email, code } = request.payload;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
  
    if (!user) {
      return h.response({
        status: 'fail',
        message: 'Email tidak ditemukan',
      }).code(404);
    }
  
    if (user.verificationCode !== code) {
      return h.response({
        status: 'fail',
        message: 'Kode verifikasi tidak valid',
      }).code(400);
    }
  
    await prisma.user.update({
      where: { email },
      data: {
        verified: true,
      },
    });
  
    return h.response({
      status: 'success',
      message: 'Email berhasil diverifikasi',
    }).code(200);
  } catch (error) {
    console.error('Error during email verification:', error.message);
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
};

const loginHandler = async (request, h) => {
  const { email, password } = request.payload;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await Bcrypt.compare(password, user.password))) {
    throw Boom.unauthorized('Email atau kata sandi tidak valid');
  }

  if (!user.verified) {
    throw Boom.forbidden('Harap verifikasi email Anda terlebih dahulu');
  }

  const token = Jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '4h' }
  );

  return h.response({
    status: 'success',
    message: 'Login berhasil',
    data: { token }
  }).code(200)
    .state('token', token, {
      isHttpOnly: true,
      isSecure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      ttl: 1000 * 60 * 60 * 4,
    });
};

const meHandler = async (request, h) => {
  const { id } = request.auth.credentials;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, email: true, verified: true, createdAt: true }
    });
    if (!user) {
      return h.response({
        status: 'fail',
        message: 'User tidak ditemukan'
      }).code(404);
    }
    return h.response({
      status: 'success',
      message: 'Berhasil mendapatkan data user',
      data: user
    }).code(200);
  } catch (error) {
    console.error('Error retrieving user data:', error.message);
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    }).code(500);
  }
};

const logoutHandler = async (request, h) => {
  return h.response({
    status: 'success',
    message: 'Logout berhasil',
  }).code(200)
    .unstate('token');
};

module.exports = { 
  registerHandler, 
  verifyEmailHandler, 
  loginHandler,
  meHandler,
  logoutHandler,
};