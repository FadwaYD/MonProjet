const express = require("express");
const router = express.Router();

const { getStats, getWeeklyDevis, getRecentActivity } = require("../../controllers/admin/dashboardController");

router.get("/dashboard/stats", getStats);
router.get("/dashboard/weekly-devis", getWeeklyDevis);
router.get("/dashboard/activity", getRecentActivity);

module.exports = router;