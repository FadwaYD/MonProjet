const db = require("../../config/db");
// ==========================
// Liste des produits
// ==========================
exports.getProduits = (req, res) => {

    const sql = `
        SELECT
            id,
            nom,
            marque,
            reference,
            description,
            prix,
            stock,
            image,
            statut
        FROM produits
        ORDER BY id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Erreur serveur",
                error: err
            });
        }

        res.status(200).json({
            success: true,
            produits: result
        });

    });

};


// ==========================
// Un seul produit
// ==========================
exports.getProduitById = (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT *
        FROM produits
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Produit introuvable"
            });
        }

        res.json(result[0]);

    });

};


// ==========================
// Statistiques accueil
// ==========================
exports.getStatistiques = (req, res) => {

    const sql = `
        SELECT COUNT(*) AS produits
        FROM produits
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({
            produits: result[0].produits,
            clients: 450,
            experience: 15,
            livraisons: 12000
        });

    });

};