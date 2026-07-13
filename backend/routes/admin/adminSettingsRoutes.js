const express = require("express");
const router = express.Router();

const { verifyToken, verifyAdmin } = require("../../middlewares/authMiddleware");
const adminSettingsController = require("../../controllers/admin/adminSettingsController");

// Toutes ces routes exigent d'être connecté ET d'avoir le rôle Admin
router.get("/profile", verifyToken, verifyAdmin, adminSettingsController.getProfile);
router.put("/profile", verifyToken, verifyAdmin, adminSettingsController.updateProfile);
router.put("/change-password", verifyToken, verifyAdmin, adminSettingsController.changePassword);

module.exports = router;