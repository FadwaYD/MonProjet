const router = require("express").Router();
const ctrl   = require("../../controllers/admin/clientController");

router.get("/",                ctrl.getAll);
router.get("/:id",             ctrl.getOne);
router.patch("/:id/accepter",  ctrl.accepter);
router.post("/",               ctrl.create);
router.put("/:id",             ctrl.update);
router.delete("/:id",          ctrl.remove);

module.exports = router;
