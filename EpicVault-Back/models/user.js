const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  email: { type: String, unique: true, index: true },
  password_hash: String,

  // Sistema de verificación
  verified: { type: Boolean, default: false },
  verification_token: String,

  friend_code: { type: String, unique: true }, // El código corto para el enlace (Ej: DARIO#1234)
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friend_requests: [{ // Peticiones RECIBIDAS
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sent_friend_requests: [{ // 👈 NUEVO: Peticiones ENVIADAS
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  avatar_url: String,
  global_roles: [String],
  created_at: Date,
  last_login: Date,
  campaigns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }]
})

const User = mongoose.model('User', userSchema, 'users');
module.exports = User;