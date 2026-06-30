const express = require("express");
const cors    = require("cors");
const path    = require("path");
const multer  = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Fichiers statiques (uploads images) ─────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes (admin + client confondus) ───────────────────────────────────────
app.use("/api/clients",   require("./routes/clientRoutes"));
app.use("/api/produits",  require("./routes/produitRoutes"));
app.use("/api/commandes", require("./routes/commandeRoutes"));

// ─── Gestion erreurs Multer ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes("images")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

// ─── Démarrage ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅  API démarrée sur http://localhost:${PORT}`));
