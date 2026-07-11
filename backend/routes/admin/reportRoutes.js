const express = require("express");
const router = express.Router();
const pool = require("../../db");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

// ─────────────────────────────────────────────────────────────────────────
// GET /api/admin/reports/stats?from=2026-01-01&to=2026-06-24
// Cartes de statistiques en haut de la page
// ─────────────────────────────────────────────────────────────────────────
router.get("/reports/stats", async (req, res) => {
  const from = req.query.from || "2000-01-01";
  const to   = req.query.to   || "2100-12-31";

  try {
    // Chiffre d'affaires (commandes confirmées sur la période)
    const [[caRow]] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS ca
       FROM commandes
       WHERE statut = 'Confirmée' AND date_commande BETWEEN ? AND ?`,
      [from, to]
    );

    // Période précédente de même durée, pour calculer le delta %
    const [[caPrevRow]] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS ca
       FROM commandes
       WHERE statut = 'Confirmée'
         AND date_commande BETWEEN DATE_SUB(?, INTERVAL DATEDIFF(?, ?) DAY) AND ?`,
      [from, to, from, from]
    );

    const ca = Number(caRow.ca);
    const caPrev = Number(caPrevRow.ca);
    const caDelta = caPrev > 0 ? ((ca - caPrev) / caPrev) * 100 : 0;

    // Clients actifs (role Client, statut validé = 0)
    const [[clientsRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM utilisateurs WHERE role = 'Client' AND statut = 0`
    );

    // Nouveaux clients validés sur la période (pour le delta)
    const [[clientsNewRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM utilisateurs
       WHERE role = 'Client' AND statut = 0 AND created_at BETWEEN ? AND ?`,
      [from, to]
    );

    // Produits en stock faible (seuil : < 10 unités)
    const SEUIL_STOCK_FAIBLE = 10;
    const [[stockRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM produits WHERE stock < ?`,
      [SEUIL_STOCK_FAIBLE]
    );

    res.json({
      success: true,
      data: {
        chiffre_affaires: ca,
        chiffre_affaires_delta_pct: Number(caDelta.toFixed(1)),
        clients_actifs: clientsRow.total,
        clients_nouveaux_periode: clientsNewRow.total,
        produits_stock_faible: stockRow.total,
        seuil_stock_faible: SEUIL_STOCK_FAIBLE,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/admin/reports/monthly?from=2026-01-01&to=2026-06-24
// Évolution du chiffre d'affaires par mois (pour le graphique)
// ─────────────────────────────────────────────────────────────────────────
router.get("/reports/monthly", async (req, res) => {
  const from = req.query.from || "2000-01-01";
  const to   = req.query.to   || "2100-12-31";

  try {
    const [rows] = await pool.query(
      `SELECT 
         DATE_FORMAT(date_commande, '%Y-%m') AS mois,
         SUM(total) AS total
       FROM commandes
       WHERE statut = 'Confirmée' AND date_commande BETWEEN ? AND ?
       GROUP BY DATE_FORMAT(date_commande, '%Y-%m')
       ORDER BY mois ASC`,
      [from, to]
    );

    const MOIS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

    const data = rows.map((r) => {
      const [year, month] = r.mois.split("-");
      return {
        m: MOIS_FR[parseInt(month, 10) - 1],
        v: Math.round(Number(r.total) / 1000), // en milliers de MAD, comme ton frontend (120k, 145k...)
        total_brut: Number(r.total),
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/admin/reports/top-products?from=&to=&limit=4
// Top produits par chiffre d'affaires généré
// ─────────────────────────────────────────────────────────────────────────
router.get("/reports/top-products", async (req, res) => {
  const from = req.query.from || "2000-01-01";
  const to   = req.query.to   || "2100-12-31";
  const limit = parseInt(req.query.limit, 10) || 4;

  try {
    const [rows] = await pool.query(
      `SELECT 
         p.id,
         p.nom,
         p.reference,
         SUM(dc.quantite) AS ventes,
         SUM(dc.quantite * dc.prix * (1 - dc.remise / 100)) AS revenue
       FROM details_commande dc
       INNER JOIN commandes c ON c.id = dc.commande_id
       INNER JOIN produits p ON p.id = dc.produit_id
       WHERE c.statut = 'Confirmée' AND c.date_commande BETWEEN ? AND ?
       GROUP BY p.id, p.nom, p.reference
       ORDER BY revenue DESC
       LIMIT ?`,
      [from, to, limit]
    );

    const data = rows.map((r) => ({
      name: r.nom,
      reference: r.reference,
      sales: r.ventes,
      revenue: `${Number(r.revenue).toLocaleString("fr-FR")} MAD`,
      revenue_brut: Number(r.revenue),
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/admin/reports/clients-status
// Répartition des clients par statut (pour rapport clients)
// ─────────────────────────────────────────────────────────────────────────
router.get("/reports/clients-status", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT statut, COUNT(*) AS total
       FROM utilisateurs
       WHERE role = 'Client'
       GROUP BY statut`
    );

    const data = { valides: 0, en_attente: 0 };
    rows.forEach((r) => {
      if (r.statut === 0) data.valides = r.total;
      if (r.statut === 1) data.en_attente = r.total;
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/admin/reports/products-status
// Répartition des produits par catégorie/statut (Réactif, Consommable, Matériel)
// ─────────────────────────────────────────────────────────────────────────
router.get("/reports/products-status", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT statut, COUNT(*) AS total, SUM(stock) AS stock_total
       FROM produits
       GROUP BY statut`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/admin/reports/orders-status?from=&to=
// Répartition des commandes par statut
// ─────────────────────────────────────────────────────────────────────────
router.get("/reports/orders-status", async (req, res) => {
  const from = req.query.from || "2000-01-01";
  const to   = req.query.to   || "2100-12-31";

  try {
    const [rows] = await pool.query(
      `SELECT statut, COUNT(*) AS total, COALESCE(SUM(total), 0) AS montant
       FROM commandes
       WHERE date_commande BETWEEN ? AND ?
       GROUP BY statut`,
      [from, to]
    );

    const data = { confirmee: 0, en_attente: 0, annulee: 0 };
    const montants = { confirmee: 0, en_attente: 0, annulee: 0 };

    rows.forEach((r) => {
      if (r.statut === "Confirmée")  { data.confirmee  = r.total; montants.confirmee  = Number(r.montant); }
      if (r.statut === "En attente") { data.en_attente = r.total; montants.en_attente = Number(r.montant); }
      if (r.statut === "Annulée")    { data.annulee    = r.total; montants.annulee    = Number(r.montant); }
    });

    res.json({ success: true, data, montants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/admin/reports/export?format=csv|xlsx|pdf&type=sales|clients|products&from=&to=
// Export des données en CSV, Excel ou PDF
// ─────────────────────────────────────────────────────────────────────────
router.get("/reports/export", async (req, res) => {
  const { format = "csv", type = "sales", from = "2000-01-01", to = "2100-12-31" } = req.query;

  try {
    let rows = [];
    let headers = [];
    let title = "";
    let filename = "export";

    if (type === "sales") {
      [rows] = await pool.query(
        `SELECT c.id AS commande_id, u.nom, u.prenom, u.email, c.date_commande, c.total, c.statut
         FROM commandes c
         INNER JOIN utilisateurs u ON u.id = c.utilisateur_id
         WHERE c.date_commande BETWEEN ? AND ?
         ORDER BY c.date_commande DESC`,
        [from, to]
      );
      headers = [
        { key: "commande_id", label: "N° commande" },
        { key: "nom", label: "Nom" },
        { key: "prenom", label: "Prénom" },
        { key: "email", label: "Email" },
        { key: "date_commande", label: "Date" },
        { key: "total", label: "Total (MAD)" },
        { key: "statut", label: "Statut" },
      ];
      title = "Rapport des ventes";
      filename = "rapport_ventes";
    } else if (type === "clients") {
      [rows] = await pool.query(
        `SELECT nom, prenom, email, nomLabo, ville, telephone, statut, created_at
         FROM utilisateurs
         WHERE role = 'Client' AND created_at BETWEEN ? AND ?
         ORDER BY created_at DESC`,
        [from, to]
      );
      headers = [
        { key: "nom", label: "Nom" },
        { key: "prenom", label: "Prénom" },
        { key: "email", label: "Email" },
        { key: "nomLabo", label: "Laboratoire" },
        { key: "ville", label: "Ville" },
        { key: "telephone", label: "Téléphone" },
        { key: "statut", label: "Statut" },
        { key: "created_at", label: "Date d'inscription" },
      ];
      title = "Rapport des clients";
      filename = "rapport_clients";
    } else if (type === "products") {
      [rows] = await pool.query(
        `SELECT nom, marque, reference, prix, stock, statut, created_at
         FROM produits
         ORDER BY nom ASC`
      );
      headers = [
        { key: "nom", label: "Nom" },
        { key: "marque", label: "Marque" },
        { key: "reference", label: "Référence" },
        { key: "prix", label: "Prix (MAD)" },
        { key: "stock", label: "Stock" },
        { key: "statut", label: "Catégorie" },
        { key: "created_at", label: "Date d'ajout" },
      ];
      title = "Rapport des produits";
      filename = "rapport_produits";
    } else {
      return res.status(400).json({ success: false, message: "Type de rapport invalide" });
    }

    // Formatage des valeurs (dates, statuts, montants)
    function formatValue(key, val) {
      if (val === null || val === undefined) return "";
      if (key === "statut" && (val === 0 || val === 1)) return val === 0 ? "Client validé" : "En attente";
      if (key === "date_commande" || key === "created_at") {
        return new Date(val).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
      }
      if (key === "total" || key === "prix") return Number(val).toLocaleString("fr-FR");
      return val;
    }

    // ─── CSV ────────────────────────────────────────────────────────────────
    if (format === "csv") {
      const csvLines = [headers.map((h) => h.label).join(",")];
      rows.forEach((row) => {
        const line = headers.map((h) => {
          const val = formatValue(h.key, row[h.key]);
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(",");
        csvLines.push(line);
      });
      const csvContent = "\uFEFF" + csvLines.join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}_${Date.now()}.csv"`);
      return res.send(csvContent);
    }

    // ─── EXCEL (.xlsx) ────────────────────────────────────────────────────
    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Gestion Laboratoire";
      workbook.created = new Date();

      const sheet = workbook.addWorksheet(title.substring(0, 31));

      sheet.columns = headers.map((h) => ({ header: h.label, key: h.key, width: 20 }));

      // Style de l'en-tête (thème bordeaux)
      sheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7A1F30" } };
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });
      sheet.getRow(1).height = 22;

      rows.forEach((row) => {
        const rowData = {};
        headers.forEach((h) => { rowData[h.key] = formatValue(h.key, row[h.key]); });
        sheet.addRow(rowData);
      });

      // Bordures légères
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = { bottom: { style: "thin", color: { argb: "FFE7DCD9" } } };
        });
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${filename}_${Date.now()}.xlsx"`);

      await workbook.xlsx.write(res);
      return res.end();
    }

    // ─── PDF ────────────────────────────────────────────────────────────────
    if (format === "pdf") {
      const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}_${Date.now()}.pdf"`);
      doc.pipe(res);

      // En-tête du document
      doc.fillColor("#4E0F1D").fontSize(18).font("Helvetica-Bold").text(title, { align: "left" });
      doc.fillColor("#5C3A40").fontSize(9).font("Helvetica")
        .text(`Période : ${from} au ${to}  •  Généré le ${new Date().toLocaleDateString("fr-FR")}`);
      doc.moveDown(1);

      const startX = doc.x;
      let y = doc.y;
      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const colWidth = pageWidth / headers.length;
      const rowHeight = 20;

      // En-tête tableau
      doc.rect(startX, y, pageWidth, rowHeight).fill("#7A1F30");
      doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold");
      headers.forEach((h, i) => {
        doc.text(h.label, startX + i * colWidth + 4, y + 6, { width: colWidth - 8 });
      });
      y += rowHeight;

      // Lignes du tableau
      doc.font("Helvetica").fontSize(8);
      rows.forEach((row, idx) => {
        if (y > doc.page.height - doc.page.margins.bottom - rowHeight) {
          doc.addPage({ margin: 40, size: "A4", layout: "landscape" });
          y = doc.page.margins.top;
        }

        if (idx % 2 === 0) {
          doc.rect(startX, y, pageWidth, rowHeight).fill("#FDF8F6");
        }
        doc.fillColor("#241014");

        headers.forEach((h, i) => {
          const val = String(formatValue(h.key, row[h.key]));
          doc.text(val, startX + i * colWidth + 4, y + 6, { width: colWidth - 8, ellipsis: true });
        });
        y += rowHeight;
      });

      doc.end();
      return;
    }

    return res.status(400).json({ success: false, message: "Format non supporté" });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Erreur lors de l'export" });
    }
  }
});

module.exports = router;