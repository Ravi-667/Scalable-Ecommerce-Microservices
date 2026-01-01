const mongoose = require('mongoose');
const debug = require('debug')('backend:db');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/se';

function connect() {
  mongoose.set('strictQuery', false);
  return mongoose
    .connect(MONGO_URI)
    .then((conn) => {
      debug('Connected to MongoDB');
      console.log('Connected to MongoDB');
      return conn;
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message || err);
      return Promise.reject(err);
    });
}

module.exports = { connect, mongoose };
