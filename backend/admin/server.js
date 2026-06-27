const express = require("express");
const cors    = require("cors");
const mysql   = require("mysql2/promise");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Dossier uploads ──────────────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
app.use("/uploads", express.static(UPLOAD_DIR));

// ─── Config multer ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `produit_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpe?g|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Seules les images (jpg, png, webp, gif) sont autorisées"));
  },
});

// ─── Connexion MySQL ──────────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:             process.env.DB_HOST || "localhost",
  user:             process.env.DB_USER || "root",
  password:         process.env.DB_PASS || "0000",
  database:         process.env.DB_NAME || "gestion_laboratoire",
  waitForConnections: true,
  connectionLimit:  10,
});

// ════════════════════════════════════════════════════════════
//  CLIENTS  (role = 'Client' uniquement)
//  statut 0 = Client accepté | statut 1 = En attente
// ════════════════════════════════════════════════════════════

function statutToLabel(statut) {
  return statut === 0 ? "Client" : "En attente";
}

// GET /api/clients?statut=0|1|tous
app.get("/api/clients", async (req, res) => {
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
});

// GET /api/clients/:id
app.get("/api/clients/:id", async (req, res) => {
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
});

// PATCH /api/clients/:id/accepter  →  statut 1 → 0
app.patch("/api/clients/:id/accepter", async (req, res) => {
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
});

