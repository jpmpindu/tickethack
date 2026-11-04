// ==========================================================
// CONFIGURATION
// ==========================================================

// Adresse du backend, écrite une seule fois pour tout le fichier
const API_URL = 'http://localhost:3000';

// Liste des villes de la base de données, chargée à l'ouverture de la page
// "let" (et non "const") car on la remplit plus tard
let cities = [];

// ==========================================================
// ÉLÉMENTS DU DOM
// ==========================================================

// Champ "Departure" du formulaire
const departureInput = document.querySelector('#departure');
// Champ "Arrival" du formulaire
const arrivalInput = document.querySelector('#arrival');
// Champ "date" du formulaire
const dateInput = document.querySelector('#date');
// Bouton "Search"
const searchButton = document.querySelector('#search-button');
// Carte de droite, où s'affichent les résultats
const resultsContainer = document.querySelector('#results-container');

// ==========================================================
// FONCTIONS UTILITAIRES
// ==========================================================

// Formater une date en heure "HH:MM"
function formatTime(date) {
  // Transformer la date reçue en objet Date, puis en texte "HH:MM" à la française
  return new Date(date).toLocaleTimeString('fr-FR', {
    // Heures sur 2 chiffres (ex : 09)
    hour: '2-digit',
    // Minutes sur 2 chiffres (ex : 05)
    minute: '2-digit',
  });
}

// Mettre un nom de ville en forme : "PARIS" ou "paris" → "Paris"
function formatCity(city) {
  // trim() enlève les espaces autour, toLowerCase() met tout en minuscules
  return (
    city
      .trim()
      .toLowerCase()
      // Mettre en majuscule la première lettre et chaque lettre après un espace ou un tiret
      // (ex : "saint-étienne" → "Saint-Étienne") ; \p{L} = n'importe quelle lettre, accents compris
      .replace(/(^|[\s-])\p{L}/gu, (letter) => letter.toUpperCase())
  );
}

// Simplifier un texte pour comparer deux noms : "  Saint-ÉTIENNE " → "saint-etienne"
function simplify(text) {
  return (
    text
      // Enlever les espaces autour et tout mettre en minuscules
      .trim()
      .toLowerCase()
      // Séparer chaque lettre de son accent ("é" → "e" + accent)...
      .normalize('NFD')
      // ...puis supprimer les accents
      .replace(/[̀-ͯ]/g, '')
  );
}

// Trouver la ville de la base qui correspond au texte saisi
// "PARIS", "paris" ou "pàris" → "Paris" (le nom exact de la base)
function matchCity(text) {
  // Chercher dans la liste une ville qui, simplifiée, est identique au texte simplifié
  const city = cities.find((name) => simplify(name) === simplify(text));

  // Ville trouvée : renvoyer son nom exact ; sinon, simple mise en forme
  return city || formatCity(text);
}

// Afficher un simple message dans la carte de résultats
function displayMessage(message) {
  // Remplacer tout le contenu de la carte par un paragraphe
  resultsContainer.innerHTML = `<p>${message}</p>`;
}

// ==========================================================
// AFFICHAGE
// ==========================================================

// Afficher le bloc "No trip found"
function displayNotFound() {
  // Remplacer le contenu de la carte par l'image, une ligne et le texte
  resultsContainer.innerHTML = `
    <div class="not-found">
      <img src="../images/notfound.png" alt="No trip found" />
      <hr />
      <p>No trip found.</p>
    </div>
  `;
}

// Créer la carte HTML d'un trajet
function createTripCard(trip) {
  // Créer une nouvelle <div> (pas encore affichée dans la page)
  const tripCard = document.createElement('div');
  // Lui donner la classe "trip-card" pour le style CSS
  tripCard.classList.add('trip-card');

  // Remplir la carte : villes, heure, prix et bouton "Book"
  // data-id garde l'identifiant du trajet pour savoir lequel réserver au clic
  tripCard.innerHTML = `
    <p>${trip.departure} > ${trip.arrival}</p>
    <p>${formatTime(trip.date)}</p>
    <p>${trip.price}€</p>
    <button class="book-button" data-id="${trip._id}">Book</button>
  `;

  // Renvoyer la carte pour qu'elle soit ajoutée dans la page
  return tripCard;
}

