// ==========================================================
// CONFIGURATION
// ==========================================================

// Adresse du backend, écrite une seule fois pour tout le fichier
const API_URL = 'http://localhost:3000';

// Une heure en millisecondes : 60 min × 60 s × 1000 ms
const ONE_HOUR = 60 * 60 * 1000;
// Un jour en millisecondes : 24 heures
const ONE_DAY = 24 * ONE_HOUR;

// ==========================================================
// ÉLÉMENTS DU DOM
// ==========================================================

// Titre "My bookings"
const bookingTitle = document.querySelector('#booking-title');
// Zone où s'affichent les réservations
const bookingItems = document.querySelector('#booking-items');
// Pied de page "Enjoy your travels with Tickethack!"
const bookingFooter = document.querySelector('#booking-footer');

// ==========================================================
// FONCTIONS UTILITAIRES
// ==========================================================

// Formater une date en heure "HH:MM"
function formatTime(date) {
  // Transformer la date en texte "HH:MM" à la française
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Construire le message "Departure in ..." selon le temps restant
function getDepartureMessage(date) {
  // Date du départ moins maintenant = temps restant en millisecondes
  const remainingTime = new Date(date) - new Date();

  // Le départ est déjà passé
  if (remainingTime <= 0) {
    return 'Departure time passed';
  }

  // Moins d'un jour : afficher en heures (Math.floor arrondit vers le bas)
  if (remainingTime < ONE_DAY) {
    return `Departure in ${Math.floor(remainingTime / ONE_HOUR)} hours`;
  }

  // Un jour ou plus : afficher en jours
  return `Departure in ${Math.floor(remainingTime / ONE_DAY)} days`;
}

// Afficher ou cacher le titre et le pied de page
function toggleHeaderFooter(visible) {
  // Ternaire : si visible est vrai → 'block' (affiché), sinon → 'none' (caché)
  const display = visible ? 'block' : 'none';
  // Appliquer au titre
  bookingTitle.style.display = display;
  // Appliquer au pied de page
  bookingFooter.style.display = display;
}

// ==========================================================
// AFFICHAGE
// ==========================================================

// Afficher le message d'erreur de chargement
function displayError() {
  bookingItems.innerHTML = '<p>Unable to load bookings.</p>';
}

// Afficher le message "aucune réservation"
function displayNoBooking() {
  // Cacher le titre et le pied de page
  toggleHeaderFooter(false);

  // Afficher les deux lignes de message
  bookingItems.innerHTML = `
    <p style="color: #333333;">No booking yet.</p>
    <p style="color: #333333;">Why not plan a trip?</p>
  `;
}

// Créer la ligne HTML d'une réservation
function createBookingItem(booking) {
  // Le trajet complet (grâce au populate du backend)
  const trip = booking.trip;

  // Renvoyer la ligne : villes, heure, prix et temps restant
  return `
    <div class="booking-item">
      <p>${trip.departure} > ${trip.arrival}</p>
      <p>${formatTime(trip.date)}</p>
      <p>${trip.price}€</p>
      <p>${getDepartureMessage(trip.date)}</p>
    </div>
  `;
}

// Afficher la liste des réservations
function displayBookings(bookings) {
  // Aucune réservation
  if (bookings.length === 0) {
    displayNoBooking();
    // Arrêter la fonction ici
    return;
  }

  // Afficher le titre et le pied de page
  toggleHeaderFooter(true);

  // Ignorer les réservations dont le trajet a été supprimé (trip = null),
  // créer une ligne HTML par réservation, puis les coller ensemble
  bookingItems.innerHTML = bookings
    .filter((booking) => booking.trip)
    .map(createBookingItem)
    .join('');
}

// ==========================================================
// APPELS À L'API
// ==========================================================

// Récupérer les réservations
async function loadBookings() {
  // "try" : si le serveur ne répond pas, on passe dans "catch"
  try {
    // Demander les réservations au backend
    const response = await fetch(`${API_URL}/bookings`, {
      // GET = on lit des données
      method: 'GET',
      // Ne pas utiliser le cache : toujours avoir les réservations à jour
      cache: 'no-store',
    });

    // Lire la réponse JSON du serveur
    const data = await response.json();

    // Le serveur indique un problème
    if (!data.result) {
      displayError();
      return;
    }

    // Tout va bien : afficher les réservations
    displayBookings(data.bookings);
  } catch (error) {
    // Afficher l'erreur dans la console du navigateur
    console.error('Bookings error:', error);
    displayError();
  }
}

// ==========================================================
// DÉMARRAGE
// ==========================================================

// Charger les réservations dès l'ouverture de la page
loadBookings();
