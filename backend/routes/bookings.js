// Importer Express
const express = require('express');
// Créer un router, branché dans app.js sur "/bookings"
const router = express.Router();

// Importer le modèle Booking pour la collection "bookings"
const Booking = require('../models/bookings');
// Importer le modèle Cart : l'achat transforme le panier en réservations
const Cart = require('../models/carts');

// GET /bookings : récupérer toutes les réservations
router.get('/', async (req, res) => {
  // "try" : en cas d'erreur de la base, on passe dans "catch"
  try {
    // find() récupère toutes les réservations
    // populate('trip') remplace l'identifiant du trajet par le trajet complet
    const bookings = await Booking.find().populate('trip');

// Envoyer les réservations au frontend
res.json({
  result: true,
  // Raccourci pour "bookings: bookings"
  bookings,
});
  } catch (error) {
    // Afficher l'erreur dans le terminal
    console.error(error);

// Code 500 = erreur côté serveur
res.status(500).json({
  result: false,
  message: error.message,
});
  }
});

// POST /bookings/add : ajouter une seule réservation (pas utilisée par le frontend)
router.post('/add', async (req, res) => {
  // Récupérer l'identifiant du trajet envoyé
  const { trip } = req.body;

  // Si l'identifiant manque, répondre tout de suite avec une erreur
  if (!trip) {
    // Code 400 = la demande est incomplète
    return res.status(400).json({
      result: false,
      message: 'Trip ID missing',
    });
  }

  try {
    // Créer la réservation (bookingDate est rempli automatiquement par le modèle)
    const newBooking = new Booking({ trip });
    // Enregistrer la réservation dans MongoDB
    const savedBooking = await newBooking.save();

// Renvoyer la réservation enregistrée
res.json({
  result: true,
  booking: savedBooking,
});
  } catch (error) {
    // Code 500 = erreur côté serveur
    res.status(500).json({
      result: false,
      message: error.message,
    });
  }
});

// POST /bookings/purchase : acheter tous les trajets du panier
router.post('/purchase', async (req, res) => {
  try {
    // Récupérer tout le panier (pas besoin de populate : seuls les identifiants servent)
    const carts = await Cart.find();

// Panier vide : rien à acheter
if (carts.length === 0) {
  // Code 400 = la demande ne peut pas être traitée
  return res.status(400).json({
    result: false,
    message: 'Your cart is empty',
  });
}

// Transformer chaque élément du panier en réservation { trip: ... }
const bookingsToCreate = carts.map((cart) => ({
  trip: cart.trip,
}));

// Enregistrer toutes les réservations en une seule fois
await Booking.insertMany(bookingsToCreate);
// Puis vider le panier ({} = tous les documents)
// L'ordre compte : si insertMany échoue, on va dans "catch" et le panier est gardé
await Cart.deleteMany({});

// Confirmer l'achat ; le frontend redirige alors vers booking.html
res.json({
  result: true,
  message: 'Purchase successful',
});
  } catch (error) {
    // Afficher l'erreur dans le terminal
    console.error('Purchase error:', error);

// Code 500 = erreur côté serveur
res.status(500).json({
  result: false,
  message: error.message,
});
  }
});

// Exporter le router pour l'utiliser dans app.js
module.exports = router;