// POST /api/clients
app.post("/api/clients", async (req, res) => {
  try {
    const {
      ice        = null,
      nom,
      prenom,
      nomLabo    = null,
      email,
      telephone  = null,
      mot_de_passe,
      message    = null,
      statut     = 1,
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
});

// PUT /api/clients/:id
app.put("/api/clients/:id", async (req, res) => {
  try {
    const {
      ice        = null,
      nom,
      prenom,
      nomLabo    = null,
      email,
      telephone  = null,
      mot_de_passe,
      message    = null,
      statut,
    } = req.body;

    const [existing] = await pool.execute(
      "SELECT id FROM utilisateurs WHERE id = ? AND role = 'Client'",
      [req.params.id]
    );
    if (!existing.length)
      return res.status(404).json({ success: false, message: "Client introuvable" });

    // Construction dynamique pour ne pas écraser le mot de passe si vide
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
});

// DELETE /api/clients/:id
app.delete("/api/clients/:id", async (req, res) => {
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
});

// ════════════════════════════════════════════════════════════
//  PRODUITS
// ════════════════════════════════════════════════════════════

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

app.get("/api/produits", async (req, res) => {
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
});

app.get("/api/produits/stats", async (req, res) => {
  try {
    const [rows]     = await pool.execute("SELECT statut, COUNT(*) as total, SUM(stock = 0) as rupture, SUM(stock > 0 AND stock <= 10) as faible FROM produits GROUP BY statut");
    const [totalRow] = await pool.execute("SELECT COUNT(*) as total, SUM(stock = 0) as rupture, SUM(stock > 0 AND stock <= 10) as faible FROM produits");
    res.json({ success: true, byStatut: rows, total: totalRow[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/produits/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM produits WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Produit introuvable" });
    res.json({ success: true, data: withImageUrl(rows[0]) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/produits  (multipart/form-data avec champ "image")
app.post("/api/produits", upload.single("image"), async (req, res) => {
  try {
    const { nom, reference, marque, description = null, prix = 0, stock = 0, statut } = req.body;
    if (!nom || !reference || !marque || !statut) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ success: false, message: "Champs obligatoires : nom, référence, marque, statut" });
    }
    const image = req.file ? req.file.filename : null;
    const [result] = await pool.execute(
      "INSERT INTO produits (nom, marque, reference, description, prix, stock, image, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [nom, marque, reference, description || null, Number(prix) || 0, Number(stock), image, statut]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ success: false, message: "Cette référence existe déjà" });
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/produits/:id  (multipart/form-data, "image" optionnelle)
app.put("/api/produits/:id", upload.single("image"), async (req, res) => {
  try {
    const { nom, reference, marque, description = null, prix, stock, statut, removeImage } = req.body;
    const [existing] = await pool.execute("SELECT * FROM produits WHERE id = ?", [req.params.id]);
    if (!existing.length) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ success: false, message: "Produit introuvable" });
    }

    let image = existing[0].image;
    // Nouvelle image envoyée → supprime l'ancienne et utilise la nouvelle
    if (req.file) {
      if (image) fs.unlink(path.join(UPLOAD_DIR, image), () => {});
      image = req.file.filename;
    } else if (removeImage === "true") {
      // L'utilisateur a explicitement retiré l'image
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
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ success: false, message: "Cette référence existe déjà" });
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/produits/:id", async (req, res) => {
  try {
    const [existing] = await pool.execute("SELECT * FROM produits WHERE id = ?", [req.params.id]);
    if (!existing.length) return res.status(404).json({ success: false, message: "Produit introuvable" });
    if (existing[0].image) fs.unlink(path.join(UPLOAD_DIR, existing[0].image), () => {});
    await pool.execute("DELETE FROM produits WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Produit supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Gestion erreurs multer (taille/format) ──────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes("images")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});


 
const STATUTS_VALIDES = ["En attente", "Confirmée", "Annulée"];
const fail = (res, code, msg) => res.status(code).json({ success: false, message: msg });

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/commandes
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/commandes", async (req, res) => {
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

    res.json({
      success: true,
      data: rows
    });

  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/commandes/stats/resume
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/commandes/stats/resume", async (req, res) => {
  try {

    const [rows] = await pool.execute(
      "SELECT statut, COUNT(*) AS total FROM commandes GROUP BY statut"
    );

    const stats = {
      Tous: 0
    };

    for (const r of rows) {
      stats[r.statut] = Number(r.total);
      stats.Tous += Number(r.total);
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/commandes/:id
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/commandes/:id", async (req, res) => {

  try {

    const [[cmd]] = await pool.execute(
      `
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
        u.ice        AS client_ice

      FROM commandes c
      JOIN utilisateurs u
        ON u.id = c.utilisateur_id

      WHERE c.id = ?
      `,
      [req.params.id]
    );

    if (!cmd)
      return fail(res, 404, "Commande introuvable");

    const [lignes] = await pool.execute(
      `
      SELECT
        dc.id,
        dc.quantite,
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

      JOIN produits p
        ON p.id = dc.produit_id

      WHERE dc.commande_id = ?

      ORDER BY dc.id
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...cmd,
        lignes
      }
    });

  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/commandes/lignes/:id
// Body : { quantite, prix, remise }
// ─────────────────────────────────────────────────────────────────────────────
app.patch("/api/commandes/lignes/:id", async (req, res) => {
  try {
    const ligneId = req.params.id;
    const { quantite, prix, remise } = req.body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (quantite == null || prix == null || remise == null)
      return fail(res, 400, "Champs requis : quantite, prix, remise");

    const qte     = Number(quantite);
    const prixU   = Number(prix);
    const remiseP = Number(remise);

    if (!Number.isFinite(qte)     || qte    < 1)
      return fail(res, 400, "Quantité invalide (min 1)");
    if (!Number.isFinite(prixU)   || prixU  < 0)
      return fail(res, 400, "Prix invalide (≥ 0)");
    if (!Number.isFinite(remiseP) || remiseP < 0 || remiseP > 100)
      return fail(res, 400, "Remise invalide (0–100)");

    // ── Vérifier que la ligne existe + récupérer la commande parente ──────────
    const [[ligne]] = await pool.execute(
      "SELECT id, commande_id FROM details_commande WHERE id = ?",
      [ligneId]
    );
    if (!ligne) return fail(res, 404, "Ligne introuvable");

    // ── Mettre à jour la ligne ────────────────────────────────────────────────
    await pool.execute(
      `UPDATE details_commande
          SET quantite = ?,
              prix     = ?,
              remise   = ?
        WHERE id = ?`,
      [qte, prixU, remiseP, ligneId]
    );

    // ── Recalculer le total de la commande parente ────────────────────────────
    await pool.execute(
      `UPDATE commandes
          SET total = (
            SELECT ROUND(SUM(dc.quantite * dc.prix * (1 - dc.remise / 100)), 2)
              FROM details_commande dc
             WHERE dc.commande_id = ?
          )
        WHERE id = ?`,
      [ligne.commande_id, ligne.commande_id]
    );

    res.json({ success: true, message: "Ligne mise à jour avec succès." });

  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/commandes/:id/statut
// ─────────────────────────────────────────────────────────────────────────────
app.patch("/api/commandes/:id/statut", async (req, res) => {

  try {

    const { statut } = req.body;

    if (!STATUTS_VALIDES.includes(statut))
      return fail(
        res,
        400,
        `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(", ")}`
      );

    const [r] = await pool.execute(
      "UPDATE commandes SET statut = ? WHERE id = ?",
      [statut, req.params.id]
    );

    if (r.affectedRows === 0)
      return fail(res, 404, "Commande introuvable");

    res.json({
      success: true,
      message: "Statut mis à jour avec succès."
    });

  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/commandes/:id
// ─────────────────────────────────────────────────────────────────────────────
app.delete("/api/commandes/:id", async (req, res) => {

  try {

    const [r] = await pool.execute(
      "DELETE FROM commandes WHERE id = ?",
      [req.params.id]
    );

    if (r.affectedRows === 0)
      return fail(res, 404, "Commande introuvable");

    res.json({
      success: true,
      message: "Commande supprimée."
    });

  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
});
 
// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅  API démarrée sur http://localhost:${PORT}`));