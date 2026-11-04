// Importer Mongoose pour décrire la forme des données
const mongoose = require('mongoose');

// Le schéma décrit une réservation
const bookingSchema = new mongoose.Schema({
// Le trajet réservé
trip: {
// On stocke seulement l'identifiant (_id) du trajet
type: mongoose.Schema.Types.ObjectId,
// Cet identifiant pointe vers la collection "trips" (pour .populate('trip'))
ref: 'trips',
// Le champ est obligatoire
required: true,
},
// La date à laquelle la réservation a été faite
bookingDate: {
// Le champ est une date
type: Date,
// Valeur par défaut : la date et l'heure du moment où la réservation est créée
default: Date.now,
},
});

// Créer le modèle "Booking", relié à la collection "bookings" de MongoDB
const Booking = mongoose.model('bookings', bookingSchema);

// Exporter le modèle pour l'utiliser dans routes/bookings.js
module.exports = Booking;