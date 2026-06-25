const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "0000",
  database: process.env.DB_NAME || "gestion_db",
  waitForConnections: true,
  connectionLimit: 10,
});

// statut 0 = Client accepté | statut 1 = En attente
function statutToLabel(statut) {
  return statut === 0 ? "Client" : "En attente";
}

// GET /api/clients?statut=0|1|tous
app.get("/api/clients", async (req, res) => {
  try {
    const { statut } = req.query;
    let sql = "SELECT * FROM users ORDER BY id DESC";
    const params = [];
    if (statut !== undefined && statut !== "tous") {
      sql = "SELECT * FROM users WHERE statut = ? ORDER BY id DESC";
      params.push(Number(statut));
    }
    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows.map((r) => ({ ...r, label: statutToLabel(r.statut) })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/clients/:id
app.get("/api/clients/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Client introuvable" });
    res.json({ success: true, data: { ...rows[0], label: statutToLabel(rows[0].statut) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/clients/:id/accepter  →  statut 1 → 0
app.patch("/api/clients/:id/accepter", async (req, res) => {
  try {
    const [existing] = await pool.execute("SELECT id, statut FROM users WHERE id = ?", [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: "Client introuvable" });
    if (existing[0].statut === 0) return res.status(400).json({ success: false, message: "Déjà accepté" });
    await pool.execute("UPDATE users SET statut = 0 WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Client accepté" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/clients
app.post("/api/clients", async (req, res) => {
  try {
    const { nom, prenom, nomLabo, telephone, gmail, codeICE, motDePasse, statut = 1 } = req.body;
    if (!nom || !prenom || !gmail || !motDePasse)
      return res.status(400).json({ success: false, message: "Champs obligatoires : nom, prénom, email, mot de passe" });
    const [result] = await pool.execute(
      "INSERT INTO users (nom, prenom, nomLabo, telephone, gmail, codeICE, motDePasse, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [nom, prenom, nomLabo || null, telephone || null, gmail, codeICE || null, motDePasse, statut]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ success: false, message: "Email déjà utilisé" });
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/clients/:id
app.put("/api/clients/:id", async (req, res) => {
  try {
    const { nom, prenom, nomLabo, telephone, gmail, codeICE, statut } = req.body;
    const [existing] = await pool.execute("SELECT id FROM users WHERE id = ?", [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: "Client introuvable" });
    await pool.execute(
      "UPDATE users SET nom=?, prenom=?, nomLabo=?, telephone=?, gmail=?, codeICE=?, statut=? WHERE id=?",
      [nom, prenom, nomLabo || null, telephone || null, gmail, codeICE || null, statut ?? 1, req.params.id]
    );
    res.json({ success: true, message: "Client mis à jour" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ success: false, message: "Email déjà utilisé" });
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/clients/:id
app.delete("/api/clients/:id", async (req, res) => {
  try {
    const [existing] = await pool.execute("SELECT id FROM users WHERE id = ?", [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: "Client introuvable" });
    await pool.execute("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Client supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("API demarree sur http://localhost:" + PORT));