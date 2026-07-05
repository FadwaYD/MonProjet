const fs           = require("fs");
const path         = require("path");
const pool         = require("../../db");
const PDFDocument  = require("pdfkit");
const nodemailer   = require("nodemailer");

const STATUTS_VALIDES = ["En attente", "Confirmée", "Annulée"];
const fail = (res, code, msg) => res.status(code).json({ success: false, message: msg });

// ─── Emplacement du logo (à côté de ce fichier ; changez si besoin) ────────────
const LOGO_PATH = path.join(__dirname, "logo.png");

// ─── Transporteur email (à configurer via .env) ────────────────────────────────
// SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ─── Palette noir / blanc, façon devis papier classique ────────────────────────
const C = {
  ink:    "#000000",
  gray:   "#4A4A4A",
  light:  "#F4F4F4",
  line:   "#000000",
};

const TYPES_AVEC_PEREMPTION = ["Réactif", "Consommable"];

// ─── Infos de l'émetteur (à ajuster selon le labo) ─────────────────────────────
const EMETTEUR = {
  nom: "GRAND LABORATOIRE",
  adresse: "Résidence Oum El Koraa, Rue de lille, RDC N° 46",
  telephone: "0522 44 17 83",
  telephone2: "0661 51 46 73",
  fax: "0522 30 88 55",
  ville: "Casablanca",
  capital: "800 000,00 Dhs",
  rc: "73377",
  patente: "32503929",
  if: "01621471",
  cnss: "2350487",
  banque: "AttijariWafa Bank Agence Dakar Casa",
  rib: "007.780.0000.105000001314 58",
  ice: "000527835000083",
};

// ─── Référence du devis, format D + année (2 chiffres) + n° sur 6 chiffres ─────
const refDevis = (id) => {
  const annee = new Date().getFullYear().toString().slice(-2);
  return `D${annee}${String(id).padStart(6, "0")}`;
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";
const fmtDateCourte = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
const fmtMontant = (v) =>
  v == null ? "—" : Number(v).toLocaleString("fr-MA", { minimumFractionDigits: 2 });
const fullName = (nom, prenom) => [prenom, nom].filter(Boolean).join(" ") || "—";
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// ─── Conversion d'un montant en toutes lettres (français), pour la mention
//     "Arrêtée le présent Devis à la somme de : ... Dirham, ... Centimes" ──────
function nombreEnLettres(n) {
  const unites = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
    "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const dizainesMots = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt"];

  function moinsDeCent(nb) {
    if (nb < 20) return unites[nb];
    const d = Math.floor(nb / 10);
    const u = nb % 10;
    if (d === 7 || d === 9) {
      // 70-79 : "soixante et onze" (seule exception avec "et"), sinon soixante-douze, -treize...
      // 90-99 : quatre-vingt-dix, quatre-vingt-onze... (jamais de "et")
      if (d === 7 && u === 1) return "soixante et onze";
      return dizainesMots[d] + "-" + unites[10 + u];
    }
    if (d === 8) {
      return u === 0 ? "quatre-vingts" : "quatre-vingt-" + unites[u];
    }
    if (u === 0) return dizainesMots[d];
    if (u === 1) return dizainesMots[d] + " et un";
    return dizainesMots[d] + "-" + unites[u];
  }

  function moinsDeMille(nb) {
    if (nb === 0) return "";
    const centaines = Math.floor(nb / 100);
    const reste = nb % 100;
    let mots = "";
    if (centaines > 0) {
      mots += (centaines > 1 ? unites[centaines] + " cent" : "cent") + (centaines > 1 && reste === 0 ? "s" : "");
      if (reste > 0) mots += " ";
    }
    if (reste > 0) mots += moinsDeCent(reste);
    return mots;
  }

  if (n === 0) return "zéro";

  let mots = "";
  const millions = Math.floor(n / 1000000);
  const milliers = Math.floor((n % 1000000) / 1000);
  const reste = n % 1000;

  if (millions > 0) mots += (millions > 1 ? moinsDeMille(millions) + " millions " : "un million ");
  if (milliers > 0) mots += (milliers > 1 ? moinsDeMille(milliers) + " mille " : "mille ");
  if (reste > 0) mots += moinsDeMille(reste);

  return mots.trim();
}

