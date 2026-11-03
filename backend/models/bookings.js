const mongoose = require('mongoose');
const Cart = require('./carts');

const bookingSchema = mongoose.Schema({
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'carts',
    required: true,
  }
});

const Booking = mongoose.model('bookings', bookingSchema);

module.exports = Booking;
