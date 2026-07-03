const express = require("express");
const router = express.Router();
const {
  getStats,
  getWeeklySales,
  getRecentActivity,
} = require("../../controllers/admin/dashboardController");

router.get("/dashboard/stats", getStats);
router.get("/dashboard/weekly-sales", getWeeklySales);
router.get("/dashboard/activity", getRecentActivity);

module.exports = router;