const express = require("express");
const router = express.Router();

const contactController = require("../../controllers/client/contactController");router.post("/", contactController.envoyerMessage);
router.get("/", contactController.getMessages);

module.exports = router;