/**
 * generateDevisPDF.js
 * ─────────────────────────────────────────────────────────────────────────
 * Génération du PDF de devis pour "Grand Laboratoire".
 * Thème : bordeaux (#7B1818) / gris — logo GL intégré — tenu sur UNE seule page
 * (la hauteur des lignes du tableau s'ajuste automatiquement au nombre de
 * produits, aucune pagination automatique n'est déclenchée).
 *
 * Compatible avec le schéma exact `gestion_laboratoire` :
 *   utilisateurs      : id, ice, nom, prenom, nomLabo, email, telephone, role …
 *   produits          : id, nom, marque, reference, prix, stock, image, statut …
 *   commandes         : id, utilisateur_id, date_commande, total, statut
 *   details_commande  : id, commande_id, produit_id, quantite, prix, remise
 *
 * Les `datesPeremption` (Réactif / Consommable) reçues du frontend sont
 * PUREMENT déclaratives : affichées sur le PDF, jamais persistées en base.
 *
 * Dépendance : pdfkit
 *   npm install pdfkit
 *
 * Logo : placez le fichier logo.png à côté de ce script (même dossier),
 * ou changez LOGO_PATH ci-dessous.
 * ─────────────────────────────────────────────────────────────────────────
 */

const fs   = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// ── Emplacement du logo (à côté de ce fichier par défaut) ──────────────────
const LOGO_PATH = path.join(__dirname, "logo.png");

// ── Palette bordeaux / gris ─────────────────────────────────────────────────
const C = {
  ink:        "#2B2B2B", // texte principal (gris très foncé, pas noir pur)
  inkSoft:    "#5A5A5A", // texte secondaire
  paperSoft:  "#F7F5F4", // fond zébrage tableau
  white:      "#FFFFFF",
  bordeaux:      "#7B1818",
  bordeauxDark:  "#4E0F0F",
  bordeauxSoft:  "#F1E3E3",
  gris:       "#8A8A8A",
  grisSoft:   "#EDEDED",
  grisLine:   "#DCD9D8",
  line:       "#E2DFDD",
  muted:      "#9C9895",
};

// Type de produit -> couleur pastille (thème bordeaux/gris uniquement)
const BADGE_PROD = {
  "Réactif": C.bordeaux,
  "Consommable": C.gris,
  "Matériel": "#B9B6B3",
};

const TYPES_AVEC_PEREMPTION = ["Réactif", "Consommable"];

// ── Infos de l'émetteur ──────────────────────────────────────────────────────
const EMETTEUR = {
  nom: "Grand Laboratoire",
  adresse: "emile zola, Casablanca, Maroc",
  telephone: "+212 5 22 00 00 00",
  email: "gl@gmail.ma",
  ice: "0012345678900000",
  rc: "RC 123456",
  if: "IF 12345678",
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const fmtMontant = (v) =>
  v == null ? "—" : Number(v).toLocaleString("fr-MA", { minimumFractionDigits: 2 }) + " MAD";

const fullName = (nom, prenom) => [prenom, nom].filter(Boolean).join(" ") || "—";
const refDevis = (id) => `CMD-${String(id).padStart(4, "0")}`;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Génère le PDF du devis (une seule page) et résout une Promise<Buffer>.
 */
function generateDevisPDF(commande, datesPeremption = {}) {
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
      const lignes = commande.lignes || [];

      const HEADER_H       = 82;
      const GAP_1          = 10;
      const CLIENT_H       = 74;
      const GAP_2          = 12;
      const TABLE_HEADER_H = 18;
      const GAP_3          = 8;
      const TOTAL_H        = 30;
      const GAP_4          = 10;
      const FOOTER_H       = 58;

      const fixedH = HEADER_H + GAP_1 + CLIENT_H + GAP_2 + TABLE_HEADER_H + GAP_3 + TOTAL_H + GAP_4 + FOOTER_H;
      const availableForRows = Math.max(pageHeight - fixedH, 60);

      const rowH = lignes.length > 0 ? clamp(availableForRows / lignes.length, 12, 20) : 20;
      const rowFont = rowH < 15 ? 6.5 : rowH < 18 ? 7.5 : 8.5;

      let y = 0;
      y = drawHeader(doc, commande, left, pageWidth, HEADER_H);
      y += GAP_1;
      y = drawClientBlock(doc, commande, left, pageWidth, y, CLIENT_H);
      y += GAP_2;
      y = drawProductsTable(doc, lignes, datesPeremption, left, pageWidth, y, rowH, rowFont, TABLE_HEADER_H);
      y += GAP_3;
      y = drawTotal(doc, commande, left, pageWidth, y, TOTAL_H);
      y += GAP_4;
      drawFooterNote(doc, left, pageWidth, y);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function drawHeader(doc, commande, left, pageWidth, h) {
  doc.save().rect(0, 0, doc.page.width, h + 24).fill(C.bordeauxDark);

  const logoSize = 42;
  const logoX = left, logoY = 16;
  let textX = left + logoSize + 14;

  if (fs.existsSync(LOGO_PATH)) {
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 4).fill(C.white);
    doc.image(LOGO_PATH, logoX, logoY, { width: logoSize, height: logoSize });
  } else {
    doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2).fill(C.white);
    doc.font("Helvetica-Bold").fontSize(16).fillColor(C.bordeaux)
      .text("GL", logoX, logoY + 11, { width: logoSize, align: "center" });
  }

  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(18).text(EMETTEUR.nom, textX, logoY + 2);
  doc.font("Helvetica").fontSize(8).fillColor("#E9D6D6")
    .text(`${EMETTEUR.adresse}  •  ${EMETTEUR.telephone}  •  ${EMETTEUR.email}`, textX, logoY + 24);

  const boxW = 160, boxX = left + pageWidth - boxW;
  doc.roundedRect(boxX, 12, boxW, 54, 6).fill("#ffffff1f");
  doc.font("Helvetica-Bold").fontSize(8).fillColor("#E9D6D6").text("DEVIS N°", boxX + 12, 19);
  doc.font("Courier-Bold").fontSize(15).fillColor(C.white).text(refDevis(commande.id), boxX + 12, 30);
  doc.font("Helvetica").fontSize(8).fillColor("#E9D6D6").text(`Émis le ${fmtDate(new Date())}`, boxX + 12, 50);

  doc.restore();
  return h + 24;
}

