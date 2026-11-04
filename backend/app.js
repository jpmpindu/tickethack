// ==========================================================
// app.js : configuration de l'application Express
// (le serveur est démarré dans bin/www)
// ==========================================================

// ----- Importer les bibliothèques -----

// Express : le framework qui gère les routes et les requêtes HTTP
var express = require('express');
// path : module de Node.js pour construire des chemins de fichiers
var path = require('path');
// cookie-parser : lit les cookies envoyés par le navigateur (dans req.cookies)
var cookieParser = require('cookie-parser');
// morgan : affiche chaque requête reçue dans le terminal (ex : "GET /carts 200")
var logger = require('morgan');
// dotenv : charge les variables du fichier .env (MONGODB_URI, PORT) dans process.env
require('dotenv').config();
// cors : autorise le frontend (autre adresse, ex : port 5500) à appeler l'API
var cors = require('cors');

// ----- Importer les routes (un fichier par groupe de routes) -----

// Route d'accueil "/"
var indexRouter = require('./routes/index');
// Recherche de trajets
var tripsRouter = require('./routes/trips');
// Panier
var cartRouter = require('./routes/carts');
// Réservations
var bookingRouter = require('./routes/bookings');
// Route d'exemple (pas utilisée)
var usersRouter = require('./routes/users');

// ----- Créer l'application -----

// Créer l'application Express
var app = express();

// ----- Middlewares : exécutés pour chaque requête, dans cet ordre -----

// Autoriser les requêtes venant d'autres adresses (le frontend)
app.use(cors());
// Afficher chaque requête dans le terminal, en mode "dev" (coloré et court)
app.use(logger('dev'));
// Lire le JSON envoyé par le frontend et le ranger dans req.body
app.use(express.json());
// Lire aussi les données de formulaires HTML classiques (dans req.body)
app.use(express.urlencoded({ extended: false }));
// Lire les cookies
app.use(cookieParser());

// ----- Brancher les routes -----

// La route d'accueil passe avant les fichiers statiques,
// sinon public/index.html répond à sa place sur "GET /"
app.use('/', indexRouter);
// Servir les fichiers du dossier "public" (HTML, CSS, images...)
// __dirname = le dossier de ce fichier (backend)
app.use(express.static(path.join(__dirname, 'public')));

// Toutes les routes de trips.js commencent par /trips (ex : /trips/search)
app.use('/trips', tripsRouter);
// Toutes les routes de carts.js commencent par /carts (ex : /carts/add)
app.use('/carts', cartRouter);
// Toutes les routes de bookings.js commencent par /bookings (ex : /bookings/purchase)
app.use('/bookings', bookingRouter);
// Toutes les routes de users.js commencent par /users
app.use('/users', usersRouter);

// Exporter l'application pour que bin/www puisse la démarrer
module.exports = app;
