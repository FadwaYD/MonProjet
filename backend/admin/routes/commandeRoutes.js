const router = require("express").Router();
const ctrl   = require("../controllers/commandeController");

// ⚠️  Routes spécifiques AVANT les routes paramétrées
router.get("/stats/resume",       ctrl.getStats);
router.patch("/lignes/:id",       ctrl.updateLigne);

router.get("/",                   ctrl.getAll);
router.get("/:id",                ctrl.getOne);
router.patch("/:id/statut",       ctrl.updateStatut);
router.delete("/:id",             ctrl.remove);

module.exports = router;
