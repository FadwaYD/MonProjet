const db = require("../../config/db");

// ==========================
// Créer une commande (checkout)
// ==========================
exports.creerCommande = (req, res) => {

    const utilisateur_id = req.userId; // rempli par le middleware verifyToken
    const { articles } = req.body;
    // articles attendu : [{ produit_id, quantite, prix }, ...]

    if (!articles || articles.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Le panier est vide"
        });
    }

    // 1. Vérifier le stock de chaque produit
    const produitIds = articles.map((a) => a.produit_id);

    const sqlVerifStock = `
        SELECT id, stock
        FROM produits
        WHERE id IN (?)
    `;

    db.query(sqlVerifStock, [produitIds], (err, produits) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Erreur serveur",
                error: err
            });
        }

        // Vérification stock suffisant pour chaque article
        for (const item of articles) {
            const produit = produits.find((p) => p.id === item.produit_id);

            if (!produit) {
                return res.status(400).json({
                    success: false,
                    message: `Produit ${item.produit_id} introuvable`
                });
            }

            if (produit.stock < item.quantite) {
                return res.status(400).json({
                    success: false,
                    message: `Stock insuffisant pour le produit ${item.produit_id}`
                });
            }
        }

        // 2. Calcul du total
        const total = articles.reduce(
            (sum, item) => sum + Number(item.prix) * item.quantite,
            0
        );

        // 3. Démarrer la transaction
        db.beginTransaction((errTrans) => {

            if (errTrans) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur serveur (transaction)",
                    error: errTrans
                });
            }

            // 4. Insérer la commande (en-tête)
            const sqlCommande = `
                INSERT INTO commandes (utilisateur_id, date_commande, total, statut)
                VALUES (?, NOW(), ?, 'En attente')
            `;

            db.query(sqlCommande, [utilisateur_id, total], (errCmd, resultCmd) => {

                if (errCmd) {
                    return db.rollback(() => {
                        res.status(500).json({
                            success: false,
                            message: "Erreur lors de la création de la commande",
                            error: errCmd
                        });
                    });
                }

                const commande_id = resultCmd.insertId;

                // 5. Préparer les lignes de détail (insertion multiple)
                const sqlDetails = `
                    INSERT INTO details_commande (commande_id, produit_id, quantite, prix, remise)
                    VALUES ?
                `;

                const valeursDetails = articles.map((item) => [
                    commande_id,
                    item.produit_id,
                    item.quantite,
                    item.prix,
                    0
                ]);

                db.query(sqlDetails, [valeursDetails], (errDet) => {

                    if (errDet) {
                        return db.rollback(() => {
                            res.status(500).json({
                                success: false,
                                message: "Erreur lors de l'ajout des détails",
                                error: errDet
                            });
                        });
                    }

                    // 6. Décrémenter le stock pour chaque produit
                    let compteur = 0;
                    let erreurStock = null;

                    articles.forEach((item) => {
                        const sqlStock = `
                            UPDATE produits
                            SET stock = stock - ?
                            WHERE id = ?
                        `;

                        db.query(sqlStock, [item.quantite, item.produit_id], (errStock) => {

                            compteur++;

                            if (errStock) {
                                erreurStock = errStock;
                            }

                            // Une fois toutes les mises à jour de stock terminées
                            if (compteur === articles.length) {

                                if (erreurStock) {
                                    return db.rollback(() => {
                                        res.status(500).json({
                                            success: false,
                                            message: "Erreur lors de la mise à jour du stock",
                                            error: erreurStock
                                        });
                                    });
                                }

                                // 7. Valider la transaction
                                db.commit((errCommit) => {

                                    if (errCommit) {
                                        return db.rollback(() => {
                                            res.status(500).json({
                                                success: false,
                                                message: "Erreur lors de la validation",
                                                error: errCommit
                                            });
                                        });
                                    }

                                    res.status(201).json({
                                        success: true,
                                        message: "Commande enregistrée avec succès",
                                        commande_id
                                    });

                                });
                            }
                        });
                    });
                });
            });
        });
    });
};


// ==========================
// Liste des commandes d'un client connecté
// ==========================
exports.getMesCommandes = (req, res) => {

    const utilisateur_id = req.user.id;

    const sql = `
        SELECT *
        FROM commandes
        WHERE utilisateur_id = ?
        ORDER BY date_commande DESC
    `;

    db.query(sql, [utilisateur_id], (err, commandes) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Erreur serveur",
                error: err
            });
        }

        res.status(200).json({
            success: true,
            data: commandes
        });

    });

};


// ==========================
// Détail d'une commande (avec ses produits)
// ==========================
exports.getDetailCommande = (req, res) => {

    const { id } = req.params;
    const utilisateur_id = req.user.id;

    // Vérifie que la commande appartient bien au client connecté
    const sqlCommande = `
        SELECT *
        FROM commandes
        WHERE id = ? AND utilisateur_id = ?
    `;

    db.query(sqlCommande, [id, utilisateur_id], (err, commandes) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Erreur serveur",
                error: err
            });
        }

        if (commandes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Commande introuvable"
            });
        }

        const sqlDetails = `
            SELECT dc.*, p.nom, p.image, p.marque
            FROM details_commande dc
            JOIN produits p ON p.id = dc.produit_id
            WHERE dc.commande_id = ?
        `;

        db.query(sqlDetails, [id], (errDet, details) => {

            if (errDet) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur serveur",
                    error: errDet
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    commande: commandes[0],
                    details: details
                }
            });

        });

    });

};