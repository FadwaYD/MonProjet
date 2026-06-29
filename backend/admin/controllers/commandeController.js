const pool = require("../../db");

const STATUTS_VALIDES = ["En attente", "Confirmée", "Annulée"];
const fail = (res, code, msg) => res.status(code).json({ success: false, message: msg });

// GET /api/commandes
exports.getAll = async (req, res) => {
  try {
    const { statut } = req.query;

    let sql = `
      SELECT
        c.id,
        c.utilisateur_id,
        c.date_commande,
        c.total,
        c.statut,

        u.nom        AS client_nom,
        u.prenom     AS client_prenom,
        u.email      AS client_email,
        u.telephone  AS client_telephone,
        u.nomLabo    AS laboratoire,
        u.ville      AS client_ville,
        u.ice        AS client_ice,

        COUNT(dc.id) AS nb_produits,

        GROUP_CONCAT(
          CONCAT(p.nom, ' × ', dc.quantite)
          ORDER BY dc.id
          SEPARATOR ' | '
        ) AS produits_resume

      FROM commandes c
      JOIN utilisateurs u ON u.id = c.utilisateur_id
      LEFT JOIN details_commande dc ON dc.commande_id = c.id
      LEFT JOIN produits p ON p.id = dc.produit_id
    `;

    const params = [];
    if (statut && statut !== "Tous") {
      sql += " WHERE c.statut = ?";
      params.push(statut);
    }
    sql += " GROUP BY c.id ORDER BY c.date_commande DESC";

    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
};

// GET /api/commandes/stats/resume
exports.getStats = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT statut, COUNT(*) AS total FROM commandes GROUP BY statut"
    );
    const stats = { Tous: 0 };
    for (const r of rows) {
      stats[r.statut] = Number(r.total);
      stats.Tous += Number(r.total);
    }
    res.json({ success: true, data: stats });
  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
};

// GET /api/commandes/:id
exports.getOne = async (req, res) => {
  try {
    const [[cmd]] = await pool.execute(
      `SELECT
        c.id, c.utilisateur_id, c.date_commande, c.total, c.statut,
        u.nom AS client_nom, u.prenom AS client_prenom,
        u.email AS client_email, u.telephone AS client_telephone,
        u.nomLabo AS laboratoire, u.ville AS client_ville, u.ice AS client_ice
       FROM commandes c
       JOIN utilisateurs u ON u.id = c.utilisateur_id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (!cmd) return fail(res, 404, "Commande introuvable");

    const [lignes] = await pool.execute(
      `SELECT
        dc.id, dc.quantite,
        dc.prix                                                    AS prix_unitaire,
        dc.remise,
        ROUND(dc.quantite * dc.prix * (1 - dc.remise / 100), 2)   AS sous_total,
        p.id        AS produit_id,
        p.nom       AS produit_nom,
        p.marque    AS produit_marque,
        p.reference AS produit_reference,
        p.statut    AS produit_type,
        p.image     AS produit_image
       FROM details_commande dc
       JOIN produits p ON p.id = dc.produit_id
       WHERE dc.commande_id = ?
       ORDER BY dc.id`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...cmd, lignes } });
  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
};

// PATCH /api/commandes/lignes/:id
exports.updateLigne = async (req, res) => {
  try {
    const ligneId = req.params.id;
    const { quantite, prix, remise } = req.body;

    if (quantite == null || prix == null || remise == null)
      return fail(res, 400, "Champs requis : quantite, prix, remise");

    const qte     = Number(quantite);
    const prixU   = Number(prix);
    const remiseP = Number(remise);

    if (!Number.isFinite(qte)     || qte    < 1)    return fail(res, 400, "Quantité invalide (min 1)");
    if (!Number.isFinite(prixU)   || prixU  < 0)    return fail(res, 400, "Prix invalide (≥ 0)");
    if (!Number.isFinite(remiseP) || remiseP < 0 || remiseP > 100)
      return fail(res, 400, "Remise invalide (0–100)");

    const [[ligne]] = await pool.execute(
      "SELECT id, commande_id FROM details_commande WHERE id = ?",
      [ligneId]
    );
    if (!ligne) return fail(res, 404, "Ligne introuvable");

    await pool.execute(
      "UPDATE details_commande SET quantite = ?, prix = ?, remise = ? WHERE id = ?",
      [qte, prixU, remiseP, ligneId]
    );

    await pool.execute(
      `UPDATE commandes
          SET total = (
            SELECT ROUND(SUM(dc.quantite * dc.prix * (1 - dc.remise / 100)), 2)
              FROM details_commande dc WHERE dc.commande_id = ?
          )
        WHERE id = ?`,
      [ligne.commande_id, ligne.commande_id]
    );

    res.json({ success: true, message: "Ligne mise à jour avec succès." });
  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
};

// PATCH /api/commandes/:id/statut
exports.updateStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    if (!STATUTS_VALIDES.includes(statut))
      return fail(res, 400, `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(", ")}`);

    const [r] = await pool.execute(
      "UPDATE commandes SET statut = ? WHERE id = ?",
      [statut, req.params.id]
    );
    if (r.affectedRows === 0) return fail(res, 404, "Commande introuvable");

    res.json({ success: true, message: "Statut mis à jour avec succès." });
  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
};

// DELETE /api/commandes/:id
exports.remove = async (req, res) => {
  try {
    const [r] = await pool.execute("DELETE FROM commandes WHERE id = ?", [req.params.id]);
    if (r.affectedRows === 0) return fail(res, 404, "Commande introuvable");
    res.json({ success: true, message: "Commande supprimée." });
  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
};
