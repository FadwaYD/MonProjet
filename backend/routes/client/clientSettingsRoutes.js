const express = require("express");
const router = express.Router();

const { verifyToken } = require("../../middlewares/authMiddleware");
const clientSettingsController = require("../../controllers/client/clientSettingsController");

// Ces routes exigent seulement d'être connecté (le client modifie SES PROPRES infos,
// req.user.id est extrait du token, donc pas besoin de verifyAdmin ici)
router.get("/profile", verifyToken, clientSettingsController.getProfile);
router.put("/profile", verifyToken, clientSettingsController.updateProfile);
router.put("/change-password", verifyToken, clientSettingsController.changePassword);

module.exports = router;