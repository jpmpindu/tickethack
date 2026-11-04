const express = require("express");
const router = express.Router();
const Bookings = require('../models/bookings');




router.get('/', async (req , res) => {
    const bookings = await Booking.find().populate('Cart');
    res.json({ result : true , bookings : bookings});
});

router.post('/add', async (req, res) => {
console.log('BODY REÇU :', req.body);

const { cart } = req.body;

if (!cart) {
return res.status(400).json({
result: false,
message: 'Aucun identifiant de trajet reçu',
});
}

try {
const newBookings = new Bookings({ cart });
const savedBookings = await newBookings.save();

res.json({
  result: true,
  cart: savedBookings,
  message: 'Enjoy your travels with Tickethack'
});
} catch (error) {
res.status(500).json({
result: false,
message: error.message,
});
}
});

module.exports = router;
