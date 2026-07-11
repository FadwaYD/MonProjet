const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../../db"); // adapte le chemin selon où se trouve ton fichier db.js
const { verifyToken } = require("../../middlewares/auth"); // adapte le chemin selon où se trouve ton middleware

// GET - Récupérer les infos du profil admin
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nom, prenom, nomLabo, ville, email, telephone, role 
       FROM utilisateurs WHERE id = ? AND role = 'Admin'`,
      [req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Admin introuvable" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PUT - Mettre à jour le profil admin
router.put("/profile", verifyToken, async (req, res) => {
  const { nom, prenom, email, telephone, ville } = req.body;

  if (!nom || !prenom || !email) {
    return res.status(400).json({ success: false, message: "Champs obligatoires manquants" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Email invalide" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM utilisateurs WHERE email = ? AND id != ?",
      [email, req.userId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "Cet email est déjà utilisé" });
    }

    await pool.query(
      `UPDATE utilisateurs 
       SET nom = ?, prenom = ?, email = ?, telephone = ?, ville = ? 
       WHERE id = ? AND role = 'Admin'`,
      [nom, prenom, email, telephone || null, ville || null, req.userId]
    );

    res.json({ success: true, message: "Profil mis à jour avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PUT - Changer le mot de passe
router.put("/change-password", verifyToken, async (req, res) => {
  const { ancien_mdp, nouveau_mdp, confirmer_mdp } = req.body;

  if (!ancien_mdp || !nouveau_mdp || !confirmer_mdp) {
    return res.status(400).json({ success: false, message: "Tous les champs sont obligatoires" });
  }

  if (nouveau_mdp !== confirmer_mdp) {
    return res.status(400).json({ success: false, message: "Les mots de passe ne correspondent pas" });
  }

  if (nouveau_mdp.length < 6) {
    return res.status(400).json({ success: false, message: "Le mot de passe doit contenir au moins 6 caractères" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT mot_de_passe FROM utilisateurs WHERE id = ?",
      [req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    }

    const isMatch = await bcrypt.compare(ancien_mdp, rows[0].mot_de_passe);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Ancien mot de passe incorrect" });
    }

    const hashedPassword = await bcrypt.hash(nouveau_mdp, 10);
    await pool.query(
      "UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?",
      [hashedPassword, req.userId]
    );

    res.json({ success: true, message: "Mot de passe changé avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;