const db = require("../../config/db");
const bcrypt = require("bcrypt");

/* ==================================================
   GET /api/admin/profile
   Récupère les infos du compte admin connecté
   (req.user.id vient du token JWT, via verifyToken)
================================================== */
exports.getProfile = (req, res) => {

    const sql = `
        SELECT id, nom, prenom, email, telephone, ville, role
        FROM utilisateurs
        WHERE id = ?
    `;

    db.query(sql, [req.user.id], (err, result) => {

        if (err) {
            console.error("Erreur SQL (getProfile):", err);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur lors du chargement du profil."
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur introuvable."
            });
        }

        res.json({
            success: true,
            data: result[0]
        });
    });
};

/* ==================================================
   PUT /api/admin/profile
   Met à jour nom / prénom / email / téléphone / ville
================================================== */
exports.updateProfile = (req, res) => {

    const { nom, prenom, email, telephone, ville } = req.body;

    if (!nom || !prenom || !email) {
        return res.status(400).json({
            success: false,
            message: "Nom, prénom et email sont obligatoires."
        });
    }

    // Vérifie que l'email n'est pas déjà utilisé par un AUTRE compte
    const checkEmailSql = "SELECT id FROM utilisateurs WHERE email = ? AND id != ?";

    db.query(checkEmailSql, [email, req.user.id], (err, result) => {

        if (err) {
            console.error("Erreur SQL (updateProfile - check email):", err);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur, veuillez réessayer plus tard."
            });
        }

        if (result.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cet email est déjà utilisé par un autre compte."
            });
        }

        const updateSql = `
            UPDATE utilisateurs
            SET nom = ?, prenom = ?, email = ?, telephone = ?, ville = ?
            WHERE id = ?
        `;

        db.query(
            updateSql,
            [nom, prenom, email, telephone || null, ville || null, req.user.id],
            (updateErr) => {

                if (updateErr) {
                    console.error("Erreur SQL (updateProfile - update):", updateErr);
                    return res.status(500).json({
                        success: false,
                        message: "Erreur serveur lors de la mise à jour du profil."
                    });
                }

                res.json({
                    success: true,
                    message: "Profil mis à jour avec succès."
                });
            }
        );
    });
};

/* ==================================================
   PUT /api/admin/change-password
   Change le mot de passe (vérifie l'ancien d'abord)
================================================== */
exports.changePassword = (req, res) => {

    const { ancien_mdp, nouveau_mdp, confirmer_mdp } = req.body;

    if (!ancien_mdp || !nouveau_mdp || !confirmer_mdp) {
        return res.status(400).json({
            success: false,
            message: "Tous les champs sont obligatoires."
        });
    }

    if (nouveau_mdp.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Le nouveau mot de passe doit contenir au moins 6 caractères."
        });
    }

    if (nouveau_mdp !== confirmer_mdp) {
        return res.status(400).json({
            success: false,
            message: "Les deux mots de passe ne correspondent pas."
        });
    }

    const sql = "SELECT mot_de_passe FROM utilisateurs WHERE id = ?";

    db.query(sql, [req.user.id], async (err, result) => {

        if (err) {
            console.error("Erreur SQL (changePassword - select):", err);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur, veuillez réessayer plus tard."
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur introuvable."
            });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(ancien_mdp, user.mot_de_passe);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Le mot de passe actuel est incorrect."
            });
        }

        let hash;
        try {
            hash = await bcrypt.hash(nouveau_mdp, 10);
        } catch (hashErr) {
            console.error("Erreur bcrypt (changePassword):", hashErr);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur lors du hachage du mot de passe."
            });
        }

        db.query(
            "UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?",
            [hash, req.user.id],
            (updateErr) => {

                if (updateErr) {
                    console.error("Erreur SQL (changePassword - update):", updateErr);
                    return res.status(500).json({
                        success: false,
                        message: "Erreur serveur lors de la mise à jour du mot de passe."
                    });
                }

                res.json({
                    success: true,
                    message: "Mot de passe modifié avec succès."
                });
            }
        );
    });
};