function montantEnLettres(montant) {
  const entier = Math.floor(Math.round(montant * 100) / 100);
  const centimes = Math.round((montant - entier) * 100);
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  let texte = capitalize(nombreEnLettres(entier)) + " Dirham";
  texte += centimes > 0 ? `, ${capitalize(nombreEnLettres(centimes))} Centimes` : ", Zéro Centime";
  return texte;
}

// ─── Génère le PDF stylé du devis en mémoire (Buffer) — reproduit la mise en
//     page papier classique (cadres, tableau grillagé, totaux, montant en
//     lettres, mentions légales) — tenu sur UNE seule page, la hauteur des
//     lignes s'ajuste automatiquement au nombre de produits. ──────────────────
// cmd    : { id, date_commande, total, statut, client_nom, client_prenom, client_email,
//            client_telephone, laboratoire, client_ville, client_ice, utilisateur_id }
// lignes : [{ id, quantite, prix_unitaire, remise, produit_nom, produit_marque,
//             produit_reference, produit_type }]
// datesPeremption : { [ligneId]: 'YYYY-MM-DD' } — fourni par le front, jamais lu/écrit en base
function genererPdfDevis(cmd, lignes, datesPeremption = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 36, autoFirstPage: true });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth  = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const pageHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;
      const left = doc.page.margins.left;

      // Recalcul du sous-total HT par ligne
      const lignesCalc = lignes.map((l) => ({
        ...l,
        sous_total: Math.round(l.quantite * l.prix_unitaire * (1 - (Number(l.remise) || 0) / 100) * 100) / 100,
      }));

      const totalHT  = Math.round(lignesCalc.reduce((s, l) => s + l.sous_total, 0) * 100) / 100;
      const tauxTVA  = 20;
      const totalTVA = Math.round(totalHT * (tauxTVA / 100) * 100) / 100;
      const totalTTC = Math.round((totalHT + totalTVA) * 100) / 100;

      const CM = 28.35; // 1 cm en points, pour un espacement précis

      const HEADER_H       = 100; // + d'espace entre la date d'émission et la ligne de séparation
      const GAP_1          = 26;  // décale les cartes un peu plus bas sous le header
      const INFO_H         = 84;
      const GAP_2          = 2 * CM; // 2 cm fixes entre les cartes et le tableau
      const TABLE_HEADER_H = 22;
      const GAP_3          = 10;
      const TOTAL_H        = 34;
      const GAP_4          = 10;
      const LETTRES_H      = 30;
      const GAP_5          = 14;
      const FOOTER_H       = 48;

      // Bloc fixe du haut (logo/titre + cadres devis/objet/client)
      const topBlockH = HEADER_H + GAP_1 + INFO_H;
      // Le footer est ancré en bas de page, quel que soit le contenu au-dessus
      const footerY = pageHeight - FOOTER_H;

      // Le tableau démarre à un point fixe : 2 cm sous les cartes (GAP_2).
      // On centre ensuite verticalement le reste (tableau + totaux + montant
      // en lettres) dans l'espace restant jusqu'au footer.
      const middleTop       = topBlockH + GAP_2;
      const middleAvailable = Math.max(footerY - GAP_5 - middleTop, 0);
      const fixedMiddleH    = TABLE_HEADER_H + GAP_3 + TOTAL_H + GAP_4 + LETTRES_H;
      const availableForRows = Math.max(middleAvailable - fixedMiddleH, 60);

      const rowH = lignesCalc.length > 0 ? clamp(availableForRows / lignesCalc.length, 16, 34) : 24;
      const rowFont = rowH < 20 ? 7.5 : rowH < 26 ? 8.5 : 9.5;

      let y = 0;
      y = drawHeader(doc, cmd, left, pageWidth, HEADER_H);
      y += GAP_1;
      y = drawInfoBlock(doc, cmd, left, pageWidth, y, INFO_H);
      y += GAP_2; // 2 cm fixes avant le tableau
      y = drawProductsTable(doc, lignesCalc, datesPeremption, left, pageWidth, y, rowH, rowFont, TABLE_HEADER_H);
      y += GAP_3;
      y = drawTotal(doc, { totalHT, tauxTVA, totalTVA, totalTTC }, left, pageWidth, y, TOTAL_H);
      y += GAP_4;
      drawMontantLettres(doc, totalTTC, left, pageWidth, y, LETTRES_H);

      // Footer toujours collé en bas de la page
      drawFooterNote(doc, left, pageWidth, footerY);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ─── En-tête : logo + nom du labo en grand, date d'émission en haut à droite ──
