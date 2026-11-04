// Importer Express
const express = require('express');
// Créer un router, branché dans app.js sur "/carts"
const router = express.Router();

// Importer le modèle Cart pour lire et modifier la collection "carts"
const Cart = require('../models/carts');

// GET /carts : récupérer tout le panier
router.get('/', async (req, res) => {
  // "try" : en cas d'erreur de la base, on passe dans "catch"
  try {
    // find() récupère tous les éléments du panier
    // populate('trip') remplace l'identifiant du trajet par le trajet complet
    const carts = await Cart.find().populate('trip');

    // Envoyer le panier au frontend
    res.json({
      result: true,
      carts: carts,
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

// POST /carts/add : ajouter un trajet au panier
router.post('/add', async (req, res) => {
  // Récupérer l'identifiant du trajet envoyé par le frontend
  const { trip } = req.body;

  // Si l'identifiant manque, répondre tout de suite avec une erreur
  if (!trip) {
    // Code 400 = la demande est incomplète ; "return" arrête la fonction ici
    return res.status(400).json({
      result: false,
      message: 'Trip ID missing',
    });
  }

  try {
    // Créer un nouvel élément de panier ({ trip } = raccourci pour { trip: trip })
    const newCart = new Cart({ trip });
    // Enregistrer l'élément dans MongoDB
    const savedCart = await newCart.save();

    // Renvoyer l'élément enregistré (avec son nouvel _id)
    res.json({
      result: true,
      cart: savedCart,
    });
  } catch (error) {
    // Code 500 = erreur côté serveur (identifiant invalide, base indisponible...)
    res.status(500).json({
      result: false,
      message: error.message,
    });
  }
});

// DELETE /carts/:id : supprimer un élément du panier
// ":id" est une partie variable de l'URL, par exemple /carts/6ae9...
router.delete('/:id', async (req, res) => {
  // Récupérer l'identifiant depuis l'URL
  const { id } = req.params;

  try {
    // Chercher l'élément par son identifiant et le supprimer en une seule opération
    // Renvoie l'élément supprimé, ou null s'il n'existait pas
    const deletedCart = await Cart.findByIdAndDelete(id);

    // L'élément n'existait pas
    if (!deletedCart) {
      // Code 404 = introuvable
      return res.status(404).json({
        result: false,
        message: 'Cart not found',
      });
    }

    // Confirmer la suppression
    res.json({
      result: true,
      message: 'Trip deleted successfully',
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
