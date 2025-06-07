const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true                     // obligatorio
  },
  email: {
    type: String,
    required: true,
    unique: true                       // no duplicados
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true                     // createdAt, updatedAt
});

module.exports = mongoose.model('User', userSchema);
