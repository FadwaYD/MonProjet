const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* ============================
   CONNEXION
============================ */

exports.login = (req, res) => {

    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
        return res.status(400).json({
            success: false,
            message: "Tous les champs sont obligatoires"
        });
    }

    // trim + lowercase pour éviter les faux négatifs dus aux espaces ou à la casse
    const cleanEmail = email.trim().toLowerCase();

    const sql = "SELECT * FROM utilisateurs WHERE LOWER(email) = ?";

    db.query(sql, [cleanEmail], async (err, result) => {

        if (err) {
            console.error("Erreur SQL (login):", err);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur lors de la connexion."
            });
        }

        if (result.length === 0) {
            console.log("Login échoué: aucun utilisateur trouvé pour", cleanEmail);
            return res.status(401).json({
                success: false,
                message: "Email incorrect"
            });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(
            mot_de_passe,
            user.mot_de_passe
        );

        // Debug temporaire — à retirer une fois le problème identifié
        console.log("Login debug -> email:", user.email, "| hash:", user.mot_de_passe, "| isMatch:", isMatch);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Mot de passe incorrect"
            });
        }

        // statut: 1 = en attente de validation, 0 = approuvé (cf. register)
        if (user.statut == 1) {
            return res.status(403).json({
                success: false,
                message: "Compte non validé"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET || "secretkey",
            {
                expiresIn: "1d"
            }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role
            }
        });

    });

};

/* ============================
   INSCRIPTION
============================ */

exports.register = (req, res) => {

    const {
        ice,
        nom,
        prenom,
        nomLabo,
        ville,
        email,
        telephone,
        mot_de_passe
    } = req.body;

    if (
        !nom ||
        !prenom ||
        !email ||
        !telephone ||
        !mot_de_passe
    ) {
        return res.status(400).json({
            success: false,
            message: "Veuillez remplir tous les champs."
        });
    }

    const cleanEmail = email.trim().toLowerCase();

    db.query(
        "SELECT * FROM utilisateurs WHERE LOWER(email) = ?",
        [cleanEmail],
        async (err, result) => {

            if (err) {
                console.error("Erreur SQL (register - check email):", err);
                return res.status(500).json({
                    success: false,
                    message: "Erreur serveur, veuillez réessayer plus tard."
                });
            }

            if (result.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Cet email existe déjà."
                });
            }

            let hash;
            try {
                hash = await bcrypt.hash(mot_de_passe, 10);
            } catch (hashErr) {
                console.error("Erreur bcrypt (register):", hashErr);
                return res.status(500).json({
                    success: false,
                    message: "Erreur serveur lors du hachage du mot de passe."
                });
            }

            const sql = `
                INSERT INTO utilisateurs
                (
                    ice,
                    nom,
                    prenom,
                    nomLabo,
                    ville,
                    email,
                    telephone,
                    mot_de_passe,
                    role,
                    statut
                )
                VALUES (?,?,?,?,?,?,?,?,?,?)
            `;

            db.query(
                sql,
                [
                    ice,
                    nom,
                    prenom,
                    nomLabo,
                    ville,
                    cleanEmail,
                    telephone,
                    hash,
                    "Client",
                    1
                ],
                (err) => {

                    if (err) {
                        console.error("Erreur SQL (register - insert):", err);
                        return res.status(500).json({
                            success: false,
                            message: "Erreur serveur, veuillez réessayer plus tard."
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: "Compte créé avec succès."
                    });

                }
            );

        }
    );

};