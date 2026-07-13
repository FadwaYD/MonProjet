const jwt = require("jsonwebtoken");

/**
 * Vérifie que la requête contient un token JWT valide.
 * Attend un header : Authorization: Bearer <token>
 * Ajoute req.user = { id, role } si le token est valide.
 */
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Accès refusé, token manquant."
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Token invalide ou expiré."
            });
        }
        req.user = decoded; // { id, role }
        next();
    });
};

/**
 * À utiliser APRÈS verifyToken.
 * Bloque l'accès si l'utilisateur n'a pas le rôle Admin.
 */
exports.verifyAdmin = (req, res, next) => {
    if (req.user.role !== "Admin") {
        return res.status(403).json({
            success: false,
            message: "Accès réservé aux administrateurs."
        });
    }
    next();
};