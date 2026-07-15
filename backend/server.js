require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");
const multer  = require("multer");

const app = express();

// =======================
// Middlewares
// =======================
app.use(cors());
app.use(express.json());

// ─── Fichiers statiques (uploads images) ─────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const utilisateursRoutes = require("./routes/utilisateurs");
app.use("/api/utilisateurs", utilisateursRoutes);

// ─── Routes Auth ──────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
const adminSettingsRoutes = require("./routes/admin/adminSettingsRoutes");
app.use("/api/admin", adminSettingsRoutes);
// ─── Routes Admin ─────────────────────────────────────────────────────────────
const reportRoutes = require("./routes/admin/reportRoutes");
const notificationRoutes = require("./routes/admin/notificationRoutes");
const contactRoutes = require("./routes/admin/contactRoutes");
const dashboardRoutes = require("./routes/admin/dashboardRoutes");
const profileRoutes = require("./routes/admin/profileRoutes");

app.use("/api/admin", reportRoutes);
app.use("/api/admin", notificationRoutes);
app.use("/api/admin", dashboardRoutes);
app.use("/api/admin", contactRoutes);
app.use("/api/admin", profileRoutes);

app.use("/api/clients",   require("./routes/admin/clientRoutes"));
app.use("/api/produits",  require("./routes/admin/produitRoutes"));
app.use("/api/commandes", require("./routes/admin/commandeRoutes"));

// ─── Routes Client ────────────────────────────────────────────────────────────
app.use("/api/produits",  require("./routes/client/produitRoutes"));
app.use("/api/contacts",  require("./routes/client/contactRoutes"));


const commandeRoutes = require("./routes/client/commandeRoutes");
app.use("/api/commande", commandeRoutes);   // <-- sans "s"

// ─── Route principale ─────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Serveur Node.js fonctionne");
});

// ─── Gestion erreurs Multer ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes("images")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route non trouvée: ${req.method} ${req.originalUrl}` });
});
// ─── Démarrage ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅  API démarrée sur http://localhost:${PORT}`));