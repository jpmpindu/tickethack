// ==========================================================
// CONFIGURATION
// ==========================================================

// Adresse du backend, écrite une seule fois pour tout le fichier
const API_URL = 'http://localhost:3000';

// ==========================================================
// ÉLÉMENTS DU DOM
// ==========================================================

// Titre "My cart"
const cartTitle = document.querySelector('#cart-title');
// Zone où s'affichent les trajets du panier
const cartItems = document.querySelector('#cart-items');
// Pied de page bleu (total + bouton Purchase)
const cartFooter = document.querySelector('#cart-footer');
// Le nombre du total
const cartTotal = document.querySelector('#cart-total');
// Bouton "Purchase"
const purchaseButton = document.querySelector('#purchase');

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

// Afficher un message à la place du panier (titre et pied de page cachés)
function displayMessage(html) {
  // Cacher le titre "My cart"
  cartTitle.style.display = 'none';
  // Cacher le total et le bouton Purchase
  cartFooter.style.display = 'none';
  // Afficher le message
  cartItems.innerHTML = html;
}

// ==========================================================
// AFFICHAGE
// ==========================================================

// Afficher le message d'erreur de chargement
function displayError() {
  displayMessage('<p class="empty-cart">Unable to load your cart.</p>');
}

// Afficher le message "panier vide"
function displayEmptyCart() {
  displayMessage(`
    <div class="empty-cart">
      <p>No tickets in your cart.</p>
      <p>Why not plan a trip?</p>
    </div>
  `);
}

// Créer la ligne HTML d'un trajet du panier
function createCartItem(cart) {
  // Le trajet complet (grâce au populate du backend)
  const trip = cart.trip;

  // Renvoyer la ligne : villes, heure, prix et bouton "X"
  // data-id garde l'identifiant de l'élément du panier (pas celui du trajet)
  return `
    <div class="cart-item">
      <p>${trip.departure} → ${trip.arrival}</p>
      <p>${formatTime(trip.date)}</p>
      <p>${trip.price} €</p>
      <button class="delete-cart" data-id="${cart._id}">X</button>
    </div>
  `;
}

// Afficher les trajets du panier et le total
function displayCart(carts) {
  // Ignorer les trajets supprimés de la base (trip = null)
  const validCarts = carts.filter((cart) => cart.trip);

  // Rien à afficher : panier vide
  if (validCarts.length === 0) {
    displayEmptyCart();
    // Arrêter la fonction ici
    return;
  }

  // Additionner les prix : on part de 0 et on ajoute le prix de chaque trajet
  const total = validCarts.reduce((sum, cart) => sum + cart.trip.price, 0);

  // Créer une ligne HTML par trajet, puis les coller ensemble
  cartItems.innerHTML = validCarts.map(createCartItem).join('');
  // Afficher le total avec 2 décimales (ex : 145.00)
  cartTotal.textContent = total.toFixed(2);

  // Réafficher le titre
  cartTitle.style.display = 'block';
  // Réafficher le pied de page (en flex pour aligner total et bouton)
  cartFooter.style.display = 'flex';
}

// ==========================================================
// APPELS À L'API
// ==========================================================

// Récupérer les trajets du panier
async function loadCart() {
  // "try" : si le serveur ne répond pas, on passe dans "catch"
  try {
    // Demander le panier au backend
    const response = await fetch(`${API_URL}/carts`, {
      // GET = on lit des données
      method: 'GET',
      // Ne pas utiliser le cache : toujours avoir le panier à jour
      cache: 'no-store',
    });

    // Le serveur a répondu avec une erreur HTTP (ex : 500)
    if (!response.ok) {
      // Lancer une erreur : on saute directement dans "catch"
      throw new Error(`HTTP error: ${response.status}`);
    }

    // Lire la réponse JSON du serveur
    const data = await response.json();

    // Le serveur indique un problème
    if (!data.result) {
      displayError();
      return;
    }

    // Tout va bien : afficher le panier
    displayCart(data.carts);
  } catch (error) {
    // Afficher l'erreur dans la console du navigateur
    console.error('Cart error:', error);
    displayError();
  }
}

// Supprimer un trajet du panier puis recharger l'affichage
async function deleteFromCart(cartId) {
  try {
    // Demander au backend de supprimer cet élément (l'id est dans l'URL)
    const response = await fetch(`${API_URL}/carts/${cartId}`, {
      // DELETE = on supprime
      method: 'DELETE',
    });

    // Lire la réponse JSON du serveur
    const data = await response.json();

    // La suppression a réussi
    if (data.result) {
      // Recharger le panier (liste et total)
      loadCart();
    } else {
      alert('Unable to delete this trip.');
    }
  } catch (error) {
    // Le serveur ne répond pas
    console.error('Delete error:', error);
  }
}

// Acheter tous les trajets du panier puis aller sur la page réservations
async function purchaseCart() {
  try {
    // Demander au backend de transformer le panier en réservations
    const response = await fetch(`${API_URL}/bookings/purchase`, {
      method: 'POST',
    });

    // Lire la réponse JSON du serveur
    const data = await response.json();

    // L'achat a réussi
    if (data.result) {
      // Aller sur la page des réservations
      window.location.href = 'booking.html';
    } else {
      // Afficher le message du serveur (ex : "Your cart is empty")
      alert(data.message || 'Unable to complete your purchase.');
    }
  } catch (error) {
    // Le serveur ne répond pas
    console.error('Purchase error:', error);
    alert('An error occurred during your purchase.');
  }
}

// ==========================================================
// ÉVÉNEMENTS
// ==========================================================

// Clic sur un bouton "X" (délégation : les boutons sont créés dynamiquement)
cartItems.addEventListener('click', (event) => {
  // event.target = l'élément exact sur lequel on a cliqué
  if (event.target.classList.contains('delete-cart')) {
    // dataset.id lit l'attribut data-id du bouton
    deleteFromCart(event.target.dataset.id);
  }
});

// Clic sur "Purchase" : acheter le panier
purchaseButton.addEventListener('click', purchaseCart);

// ==========================================================
// DÉMARRAGE
// ==========================================================

// Charger le panier dès l'ouverture de la page
loadCart();
