const express = require('express');

const router = express.Router();

const utilisateurController =
require('../controllers/utilisateurController');

router.get(
'/utilisateurs',
utilisateurController.liste
);

module.exports = router;