/**
 * Products.jsx
 * ── Design (v3 — thème Bordeaux, aligné sur QuoteRequests.jsx) ─────────────
 * Reprend l'identité visuelle de la page "Demandes de devis" :
 *   - Palette "cave à vin" (bordeaux profond / lie-de-vin / doré cire-de-bouchon)
 *   - Typographie Space Grotesk (titres) + Inter (corps) + IBM Plex Mono (réf/chiffres)
 *   - Étiquette-échantillon RefTag pour la référence produit
 *   - Toasts au lieu des alert() natifs
 * IMPORTANT : contrairement à une version précédente, la fiche produit,
 * le formulaire d'ajout/modification et la confirmation de suppression
 * restent des POPUPS (composant <Modal>), comme dans la version d'origine —
 * seul le style (couleurs, polices, badges) a été aligné sur le thème Bordeaux.
 * Aucune logique métier (API, endpoints, champs) n'a été modifiée.
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import {
  IconBox, IconFlask, IconPlus, IconSearch,
  IconEdit as IconEditOutline, IconTrash, IconAlert, IconDownload, IconCheck, IconX,
} from "./components/Icons";

// ─── Config ───────────────────────────────────────────────────────────────────
const API = "http://localhost:4000/api/produits";
const STATUTS = ["Tous", "Réactif", "Consommable", "Matériel"];

const EMPTY_FORM = {
  reference: "",
  nom: "",
  marque: "",
  description: "",
  prix: 0,
  stock: 0,
  statut: "Réactif",
};

const COMPANY = {
  name:    "GRAND LABORATOIRE",
  address: "Résidence Oum El Koraa, Rue de Lille, RDC N° 46, Casablanca",
  tel:     "0522 44 17 83 — 0661 51 46 73",
  fax:     "0522 30 88 55",
  legal:   "S.A.R.L au capital de 800 000,00 Dhs — RC : 73377 — Patente : 32503929 — IF : 01621471 — CNSS : 2350487",
  bank:    "AttijariWafa Bank, Agence Dakar Casa — 007.780.0000.105000001314.58",
  ice:     "000527835000083",
};

// ─── Design tokens (identiques à QuoteRequests.jsx) ──────────────────────────
const FONT_DISPLAY = "'Space Grotesk', 'Inter', sans-serif";
const FONT_BODY    = "'Inter', -apple-system, sans-serif";
const FONT_MONO    = "'IBM Plex Mono', 'SFMono-Regular', monospace";

const C = {
  ink:        "#241014",
  inkSoft:    "#5C3A40",
  paper:      "#FBF3F1",
  paperSoft:  "#FDF8F6",
  white:      "#FFFFFF",
  petrol:     "#7A1F30",
  petrolDark: "#4E0F1D",
  petrolSoft: "#F4E1E5",
  petrolLine: "#E3BEC7",
  clay:       "#B8863A",
  claySoft:   "#FBEFDB",
  clayLine:   "#EAD3A4",
  sage:       "#7D6A6D",
  sageSoft:   "#EFE7E8",
  sageLine:   "#DCCBCE",
  success:    "#3A7D5C",
  successSoft:"#E3F0E9",
  successLine:"#B9DAC7",
  danger:     "#A8433D",
  dangerSoft: "#F7E7E5",
  dangerLine: "#E6BEB9",
  line:       "#E7DCD9",
  lineSoft:   "#F0E7E4",
  muted:      "#A08E90",
};

const GOOGLE_FONTS_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');";

// Type de produit -> couleur (identique à QuoteRequests)
const BADGE_PROD = {
  Réactif:     { bg: C.petrolSoft, color: "#4E0F1D", dot: C.petrol },
  Consommable: { bg: C.claySoft,   color: "#8A5423", dot: C.clay },
  Matériel:    { bg: C.sageSoft,   color: "#4B3538", dot: C.sage },
};

// État du stock -> couleur (harmonisé avec la palette bordeaux)
const BADGE_STOCK = {
  "En stock":     { bg: C.successSoft, color: "#265E43", dot: C.success },
};

// Abréviations affichées uniquement dans le tableau (n'affecte pas les valeurs réelles/API)
const STATUT_ABBR = {
  "Réactif":     "Réactif",
  "Consommable": "Consom.",
  "Matériel":    "Matériel",
};

const BORDEAUX_RGB       = [122, 31, 48];
const GRAY_RGB           = [107, 114, 128];
const LIGHT_BORDEAUX_RGB = [244, 225, 229];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrix(prix) {
  const n = Number(prix);
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(2)} DH`;
}

// ─── Icônes inline (mêmes que QuoteRequests.jsx) ─────────────────────────────
function IconArrowLeft({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function IconCopy({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

// ─── Étiquette-échantillon pour la référence produit ─────────────────────────
function RefTag({ text, tone = C.petrol, size = "md" }) {
  const big = size === "lg";
  const xs  = size === "xs";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: big ? 9 : xs ? 4 : 7,
      fontFamily: FONT_MONO, fontWeight: 600,
      fontSize: big ? 18 : xs ? 11 : 12.5, letterSpacing: ".03em",
      color: big ? C.white : tone,
      background: big ? "rgba(255,255,255,.14)" : `${tone}14`,
      border: big ? "1px solid rgba(255,255,255,.28)" : `1px solid ${tone}33`,
      borderRadius: xs ? 6 : 7,
      padding: big ? "6px 14px 6px 10px" : xs ? "2px 7px 2px 5px" : "3px 10px 3px 7px",
      whiteSpace: "nowrap",
    }}>
      <span style={{ display: "flex", gap: xs ? 1 : 1.5, alignItems: "center" }}>
        {[3, 5, 2, 4].map((h, i) => (
          <span key={i} style={{
            width: big ? 2 : 1.5, height: big ? h + 3 : xs ? Math.max(h - 1, 2) : h + 2,
            background: big ? "rgba(255,255,255,.65)" : tone, opacity: .8,
            borderRadius: 1,
          }} />
        ))}
      </span>
      {text}
    </span>
  );
}

// ─── Titre de section ─────────────────────────────────────────────────────────
function SectionTitle({ icon, label, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
      paddingBottom: 8, borderBottom: `2px solid ${C.lineSoft}`,
    }}>
      <span style={{
        fontSize: 13, width: 24, height: 24, borderRadius: 6,
        background: C.petrolSoft, color: C.petrolDark,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{icon}</span>
      <span style={{
        fontSize: 13.5, fontWeight: 700, color: C.ink, fontFamily: FONT_DISPLAY,
        textTransform: "uppercase", letterSpacing: ".04em",
      }}>{label}</span>
      {right && <span style={{ marginLeft: "auto" }}>{right}</span>}
    </div>
  );
}

function Dash() {
  return <span style={{ color: C.muted, fontSize: 12, fontStyle: "italic" }}>Non renseigné</span>;
}

// ─── UI atoms (identiques à QuoteRequests.jsx) ───────────────────────────────
function Badge({ label, map, size = "md", displayLabel }) {
  const s = map[label] || { bg: C.sageSoft, color: C.inkSoft, dot: C.muted };
  const sm = size === "sm";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: sm ? 4 : 5,
      padding: sm ? "2px 8px" : "3px 10px", borderRadius: 999,
      fontSize: sm ? 10.5 : 11.5, fontWeight: 700,
      fontFamily: FONT_BODY, background: s.bg, color: s.color, whiteSpace: "nowrap",
    }}>
      <span style={{ width: sm ? 5 : 6, height: sm ? 5 : 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {displayLabel ?? label}
    </span>
  );
}

function Btn({ variant = "ghost", onClick, disabled, children, style = {}, type = "button" }) {
  const vars = {
    primary:   { background: C.petrol, color: C.white, border: "none" },
    danger:    { background: C.danger, color: C.white, border: "none" },
    ghost:     { background: C.white,  color: C.inkSoft, border: `1.5px solid ${C.line}` },
    red_ghost: { background: C.dangerSoft, color: C.danger, border: `1.5px solid ${C.dangerLine}` },
    warning:   { background: C.clay,   color: C.white, border: "none" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600,
      fontFamily: FONT_BODY, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? .45 : 1, transition: "opacity .12s, transform .12s",
      ...vars[variant], ...style,
    }}>
      {children}
    </button>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const bg = { success: C.petrolDark, error: C.danger, info: C.clay }[toast.type] || C.inkSoft;
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: bg, color: C.white, padding: "12px 22px", borderRadius: 10,
      fontWeight: 700, fontSize: 13.5, fontFamily: FONT_BODY,
      boxShadow: "0 10px 34px rgba(0,0,0,.2)",
      display: "flex", alignItems: "center", gap: 10, animation: "toastIn .22s ease",
    }}>
      {toast.type === "success" ? "✓" : "✕"} {toast.message}
      <style>{`@keyframes toastIn{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div style={{
      background: C.paperSoft, borderRadius: 9, padding: "9px 12px",
      display: "flex", gap: 9, alignItems: "flex-start", border: `1px solid ${C.line}`,
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: C.petrolSoft, color: C.petrolDark,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 9.5, color: C.muted, fontWeight: 700, fontFamily: FONT_BODY,
          textTransform: "uppercase", letterSpacing: ".07em",
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 13, fontWeight: 700, color: C.ink, marginTop: 2, fontFamily: FONT_BODY,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}

const TH = ({ children, center, width }) => (
  <th style={{
    padding: "8px 8px", textAlign: center ? "center" : "left",
    fontSize: 9.5, fontWeight: 700, color: C.inkSoft, fontFamily: FONT_BODY,
    textTransform: "uppercase", letterSpacing: ".06em",
    borderBottom: `1.5px solid ${C.line}`, whiteSpace: "nowrap",
    width: width || "auto",
  }}>
    {children}
  </th>
);

// ─── Miniature produit ────────────────────────────────────────────────────────
function ProductThumb({ src, alt, size = 36 }) {
  return src ? (
    <img
      src={src} alt={alt}
      style={{ width: size, height: size, borderRadius: 8, objectFit: "cover", border: `1px solid ${C.line}`, flexShrink: 0 }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: 8, background: C.paperSoft,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: C.muted, flexShrink: 0, border: `1px solid ${C.line}`,
    }}>
      <IconBox width={size * 0.5} height={size * 0.5} />
    </div>
  );
}

// ─── Champs de formulaire (restylés bordeaux) ────────────────────────────────
function Field({ label, name, type = "text", value, onChange, required, placeholder, min, step }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, fontFamily: FONT_BODY, textTransform: "uppercase", letterSpacing: ".04em" }}>
        {label}{required && <span style={{ color: C.danger, marginLeft: 2 }}>*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder || label} required={required} min={min} step={step}
        style={{
          padding: "9px 12px", borderRadius: 8,
          border: `1.5px solid ${C.line}`, fontSize: 13.5,
          outline: "none", background: C.paperSoft, color: C.ink, fontFamily: FONT_BODY,
        }}
        onFocus={(e) => (e.target.style.borderColor = C.petrol)}
        onBlur={(e)  => (e.target.style.borderColor = C.line)}
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, fontFamily: FONT_BODY, textTransform: "uppercase", letterSpacing: ".04em" }}>
        Description
      </label>
      <textarea
        name={name} value={value} onChange={onChange} placeholder={placeholder || label} rows={4}
        style={{
          padding: "9px 12px", borderRadius: 8,
          border: `1.5px solid ${C.line}`, fontSize: 13.5,
          outline: "none", background: C.paperSoft, color: C.ink, fontFamily: FONT_BODY,
          resize: "vertical",
        }}
        onFocus={(e) => (e.target.style.borderColor = C.petrol)}
        onBlur={(e)  => (e.target.style.borderColor = C.line)}
      />
    </div>
  );
}

function ImageField({ currentUrl, onFileChange, onRemove }) {
  const [preview, setPreview] = useState(currentUrl || null);
  const inputRef = useRef(null);

  useEffect(() => { setPreview(currentUrl || null); }, [currentUrl]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileChange(file);
  }

  function handleRemove() {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onRemove();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, fontFamily: FONT_BODY, textTransform: "uppercase", letterSpacing: ".04em" }}>
        Photo du produit
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {preview ? (
          <img src={preview} alt="Aperçu" style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", border: `1px solid ${C.line}` }} />
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: 10, background: C.paperSoft, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, border: `1px solid ${C.line}` }}>
            <IconBox width={28} height={28} />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Btn variant="ghost" onClick={() => inputRef.current?.click()}>
            {preview ? "Changer la photo" : "Ajouter une photo"}
          </Btn>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              style={{ fontSize: 12, color: C.danger, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, fontFamily: FONT_BODY, fontWeight: 600 }}
            >
              Retirer la photo
            </button>
          )}
        </div>
        <input
          ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFile} style={{ display: "none" }}
        />
      </div>
      <span style={{ fontSize: 11, color: C.muted, fontFamily: FONT_BODY }}>JPG, PNG, WEBP ou GIF — 5 Mo max</span>
    </div>
  );
}

// ─── Export PDF — bandeau bordeaux, logo GL ──────────────────────────────────
function ExportPdfButton({ produits }) {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function exportPDF() {
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(...BORDEAUX_RGB);
      doc.rect(0, 0, pageWidth, 30, "F");

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(14, 6, 18, 18, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...BORDEAUX_RGB);
      doc.text("GL", 23, 18.5, { align: "center" });

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text(COMPANY.name, 38, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(COMPANY.address, 38, 20.5);
      doc.text(`Tél : ${COMPANY.tel}`, 38, 25);

      doc.setFontSize(9);
      doc.text(`Casablanca, le ${new Date().toLocaleDateString("fr-FR")}`, pageWidth - 14, 15, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(55, 65, 81);
      doc.text(`Catalogue des produits — ${produits.length} article(s)`, 14, 39);

      doc.autoTable({
        startY: 44,
        head: [["Référence", "Nom", "Marque", "Prix", "Type", "Stock"]],
        body: produits.map((p) => [
          p.reference, p.nom, p.marque, formatPrix(p.prix), p.statut, `${p.stock} u.`,
        ]),
        styles: { fontSize: 8.5, cellPadding: 3 },
        headStyles: { fillColor: BORDEAUX_RGB, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: LIGHT_BORDEAUX_RGB },
        columnStyles: {
          0: { cellWidth: 24 }, 1: { cellWidth: 82 }, 2: { cellWidth: 34 },
          3: { cellWidth: 26 }, 4: { cellWidth: 28 }, 5: { cellWidth: 20 },
        },
        margin: { left: 14, right: 14, top: 44 },
        didDrawPage: () => {
          const h = doc.internal.pageSize.getHeight();
          doc.setDrawColor(...BORDEAUX_RGB);
          doc.setLineWidth(0.4);
          doc.line(14, h - 16, pageWidth - 14, h - 16);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7); doc.setTextColor(...GRAY_RGB);
          doc.text(COMPANY.legal, pageWidth / 2, h - 11, { align: "center" });
          doc.text(`ICE N° : ${COMPANY.ice}   —   ${COMPANY.bank}`, pageWidth / 2, h - 7.5, { align: "center" });
        },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8); doc.setTextColor(...GRAY_RGB);
        doc.text(`Page ${i} / ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 3, { align: "right" });
      }

      doc.save(`catalogue_produits_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
      alert("Erreur export PDF : " + e.message);
    }
  }

  return (
    <Btn variant="ghost" onClick={exportPDF}>
      <IconDownload width={15} height={15} /> Exporter en PDF
    </Btn>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Composant principal
// ═══════════════════════════════════════════════════════════════════════════
export default function Products() {
  const [produits, setProduits]         = useState([]);
  const [allStats, setAllStats]         = useState({ total: 0, rupture: 0, faible: 0, byStatut: {} });
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeCat, setActiveCat]       = useState("Tous");
  const [query, setQuery]               = useState("");

  // ── Popup : fiche détail produit ──────────────────────────────────────────
  const [viewTarget, setViewTarget]     = useState(null);

  // ── Popup : formulaire ajout / modification ───────────────────────────────
  const [formModal, setFormModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [imageFile, setImageFile]       = useState(null);
  const [removeImage, setRemoveImage]   = useState(false);
  const [formErr, setFormErr]           = useState("");
  const [formBusy, setFormBusy]         = useState(false);

  // ── Popup : confirmation de suppression ───────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState(null);
  const notif = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchProduits = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (activeCat !== "Tous") params.set("statut", activeCat);
      if (query)               params.set("q", query);
      const res  = await fetch(`${API}?${params}`);
      const json = await res.json();
      if (json.success) setProduits(json.data);
      else throw new Error(json.message);
    } catch (e) { setError(e.message || "Impossible de contacter le serveur"); }
    finally { setLoading(false); }
  }, [activeCat, query]);

  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/stats`);
      const json = await res.json();
      if (json.success) {
        const byStatut = {};
        json.byStatut.forEach((r) => { byStatut[r.statut] = Number(r.total); });
        setAllStats({
          total:   Number(json.total.total)   || 0,
          rupture: Number(json.total.rupture) || 0,
          faible:  Number(json.total.faible)  || 0,
          byStatut,
        });
      }
    } catch (_) {}
  }, []);

  useEffect(() => { fetchProduits(); }, [fetchProduits]);
  useEffect(() => { fetchStats(); },   [fetchStats]);

  const refresh = () => { fetchProduits(); fetchStats(); };

  const copierReference = async (ref) => {
    try {
      await navigator.clipboard.writeText(ref);
      notif(`Référence ${ref} copiée`);
    } catch {
      notif("Impossible de copier la référence", "error");
    }
  };

  function openAdd() {
    setEditTarget(null); setForm(EMPTY_FORM);
    setImageFile(null); setRemoveImage(false);
    setFormErr(""); setFormModal(true);
  }

  function openEdit(p) {
    setEditTarget(p);
    setForm({
      reference: p.reference,
      nom: p.nom,
      marque: p.marque,
      description: p.description || "",
      prix: p.prix ?? 0,
      stock: p.stock,
      statut: p.statut,
    });
    setImageFile(null); setRemoveImage(false);
    setFormErr(""); setFormModal(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageFile(file) { setImageFile(file); setRemoveImage(false); }
  function handleImageRemove()   { setImageFile(null); setRemoveImage(true); }

  async function handleSubmit() {
    setFormErr("");
    if (!form.reference || !form.nom || !form.marque || !form.statut) {
      setFormErr("Référence, nom, marque et type sont obligatoires."); return;
    }
    setFormBusy(true);
    try {
      const url    = editTarget ? `${API}/${editTarget.id}` : API;
      const method = editTarget ? "PUT" : "POST";

      const fd = new FormData();
      fd.append("nom", form.nom);
      fd.append("reference", form.reference);
      fd.append("marque", form.marque);
      fd.append("description", form.description || "");
      fd.append("prix", Number(form.prix) || 0);
      fd.append("stock", Number(form.stock));
      fd.append("statut", form.statut);
      if (imageFile) fd.append("image", imageFile);
      if (removeImage) fd.append("removeImage", "true");

      const res  = await fetch(url, { method, body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      notif(editTarget ? "Produit mis à jour" : "Produit ajouté");
      setFormModal(false); refresh();
    } catch (e) { setFormErr(e.message); }
    finally { setFormBusy(false); }
  }

  async function handleDelete() {
    try {
      const res  = await fetch(`${API}/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      notif("Produit supprimé");
      setDeleteTarget(null); refresh();
    } catch (e) { notif(e.message, "error"); }
  }

  const sidebar = {
    eyebrow: "Catalogue", title: "Produits", description: "Filtrer par famille de produits",
    sections: [
      { title: "Familles", items: STATUTS.map((s) => ({
        key: s, label: s, icon: s === "Réactif" ? IconFlask : IconBox,
        active: activeCat === s,
        count: s === "Tous" ? allStats.total : (allStats.byStatut[s] || 0),
        onClick: () => { setActiveCat(s); setQuery(""); },
      }))},
      
    ],
    promo: { title: "Traçabilité", text: "Un catalogue à jour évite les ruptures de stock imprévues." },
  };

  // ───────────────────────────────────────────────────────────────────────────
  return (
    <AdminLayout sidebar={sidebar}>
      <style>{GOOGLE_FONTS_IMPORT}</style>
      <div style={{ fontFamily: FONT_BODY, color: C.ink }}>
        <Toast toast={toast} />

        <PageHead
          crumb={<>Admin&nbsp;/&nbsp;<b>Produits</b></>}
          title="Catalogue des produits"
          description="Gérez les réactifs, consommables et matériels du catalogue."
          actions={
            <>
              <ExportPdfButton produits={produits} />
              <Btn variant="primary" onClick={openAdd}>
                <IconPlus width={15} height={15} /> Ajouter un produit
              </Btn>
            </>
          }
        />

        {error && (
          <div style={{
            background: C.dangerSoft, border: `1px solid ${C.dangerLine}`, borderRadius: 10,
            padding: "12px 16px", color: C.danger, fontSize: 13.5, marginBottom: 16, fontWeight: 600,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ═══════════════════════ TABLEAU GLOBAL (compact, style devis) ═══════════════════════ */}
        <div style={{
          background: C.white, borderRadius: 14, overflow: "hidden",
          border: `1px solid ${C.line}`,
          boxShadow: "0 1px 3px rgba(36,16,20,.04), 0 10px 28px rgba(122,31,48,.06)",
        }}>
          {/* Toolbar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
            padding: "10px 16px", borderBottom: `1px solid ${C.lineSoft}`,
            background: `linear-gradient(135deg, ${C.paperSoft}, ${C.petrolSoft})`,
          }}>
            <span style={{
              width: 26, height: 26, borderRadius: 7, background: C.petrol, color: C.white,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
            }}>📦</span>
            <span style={{
              fontSize: 13, fontWeight: 700, color: C.petrolDark, fontFamily: FONT_DISPLAY,
              letterSpacing: ".01em",
            }}>Catalogue produits</span>

            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: C.white, border: `1.5px solid ${C.petrolLine}`, borderRadius: 8,
              padding: "5px 10px", minWidth: 220,
            }}>
              <IconSearch width={13} height={13} color={C.petrol} />
              <input
                placeholder="Rechercher par nom, référence, marque…"
                value={query} onChange={(e) => setQuery(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: 12, fontFamily: FONT_BODY, width: "100%", background: "transparent", color: C.ink }}
              />
            </div>

            <select value={activeCat} onChange={(e) => setActiveCat(e.target.value)} style={{
              padding: "5px 24px 5px 9px", borderRadius: 7,
              border: `1.5px solid ${C.petrolLine}`, fontSize: 12, fontWeight: 600,
              fontFamily: FONT_BODY, color: C.petrolDark, background: C.white,
              cursor: "pointer", outline: "none",
            }}>
              {STATUTS.map((s) => <option key={s}>{s}</option>)}
            </select>

            {loading && <span style={{ fontSize: 11.5, color: C.petrol, fontWeight: 600 }}>Chargement…</span>}

            <span style={{
              marginLeft: "auto", fontSize: 11, fontWeight: 700, color: C.petrolDark,
              fontFamily: FONT_MONO, background: C.white, padding: "3px 10px",
              borderRadius: 999, border: `1px solid ${C.petrolLine}`,
            }}>
              {produits.length} produit(s)
            </span>
          </div>

          {/* Table compacte */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
              <colgroup>
                <col style={{ width: "10%" }} />
                <col style={{ width: "28%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "11%" }} />
              </colgroup>
              <thead style={{ background: C.paperSoft }}>
                <tr>
                  <TH>Réf.</TH>
                  <TH>Produit</TH>
                  <TH>Description</TH>
                  <TH>Marque</TH>
                  <TH center>Prix</TH>
                  <TH center>Type</TH>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
                      Chargement…
                    </td>
                  </tr>
                )}
                {!loading && produits.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
                      <div style={{ fontSize: 30, marginBottom: 8, opacity: .6 }}>🔍</div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, marginBottom: 3, fontFamily: FONT_DISPLAY }}>
                        Aucun produit trouvé
                      </div>
                      <div style={{ fontSize: 12 }}>Essayez une autre recherche ou catégorie.</div>
                    </td>
                  </tr>
                )}
                {!loading && produits.map((p, idx) => (
                  <tr key={p.id}
                    onClick={() => setViewTarget(p)}
                    style={{ cursor: "pointer", borderBottom: idx < produits.length - 1 ? `1px solid ${C.lineSoft}` : "none", transition: "background .1s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.paperSoft}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "8px 8px", overflow: "hidden" }}>
                      <RefTag text={p.reference} tone={BADGE_PROD[p.statut]?.dot || C.petrol} size="xs" />
                    </td>
                    <td style={{ padding: "8px 8px", overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <ProductThumb src={p.image} alt={p.nom} />
                        <span style={{ fontWeight: 700, fontSize: 12.5, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={p.nom}>
                          {p.nom}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "8px 8px", fontSize: 11.5, color: C.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={p.description || ""}>
                      {p.description || <span style={{ color: C.muted }}>—</span>}
                    </td>
                    <td style={{ padding: "8px 8px", fontSize: 12, color: C.inkSoft, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.marque}
                    </td>
                    <td style={{ padding: "8px 8px", textAlign: "center", fontWeight: 700, fontSize: 12, color: C.petrolDark, fontFamily: FONT_MONO, whiteSpace: "nowrap" }}>
                      {formatPrix(p.prix)}
                    </td>
                    <td style={{ padding: "8px 8px", textAlign: "center" }}>
                      <Badge label={p.statut} displayLabel={STATUT_ABBR[p.statut]} map={BADGE_PROD} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Popup : fiche détail produit (style bordeaux) ──────────────────── */}
        <Modal
          open={!!viewTarget} onClose={() => setViewTarget(null)}
          title={viewTarget?.nom} subtitle={viewTarget && <RefTag text={viewTarget.reference} size="xs" />}
          size="md"
          footer={
            <>
              <Btn variant="red_ghost" onClick={() => { setDeleteTarget(viewTarget); setViewTarget(null); }}>
                <IconTrash width={13} height={13} /> Supprimer
              </Btn>
              <Btn variant="primary" onClick={() => { const t = viewTarget; setViewTarget(null); openEdit(t); }}>
                <IconEditOutline width={13} height={13} /> Modifier
              </Btn>
            </>
          }
        >
          {viewTarget && (
            <div style={{ fontFamily: FONT_BODY, color: C.ink }}>
              <style>{GOOGLE_FONTS_IMPORT}</style>
              <div style={{ display: "flex", gap: 18 }}>
                <ProductThumb src={viewTarget.image} alt={viewTarget.nom} size={110} />
                <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <Badge label={viewTarget.statut} map={BADGE_PROD} />
                    <Badge label={viewTarget.stockLabel} map={BADGE_STOCK} />
                    <button
                      onClick={() => copierReference(viewTarget.reference)}
                      title="Copier la référence"
                      style={{
                        width: 24, height: 24, borderRadius: 6,
                        border: `1px solid ${C.line}`, background: C.paperSoft,
                        color: C.petrolDark, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <IconCopy size={11} />
                    </button>
                  </div>
                  <div style={{ fontSize: 13, color: C.inkSoft }}>
                    <strong style={{ color: C.ink }}>Marque :</strong> {viewTarget.marque}
                  </div>
                  <div style={{ fontSize: 13, color: C.inkSoft }}>
                    <strong style={{ color: C.ink }}>Prix :</strong>{" "}
                    <span style={{ fontFamily: FONT_MONO, fontWeight: 700, color: C.petrolDark }}>{formatPrix(viewTarget.prix)}</span>
                    &nbsp;—&nbsp;
                    <strong style={{ color: C.ink }}>Stock :</strong> {viewTarget.stock} u.
                  </div>
                  <div style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6, marginTop: 4 }}>
                    {viewTarget.description || <Dash />}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* ── Popup : ajout / modification (style bordeaux) ──────────────────── */}
        <Modal
          open={formModal} onClose={() => setFormModal(false)}
          title={editTarget ? "Modifier le produit" : "Ajouter un produit"}
          subtitle={editTarget ? <RefTag text={editTarget.reference} size="xs" /> : "Renseignez les informations du nouvel article"}
          size="md"
          footer={
            <>
              <Btn variant="ghost" onClick={() => setFormModal(false)} disabled={formBusy}>Annuler</Btn>
              <Btn variant="primary" onClick={handleSubmit} disabled={formBusy}>
                <IconCheck width={13} height={13} /> {formBusy ? "Enregistrement…" : editTarget ? "Enregistrer" : "Ajouter le produit"}
              </Btn>
            </>
          }
        >
          <div style={{ fontFamily: FONT_BODY, color: C.ink, display: "flex", flexDirection: "column", gap: 14 }}>
            <style>{GOOGLE_FONTS_IMPORT}</style>
            {formErr && (
              <div style={{ background: C.dangerSoft, border: `1px solid ${C.dangerLine}`, borderRadius: 8, padding: "10px 14px", color: C.danger, fontSize: 13, fontWeight: 600 }}>
                {formErr}
              </div>
            )}

            <ImageField
              currentUrl={editTarget?.image}
              onFileChange={handleImageFile}
              onRemove={handleImageRemove}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Référence" name="reference" value={form.reference} onChange={handleChange} required placeholder="Ex. P-1042" />
              <Field label="Marque" name="marque" value={form.marque} onChange={handleChange} required placeholder="Ex. BioMerieux" />
            </div>
            <Field label="Nom du produit" name="nom" value={form.nom} onChange={handleChange} required placeholder="Ex. Réactif R-204 Buffer pH 7" />
            <TextAreaField label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Détails, composition, usage…" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="Prix (DH)" name="prix" type="number" value={form.prix} onChange={handleChange} min={0} step="0.01" required placeholder="Ex. 120.00" />
              <Field label="Quantité en stock" name="stock" type="number" value={form.stock} onChange={handleChange} min={0} required />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, fontFamily: FONT_BODY, textTransform: "uppercase", letterSpacing: ".04em" }}>
                  Type <span style={{ color: C.danger, marginLeft: 2 }}>*</span>
                </label>
                <select name="statut" value={form.statut} onChange={handleChange}
                  style={{ padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${C.line}`, fontSize: 13.5, background: C.paperSoft, color: C.ink, fontFamily: FONT_BODY }}>
                  <option value="Réactif">Réactif</option>
                  <option value="Consommable">Consommable</option>
                  <option value="Matériel">Matériel</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>

        {/* ── Popup : confirmation de suppression (style bordeaux) ───────────── */}
        <Modal
          open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
          title="Confirmer la suppression" size="sm"
          footer={
            <>
              <Btn variant="ghost" onClick={() => setDeleteTarget(null)}>Annuler</Btn>
              <Btn variant="danger" onClick={handleDelete}>Supprimer définitivement</Btn>
            </>
          }
        >
          <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, fontFamily: FONT_BODY }}>
            Voulez-vous vraiment supprimer <strong style={{ color: C.ink }}>{deleteTarget?.nom}</strong>{" "}
            {deleteTarget && <RefTag text={deleteTarget.reference} size="xs" />} ?
            Cette action est irréversible.
          </p>
        </Modal>
      </div>
    </AdminLayout>
  );
}
