const pool = require("../../db");
const nodemailer = require("nodemailer");

// ─── CONFIGURATION EMAIL (lit les valeurs depuis ton .env existant) ─────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true pour 465, false pour 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Vérifie la connexion SMTP au démarrage (log uniquement, ne bloque rien)
transporter.verify((err) => {
  if (err) console.error("❌ Erreur configuration email :", err.message);
  else console.log("✅ Serveur email prêt à envoyer des messages");
});

function statutToLabel(statut) {
  return statut === 0 ? "Client" : "En attente";
}

// ─── Template email de bienvenue ────────────────────────────────────────────
function buildWelcomeEmail(client) {
  const { email, nom, prenom, nomLabo } = client;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color:#1a1a1a;">
      <div style="background:#7c2d40; padding:24px; border-radius:10px 10px 0 0; text-align:center;">
        <h1 style="color:#fff; margin:0; font-size:20px;">Grand Laboratoire</h1>
      </div>
      <div style="border:1px solid #eee; border-top:none; padding:24px; border-radius:0 0 10px 10px;">
        <p>Bonjour ${prenom} ${nom},</p>
        <p>
          Nous avons le plaisir de vous informer que votre inscription
          ${nomLabo ? `pour <strong>${nomLabo}</strong> ` : ""}a été
          <strong>validée</strong> par notre équipe.
        </p>
        <p>
          Vous êtes désormais client officiel de <strong>Grand Laboratoire</strong>
          et vous pouvez dès à présent vous connecter à votre espace pour
          <strong>passer vos commandes</strong> de réactifs, consommables et matériel.
        </p>
        <p style="margin-top:24px;">
          Nous restons à votre disposition pour toute question.
        </p>
        <p style="margin-top:24px;">Cordialement,<br/>L'équipe Grand Laboratoire</p>
      </div>
    </div>
  `;

  return {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Votre compte Grand Laboratoire a été validé ✅",
    html,
  };
}

// GET /api/clients?statut=0|1|tous
exports.getAll = async (req, res) => {
  try {
    const { statut } = req.query;
    let sql = "SELECT * FROM utilisateurs WHERE role = 'Client'";
    const params = [];
    if (statut !== undefined && statut !== "tous") {
      sql += " AND statut = ?";
      params.push(Number(statut));
    }
    sql += " ORDER BY id DESC";
    const [rows] = await pool.execute(sql, params);
    res.json({
      success: true,
      data: rows.map((r) => ({ ...r, label: statutToLabel(r.statut) })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/clients/:id
exports.getOne = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM utilisateurs WHERE id = ? AND role = 'Client'",
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: "Client introuvable" });
    res.json({
      success: true,
      data: { ...rows[0], label: statutToLabel(rows[0].statut) },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/clients/:id/accepter
exports.accepter = async (req, res) => {
  try {
    const [existing] = await pool.execute(
      "SELECT id, statut, email, nom, prenom, nomLabo FROM utilisateurs WHERE id = ? AND role = 'Client'",
      [req.params.id]
    );
    if (!existing.length)
      return res.status(404).json({ success: false, message: "Client introuvable" });
    if (existing[0].statut === 0)
      return res.status(400).json({ success: false, message: "Déjà accepté" });

    await pool.execute("UPDATE utilisateurs SET statut = 0 WHERE id = ?", [req.params.id]);

    // ── Envoi automatique du mail de bienvenue ──────────────────────────────
    let mailSent = true;
    try {
      await transporter.sendMail(buildWelcomeEmail(existing[0]));
      console.log(`📧 Email de bienvenue envoyé à ${existing[0].email}`);
    } catch (mailErr) {
      mailSent = false;
      console.error("❌ Erreur envoi mail de bienvenue :", mailErr.message);
    }

    res.json({
      success: true,
      message: mailSent
        ? "Client accepté, email de confirmation envoyé"
        : "Client accepté, mais l'envoi de l'email a échoué",
      mailSent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/clients
exports.create = async (req, res) => {
  try {
    const {
      ice = null, nom, prenom, nomLabo = null,
      email, telephone = null, mot_de_passe,
      message = null, statut = 1,
    } = req.body;

    if (!nom || !prenom || !email || !mot_de_passe)
      return res.status(400).json({
        success: false,
        message: "Champs obligatoires : nom, prénom, email, mot de passe",
      });

    const [result] = await pool.execute(
      `INSERT INTO utilisateurs
         (ice, nom, prenom, nomLabo, email, telephone, mot_de_passe, role, message, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Client', ?, ?)`,
      [ice, nom, prenom, nomLabo, email, telephone, mot_de_passe, message, Number(statut)]
    );

    // Si l'admin crée directement le client avec statut "Client" (0), on envoie aussi le mail
    if (Number(statut) === 0) {
      try {
        await transporter.sendMail(buildWelcomeEmail({ email, nom, prenom, nomLabo }));
        console.log(`📧 Email de bienvenue envoyé à ${email}`);
      } catch (mailErr) {
        console.error("❌ Erreur envoi mail de bienvenue (création) :", mailErr.message);
      }
    }

    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ success: false, message: "Email ou ICE déjà utilisé" });
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/clients/:id
exports.update = async (req, res) => {
  try {
    const {
      ice = null, nom, prenom, nomLabo = null,
      email, telephone = null, mot_de_passe,
      message = null, statut,
    } = req.body;

    const [existing] = await pool.execute(
      "SELECT id, statut FROM utilisateurs WHERE id = ? AND role = 'Client'",
      [req.params.id]
    );
    if (!existing.length)
      return res.status(404).json({ success: false, message: "Client introuvable" });

    const wasEnAttente  = existing[0].statut === 1;
    const becomesClient = Number(statut ?? 1) === 0;

    if (mot_de_passe) {
      await pool.execute(
        `UPDATE utilisateurs
         SET ice=?, nom=?, prenom=?, nomLabo=?, email=?, telephone=?,
             mot_de_passe=?, message=?, statut=?
         WHERE id=?`,
        [ice, nom, prenom, nomLabo, email, telephone, mot_de_passe, message, statut ?? 1, req.params.id]
      );
    } else {
      await pool.execute(
        `UPDATE utilisateurs
         SET ice=?, nom=?, prenom=?, nomLabo=?, email=?, telephone=?,
             message=?, statut=?
         WHERE id=?`,
        [ice, nom, prenom, nomLabo, email, telephone, message, statut ?? 1, req.params.id]
      );
    }

    // Si le statut passe de "En attente" à "Client" via le formulaire de modification
    if (wasEnAttente && becomesClient) {
      try {
        await transporter.sendMail(buildWelcomeEmail({ email, nom, prenom, nomLabo }));
        console.log(`📧 Email de bienvenue envoyé à ${email}`);
      } catch (mailErr) {
        console.error("❌ Erreur envoi mail de bienvenue (update) :", mailErr.message);
      }
    }

    res.json({ success: true, message: "Client mis à jour" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ success: false, message: "Email ou ICE déjà utilisé" });
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/clients/:id
exports.remove = async (req, res) => {
  try {
    const [existing] = await pool.execute(
      "SELECT id FROM utilisateurs WHERE id = ? AND role = 'Client'",
      [req.params.id]
    );
    if (!existing.length)
      return res.status(404).json({ success: false, message: "Client introuvable" });
    await pool.execute("DELETE FROM utilisateurs WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Client supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};