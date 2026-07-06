const db = require("../../config/db");
// ==========================
// Enregistrer un message de contact
// ==========================
exports.envoyerMessage = (req, res) => {

    const { nom, email, sujet, message } = req.body;

    // Validation simple
    if (!nom || !email || !sujet || !message) {
        return res.status(400).json({
            success: false,
            message: "Tous les champs sont obligatoires"
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Email invalide"
        });
    }

    const sql = `
        INSERT INTO contacts (nom, email, sujet, message)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [nom, email, sujet, message], (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Erreur serveur",
                error: err
            });
        }

        res.status(201).json({
            success: true,
            message: "Votre message a été envoyé avec succès",
            id: result.insertId
        });

    });

};


// ==========================
// Liste des messages (pour un futur espace admin)
// ==========================
exports.getMessages = (req, res) => {

    const sql = `
        SELECT *
        FROM contacts
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
            data: result
        });

    });

};