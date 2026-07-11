const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "ton_secret_key";

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Token manquant" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Token invalide ou expiré" });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
}

module.exports = { verifyToken, SECRET_KEY };