const express = require("express");
const router = express.Router();
const { getLatestClientRequests } = require("../../controllers/admin/notificationController");
// const verifyAdmin = require("../../middlewares/verifyAdmin"); // décommentez si vous avez un middleware d'auth admin

router.get("/notifications/latest-clients", /* verifyAdmin, */ getLatestClientRequests);

module.exports = router;