function drawClientBlock(doc, commande, left, pageWidth, startY, h) {
  const colW = (pageWidth - 14) / 2;

  doc.roundedRect(left, startY, colW, h, 6).lineWidth(1).stroke(C.line);
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(C.bordeaux)
    .text("ADRESSÉ À", left + 12, startY + 9, { characterSpacing: 0.5 });
  doc.font("Helvetica-Bold").fontSize(11).fillColor(C.ink)
    .text(fullName(commande.client_nom, commande.client_prenom), left + 12, startY + 21);
  doc.font("Helvetica").fontSize(8.5).fillColor(C.inkSoft)
    .text(commande.laboratoire || "Laboratoire non renseigné", left + 12, startY + 36)
    .text([commande.client_ville, commande.client_email].filter(Boolean).join("  •  "), left + 12, startY + 48)
    .text(commande.client_telephone ? `Tél. ${commande.client_telephone}` : "", left + 12, startY + 60);

  const rightX = left + colW + 14;
  doc.roundedRect(rightX, startY, colW, h, 6).lineWidth(1).stroke(C.line);
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(C.bordeaux)
    .text("DÉTAILS DU DEVIS", rightX + 12, startY + 9, { characterSpacing: 0.5 });

  const rows = [
    ["Date", fmtDate(commande.date_commande)],
    ["Statut", commande.statut],
    ["ICE client", commande.client_ice || "Non renseigné"],
  ];
  rows.forEach(([label, value], i) => {
    const ry = startY + 24 + i * 15;
    doc.font("Helvetica").fontSize(8.5).fillColor(C.muted).text(label, rightX + 12, ry, { width: 80 });
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.ink)
      .text(value, rightX + 96, ry, { width: colW - 108, align: "right" });
  });

  return startY + h;
}

