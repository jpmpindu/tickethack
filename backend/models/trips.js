// Importer Mongoose pour décrire la forme des données
const mongoose = require('mongoose');

// Le schéma décrit les champs d'un trajet et leur type
const tripSchema = mongoose.Schema({
  // Ville de départ (texte), par exemple "Paris"
  departure: String,
  // Ville d'arrivée (texte), par exemple "Lyon"
  arrival: String,
  // Date et heure de départ
  date: Date,
  // Prix du billet en euros (nombre)
  price: Number,
});

// Créer le modèle "Trip", relié à la collection "trips" de MongoDB
// C'est lui qu'on utilise dans les routes : Trip.find(), etc.
const Trip = mongoose.model('trips', tripSchema);

// Exporter le modèle pour l'utiliser dans routes/trips.js
module.exports = Trip;
