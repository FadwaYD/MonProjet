const express = require("express");
const router = express.Router();
const {
  getAllContacts,
  getLatestContacts,
  replyToContact,
  archiveContact,
  restoreContact,
  deleteContact,
} = require("../../controllers/admin/contactController");

router.get("/contacts", getAllContacts);
router.get("/contacts/latest", getLatestContacts);
router.post("/contacts/:id/reply", replyToContact);
router.patch("/contacts/:id/archive", archiveContact);
router.patch("/contacts/:id/restore", restoreContact);
router.delete("/contacts/:id", deleteContact);

module.exports = router;