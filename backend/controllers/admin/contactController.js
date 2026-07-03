const pool = require("../../db");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// GET /api/admin/contacts
exports.getAllContacts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nom, email, sujet, message, statut, archive, created_at
       FROM contacts
       ORDER BY created_at DESC`
    );

    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error("Erreur getAllContacts:", err);
    res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération des messages." });
  }
};

// GET /api/admin/contacts/latest
exports.getLatestContacts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nom, email, sujet, message, statut, archive, created_at
       FROM contacts
       WHERE archive = 0
       ORDER BY created_at DESC
       LIMIT 3`
    );

    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error("Erreur getLatestContacts:", err);
    res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération des derniers messages." });
  }
};

// POST /api/admin/contacts/:id/reply
exports.replyToContact = async (req, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  if (!replyMessage || !replyMessage.trim()) {
    return res.status(400).json({ success: false, message: "Le message de réponse ne peut pas être vide." });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, nom, email, sujet, message FROM contacts WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Message de contact introuvable." });
    }

    const contact = rows[0];

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: contact.email,
      subject: `Re: ${contact.sujet}`,
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222; line-height: 1.6;">
          <p>Bonjour ${contact.nom},</p>
          <p>${replyMessage.replace(/\n/g, "<br>")}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #888; font-size: 12px;">
            En réponse à votre message : « ${contact.message.slice(0, 150)}${contact.message.length > 150 ? "…" : ""} »
          </p>
          <p style="margin-top: 20px;">Cordialement,<br><strong>Grand Laboratoire</strong></p>
        </div>
      `,
    });

    await pool.query(`UPDATE contacts SET statut = 'Traité' WHERE id = ?`, [id]);

    res.status(200).json({ success: true, message: "Réponse envoyée avec succès." });
  } catch (err) {
    console.error("Erreur replyToContact:", err);
    res.status(500).json({ success: false, message: "Erreur lors de l'envoi de la réponse." });
  }
};

// PATCH /api/admin/contacts/:id/archive
exports.archiveContact = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`UPDATE contacts SET archive = 1 WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Message introuvable." });
    }
    res.status(200).json({ success: true, message: "Message archivé." });
  } catch (err) {
    console.error("Erreur archiveContact:", err);
    res.status(500).json({ success: false, message: "Erreur lors de l'archivage." });
  }
};

// PATCH /api/admin/contacts/:id/restore
exports.restoreContact = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`UPDATE contacts SET archive = 0 WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Message introuvable." });
    }
    res.status(200).json({ success: true, message: "Message restauré." });
  } catch (err) {
    console.error("Erreur restoreContact:", err);
    res.status(500).json({ success: false, message: "Erreur lors de la restauration." });
  }
};

// DELETE /api/admin/contacts/:id
exports.deleteContact = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(`DELETE FROM contacts WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Message introuvable." });
    }
    res.status(200).json({ success: true, message: "Message supprimé." });
  } catch (err) {
    console.error("Erreur deleteContact:", err);
    res.status(500).json({ success: false, message: "Erreur lors de la suppression." });
  }
};