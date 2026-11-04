const express = require('express');
const router = express.Router();
const Trip = require('../models/trips');
const Cart = require('../models/carts');

// Rechercher un trajet
router.post('/trips/search', async (req, res) => {
  const { departure, arrival, date } = req.body;
  console.log('Départ :', departure);
  console.log('Arrivée :', arrival);
  console.log('Date :', date);
  try {
    // Récupérer tous les trajets
    const trips = await Trip.find();

    // Mettre les villes recherchées en minuscules
    const searchDeparture = departure.toLowerCase();
    const searchArrival = arrival.toLowerCase();

    const matchingTrips = [];
    //range tous les trajets qui correspondent à la recherche
    const searchDate = new Date(date);
    //transforme la date reçue en objet Date

    // Vérifier chaque trajet
    for (const trip of trips) {
      //parcours chaque élément d'un tableau
      const tripDeparture = trip.departure.toLowerCase();
      const tripArrival = trip.arrival.toLowerCase();
      const tripDate = new Date(trip.date);

      if (
        tripDeparture === searchDeparture &&
        //si ville de depart et ville recherchee sont pareille
        tripArrival === searchArrival &&
        //vois si la ville correspond
        tripDate.getDate() === searchDate.getDate() &&
        //.getDate() récupère le jour du mois.
        tripDate.getMonth() === searchDate.getMonth() &&
        //.getMonth() récupère le mois en nombre
        tripDate.getFullYear() === searchDate.getFullYear()
        //getFullYear() récupère l'année complète
      ) {
        matchingTrips.push(trip);
        //matchingTrips : notre panier
      }
    }

    // Si aucun trajet n'est trouvé
    if (matchingTrips.length === 0) {
      //.length : nombre d'éléments dans un tableau.
      //=== 0 : signifie aucun élément.
      return res.json({
        result: false,
        error: 'No trip found'
      });
    }

    // Si des trajets sont trouvés
    res.json({
      result: true,
      trips: matchingTrips
      //matchingTrips : trajets correspondants
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      result: false,
      error: 'Server error'
    });
  }
});

// Supprimer un panier
router.delete("/carts/:id", async (req, res) => {

  const { id } = req.params;

  const cartToDelete = await Cart.findByIdAndDelete(id);

  if (!cartToDelete) {
    return res.json({
      result: false,
      error: "Cart not found"
    });
  }

  res.json({
    result: true,
    message: "Cart deleted"
  });
});




module.exports = router;