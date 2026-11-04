const express = require('express');
const router = express.Router();

const Cart = require('../models/carts');

/* GET cart listing. */
router.get('/', async (req, res) => {
  const carts = await Cart.find().populate('trip');

  res.json({
    result: true,
    carts: carts,
  });
});

router.post('/add', async (req, res) => {
  console.log('BODY REÇU :', req.body);

  const { trip } = req.body;

  if (!trip) {
    return res.status(400).json({
      result: false,
      message: 'Aucun identifiant de trajet reçu',
    });
  }

  try {
    const newCart = new Cart({ trip });
    const savedCart = await newCart.save();

    res.json({
      result: true,
      cart: savedCart,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      message: error.message,
    });
  }
});

module.exports = router;
