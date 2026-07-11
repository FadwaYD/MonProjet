require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const multer  = require("multer");
const reportRoutes = require("./routes/admin/reportRoutes");


const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/admin", reportRoutes);
// ─── Fichiers statiques (uploads images) ─────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const notificationRoutes = require("./routes/admin/notificationRoutes");

app.use("/api/admin", notificationRoutes);
// ─── Routes Admin ─────────────────────────────────────────────────────────────
app.use("/api/clients",   require("./routes/admin/clientRoutes"));
app.use("/api/produits",  require("./routes/admin/produitRoutes"));
app.use("/api/commandes", require("./routes/admin/commandeRoutes"));
const contactRoutes = require("./routes/admin/contactRoutes");

const dashboardRoutes = require("./routes/admin/dashboardRoutes");

app.use("/api/admin", dashboardRoutes);

app.use("/api/admin", contactRoutes);

// ─── Route Profil Admin (Paramètres du compte) ───────────────────────────────
const profileRoutes = require("./routes/admin/profileRoutes");
app.use("/api/admin", profileRoutes);

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