function drawHeader(doc, cmd, left, pageWidth, h) {
  const logoSize = 62;
  const logoX = left, logoY = 4;

  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, logoX, logoY, { width: logoSize, height: logoSize });
  } else {
    doc.lineWidth(3).circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2).stroke(C.ink);
    doc.font("Helvetica-Bold").fontSize(26).fillColor(C.ink)
      .text("GL", logoX, logoY + logoSize / 2 - 14, { width: logoSize, align: "center" });
  }

  doc.font("Helvetica-Bold").fontSize(30).fillColor(C.ink)
    .text(EMETTEUR.nom, logoX + logoSize + 16, logoY + 14, { characterSpacing: 0.5 });

  doc.font("Helvetica").fontSize(9).fillColor(C.ink)
    .text(`${EMETTEUR.ville} le  ${fmtDateCourte(new Date())}`, left, logoY + logoSize + 6, {
      width: pageWidth, align: "right",
    });

  doc.moveTo(left, h).lineTo(left + pageWidth, h).lineWidth(1).stroke(C.line);
  return h;
}

// ─── Bloc "DEVIS N° / Objet" à gauche, bloc client à droite, dans des cadres ──
function drawInfoBlock(doc, cmd, left, pageWidth, startY, h) {
  const leftColW = pageWidth * 0.42;
  const gap = 14;
  const rightColW = pageWidth - leftColW - gap;
  const rightX = left + leftColW + gap;

  // Cadre "DEVIS N°"
  const devisH = 30;
  doc.roundedRect(left, startY, leftColW, devisH, 4).lineWidth(1).stroke(C.ink);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.ink)
    .text("DEVIS N° :", left + 14, startY + 10);
  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.ink)
    .text(refDevis(cmd.id), left, startY + 10, { width: leftColW - 14, align: "right" });

  // Cadre "Objet"
  const objetY = startY + devisH + 10;
  const objetH = h - devisH - 10;
  doc.roundedRect(left, objetY, leftColW, objetH, 4).lineWidth(1).stroke(C.ink);
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.ink)
    .text("Objet :", left + 14, objetY + 10);
  doc.font("Helvetica").fontSize(9).fillColor(C.ink)
    .text(cmd.objet || "", left + 70, objetY + 10, { width: leftColW - 84 });

  // Cadre client (à droite, sur toute la hauteur)
  doc.roundedRect(rightX, startY, rightColW, h, 4).lineWidth(1).stroke(C.ink);
  let cy = startY + 10;
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.ink)
    .text(`Code Client N° : ${cmd.utilisateur_id ?? "—"}`, rightX, cy, { width: rightColW, align: "center" });
  cy += 14;
  doc.font("Helvetica-Bold").fontSize(10).fillColor(C.ink)
    .text((cmd.laboratoire || fullName(cmd.client_nom, cmd.client_prenom)).toUpperCase(), rightX, cy, {
      width: rightColW, align: "center",
    });
  cy += 13;
  if (cmd.client_ville && cmd.client_ville !== (cmd.laboratoire || "")) {
    doc.font("Helvetica").fontSize(9).fillColor(C.ink)
      .text(cmd.client_ville.toUpperCase(), rightX, cy, { width: rightColW, align: "center" });
    cy += 13;
  }
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.ink)
    .text((cmd.client_ville || "").toUpperCase(), rightX, startY + h - 16, { width: rightColW, align: "center" });

  return startY + h;
}

