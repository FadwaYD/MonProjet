const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const app = express();

// =======================
// Middlewares
// =======================
app.use(cors());
app.use(express.json());

// =======================
// Fichiers statiques
// =======================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================
// Routes Auth
// =======================
app.use("/api/auth", require("./routes/authRoutes"));

// =======================
// Routes Utilisateurs
// =======================
const utilisateurRoutes = require("./routes/utilisateurRoutes");
app.use("/api", utilisateurRoutes);

// =======================
// Routes Admin
// =======================
app.use("/api/clients", require("./admin/routes/clientRoutes"));
app.use("/api/produits", require("./admin/routes/produitRoutes"));
app.use("/api/commandes", require("./admin/routes/commandeRoutes"));

// =======================
// Routes Client
// =======================
app.use("/api/produits", require("./routes/client/produitRoutes"));
app.use("/api/contacts", require("./routes/client/contactRoutes"));

// =======================
// Route principale
// =======================
app.get("/", (req, res) => {
  res.send("Serveur Node.js fonctionne");
});

// =======================
// Gestion des erreurs Multer
// =======================
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes("images")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
});

// =======================
// Démarrage du serveur
// =======================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ API démarrée sur http://localhost:${PORT}`);
});