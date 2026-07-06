const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = (req, res) => {

    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
        return res.status(400).json({
            success: false,
            message: "Tous les champs sont obligatoires"
        });
    }

    const sql = "SELECT * FROM utilisateurs WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email incorrect"
            });
        }

        const user = result[0];

        // si mot de passe crypté

       const isMatch = mot_de_passe === user.mot_de_passe;

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Mot de passe incorrect"
            });
        }

        if (user.statut == 0) {
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
            "secretkey",
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