// ─── Tableau des produits, grillagé (cadres sur chaque cellule) ───────────────
function drawProductsTable(doc, lignes, datesPeremption, left, pageWidth, startY, rowH, rowFont, headerH) {
  const cols = [
    { key: "ref", label: "Référence", w: 0.15 },
    { key: "produit", label: "Désignation", w: 0.37 },
    { key: "qte", label: "Qté", w: 0.08, align: "center" },
    { key: "prix", label: "P.U HT", w: 0.13, align: "right" },
    { key: "remise", label: "R%", w: 0.09, align: "center" },
    { key: "total", label: "Montant HT", w: 0.18, align: "right" },
  ].map((c) => ({ ...c, w: c.w * pageWidth }));

  let y = startY;
  const tableBottom0 = y;

  // En-tête
  doc.lineWidth(1).rect(left, y, pageWidth, headerH).stroke(C.ink);
  let x = left;
  cols.forEach((c) => {
    if (x > left) doc.moveTo(x, y).lineTo(x, y + headerH).lineWidth(1).stroke(C.ink);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.ink)
      .text(c.label, x + 6, y + 6, { width: c.w - 12, align: c.align || "left" });
    x += c.w;
  });
  y += headerH;

  lignes.forEach((l) => {
    x = left;
    const cellY = y + Math.max((rowH - rowFont) / 2 - 1, 3);

    doc.rect(left, y, pageWidth, rowH).lineWidth(0.75).stroke(C.ink);
    cols.forEach((c) => {
      if (x > left) doc.moveTo(x, y).lineTo(x, y + rowH).lineWidth(0.5).stroke(C.ink);
      x += c.w;
    });

    x = left;
    doc.font("Courier").fontSize(rowFont - 0.5).fillColor(C.ink)
      .text(l.produit_reference || "—", x + 6, cellY, { width: cols[0].w - 12, ellipsis: true });
    x += cols[0].w;

    const ddp = TYPES_AVEC_PEREMPTION.includes(l.produit_type) && datesPeremption[l.id]
      ? `   ${fmtDateCourte(datesPeremption[l.id])}` : "";
    doc.font("Helvetica").fontSize(rowFont).fillColor(C.ink)
      .text(`${l.produit_nom || "—"}${ddp}`, x + 6, cellY, { width: cols[1].w - 12, ellipsis: true });
    x += cols[1].w;

    doc.font("Helvetica").fontSize(rowFont).fillColor(C.ink)
      .text(String(l.quantite), x, cellY, { width: cols[2].w, align: "center" });
    x += cols[2].w;

    doc.font("Helvetica").fontSize(rowFont).fillColor(C.ink)
      .text(fmtMontant(l.prix_unitaire), x, cellY, { width: cols[3].w - 8, align: "right" });
    x += cols[3].w;

    doc.font("Helvetica").fontSize(rowFont).fillColor(C.ink)
      .text(Number(l.remise) > 0 ? `${l.remise}%` : "", x, cellY, { width: cols[4].w, align: "center" });
    x += cols[4].w;

    doc.font("Helvetica-Bold").fontSize(rowFont).fillColor(C.ink)
      .text(fmtMontant(l.sous_total), x, cellY, { width: cols[5].w - 8, align: "right" });

    y += rowH;
  });

  // Contour extérieur du tableau
  doc.rect(left, tableBottom0, pageWidth, y - tableBottom0).lineWidth(1).stroke(C.ink);

  return y;
}

// ─── Ligne de totaux : H.T / TVA / Mt TVA / Total TTC ─────────────────────────
function drawTotal(doc, totaux, left, pageWidth, startY, h) {
  const cols = [
    { label: "H.T", value: fmtMontant(totaux.totalHT) },
    { label: "TVA", value: `${totaux.tauxTVA.toFixed(2)}%` },
    { label: "Mt TVA", value: fmtMontant(totaux.totalTVA) },
    { label: "Total TTC", value: `${fmtMontant(totaux.totalTTC)} MAD` },
  ];
  const colW = pageWidth / cols.length;
  const headerH = h / 2;

  doc.rect(left, startY, pageWidth, h).lineWidth(1).stroke(C.ink);
  doc.moveTo(left, startY + headerH).lineTo(left + pageWidth, startY + headerH).lineWidth(1).stroke(C.ink);

  cols.forEach((c, i) => {
    const x = left + i * colW;
    if (i > 0) doc.moveTo(x, startY).lineTo(x, startY + h).lineWidth(1).stroke(C.ink);

    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.ink)
      .text(c.label, x, startY + 6, { width: colW, align: "center" });
    doc.font(i === cols.length - 1 ? "Helvetica-Bold" : "Helvetica").fontSize(i === cols.length - 1 ? 11 : 9.5)
      .fillColor(C.ink)
      .text(c.value, x, startY + headerH + 6, { width: colW, align: "center" });
  });

  return startY + h;
}

