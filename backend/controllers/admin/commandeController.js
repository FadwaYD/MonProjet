const pool         = require("../../db");
const PDFDocument  = require("pdfkit");
const nodemailer   = require("nodemailer");

const STATUTS_VALIDES = ["En attente", "Confirmée", "Annulée"];
const fail = (res, code, msg) => res.status(code).json({ success: false, message: msg });

// ─── Transporteur email (à configurer via .env) ────────────────────────────────
// SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Génère le PDF du devis en mémoire (Buffer) ────────────────────────────────
// datesPeremption : { [ligneId]: 'YYYY-MM-DD' } — fourni par le front, jamais lu/écrit en base
function genererPdfDevis(cmd, lignes, datesPeremption = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const ref = `CMD-${String(cmd.id).padStart(4, "0")}`;

    // ── En-tête ──
    doc.fontSize(20).fillColor("#1E3A8A").text("Devis", { align: "right" });
    doc.fontSize(10).fillColor("#6B7280")
      .text(ref, { align: "right" })
      .text(new Date(cmd.date_commande).toLocaleDateString("fr-FR"), { align: "right" });
    doc.moveDown(1.5);

    // ── Infos client ──
    doc.fontSize(12).fillColor("#111827").text("Client :", { underline: true });
    doc.fontSize(10).fillColor("#374151")
      .text(`${cmd.client_prenom} ${cmd.client_nom}`)
      .text(cmd.laboratoire || "")
      .text(cmd.client_email)
      .text(cmd.client_telephone || "")
      .text(cmd.client_ville || "");
    doc.moveDown(1.5);

    // ── Tableau produits ──
    const colX = { ref: 50, nom: 110, qte: 300, prix: 345, remise: 405, perem: 455 };
    let y = doc.y;
    doc.fontSize(9).fillColor("#1E40AF");
    doc.text("Réf.", colX.ref, y);
    doc.text("Produit", colX.nom, y);
    doc.text("Qté", colX.qte, y);
    doc.text("P.U.", colX.prix, y);
    doc.text("Remise", colX.remise, y);
    doc.text("Péremption", colX.perem, y);
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#BFDBFE").stroke();
    doc.moveDown(0.5);

    lignes.forEach((l) => {
      const rowY = doc.y;
      const peremption = datesPeremption[l.id]
        ? new Date(datesPeremption[l.id]).toLocaleDateString("fr-FR")
        : "—";
      doc.fontSize(9).fillColor("#374151");
      doc.text(l.produit_reference, colX.ref, rowY, { width: 55 });
      doc.text(l.produit_nom, colX.nom, rowY, { width: 185 });
      doc.text(String(l.quantite), colX.qte, rowY);
      doc.text(`${Number(l.prix_unitaire).toFixed(2)} MAD`, colX.prix, rowY);
      doc.text(`${Number(l.remise) || 0}%`, colX.remise, rowY);
      doc.text(peremption, colX.perem, rowY);
      doc.moveDown();
    });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#BFDBFE").stroke();
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#1D4ED8")
      .text(`Total : ${Number(cmd.total).toFixed(2)} MAD`, { align: "right" });

    doc.end();
  });
}