function drawProductsTable(doc, lignes, datesPeremption, left, pageWidth, startY, rowH, rowFont, headerH) {
  const cols = [
    { key: "ref", label: "Réf.", w: 0.09 },
    { key: "produit", label: "Produit", w: 0.23 },
    { key: "marque", label: "Marque", w: 0.12 },
    { key: "type", label: "Type", w: 0.11 },
    { key: "qte", label: "Qté", w: 0.06, align: "center" },
    { key: "prix", label: "Prix unit.", w: 0.11, align: "right" },
    { key: "remise", label: "Remise", w: 0.08, align: "center" },
    { key: "ddp", label: "DDP", w: 0.1, align: "center" },
    { key: "total", label: "Sous-total", w: 0.1, align: "right" },
  ].map((c) => ({ ...c, w: c.w * pageWidth }));

  let y = startY;

  doc.rect(left, y, pageWidth, headerH).fill(C.bordeauxSoft);
  let x = left;
  cols.forEach((c) => {
    doc.font("Helvetica-Bold").fontSize(7).fillColor(C.bordeauxDark)
      .text(c.label.toUpperCase(), x + 5, y + 5, { width: c.w - 10, align: c.align || "left", characterSpacing: 0.3 });
    x += c.w;
  });
  y += headerH;

  lignes.forEach((l, i) => {
    if (i % 2 === 0) doc.rect(left, y, pageWidth, rowH).fill(C.paperSoft);

    x = left;
    const cellY = y + Math.max((rowH - rowFont) / 2 - 1, 2);

    doc.font("Courier").fontSize(rowFont - 1).fillColor(C.inkSoft)
      .text(l.produit_reference || "—", x + 5, cellY, { width: cols[0].w - 10, ellipsis: true });
    x += cols[0].w;

    doc.font("Helvetica-Bold").fontSize(rowFont).fillColor(C.ink)
      .text(l.produit_nom || "—", x + 5, cellY, { width: cols[1].w - 10, ellipsis: true });
    x += cols[1].w;

    doc.font("Helvetica").fontSize(rowFont).fillColor(C.inkSoft)
      .text(l.produit_marque || "—", x + 5, cellY, { width: cols[2].w - 10, ellipsis: true });
    x += cols[2].w;

    const dotColor = BADGE_PROD[l.produit_type] || C.gris;
    doc.circle(x + 8, cellY + rowFont / 2, 2.2).fill(dotColor);
    doc.font("Helvetica").fontSize(rowFont - 0.5).fillColor(C.inkSoft)
      .text(l.produit_type || "—", x + 13, cellY, { width: cols[3].w - 18, ellipsis: true });
    x += cols[3].w;

    doc.font("Helvetica-Bold").fontSize(rowFont).fillColor(C.bordeaux)
      .text(String(l.quantite), x, cellY, { width: cols[4].w, align: "center" });
    x += cols[4].w;

    doc.font("Helvetica").fontSize(rowFont - 0.5).fillColor(C.inkSoft)
      .text(fmtMontant(l.prix_unitaire), x, cellY, { width: cols[5].w - 6, align: "right" });
    x += cols[5].w;

    doc.font("Helvetica-Bold").fontSize(rowFont - 0.5).fillColor(Number(l.remise) > 0 ? C.bordeaux : C.muted)
      .text(Number(l.remise) > 0 ? `-${l.remise}%` : "—", x, cellY, { width: cols[6].w, align: "center" });
    x += cols[6].w;

    const ddp = TYPES_AVEC_PEREMPTION.includes(l.produit_type)
      ? (datesPeremption[l.id] ? fmtDate(datesPeremption[l.id]) : "Non préc.")
      : "N/A";
    doc.font("Helvetica").fontSize(rowFont - 1.5).fillColor(TYPES_AVEC_PEREMPTION.includes(l.produit_type) ? C.bordeaux : C.muted)
      .text(ddp, x, cellY, { width: cols[7].w - 6, align: "center", ellipsis: true });
    x += cols[7].w;

    doc.font("Helvetica-Bold").fontSize(rowFont).fillColor(C.ink)
      .text(fmtMontant(l.sous_total), x, cellY, { width: cols[8].w - 6, align: "right" });

    y += rowH;
    doc.moveTo(left, y).lineTo(left + pageWidth, y).lineWidth(0.4).stroke(C.line);
  });

  return y;
}

function drawTotal(doc, commande, left, pageWidth, startY, h) {
  const boxW = 210, boxX = left + pageWidth - boxW;

  doc.roundedRect(boxX, startY, boxW, h, 6).fill(C.bordeauxDark);
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor(C.white).text("TOTAL", boxX + 14, startY + h / 2 - 6);
  doc.font("Helvetica-Bold").fontSize(13).fillColor(C.white)
    .text(fmtMontant(commande.total), boxX, startY + h / 2 - 7, { width: boxW - 14, align: "right" });

  return startY + h;
}

function drawFooterNote(doc, left, pageWidth, y) {
  doc.moveTo(left, y).lineTo(left + pageWidth, y).lineWidth(0.5).stroke(C.line);
  y += 8;

  doc.font("Helvetica-Bold").fontSize(7.5).fillColor(C.bordeaux).text("Conditions", left, y);
  y += 10;

  doc.font("Helvetica").fontSize(7).fillColor(C.muted).text(
    "Devis valable 30 jours à compter de la date d'émission. Les dates de péremption indiquées sont fournies " +
      "à titre indicatif et n'engagent pas la responsabilité du laboratoire au-delà de la livraison effective. " +
      "Paiement à réception de facture, sauf accord contraire.",
    left, y, { width: pageWidth, align: "justify", lineGap: 0.5 }
  );
  y += 28;

  doc.font("Helvetica").fontSize(7).fillColor(C.muted).text(
    `${EMETTEUR.nom} — ${EMETTEUR.rc} — ${EMETTEUR.if} — ICE ${EMETTEUR.ice}`,
    left, y, { width: pageWidth, align: "center" }
  );
}

module.exports = { generateDevisPDF };