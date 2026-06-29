const router       = require("express").Router();
const ctrl         = require("../controllers/produitController");
const { upload }   = require("../middlewares/upload");

// ⚠️  /stats AVANT /:id pour éviter le conflit de paramètre
router.get("/stats",       ctrl.getStats);
router.get("/",            ctrl.getAll);
router.get("/:id",         ctrl.getOne);
router.post("/",           upload.single("image"), ctrl.create);
router.put("/:id",         upload.single("image"), ctrl.update);
router.delete("/:id",      ctrl.remove);

module.exports = router;
