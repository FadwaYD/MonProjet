const pool           = require("../db");
const { UPLOAD_DIR } = require("../middlewares/upload");
const fs             = require("fs");
const path           = require("path");

function stockLabel(stock) {
  if (stock === 0)  return "Rupture";
  if (stock <= 10)  return "Stock faible";
  return "En stock";
}

function withImageUrl(r) {
  return {
    ...r,
    prix: r.prix !== null ? Number(r.prix) : null,
    stockLabel: stockLabel(r.stock),
    image: r.image ? `http://localhost:4000/uploads/${r.image}` : null,
  };
}

// GET /api/produits
exports.getAll = async (req, res) => {
  try {
    const { statut, q } = req.query;
    let sql = "SELECT * FROM produits WHERE 1=1";
    const params = [];
    if (statut && statut !== "Tous") { sql += " AND statut = ?"; params.push(statut); }
    if (q) {
      sql += " AND (nom LIKE ? OR reference LIKE ? OR marque LIKE ?)";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    sql += " ORDER BY id DESC";
    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows.map(withImageUrl) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/produits/stats
exports.getStats = async (req, res) => {
  try {
    const [rows]     = await pool.execute(
      "SELECT statut, COUNT(*) as total, SUM(stock = 0) as rupture, SUM(stock > 0 AND stock <= 10) as faible FROM produits GROUP BY statut"
    );
    const [totalRow] = await pool.execute(
      "SELECT COUNT(*) as total, SUM(stock = 0) as rupture, SUM(stock > 0 AND stock <= 10) as faible FROM produits"
    );
    res.json({ success: true, byStatut: rows, total: totalRow[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/produits/:id
exports.getOne = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM produits WHERE id = ?", [req.params.id]);
    if (!rows.length)
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    res.json({ success: true, data: withImageUrl(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/produits
exports.create = async (req, res) => {
  try {
    const { nom, reference, marque, description = null, prix = 0, stock = 0, statut } = req.body;
    if (!nom || !reference || !marque || !statut) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: "Champs obligatoires : nom, référence, marque, statut",
      });
    }
    const image = req.file ? req.file.filename : null;
    const [result] = await pool.execute(
      "INSERT INTO produits (nom, marque, reference, description, prix, stock, image, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [nom, marque, reference, description || null, Number(prix) || 0, Number(stock), image, statut]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ success: false, message: "Cette référence existe déjà" });
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/produits/:id
exports.update = async (req, res) => {
  try {
    const { nom, reference, marque, description = null, prix, stock, statut, removeImage } = req.body;
    const [existing] = await pool.execute("SELECT * FROM produits WHERE id = ?", [req.params.id]);
    if (!existing.length) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    let image = existing[0].image;
    if (req.file) {
      if (image) fs.unlink(path.join(UPLOAD_DIR, image), () => {});
      image = req.file.filename;
    } else if (removeImage === "true") {
      if (image) fs.unlink(path.join(UPLOAD_DIR, image), () => {});
      image = null;
    }

    await pool.execute(
      "UPDATE produits SET nom=?, marque=?, reference=?, description=?, prix=?, stock=?, image=?, statut=? WHERE id=?",
      [nom, marque, reference, description || null, Number(prix) || 0, Number(stock), image, statut, req.params.id]
    );
    res.json({ success: true, message: "Produit mis à jour" });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ success: false, message: "Cette référence existe déjà" });
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/produits/:id
exports.remove = async (req, res) => {
  try {
    const [existing] = await pool.execute("SELECT * FROM produits WHERE id = ?", [req.params.id]);
    if (!existing.length)
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    if (existing[0].image) fs.unlink(path.join(UPLOAD_DIR, existing[0].image), () => {});
    await pool.execute("DELETE FROM produits WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Produit supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
