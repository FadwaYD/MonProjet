const pool = require("../../db");

// GET /api/admin/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    // Ventes du mois (commandes confirmées, mois en cours)
    const [[salesNow]] = await pool.query(
      `SELECT COALESCE(SUM(total),0) AS total FROM commandes
       WHERE statut = 'Confirmée' AND MONTH(date_commande) = MONTH(CURDATE()) AND YEAR(date_commande) = YEAR(CURDATE())`
    );
    const [[salesPrev]] = await pool.query(
      `SELECT COALESCE(SUM(total),0) AS total FROM commandes
       WHERE statut = 'Confirmée' AND MONTH(date_commande) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(date_commande) = YEAR(CURDATE() - INTERVAL 1 MONTH)`
    );

    // Messages non traités
    const [[msgNow]] = await pool.query(
      `SELECT COUNT(*) AS count FROM contacts WHERE statut = 'Nouveau' AND archive = 0`
    );

    // Commandes en cours (statut "En attente")
    const [[ordersNow]] = await pool.query(
      `SELECT COUNT(*) AS count FROM commandes WHERE statut = 'En attente'`
    );
    const [[ordersPrevWeek]] = await pool.query(
      `SELECT COUNT(*) AS count FROM commandes WHERE statut = 'En attente' AND date_commande < CURDATE() - INTERVAL 7 DAY`
    );

    // Nouveaux clients (mois en cours)
    const [[clientsNow]] = await pool.query(
      `SELECT COUNT(*) AS count FROM utilisateurs
       WHERE role = 'Client' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`
    );
    const [[clientsPrev]] = await pool.query(
      `SELECT COUNT(*) AS count FROM utilisateurs
       WHERE role = 'Client' AND MONTH(created_at) = MONTH(CURDATE() - INTERVAL 1 MONTH) AND YEAR(created_at) = YEAR(CURDATE() - INTERVAL 1 MONTH)`
    );

    const pct = (now, prev) => {
      if (prev === 0) return now > 0 ? "+100%" : "0%";
      const diff = ((now - prev) / prev) * 100;
      return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
    };

    res.status(200).json({
      success: true,
      data: {
        ventesMois: {
          value: Number(salesNow.total),
          delta: pct(Number(salesNow.total), Number(salesPrev.total)),
          up: Number(salesNow.total) >= Number(salesPrev.total),
        },
        messagesNonTraites: {
          value: msgNow.count,
          delta: `${msgNow.count} en attente`,
          up: msgNow.count > 0,
        },
        commandesEnCours: {
          value: ordersNow.count,
          delta: `${ordersNow.count - ordersPrevWeek.count >= 0 ? "+" : ""}${ordersNow.count - ordersPrevWeek.count}`,
          up: ordersNow.count - ordersPrevWeek.count >= 0,
        },
        nouveauxClients: {
          value: clientsNow.count,
          delta: `${clientsNow.count - clientsPrev.count >= 0 ? "+" : ""}${clientsNow.count - clientsPrev.count}`,
          up: clientsNow.count - clientsPrev.count >= 0,
        },
      },
    });
  } catch (err) {
    console.error("Erreur getStats:", err);
    res.status(500).json({ success: false, message: "Erreur serveur lors du calcul des statistiques." });
  }
};

// GET /api/admin/dashboard/monthly-orders
// Commandes des 6 derniers mois, réparties par statut (Confirmée / En attente / Annulée).
exports.getMonthlyOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         DATE_FORMAT(date_commande, '%Y-%m') AS mois,
         SUM(CASE WHEN statut = 'Confirmée'  THEN 1 ELSE 0 END) AS confirmee,
         SUM(CASE WHEN statut = 'En attente' THEN 1 ELSE 0 END) AS enAttente,
         SUM(CASE WHEN statut = 'Annulée'    THEN 1 ELSE 0 END) AS annulee
       FROM commandes
       WHERE date_commande >= DATE_FORMAT(CURDATE() - INTERVAL 5 MONTH, '%Y-%m-01')
       GROUP BY DATE_FORMAT(date_commande, '%Y-%m')
       ORDER BY mois ASC`
    );

    // Génère les 6 derniers mois (avec 0 pour les mois sans commande)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1); // évite les décalages de fin de mois (ex: 31 -> mois suivant)
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("fr-FR", { month: "short" });
      const found = rows.find((r) => r.mois === key);

      const confirmee = found ? Number(found.confirmee) : 0;
      const enAttente = found ? Number(found.enAttente) : 0;
      const annulee = found ? Number(found.annulee) : 0;

      months.push({
        m: label.charAt(0).toUpperCase() + label.slice(1).replace(".", ""),
        confirmee,
        enAttente,
        annulee,
        total: confirmee + enAttente + annulee,
      });
    }

    res.status(200).json({ success: true, data: months });
  } catch (err) {
    console.error("Erreur getMonthlyOrders:", err);
    res.status(500).json({ success: false, message: "Erreur serveur lors du calcul des commandes mensuelles." });
  }
};

// GET /api/admin/dashboard/activity
exports.getRecentActivity = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `(SELECT 'commande' AS type, id, CONCAT('Commande #CMD-', id, ' — ', FORMAT(total,2), ' MAD (', statut, ')') AS text, date_commande AS date
        FROM commandes ORDER BY date_commande DESC LIMIT 5)
       UNION ALL
       (SELECT 'client' AS type, id, CONCAT('Nouveau client inscrit : ', COALESCE(nomLabo, CONCAT(prenom, ' ', nom))) AS text, created_at AS date
        FROM utilisateurs WHERE role = 'Client' ORDER BY created_at DESC LIMIT 5)
       UNION ALL
       (SELECT 'message' AS type, id, CONCAT('Nouveau message : ', sujet) AS text, created_at AS date
        FROM contacts ORDER BY created_at DESC LIMIT 5)
       ORDER BY date DESC
       LIMIT 6`
    );

    const formatted = rows.map((r) => ({
      id: `${r.type}-${r.id}`,
      type: r.type,
      text: r.text,
      time: formatDate(r.date),
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error("Erreur getRecentActivity:", err);
    res.status(500).json({ success: false, message: "Erreur serveur lors du chargement de l'activité." });
  }
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.toLocaleDateString("fr-FR");
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${day} à ${time}`;
}