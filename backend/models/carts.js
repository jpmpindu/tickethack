const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'trips',
    required: true,
  },
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