// ─── Mention "Arrêtée le présent Devis à la somme de : ..." ───────────────────
function drawMontantLettres(doc, totalTTC, left, pageWidth, startY, h) {
  doc.font("Helvetica-Bold").fontSize(9).fillColor(C.ink)
    .text(`Arrêtée le présent Devis à la somme de : ${montantEnLettres(totalTTC)}`, left, startY, {
      width: pageWidth,
    });
  return startY + h;
}

// ─── Pied de page : mentions légales du laboratoire ────────────────────────────
function drawFooterNote(doc, left, pageWidth, y) {
  doc.moveTo(left, y).lineTo(left + pageWidth, y).lineWidth(0.75).stroke(C.ink);
  y += 8;

  const lignesFooter = [
    `${EMETTEUR.adresse} - Tel: ${EMETTEUR.telephone} - ${EMETTEUR.telephone2} - Fax: ${EMETTEUR.fax} ${EMETTEUR.ville}`,
    `S.A.R.L Au Capital de ${EMETTEUR.capital} - RC : ${EMETTEUR.rc} - Patente : ${EMETTEUR.patente} - IF : ${EMETTEUR.if} - CNSS : ${EMETTEUR.cnss}`,
    `Cpte Bancaire ${EMETTEUR.banque} ${EMETTEUR.rib}`,
    `ICE N° : ${EMETTEUR.ice}`,
  ];

  lignesFooter.forEach((ligne) => {
    doc.font("Helvetica").fontSize(7).fillColor(C.gray)
      .text(ligne, left, y, { width: pageWidth, align: "center" });
    y += 9;
  });
}

