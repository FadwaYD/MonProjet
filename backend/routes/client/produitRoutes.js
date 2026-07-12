const express = require("express");
const router = express.Router();

const produitController = require("../../controllers/client/produitController");router.get("/", produitController.getProduits);
router.get("/statistiques/home", produitController.getStatistiques);
router.get("/:id", produitController.getProduitById);

module.exports = router;