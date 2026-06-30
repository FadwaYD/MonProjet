const router = require("express").Router();
const commandesController   = require("../../controllers/admin/commandeController");


router.get("/", commandesController.getAll);
router.get("/stats/resume", commandesController.getStats);
router.get("/:id", commandesController.getOne);
router.patch("/lignes/:id", commandesController.updateLigne);
router.patch("/:id/statut", commandesController.updateStatut);
router.delete("/:id", commandesController.remove);
router.patch("/:id/confirmer", commandesController.confirmerEtEnvoyer);
module.exports = router;
