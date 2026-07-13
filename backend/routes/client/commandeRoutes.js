const express = require("express");
const router = express.Router();
const commandeController = require("../../Controllers/client/commandeController");
const { verifyToken } = require("../../middlewares/auth");
router.post("/", verifyToken, commandeController.creerCommande);
router.get("/mes-commandes", verifyToken, commandeController.getMesCommandes);
router.get("/:id", verifyToken, commandeController.getDetailCommande);

module.exports = router;