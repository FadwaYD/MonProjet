const pool = require("../../db");

function statutToLabel(statut) {
  return statut === 0 ? "Client" : "En attente";
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
      "SELECT id, statut FROM utilisateurs WHERE id = ? AND role = 'Client'",
      [req.params.id]
    );
    if (!existing.length)
      return res.status(404).json({ success: false, message: "Client introuvable" });
    if (existing[0].statut === 0)
      return res.status(400).json({ success: false, message: "Déjà accepté" });
    await pool.execute("UPDATE utilisateurs SET statut = 0 WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Client accepté" });
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
      "SELECT id FROM utilisateurs WHERE id = ? AND role = 'Client'",
      [req.params.id]
    );
    if (!existing.length)
      return res.status(404).json({ success: false, message: "Client introuvable" });

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
