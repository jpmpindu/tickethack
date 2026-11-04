// Importer Express
const express = require('express');
// Créer un router, branché dans app.js sur "/trips"
const router = express.Router();

// Importer le modèle Trip pour lire la collection "trips"
const Trip = require('../models/trips');

// Échapper les caractères spéciaux d'une regex (ex : "." ou "(")
function escapeRegex(text) {
  // Ajouter un "\" devant chaque caractère spécial, pour qu'il soit lu comme du texte
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Regex qui correspond exactement à une ville, sans tenir compte des majuscules
function cityRegex(city) {
  // ^ = début du texte, $ = fin du texte, "i" = ignorer les majuscules
  // trim() enlève les espaces en trop autour du nom
  return new RegExp(`^${escapeRegex(city.trim())}$`, 'i');
}

// GET /trips/cities : liste des villes, écrites exactement comme dans la base
router.get('/cities', async (req, res) => {
  // "try" : en cas d'erreur de la base, on passe dans "catch"
  try {
    // distinct() renvoie chaque valeur une seule fois (ex : ['Lyon', 'Paris'])
    const departures = await Trip.distinct('departure');
    const arrivals = await Trip.distinct('arrival');

    // Réunir les deux listes ; un Set supprime les doublons
    const cities = [...new Set([...departures, ...arrivals])];

    // Trier par ordre alphabétique
    cities.sort();

    // Envoyer la liste au frontend
    res.json({
      result: true,
      // Raccourci pour "cities: cities"
      cities,
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

// POST /trips/search : rechercher un trajet
router.post('/search', async (req, res) => {
  // Récupérer les 3 valeurs envoyées par le frontend (déstructuration)
  const { departure, arrival, date } = req.body;

  // Vérifier que tous les champs sont présents
  if (!departure || !arrival || !date) {
    // Code 400 = la demande est incomplète ; "return" arrête la fonction ici
    return res.status(400).json({
      result: false,
      message: 'Departure, arrival and date are required',
    });
  }

  // Début et fin de la journée recherchée, en heure locale
  // (sans le "T00:00:00", "2026-11-05" serait lu comme minuit UTC)
  const startOfDay = new Date(`${date}T00:00:00`);

  // isNaN = "is Not a Number" : vrai si la date est invalide (ex : "abc")
  if (isNaN(startOfDay)) {
    return res.status(400).json({
      result: false,
      message: 'Invalid date',
    });
  }

  // Copier la date de début...
  const endOfDay = new Date(startOfDay);
  // ...et ajouter 1 jour : on obtient minuit le lendemain
  endOfDay.setDate(endOfDay.getDate() + 1);

  // "try" : en cas d'erreur de la base, on passe dans "catch"
  try {
    // MongoDB ne renvoie que les trajets qui correspondent
    const trips = await Trip.find({
      // Même ville de départ (majuscules ignorées)
      departure: cityRegex(departure),
      // Même ville d'arrivée (majuscules ignorées)
      arrival: cityRegex(arrival),
      // $gte = "plus grand ou égal à", $lt = "plus petit que" : la date est dans la journée
      date: { $gte: startOfDay, $lt: endOfDay },
      // Trier par date croissante (1 = du plus tôt au plus tard)
    }).sort({ date: 1 });

    // Aucun trajet trouvé
    if (trips.length === 0) {
      return res.json({
        result: false,
        message: 'No trip found',
      });
    }

    // Envoyer la liste des trajets trouvés
    res.json({
      result: true,
      // Raccourci pour "trips: trips"
      trips,
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

// Exporter le router pour l'utiliser dans app.js
module.exports = router;
