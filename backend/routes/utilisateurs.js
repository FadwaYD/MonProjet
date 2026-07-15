const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

function verifierToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Aucun token fourni. Veuillez vous reconnecter." });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Session expirée ou invalide. Veuillez vous reconnecter." });
    req.userId = decoded.id;
    next();
  });
}

// ⚠️ IMPORTANT : "/moi" doit toujours être déclaré AVANT toute route "/:id"
router.get("/moi", verifierToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, ice, nom, prenom, nomLabo, ville, email, telephone, role, statut, created_at
       FROM utilisateurs WHERE id = ?`,
      [req.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Erreur GET /moi :", err);
    res.status(500).json({ message: "Erreur serveur lors du chargement du profil." });
  }
});

router.put("/moi", verifierToken, async (req, res) => {
  const { ice, nom, prenom, nomLabo, ville, email, telephone, mot_de_passe } = req.body;

  try {
    if (email) {
      const [existant] = await db.query(
        "SELECT id FROM utilisateurs WHERE email = ? AND id != ?",
        [email, req.userId]
      );
      if (existant.length > 0) {
        return res.status(400).json({ message: "Cet email est déjà utilisé par un autre compte." });
      }
    }

    let champs = [];
    let valeurs = [];
    const ajouter = (col, val) => {
      champs.push(`${col} = ?`);
      valeurs.push(val);
    };

    if (ice !== undefined) ajouter("ice", ice);
    if (nom !== undefined) ajouter("nom", nom);
    if (prenom !== undefined) ajouter("prenom", prenom);
    if (nomLabo !== undefined) ajouter("nomLabo", nomLabo);
    if (ville !== undefined) ajouter("ville", ville);
    if (email !== undefined) ajouter("email", email);
    if (telephone !== undefined) ajouter("telephone", telephone);

    if (mot_de_passe) {
      const hash = await bcrypt.hash(mot_de_passe, 10);
      ajouter("mot_de_passe", hash);
    }

    if (champs.length === 0) {
      return res.status(400).json({ message: "Aucune donnée à modifier." });
    }

    valeurs.push(req.userId);
    await db.query(`UPDATE utilisateurs SET ${champs.join(", ")} WHERE id = ?`, valeurs);

    const [rows] = await db.query(
      `SELECT id, ice, nom, prenom, nomLabo, ville, email, telephone, role, statut, created_at
       FROM utilisateurs WHERE id = ?`,
      [req.userId]
    );

    res.json({ message: "Informations mises à jour avec succès.", utilisateur: rows[0] });
  } catch (err) {
    console.error("Erreur PUT /moi :", err);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
  }
});

// Les routes avec ":id" (réservées à l'Admin, par exemple) doivent venir APRÈS "/moi"
// router.get("/:id", ...);

module.exports = router;