// ─── Envoie le PDF par email au client ─────────────────────────────────────────
async function envoyerEmailDevis(destinataire, cmd, pdfBuffer) {
  const ref = refDevis(cmd.id);
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: destinataire,
    subject: `Votre devis ${ref} — Grand Laboratoire`,
    text:
      `Bonjour ${cmd.client_prenom},\n\n` +
      `Votre devis ${ref} a bien été confirmé. Vous trouverez le détail en pièce jointe (PDF).\n\n` +
      `Cordialement,\nL'équipe du laboratoire`,
    attachments: [
      {
        filename: `devis-${ref}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}

// ─── Vérifie si un client a le droit de passer commande ────────────────────────
// Règle métier (telle que demandée) :
//   utilisateurs.statut = 0  ->  autorisé à commander
//   utilisateurs.statut = 1  ->  refusé
async function clientPeutCommander(utilisateurId) {
  const [[user]] = await pool.execute(
    "SELECT id, statut FROM utilisateurs WHERE id = ?",
    [utilisateurId]
  );
  if (!user) return { autorise: false, code: 404, raison: "Utilisateur introuvable" };
  if (Number(user.statut) === 1) {
    return {
      autorise: false,
      code: 403,
      raison: "Votre compte n'est pas autorisé à passer commande pour le moment.",
    };
  }
  return { autorise: true };
}

// GET /api/commandes
exports.getAll = async (req, res) => {
  try {
    const { statut } = req.query;

    let sql = `
      SELECT
        c.id,
        c.utilisateur_id,
        c.date_commande,
        c.total,
        c.statut,

        u.nom        AS client_nom,
        u.prenom     AS client_prenom,
        u.email      AS client_email,
        u.telephone  AS client_telephone,
        u.nomLabo    AS laboratoire,
        u.ville      AS client_ville,
        u.ice        AS client_ice,

        COUNT(dc.id) AS nb_produits,

        GROUP_CONCAT(
          CONCAT(p.nom, ' × ', dc.quantite)
          ORDER BY dc.id
          SEPARATOR ' | '
        ) AS produits_resume

      FROM commandes c
      JOIN utilisateurs u ON u.id = c.utilisateur_id
      LEFT JOIN details_commande dc ON dc.commande_id = c.id
      LEFT JOIN produits p ON p.id = dc.produit_id
    `;

    const params = [];
    if (statut && statut !== "Tous") {
      sql += " WHERE c.statut = ?";
      params.push(statut);
    }
    sql += " GROUP BY c.id ORDER BY c.date_commande DESC";

    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
};

// GET /api/commandes/stats/resume
exports.getStats = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT statut, COUNT(*) AS total FROM commandes GROUP BY statut"
    );
    const stats = { Tous: 0 };
    for (const r of rows) {
      stats[r.statut] = Number(r.total);
      stats.Tous += Number(r.total);
    }
    res.json({ success: true, data: stats });
  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
};

// GET /api/commandes/:id
exports.getOne = async (req, res) => {
  try {
    const [[cmd]] = await pool.execute(
      `SELECT
        c.id, c.utilisateur_id, c.date_commande, c.total, c.statut,
        u.nom AS client_nom, u.prenom AS client_prenom,
        u.email AS client_email, u.telephone AS client_telephone,
        u.nomLabo AS laboratoire, u.ville AS client_ville, u.ice AS client_ice
       FROM commandes c
       JOIN utilisateurs u ON u.id = c.utilisateur_id
       WHERE c.id = ?`,
      [req.params.id]
    );
    if (!cmd) return fail(res, 404, "Commande introuvable");

    const [lignes] = await pool.execute(
      `SELECT
        dc.id, dc.quantite,
        dc.prix                                                    AS prix_unitaire,
        dc.remise,
        ROUND(dc.quantite * dc.prix * (1 - dc.remise / 100), 2)   AS sous_total,
        p.id        AS produit_id,
        p.nom       AS produit_nom,
        p.marque    AS produit_marque,
        p.reference AS produit_reference,
        p.statut    AS produit_type,
        p.image     AS produit_image
       FROM details_commande dc
       JOIN produits p ON p.id = dc.produit_id
       WHERE dc.commande_id = ?
       ORDER BY dc.id`,
      [req.params.id]
    );

    res.json({ success: true, data: { ...cmd, lignes } });
  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
};

// POST /api/commandes
// Body attendu : { utilisateur_id, lignes: [{ produit_id, quantite, prix, remise }] }
// Applique la règle d'accès : utilisateurs.statut = 0 -> autorisé | statut = 1 -> refusé
exports.create = async (req, res) => {
  const { utilisateur_id, lignes } = req.body || {};

  if (!utilisateur_id) return fail(res, 400, "Champ requis : utilisateur_id");
  if (!Array.isArray(lignes) || lignes.length === 0)
    return fail(res, 400, "La commande doit contenir au moins une ligne (lignes[])");

  const acces = await clientPeutCommander(utilisateur_id);
  if (!acces.autorise) return fail(res, acces.code, acces.raison);

  for (const l of lignes) {
    const qte    = Number(l.quantite);
    const prix   = Number(l.prix);
    const remise = Number(l.remise || 0);
    if (!l.produit_id) return fail(res, 400, "Chaque ligne doit avoir un produit_id");
    if (!Number.isFinite(qte)    || qte    < 1)   return fail(res, 400, "Quantité invalide (min 1)");
    if (!Number.isFinite(prix)   || prix   < 0)   return fail(res, 400, "Prix invalide (≥ 0)");
    if (!Number.isFinite(remise) || remise < 0 || remise > 100)
      return fail(res, 400, "Remise invalide (0–100)");
  }

  const total = lignes.reduce((sum, l) => {
    const qte    = Number(l.quantite);
    const prix   = Number(l.prix);
    const remise = Number(l.remise || 0);
    return sum + qte * prix * (1 - remise / 100);
  }, 0);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      "INSERT INTO commandes (utilisateur_id, total, statut) VALUES (?, ?, 'En attente')",
      [utilisateur_id, Math.round(total * 100) / 100]
    );
    const commandeId = result.insertId;

    for (const l of lignes) {
      await conn.execute(
        "INSERT INTO details_commande (commande_id, produit_id, quantite, prix, remise) VALUES (?, ?, ?, ?, ?)",
        [commandeId, l.produit_id, Number(l.quantite), Number(l.prix), Number(l.remise || 0)]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, data: { id: commandeId } });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    fail(res, 500, "Erreur serveur lors de la création de la commande");
  } finally {
    conn.release();
  }
};

// PATCH /api/commandes/lignes/:id
exports.updateLigne = async (req, res) => {
  try {
    const ligneId = req.params.id;
    const { quantite, prix, remise } = req.body;

    if (quantite == null || prix == null || remise == null)
      return fail(res, 400, "Champs requis : quantite, prix, remise");

    const qte     = Number(quantite);
    const prixU   = Number(prix);
    const remiseP = Number(remise);

    if (!Number.isFinite(qte)     || qte    < 1)    return fail(res, 400, "Quantité invalide (min 1)");
    if (!Number.isFinite(prixU)   || prixU  < 0)    return fail(res, 400, "Prix invalide (≥ 0)");
    if (!Number.isFinite(remiseP) || remiseP < 0 || remiseP > 100)
      return fail(res, 400, "Remise invalide (0–100)");

    const [[ligne]] = await pool.execute(
      "SELECT id, commande_id FROM details_commande WHERE id = ?",
      [ligneId]
    );
    if (!ligne) return fail(res, 404, "Ligne introuvable");

    await pool.execute(
      "UPDATE details_commande SET quantite = ?, prix = ?, remise = ? WHERE id = ?",
      [qte, prixU, remiseP, ligneId]
    );

    await pool.execute(
      `UPDATE commandes
          SET total = (
            SELECT ROUND(SUM(dc.quantite * dc.prix * (1 - dc.remise / 100)), 2)
              FROM details_commande dc WHERE dc.commande_id = ?
          )
        WHERE id = ?`,
      [ligne.commande_id, ligne.commande_id]
    );

    res.json({ success: true, message: "Ligne mise à jour avec succès." });
  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
};

// PATCH /api/commandes/:id/statut
exports.updateStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    if (!STATUTS_VALIDES.includes(statut))
      return fail(res, 400, `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(", ")}`);

    const [r] = await pool.execute(
      "UPDATE commandes SET statut = ? WHERE id = ?",
      [statut, req.params.id]
    );
    if (r.affectedRows === 0) return fail(res, 404, "Commande introuvable");

    res.json({ success: true, message: "Statut mis à jour avec succès." });
  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
};

// PATCH /api/commandes/:id/confirmer
// Génère le PDF stylé du devis (mise en page façon facture papier, une seule
// page) avec les dates de péremption transmises par le front (jamais
// persistées en base), l'envoie par email au client, puis passe le statut
// à "Confirmée".
exports.confirmerEtEnvoyer = async (req, res) => {
  try {
    const id = req.params.id;
    const { datesPeremption } = req.body || {};

    const [[cmd]] = await pool.execute(
      `SELECT
        c.id, c.utilisateur_id, c.date_commande, c.total, c.statut,
        u.nom AS client_nom, u.prenom AS client_prenom,
        u.email AS client_email, u.telephone AS client_telephone,
        u.nomLabo AS laboratoire, u.ville AS client_ville, u.ice AS client_ice
       FROM commandes c
       JOIN utilisateurs u ON u.id = c.utilisateur_id
       WHERE c.id = ?`,
      [id]
    );
    if (!cmd) return fail(res, 404, "Commande introuvable");

    const [lignes] = await pool.execute(
      `SELECT
        dc.id, dc.quantite,
        dc.prix     AS prix_unitaire,
        dc.remise,
        p.nom       AS produit_nom,
        p.marque    AS produit_marque,
        p.reference AS produit_reference,
        p.statut    AS produit_type
       FROM details_commande dc
       JOIN produits p ON p.id = dc.produit_id
       WHERE dc.commande_id = ?
       ORDER BY dc.id`,
      [id]
    );

    let pdfBuffer;
    try {
      pdfBuffer = await genererPdfDevis(cmd, lignes, datesPeremption || {});
    } catch (e) {
      console.error("Erreur génération PDF :", e);
      return fail(res, 500, "Erreur lors de la génération du PDF");
    }

    try {
      await envoyerEmailDevis(cmd.client_email, cmd, pdfBuffer);
    } catch (e) {
      console.error("Erreur envoi email :", e);
      return fail(res, 500, "Le PDF a été généré mais l'email n'a pas pu être envoyé");
    }

    const [r] = await pool.execute(
      "UPDATE commandes SET statut = 'Confirmée' WHERE id = ?",
      [id]
    );
    if (r.affectedRows === 0) return fail(res, 404, "Commande introuvable");

    res.json({ success: true, message: "Devis confirmé et envoyé par email au client." });
  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
};

// DELETE /api/commandes/:id
exports.remove = async (req, res) => {
  try {
    const [r] = await pool.execute("DELETE FROM commandes WHERE id = ?", [req.params.id]);
    if (r.affectedRows === 0) return fail(res, 404, "Commande introuvable");
    res.json({ success: true, message: "Commande supprimée." });
  } catch (e) {
    console.error(e);
    fail(res, 500, "Erreur serveur");
  }
};