// ─── Envoie le PDF par email au client ─────────────────────────────────────────
async function envoyerEmailDevis(destinataire, cmd, pdfBuffer) {
  const ref = `CMD-${String(cmd.id).padStart(4, "0")}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: destinataire,
    subject: `Votre devis ${ref} est confirmé`,
    text:
      `Bonjour ${cmd.client_prenom},\n\n` +
      `Votre devis ${ref} a bien été confirmé. Vous trouverez le détail en pièce jointe (PDF).\n\n` +
      `Cordialement,\nL'équipe du laboratoire`,
    attachments: [
      {
        filename: `devis-${ref}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

// ─── Vérifie si un client a le droit de passer commande ────────────────────────
// Règle métier (telle que demandée) :
//   utilisateurs.statut = 0  ->  autorisé à commander
//   utilisateurs.statut = 1  ->  refusé
async function clientPeutCommander(utilisateurId) {
  const [[user]] = await pool.execute(
    "SELECT id, statut FROM utilisateurs WHERE id = ?",
    [utilisateurId]
  );
  if (!user) return { autorise: false, code: 404, raison: "Utilisateur introuvable" };
  if (Number(user.statut) === 1) {
    return {
      autorise: false,
      code: 403,
      raison: "Votre compte n'est pas autorisé à passer commande pour le moment.",
    };
  }
  return { autorise: true };
}

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

// POST /api/commandes
// Body attendu : { utilisateur_id, lignes: [{ produit_id, quantite, prix, remise }] }
// Applique la règle d'accès : utilisateurs.statut = 0 -> autorisé | statut = 1 -> refusé
exports.create = async (req, res) => {
  const { utilisateur_id, lignes } = req.body || {};

  if (!utilisateur_id) return fail(res, 400, "Champ requis : utilisateur_id");
  if (!Array.isArray(lignes) || lignes.length === 0)
    return fail(res, 400, "La commande doit contenir au moins une ligne (lignes[])");

  // ── Vérification de l'accès du client ──
  const acces = await clientPeutCommander(utilisateur_id);
  if (!acces.autorise) return fail(res, acces.code, acces.raison);

  // ── Validation des lignes ──
  for (const l of lignes) {
    const qte    = Number(l.quantite);
    const prix   = Number(l.prix);
    const remise = Number(l.remise || 0);
    if (!l.produit_id) return fail(res, 400, "Chaque ligne doit avoir un produit_id");
    if (!Number.isFinite(qte)    || qte    < 1)   return fail(res, 400, "Quantité invalide (min 1)");
    if (!Number.isFinite(prix)   || prix   < 0)   return fail(res, 400, "Prix invalide (≥ 0)");
    if (!Number.isFinite(remise) || remise < 0 || remise > 100)
      return fail(res, 400, "Remise invalide (0–100)");
  }

  const total = lignes.reduce((sum, l) => {
    const qte    = Number(l.quantite);
    const prix   = Number(l.prix);
    const remise = Number(l.remise || 0);
    return sum + qte * prix * (1 - remise / 100);
  }, 0);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      "INSERT INTO commandes (utilisateur_id, total, statut) VALUES (?, ?, 'En attente')",
      [utilisateur_id, Math.round(total * 100) / 100]
    );
    const commandeId = result.insertId;

    for (const l of lignes) {
      await conn.execute(
        "INSERT INTO details_commande (commande_id, produit_id, quantite, prix, remise) VALUES (?, ?, ?, ?, ?)",
        [commandeId, l.produit_id, Number(l.quantite), Number(l.prix), Number(l.remise || 0)]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, data: { id: commandeId } });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    fail(res, 500, "Erreur serveur lors de la création de la commande");
  } finally {
    conn.release();
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

// PATCH /api/commandes/:id/confirmer
// Génère le PDF du devis (avec les dates de péremption transmises par le front,
// jamais persistées en base), l'envoie par email au client, puis passe le
// statut de la commande à "Confirmée".
exports.confirmerEtEnvoyer = async (req, res) => {
  try {
    const id = req.params.id;
    const { datesPeremption } = req.body || {};

    const [[cmd]] = await pool.execute(
      `SELECT
        c.id, c.utilisateur_id, c.date_commande, c.total, c.statut,
        u.nom AS client_nom, u.prenom AS client_prenom,
        u.email AS client_email, u.telephone AS client_telephone,
        u.nomLabo AS laboratoire, u.ville AS client_ville, u.ice AS client_ice
       FROM commandes c
       JOIN utilisateurs u ON u.id = c.utilisateur_id
       WHERE c.id = ?`,
      [id]
    );
    if (!cmd) return fail(res, 404, "Commande introuvable");

    const [lignes] = await pool.execute(
      `SELECT
        dc.id, dc.quantite,
        dc.prix     AS prix_unitaire,
        dc.remise,
        p.nom       AS produit_nom,
        p.marque    AS produit_marque,
        p.reference AS produit_reference,
        p.statut    AS produit_type
       FROM details_commande dc
       JOIN produits p ON p.id = dc.produit_id
       WHERE dc.commande_id = ?
       ORDER BY dc.id`,
      [id]
    );

    let pdfBuffer;
    try {
      pdfBuffer = await genererPdfDevis(cmd, lignes, datesPeremption || {});
    } catch (e) {
      console.error("Erreur génération PDF :", e);
      return fail(res, 500, "Erreur lors de la génération du PDF");
    }

    try {
      await envoyerEmailDevis(cmd.client_email, cmd, pdfBuffer);
    } catch (e) {
      console.error("Erreur envoi email :", e);
      return fail(res, 500, "Le PDF a été généré mais l'email n'a pas pu être envoyé");
    }

    const [r] = await pool.execute(
      "UPDATE commandes SET statut = 'Confirmée' WHERE id = ?",
      [id]
    );
    if (r.affectedRows === 0) return fail(res, 404, "Commande introuvable");

    res.json({ success: true, message: "Devis confirmé et envoyé par email au client." });
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