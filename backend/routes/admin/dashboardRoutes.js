const express = require("express");
const router = express.Router();

const { getStats, getMonthlyOrders, getRecentActivity } = require("../../controllers/admin/dashboardController");

router.get("/dashboard/stats", getStats);
router.get("/dashboard/monthly-orders", getMonthlyOrders);
router.get("/dashboard/activity", getRecentActivity);

module.exports = router;