// Afficher la liste des trajets trouvés
function displayTrips(trips) {
  // Aucun trajet : afficher "No trip found"
  if (trips.length === 0) {
    displayNotFound();
    // Arrêter la fonction ici
    return;
  }

  // Vider la carte (enlever l'image du train ou les anciens résultats)
  resultsContainer.innerHTML = '';

  // Pour chaque trajet...
  trips.forEach((trip) => {
    // ...créer sa carte et l'ajouter à la fin de la liste
    resultsContainer.appendChild(createTripCard(trip));
  });
}

// ==========================================================
// APPELS À L'API
// ==========================================================

// Rechercher les trajets correspondant au formulaire
// "async" permet d'utiliser "await" pour attendre le serveur
async function searchTrips() {
  // Lire la ville de départ et la corriger comme dans la base (ex : "PARIS" → "Paris")
  const departure = matchCity(departureInput.value);
  // Lire la ville d'arrivée et la corriger comme dans la base
  const arrival = matchCity(arrivalInput.value);

  // Afficher les noms corrigés dans les champs
  departureInput.value = departure;
  arrivalInput.value = arrival;
  // Lire la date (format "AAAA-MM-JJ")
  const date = dateInput.value;

  // Vérifier que tous les champs sont remplis
  if (!departure || !arrival || !date) {
    displayMessage('Please fill in all fields.');
    // Arrêter la fonction : inutile d'appeler le serveur
    return;
  }

  // "try" : si le serveur ne répond pas, on passe dans "catch"
  try {
    // Envoyer la recherche au backend et attendre sa réponse
    const response = await fetch(`${API_URL}/trips/search`, {
      // POST = on envoie des données
      method: 'POST',
      // Prévenir le serveur que les données sont en JSON
      headers: { 'Content-Type': 'application/json' },
      // Transformer l'objet JavaScript en texte JSON
      body: JSON.stringify({ departure, arrival, date }),
    });

    // Lire la réponse JSON du serveur
    const data = await response.json();

    // Si result est vrai et qu'il y a des trajets, les afficher ; sinon liste vide
    displayTrips(data.result && data.trips ? data.trips : []);
  } catch (error) {
    // Afficher l'erreur dans la console du navigateur
    console.error('Search error:', error);
    // Prévenir l'utilisateur
    displayMessage('Unable to search for trips.');
  }
}

// Récupérer la liste des villes de la base de données
async function loadCities() {
  try {
    // Demander la liste au backend
    const response = await fetch(`${API_URL}/trips/cities`);
    // Lire la réponse JSON du serveur
    const data = await response.json();

    // Tout va bien : garder la liste pour matchCity()
    if (data.result) {
      cities = data.cities;
    }
  } catch (error) {
    // Pas de liste : matchCity() utilisera seulement formatCity()
    console.error('Cities error:', error);
  }
}

// Ajouter un trajet au panier puis aller sur la page panier
async function addToCart(tripId) {
  try {
    // Envoyer l'identifiant du trajet au backend
    const response = await fetch(`${API_URL}/carts/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip: tripId }),
    });

    // Lire la réponse JSON du serveur
    const data = await response.json();

    // L'ajout a réussi
    if (data.result) {
      // Aller sur la page du panier
      window.location.href = 'cart.html';
    } else {
      // Le serveur a refusé l'ajout
      alert('Unable to add this trip to your cart.');
    }
  } catch (error) {
    // Le serveur ne répond pas
    console.error('Cart error:', error);
    alert('An error occurred while adding the trip.');
  }
}

// ==========================================================
// ÉVÉNEMENTS
// ==========================================================

// Quand on quitte un champ ville ("blur"), corriger le nom comme dans la base
departureInput.addEventListener('blur', () => {
  departureInput.value = matchCity(departureInput.value);
});
arrivalInput.addEventListener('blur', () => {
  arrivalInput.value = matchCity(arrivalInput.value);
});

// Clic sur "Search" : lancer la recherche
searchButton.addEventListener('click', searchTrips);

// Clic sur un bouton "Book" (délégation : les boutons sont créés dynamiquement)
// On écoute les clics sur la carte entière, puis on regarde ce qui a été cliqué
resultsContainer.addEventListener('click', (event) => {
  // event.target = l'élément exact sur lequel on a cliqué
  if (event.target.classList.contains('book-button')) {
    // dataset.id lit l'attribut data-id du bouton
    addToCart(event.target.dataset.id);
  }
});

// ==========================================================
// DÉMARRAGE
// ==========================================================

// Charger la liste des villes dès l'ouverture de la page
loadCities();
