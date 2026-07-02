const pool = require("../../db");
// GET /api/admin/notifications/latest-clients
// Retourne les 3 dernières demandes de validation client (statut = 1 = en attente)
exports.getLatestClientRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, ice, nom, prenom, nomLabo, ville, email, telephone, message, statut, created_at
       FROM utilisateurs
       WHERE role = 'Client' AND statut = 1
       ORDER BY created_at DESC
       LIMIT 3`
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("Erreur getLatestClientRequests:", err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des notifications.",
    });
  }
};