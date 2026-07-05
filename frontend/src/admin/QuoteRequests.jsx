/**
 * QuoteRequests.jsx
 * Schéma exact : gestion_laboratoire
 *   utilisateurs : id, ice, nom, prenom, nomLabo, email, telephone, role …
 *   produits     : id, nom, marque, reference, prix, stock, image, statut …
 *   commandes    : id, utilisateur_id, date_commande, total, statut
 *   details_commande : id, commande_id, produit_id, quantite, prix, remise
 *
 * Comportement des boutons du devis :
 *   - Confirmer        -> PATCH /commandes/:id/confirmer
 *                          (le backend génère le PDF du devis et l'envoie par email au client,
 *                           puis passe le statut à "Confirmée")
 *   - Supprimer         -> DELETE /commandes/:id  (suppression définitive de la commande)
 *   - En attente        -> PATCH /commandes/:id/statut { statut: "En attente" }
 *
 * Colonne "Date de péremption" :
 *   - Affichée uniquement pour les lignes dont le produit a pour statut "Réactif" ou "Consommable"
 *   - Purement front-end (state React local), AUCUNE persistance en base de données
 *
 * ── Design ─────────────────────────────────────────────────────────────────
 * Identité visuelle inspirée du monde du laboratoire : palette "paillasse"
 * (pétrole / papier chaud / ambre bouchon-de-tube), typographie technique
 * (Space Grotesk + Inter + IBM Plex Mono), et une étiquette-échantillon
 * ("RefTag") comme élément signature pour les références de commande.
 *
 * MODIF (compact) :
 *   - Tableau global resserré pour tenir sur un seul écran.
 *   - Popup de détail réduite en taille (size "lg" au lieu de "xl"), paddings
 *     et espacements resserrés pour tout voir sur un seul écran.
 *   - Bouton "Annuler" (à côté de "Confirmer") supprimé du footer.
 *   - Nouvelle barre d'édition compacte (une seule ligne) pour modifier
 *     qté / prix / remise d'un produit, à la place de l'ancien encart en
 *     pointillés.
 *   - Bouton "Exporter CSV" retiré.
 *   - AJOUT : bouton "copier la référence" sur le RefTag du header (copie
 *     CMD-XXXX dans le presse-papier) + badge "N articles" dans le header
 *     pour un aperçu rapide sans scroller vers le tableau produits.
 *   - FIX : le tableau "Produits commandés" utilise maintenant tableLayout
 *     fixed + colgroup avec largeurs en %, et son conteneur a overflowX:auto
 *     avec une largeur minimale, pour que TOUTES les colonnes (y compris le
 *     bouton crayon ✎ tout à droite) restent accessibles et ne soient plus
 *     coupées hors de l'écran.
 * Aucune logique métier n'a été modifiée par ailleurs.
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead    from "./components/PageHead";
import Modal       from "./components/Modal";
import {
  IconFile, IconClock, IconCheck, IconX,
  IconBuilding, IconCalendar,
} from "./components/Icons";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:4000/api";
const STATUTS  = ["Tous", "En attente", "Confirmée", "Annulée"];

// Types de produits pour lesquels la date de péremption a du sens
const TYPES_AVEC_PEREMPTION = ["Réactif", "Consommable"];

// ─── Design tokens ────────────────────────────────────────────────────────────
const FONT_DISPLAY = "'Space Grotesk', 'Inter', sans-serif";
const FONT_BODY     = "'Inter', -apple-system, sans-serif";
const FONT_MONO     = "'IBM Plex Mono', 'SFMono-Regular', monospace";

const C = {
  ink:        "#14231F",
  inkSoft:    "#425048",
  paper:      "#F6F4EF",
  paperSoft:  "#FBFAF7",
  white:      "#FFFFFF",
  petrol:     "#0E5C57",
  petrolDark: "#0A4744",
  petrolSoft: "#E3EFED",
  petrolLine: "#BFDAD6",
  clay:       "#B8763A",
  claySoft:   "#FAEEE0",
  clayLine:   "#EAD0AE",
  sage:       "#6B7D74",
  sageSoft:   "#EBEFEA",
  sageLine:   "#D3DCD6",
  success:    "#3A7D5C",
  successSoft:"#E3F0E9",
  successLine:"#B9DAC7",
  danger:     "#A8433D",
  dangerSoft: "#F7E7E5",
  dangerLine: "#E6BEB9",
  line:       "#E4E0D5",
  lineSoft:   "#EDEAE1",
  muted:      "#9C9585",
};

const GOOGLE_FONTS_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');";

// Statut de commande -> couleur (chaque statut du workflow a sa propre teinte)
const BADGE_CMD = {
  "En attente": { bg: C.claySoft,    color: "#8A5423", dot: C.clay },
  Confirmée:    { bg: C.successSoft, color: "#265E43", dot: C.success },
  Annulée:      { bg: C.dangerSoft,  color: "#7E322D", dot: C.danger },
  Expédiée:     { bg: C.petrolSoft,  color: "#0A4744", dot: C.petrol },
  Livrée:       { bg: C.sageSoft,    color: "#4B5951", dot: C.sage },
};

// Type de produit -> couleur (calquée sur les codes-couleurs réels des bouchons
// de tubes/flacons de laboratoire : réactif = pétrole, consommable = ambre,
// matériel = sauge neutre)
const BADGE_PROD = {
  Réactif:     { bg: C.petrolSoft, color: "#0A4744", dot: C.petrol },
  Consommable: { bg: C.claySoft,   color: "#8A5423", dot: C.clay },
  Matériel:    { bg: C.sageSoft,   color: "#4B5951", dot: C.sage },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtMontant = (v) =>
  v == null ? "—" : Number(v).toLocaleString("fr-MA", { minimumFractionDigits: 2 }) + " MAD";

const fullName = (nom, prenom) => [prenom, nom].filter(Boolean).join(" ") || "—";

// ─── Icône crayon inline ──────────────────────────────────────────────────────
function IconEdit({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

// ─── Icône copier inline ──────────────────────────────────────────────────────
function IconCopy({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

// ─── Étiquette-échantillon (élément signature) ───────────────────────────────
// Rappelle une étiquette de tube de laboratoire : un mini repère à rainures
// suivi de la référence en monospace. Utilisé pour chaque CMD-XXXX.
function RefTag({ id, tone = C.petrol, size = "md" }) {
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
      padding: big ? "5px 12px 5px 9px" : xs ? "2px 7px 2px 5px" : "3px 10px 3px 7px",
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
      CMD-{String(id).padStart(4, "0")}
    </span>
  );
}

// ─── Titre de section ─────────────────────────────────────────────────────────
function SectionTitle({ icon, label, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, marginBottom: 9,
      paddingBottom: 7, borderBottom: `2px solid ${C.lineSoft}`,
    }}>
      <span style={{
        fontSize: 12, width: 22, height: 22, borderRadius: 6,
        background: C.petrolSoft, color: C.petrolDark,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{icon}</span>
      <span style={{
        fontSize: 12.5, fontWeight: 700, color: C.ink, fontFamily: FONT_DISPLAY,
        textTransform: "uppercase", letterSpacing: ".04em",
      }}>{label}</span>
      {right && <span style={{ marginLeft: "auto" }}>{right}</span>}
    </div>
  );
}

// ─── Valeur vide ─────────────────────────────────────────────────────────────
function Dash() {
  return <span style={{ color: C.muted, fontSize: 12, fontStyle: "italic" }}>Non renseigné</span>;
}

// ─── UI atoms ─────────────────────────────────────────────────────────────────
function Badge({ label, map, size = "md" }) {
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
      {label}
    </span>
  );
}

function Btn({ variant = "ghost", onClick, disabled, children, style = {} }) {
  const vars = {
    primary:   { background: C.petrol, color: C.white, border: "none" },
    danger:    { background: C.danger, color: C.white, border: "none" },
    ghost:     { background: C.white,  color: C.inkSoft, border: `1.5px solid ${C.line}` },
    red_ghost: { background: C.dangerSoft, color: C.danger, border: `1.5px solid ${C.dangerLine}` },
    warning:   { background: C.clay,   color: C.white, border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
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
      background: C.paperSoft, borderRadius: 9, padding: "8px 11px",
      display: "flex", gap: 9, alignItems: "flex-start", border: `1px solid ${C.line}`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: C.petrolSoft, color: C.petrolDark,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
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
          fontSize: 12.5, fontWeight: 700, color: C.ink, marginTop: 2, fontFamily: FONT_BODY,
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

// ─── Composant principal ──────────────────────────────────────────────────────
export default function QuoteRequests() {
  const [filtre,        setFiltre]        = useState("Tous");
  const [commandes,     setCommandes]     = useState([]);
  const [stats,         setStats]         = useState({});
  const [selected,      setSelected]      = useState(null);
  const [detail,        setDetail]        = useState(null);
  const [loadDet,       setLoadDet]       = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [actionLoad,    setActionLoad]    = useState(false);
  const [confirmSendLoad, setConfirmSendLoad] = useState(false);
  const [note,          setNote]          = useState("");
  const [toast,         setToast]         = useState(null);

  // ── Confirmation pour l'action destructive du footer (suppression du devis) ─
  const [pendingAction, setPendingAction] = useState(null); // null | "delete"

  // ── Dates de péremption : 100% front-end, jamais envoyées/persistées en base ─
  // Forme : { [ligneId]: "YYYY-MM-DD" }
  const [datesPeremption, setDatesPeremption] = useState({});

  // ── Edition ligne dans le popup détail ────────────────────────────────────
  const [editLigne, setEditLigne] = useState(null);
  const [saveLoad,  setSaveLoad]  = useState(false);

  const notif = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Copier la référence du devis dans le presse-papier ──────────────────────
  const copierReference = async (id) => {
    const ref = `CMD-${String(id).padStart(4, "0")}`;
    try {
      await navigator.clipboard.writeText(ref);
      notif(`Référence ${ref} copiée`);
    } catch {
      notif("Impossible de copier la référence", "error");
    }
  };

  // ── Fetch liste ───────────────────────────────────────────────────────────
  const fetchCommandes = useCallback(async () => {
    setLoading(true);
    try {
      const q    = filtre !== "Tous" ? `?statut=${encodeURIComponent(filtre)}` : "";
      const res  = await fetch(`${API_BASE}/commandes${q}`);
      const json = await res.json();
      if (json.success) setCommandes(json.data);
      else notif("Erreur de chargement", "error");
    } catch { notif("Erreur réseau", "error"); }
    finally   { setLoading(false); }
  }, [filtre]);

  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/commandes/stats/resume`);
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch {}
  }, []);

  useEffect(() => { fetchCommandes(); }, [fetchCommandes]);
  useEffect(() => { fetchStats(); },    [fetchStats]);

  // ── Ouvrir modal détail ───────────────────────────────────────────────────
  const ouvrirModal = async (cmd) => {
    setSelected(cmd); setDetail(null);
    setNote(""); setPendingAction(null); setEditLigne(null);
    setDatesPeremption({}); // reset des dates de péremption (front-end uniquement)
    setLoadDet(true);
    try {
      const res  = await fetch(`${API_BASE}/commandes/${cmd.id}`);
      const json = await res.json();
      if (json.success) setDetail(json.data);
    } catch { notif("Impossible de charger le détail", "error"); }
    finally   { setLoadDet(false); }
  };

  const fermer = () => {
    setSelected(null); setDetail(null);
    setNote(""); setPendingAction(null); setEditLigne(null);
    setDatesPeremption({});
  };

  // ── Changer statut (utilisé pour "En attente") ──────────────────────────────
  const changerStatut = async (id, statut) => {
    setActionLoad(true);
    try {
      const res  = await fetch(`${API_BASE}/commandes/${id}/statut`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });
      const json = await res.json();
      if (json.success) {
        notif(`Statut mis à jour : ${statut}`);
        setCommandes((prev) => prev.map((c) => c.id === id ? { ...c, statut } : c));
        fetchStats();
        if (selected?.id === id) setSelected((s) => ({ ...s, statut }));
      } else notif(json.message || "Erreur", "error");
    } catch { notif("Erreur réseau", "error"); }
    finally   { setActionLoad(false); }
  };

  // ── Confirmer le devis : le backend génère le PDF et l'envoie par email ────
  const confirmerEtEnvoyer = async (id) => {
    setConfirmSendLoad(true);
    try {
      const res  = await fetch(`${API_BASE}/commandes/${id}/confirmer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // On transmet les dates de péremption saisies pour qu'elles apparaissent sur le PDF envoyé,
        // sans jamais les enregistrer en base côté serveur.
        body: JSON.stringify({ datesPeremption }),
      });
      const json = await res.json();
      if (json.success) {
        notif("Devis confirmé et envoyé par email au client ✓");
        setCommandes((prev) => prev.map((c) => c.id === id ? { ...c, statut: "Confirmée" } : c));
        fetchStats();
        setSelected((s) => (s ? { ...s, statut: "Confirmée" } : s));
      } else notif(json.message || "Erreur lors de l'envoi du devis", "error");
    } catch { notif("Erreur réseau", "error"); }
    finally   { setConfirmSendLoad(false); }
  };

  // ── Suppression manuelle (bouton "Supprimer le devis") ──────────────────────
  const supprimer = async (id) => {
    setActionLoad(true);
    try {
      const res  = await fetch(`${API_BASE}/commandes/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { notif("Devis supprimé"); fermer(); fetchCommandes(); fetchStats(); }
      else notif(json.message || "Erreur", "error");
    } catch { notif("Erreur réseau", "error"); }
    finally   { setActionLoad(false); }
  };

  // ── Sauvegarder une ligne du détail (qté / prix / remise) ───────────────────
  const sauvegarderLigne = async (ligneId) => {
    setSaveLoad(true);
    try {
      const res  = await fetch(`${API_BASE}/commandes/lignes/${ligneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantite: editLigne.quantite,
          prix:     editLigne.prix_unitaire,
          remise:   editLigne.remise,
        }),
      });
      const json = await res.json();
      if (json.success) {
        notif("Ligne mise à jour");
        setEditLigne(null);
        // Recharger le détail pour avoir sous-totaux et total à jour
        const r2 = await fetch(`${API_BASE}/commandes/${selected.id}`);
        const j2 = await r2.json();
        if (j2.success) {
          setDetail(j2.data);
          setSelected((s) => ({ ...s, total: j2.data.total }));
        }
      } else notif(json.message || "Erreur", "error");
    } catch { notif("Erreur réseau", "error"); }
    finally   { setSaveLoad(false); }
  };

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const ICONS = { Tous: IconFile, "En attente": IconClock, Confirmée: IconCheck, Annulée: IconX };
  const sidebar = {
    eyebrow: "Administration", title: "Demandes de devis",
    description: "Suivi et traitement des commandes clients",
    sections: [{
      title: "Filtrer par statut",
      items: STATUTS.map((s) => ({
        key: s, label: s === "Tous" ? "Tous les devis" : s,
        icon: ICONS[s] || IconFile, count: stats[s] ?? 0,
        active: filtre === s, onClick: () => setFiltre(s),
      })),
    }],
    promo: { title: "Réactivité", text: "Un délai de réponse < 24 h améliore la fidélisation client." },
  };

  // ───────────────────────────────────────────────────────────────────────────
  return (
    <AdminLayout sidebar={sidebar}>
      <style>{GOOGLE_FONTS_IMPORT}</style>
      <div style={{ fontFamily: FONT_BODY, color: C.ink }}>
        <Toast toast={toast} />

        <PageHead
          crumb={<>Admin&nbsp;/&nbsp;<b>Demandes de devis</b></>}
          title="Demandes de devis"
          description="Consultez, confirmez ou annulez les commandes passées par vos clients."
        />

        {/* ═══════════════════════ TABLEAU GLOBAL (compact) ═══════════════════════ */}
        <div style={{
          background: C.white, borderRadius: 14, overflow: "hidden",
          border: `1px solid ${C.line}`,
          boxShadow: "0 1px 3px rgba(20,35,31,.04), 0 10px 28px rgba(14,92,87,.06)",
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
            }}>📋</span>
            <span style={{
              fontSize: 13, fontWeight: 700, color: C.petrolDark, fontFamily: FONT_DISPLAY,
              letterSpacing: ".01em",
            }}>Devis clients</span>
            <select value={filtre} onChange={(e) => setFiltre(e.target.value)} style={{
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
              {commandes.length} devis
            </span>
          </div>

          {/* Table compacte */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
              <colgroup>
                <col style={{ width: "12%" }} />
                <col style={{ width: "24%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead style={{ background: C.paperSoft }}>
                <tr>
                  <TH>Réf.</TH>
                  <TH>Client</TH>
                  <TH>Laboratoire</TH>
                  <TH>Ville</TH>
                  <TH>Date</TH>
                  <TH>Statut</TH>
                  <TH center>Actions</TH>
                </tr>
              </thead>
              <tbody>
                {!loading && commandes.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
                      <div style={{ fontSize: 30, marginBottom: 8, opacity: .6 }}>📭</div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, marginBottom: 3, fontFamily: FONT_DISPLAY }}>
                        Aucun devis trouvé
                      </div>
                      <div style={{ fontSize: 12 }}>Essayez un autre filtre.</div>
                    </td>
                  </tr>
                ) : commandes.map((c, idx) => (
                  <tr key={c.id}
                    onClick={() => ouvrirModal(c)}
                    style={{ cursor: "pointer", borderBottom: idx < commandes.length - 1 ? `1px solid ${C.lineSoft}` : "none", transition: "background .1s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.paperSoft}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "8px 8px", overflow: "hidden" }}>
                      <RefTag id={c.id} tone={BADGE_CMD[c.statut]?.dot || C.petrol} size="xs" />
                    </td>
                    <td style={{ padding: "8px 8px", overflow: "hidden" }}>
                      <div style={{ fontWeight: 700, fontSize: 12.5, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {fullName(c.client_nom, c.client_prenom)}
                      </div>
                      <div style={{ fontSize: 10.5, color: C.muted, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.client_email}
                      </div>
                    </td>
                    <td style={{ padding: "8px 8px", overflow: "hidden" }}>
                      {c.laboratoire
                        ? <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: C.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            <span style={{ fontSize: 12, flexShrink: 0 }}>🏥</span>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{c.laboratoire}</span>
                          </div>
                        : <span style={{ color: C.muted, fontSize: 11.5 }}>—</span>}
                    </td>
                    <td style={{ padding: "8px 8px", overflow: "hidden" }}>
                      <span style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {c.client_ville}
                      </span>
                    </td>
                    <td style={{ padding: "8px 8px", fontSize: 11.5, color: C.inkSoft, whiteSpace: "nowrap" }}>
                      {fmtDate(c.date_commande)}
                    </td>
                    <td style={{ padding: "8px 8px" }}>
                      <Badge label={c.statut} map={BADGE_CMD} size="sm" />
                    </td>
                    <td style={{ padding: "8px 8px" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); ouvrirModal(c); }}
                          style={{
                            padding: "4px 10px", borderRadius: 6,
                            border: `1.5px solid ${C.petrolLine}`, background: C.petrolSoft,
                            fontSize: 11, fontWeight: 700, color: C.petrolDark, cursor: "pointer",
                            fontFamily: FONT_BODY, whiteSpace: "nowrap",
                          }}
                        >Détails</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══════════════════════ MODAL DÉTAIL (compacte) ═══════════════════════ */}
        <Modal
          open={!!selected}
          onClose={fermer}
          title=""
          size="lg"
          footer={
            selected && (
              pendingAction === null ? (
                <div style={{
                  display: "flex", justifyContent: "space-between", width: "100%",
                  alignItems: "center", gap: 8, padding: "2px 0",
                }}>
                  <Btn variant="red_ghost" disabled={actionLoad || confirmSendLoad} onClick={() => setPendingAction("delete")}>
                    <IconX width={13} height={13} /> Supprimer le devis
                  </Btn>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="ghost" disabled={actionLoad || confirmSendLoad || selected.statut === "En attente"}
                      onClick={() => changerStatut(selected.id, "En attente")}>
                      <IconClock width={13} height={13} /> {actionLoad ? "…" : "En attente"}
                    </Btn>
                    <Btn variant="primary" disabled={actionLoad || confirmSendLoad || selected.statut === "Confirmée"}
                      onClick={() => confirmerEtEnvoyer(selected.id)}>
                      <IconCheck width={13} height={13} /> {confirmSendLoad ? "Envoi en cours…" : "Confirmer & envoyer le PDF"}
                    </Btn>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: C.danger, fontWeight: 700 }}>
                    ⚠️ Supprimer définitivement ce devis ?
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="ghost" onClick={() => setPendingAction(null)} disabled={actionLoad}>Annuler</Btn>
                    <Btn variant="danger" onClick={() => supprimer(selected.id)} disabled={actionLoad}>
                      {actionLoad ? "Suppression…" : "Oui, supprimer"}
                    </Btn>
                  </div>
                </div>
              )
            )
          }
        >
          {selected && (
            <div style={{ display: "flex", flexDirection: "column", gap: 0, fontFamily: FONT_BODY }}>

              {/* ══ HEADER INTERNE (compact + bouton copier + compteur d'articles) ══ */}
              <div style={{
                background: `linear-gradient(135deg, ${C.petrolDark} 0%, ${C.petrol} 100%)`,
                borderRadius: "12px 12px 0 0",
                padding: "16px 20px 14px",
                position: "relative", overflow: "hidden",
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
              }}>
                <div style={{
                  position: "absolute", inset: 0, opacity: .07, pointerEvents: "none",
                  backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
                  backgroundSize: "22px 22px",
                }} />
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <RefTag id={selected.id} size="lg" />
                    {/* Bouton copier la référence */}
                    <button
                      onClick={() => copierReference(selected.id)}
                      title="Copier la référence"
                      style={{
                        width: 26, height: 26, borderRadius: 7,
                        border: "1px solid rgba(255,255,255,.28)", background: "rgba(255,255,255,.12)",
                        color: C.white, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <IconCopy size={12} />
                    </button>
                    <Badge label={selected.statut} map={BADGE_CMD} />
                    {/* Compteur d'articles (aperçu rapide sans scroller) */}
                    {detail?.lignes && (
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, color: C.white,
                        background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.22)",
                        borderRadius: 999, padding: "2px 9px", fontFamily: FONT_BODY,
                      }}>
                        📦 {detail.lignes.length} article{detail.lignes.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#CFE4E1", display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span>📅 {fmtDate(selected.date_commande)}</span>
                    <span>👤 {fullName(selected.client_nom, selected.client_prenom)}</span>
                    <span>🏥 {selected.laboratoire || "—"}</span>
                  </div>
                </div>
                <div style={{
                  position: "relative", textAlign: "right", background: "rgba(255,255,255,.12)",
                  borderRadius: 10, padding: "7px 14px", border: "1px solid rgba(255,255,255,.15)",
                }}>
                  <div style={{ fontSize: 9.5, color: "#CFE4E1", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>
                    Total
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.white, marginTop: 1, fontFamily: FONT_DISPLAY }}>
                    {fmtMontant(selected.total)}
                  </div>
                </div>
              </div>

              {/* ══ BODY (compact) ══ */}
              <div style={{ padding: "14px 20px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

                {/* ─ Infos client ─ */}
                <section>
                  <SectionTitle icon="👤" label="Informations client" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    <InfoCard icon={<IconBuilding width={14} height={14} />} label="Nom complet"
                      value={fullName(selected.client_nom, selected.client_prenom)} />
                    <InfoCard icon="🏥" label="Laboratoire"
                      value={selected.laboratoire || <Dash />} />
                    <InfoCard icon="🏙️" label="Ville"
                      value={selected.client_ville || <Dash />} />
                    <InfoCard icon="📧" label="Email"
                      value={
                        <a href={`mailto:${selected.client_email}`}
                          style={{ color: C.petrolDark, fontWeight: 700, textDecoration: "none" }}>
                          {selected.client_email}
                        </a>
                      } />
                    <InfoCard icon="📞" label="Téléphone"
                      value={selected.client_telephone || <Dash />} />
                    <InfoCard icon="🪪" label="ICE"
                      value={selected.client_ice || <Dash />} />
                  </div>
                </section>

                {/* ─ Produits ─ */}
                <section>
                  <SectionTitle
                    icon="📦"
                    label="Produits commandés"
                    right={loadDet && <span style={{ fontSize: 11, color: C.petrol }}>Chargement…</span>}
                  />

                  {/* FIX : overflowX auto sur le conteneur pour ne jamais perdre le bouton crayon */}
                  <div style={{
                    border: `1.5px solid ${C.petrolLine}`, borderRadius: 10,
                    overflowX: "auto", boxShadow: "0 2px 8px rgba(14,92,87,.06)",
                  }}>
                    {/* FIX : tableLayout fixed + colgroup pour répartir toutes les colonnes,
                        avec minWidth pour garantir la lisibilité et l'accès au bouton crayon */}
                    <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", minWidth: 780 }}>
                      <colgroup>
                        <col style={{ width: "9%" }} />   {/* Réf. */}
                        <col style={{ width: "16%" }} />  {/* Produit */}
                        <col style={{ width: "11%" }} />  {/* Marque */}
                        <col style={{ width: "11%" }} />  {/* Type */}
                        <col style={{ width: "6%" }} />   {/* Qté */}
                        <col style={{ width: "10%" }} />  {/* Prix unit. */}
                        <col style={{ width: "8%" }} />   {/* Remise */}
                        <col style={{ width: "13%" }} />  {/* Péremption */}
                        <col style={{ width: "10%" }} />  {/* Sous-total */}
                        <col style={{ width: "6%" }} />   {/* Bouton crayon */}
                      </colgroup>
                      <thead>
                        <tr style={{ background: `linear-gradient(90deg, ${C.petrolSoft}, #D9EAE7)` }}>
                          {[
                            ["Réf.", false], ["Produit", false], ["Marque", false],
                            ["Type", false], ["Qté", true], ["Prix", true],
                            ["Remise", true], ["DDP", true], ["total", true], ["", true],
                          ].map(([h, c], i) => (
                            <th key={i} style={{
                              padding: "7px 8px", textAlign: c ? "center" : "left",
                              fontSize: 9.5, fontWeight: 700, color: C.petrolDark, fontFamily: FONT_BODY,
                              textTransform: "uppercase", letterSpacing: ".06em",
                              borderBottom: `2px solid ${C.petrolLine}`, whiteSpace: "nowrap",
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {loadDet ? (
                          <tr>
                            <td colSpan={10} style={{ textAlign: "center", padding: 24, color: C.muted, fontSize: 12.5 }}>
                              Chargement…
                            </td>
                          </tr>
                        ) : detail?.lignes?.length > 0 ? detail.lignes.map((l, i) => (
                          <React.Fragment key={l.id}>
                            {/* ── Ligne lecture ── */}
                            <tr
                              style={{
                                background: i % 2 === 0 ? C.white : C.paperSoft,
                                borderBottom: `1px solid ${C.lineSoft}`,
                                transition: "background .1s",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = C.petrolSoft}
                              onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? C.white : C.paperSoft}
                            >
                              <td style={{ padding: "8px 8px", fontFamily: FONT_MONO, fontSize: 10.5, color: C.inkSoft, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {l.produit_reference}
                              </td>
                              <td style={{ padding: "8px 8px", fontWeight: 700, fontSize: 12, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {l.produit_nom}
                              </td>
                              <td style={{ padding: "8px 8px", fontSize: 11.5, color: C.inkSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {l.produit_marque}
                              </td>
                              <td style={{ padding: "8px 8px", overflow: "hidden" }}>
                                <Badge label={l.produit_type} map={BADGE_PROD} size="sm" />
                              </td>
                              <td style={{ padding: "8px 8px", textAlign: "center", fontWeight: 700, color: C.petrolDark, fontSize: 12.5, fontFamily: FONT_MONO }}>
                                {l.quantite}
                              </td>
                              <td style={{ padding: "8px 8px", textAlign: "center", fontSize: 11.5, color: C.inkSoft, fontFamily: FONT_MONO, whiteSpace: "nowrap" }}>
                                {fmtMontant(l.prix_unitaire)}
                              </td>
                              <td style={{ padding: "8px 8px", textAlign: "center" }}>
                                {Number(l.remise) > 0
                                  ? <span style={{ background: C.claySoft, color: "#8A5423", borderRadius: 6, padding: "2px 7px", fontWeight: 700, fontSize: 11, fontFamily: FONT_MONO, whiteSpace: "nowrap" }}>
                                      -{l.remise}%
                                    </span>
                                  : <span style={{ color: C.muted, fontSize: 11 }}>—</span>}
                              </td>
                              {/* ── Date de péremption : frontend uniquement, jamais persistée en base ── */}
                              <td style={{ padding: "8px 8px", textAlign: "center" }}>
                                {TYPES_AVEC_PEREMPTION.includes(l.produit_type) ? (
                                  <input
                                    type="date"
                                    value={datesPeremption[l.id] || ""}
                                    onChange={(e) =>
                                      setDatesPeremption((prev) => ({ ...prev, [l.id]: e.target.value }))
                                    }
                                    title="Date de péremption (non enregistrée en base — affichage/PDF uniquement)"
                                    style={{
                                      width: "100%", padding: "4px 4px", borderRadius: 6,
                                      border: `1.5px solid ${C.clayLine}`, fontSize: 10.5, fontWeight: 600,
                                      fontFamily: FONT_MONO, color: "#8A5423", background: C.claySoft, outline: "none",
                                      boxSizing: "border-box",
                                    }}
                                  />
                                ) : (
                                  <span style={{ color: C.muted, fontSize: 11 }}>N/A</span>
                                )}
                              </td>
                              <td style={{ padding: "8px 8px", textAlign: "center", fontWeight: 700, fontSize: 12, color: C.ink, fontFamily: FONT_MONO, whiteSpace: "nowrap" }}>
                                {fmtMontant(l.sous_total)}
                              </td>
                              <td style={{ padding: "8px 8px", textAlign: "center" }}>
                                <button
                                  onClick={() => setEditLigne(
                                    editLigne?.id === l.id ? null : {
                                      id: l.id,
                                      quantite: l.quantite,
                                      prix_unitaire: l.prix_unitaire,
                                      remise: Number(l.remise),
                                    }
                                  )}
                                  title="Modifier cette ligne"
                                  style={{
                                    width: 26, height: 26, borderRadius: 7,
                                    border: editLigne?.id === l.id ? `2px solid ${C.petrol}` : `1.5px solid ${C.line}`,
                                    background: editLigne?.id === l.id ? C.petrolSoft : C.white,
                                    color: editLigne?.id === l.id ? C.petrolDark : C.muted,
                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all .12s", margin: "0 auto",
                                  }}
                                >
                                  <IconEdit size={12} />
                                </button>
                              </td>
                            </tr>

                            {/* ── Barre d'édition compacte (une seule ligne) ── */}
                            {editLigne?.id === l.id && (
                              <tr>
                                <td colSpan={10} style={{ padding: "6px 8px" }}>
                                  <div style={{
                                    display: "flex", alignItems: "center", flexWrap: "wrap",
                                    gap: 0, background: C.white, borderRadius: 10,
                                    border: `1.5px solid ${C.petrolLine}`,
                                    borderLeft: `4px solid ${C.petrol}`,
                                    boxShadow: "0 3px 12px rgba(14,92,87,.10)",
                                    padding: "9px 14px",
                                  }}>
                                    <span style={{
                                      fontSize: 10.5, fontWeight: 700, color: C.petrolDark,
                                      fontFamily: FONT_DISPLAY, textTransform: "uppercase",
                                      letterSpacing: ".05em", marginRight: 16, whiteSpace: "nowrap",
                                    }}>
                                      ✎ Édition
                                    </span>

                                    {/* Quantité */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 14 }}>
                                      <span style={{ fontSize: 9.5, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Qté</span>
                                      <input
                                        type="number" min={1}
                                        value={editLigne.quantite}
                                        onChange={(e) => setEditLigne((p) => ({ ...p, quantite: Number(e.target.value) }))}
                                        style={{
                                          width: 46, padding: "4px 5px", borderRadius: 6,
                                          border: `1.5px solid ${C.petrolLine}`, fontSize: 11.5, fontWeight: 700,
                                          fontFamily: FONT_MONO, color: C.petrolDark, textAlign: "center", outline: "none",
                                        }}
                                      />
                                    </div>

                                    <div style={{ width: 1, height: 20, background: C.lineSoft, marginRight: 14 }} />

                                    {/* Prix unitaire */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 14 }}>
                                      <span style={{ fontSize: 9.5, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Prix</span>
                                      <input
                                        type="number" min={0} step="0.01"
                                        value={editLigne.prix_unitaire}
                                        onChange={(e) => setEditLigne((p) => ({ ...p, prix_unitaire: Number(e.target.value) }))}
                                        style={{
                                          width: 72, padding: "4px 5px", borderRadius: 6,
                                          border: `1.5px solid ${C.petrolLine}`, fontSize: 11.5, fontWeight: 700,
                                          fontFamily: FONT_MONO, color: C.inkSoft, textAlign: "center", outline: "none",
                                        }}
                                      />
                                    </div>

                                    <div style={{ width: 1, height: 20, background: C.lineSoft, marginRight: 14 }} />

                                    {/* Remise */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 14 }}>
                                      <span style={{ fontSize: 9.5, fontWeight: 700, color: C.muted, textTransform: "uppercase" }}>Remise %</span>
                                      <input
                                        type="number" min={0} max={100} step="0.01"
                                        value={editLigne.remise}
                                        onChange={(e) => setEditLigne((p) => ({ ...p, remise: Number(e.target.value) }))}
                                        style={{
                                          width: 56, padding: "4px 5px", borderRadius: 6,
                                          border: `1.5px solid ${C.clayLine}`, fontSize: 11.5, fontWeight: 700,
                                          fontFamily: FONT_MONO, color: "#8A5423", background: C.claySoft,
                                          textAlign: "center", outline: "none",
                                        }}
                                      />
                                    </div>

                                    <div style={{ width: 1, height: 20, background: C.lineSoft, marginRight: 14 }} />

                                    {/* Sous-total calculé */}
                                    <div style={{
                                      fontSize: 12, fontWeight: 700, color: C.petrolDark, fontFamily: FONT_MONO,
                                      background: C.petrolSoft, borderRadius: 6, padding: "4px 10px",
                                      whiteSpace: "nowrap", marginRight: 14,
                                    }}>
                                      {fmtMontant(
                                        Math.round(editLigne.quantite * editLigne.prix_unitaire * (1 - editLigne.remise / 100) * 100) / 100
                                      )}
                                    </div>

                                    {/* Actions : icônes rondes */}
                                    <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                                      <button
                                        onClick={() => setEditLigne(null)}
                                        title="Annuler"
                                        style={{
                                          width: 28, height: 28, borderRadius: "50%",
                                          border: `1.5px solid ${C.line}`, background: C.white, color: C.inkSoft,
                                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                        }}
                                      >
                                        <IconX width={12} height={12} />
                                      </button>
                                      <button
                                        onClick={() => sauvegarderLigne(l.id)}
                                        disabled={saveLoad}
                                        title="Enregistrer"
                                        style={{
                                          width: 28, height: 28, borderRadius: "50%", border: "none",
                                          background: saveLoad ? C.petrolLine : C.petrol, color: C.white,
                                          cursor: saveLoad ? "not-allowed" : "pointer",
                                          display: "flex", alignItems: "center", justifyContent: "center",
                                        }}
                                      >
                                        <IconCheck width={13} height={13} />
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )) : (
                          <tr>
                            <td colSpan={10} style={{ textAlign: "center", padding: 24, color: C.muted, fontSize: 12.5 }}>
                              Aucun produit associé
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {detail?.lignes?.length > 0 && (
                        <tfoot>
                          <tr style={{ background: `linear-gradient(90deg, ${C.petrolSoft}, #D9EAE7)`, borderTop: `2px solid ${C.petrolLine}` }}>
                            <td colSpan={8} style={{ padding: "9px 8px", fontWeight: 700, fontSize: 12, color: C.petrolDark, textAlign: "right", fontFamily: FONT_BODY }}>
                              Total commande
                            </td>
                            <td colSpan={2} style={{ padding: "9px 8px", textAlign: "center", fontWeight: 700, fontSize: 14, color: C.petrolDark, fontFamily: FONT_MONO }}>
                              {fmtMontant(selected.total)}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                  <div style={{ fontSize: 10.5, color: C.muted, marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                     Les dates de péremption sont saisies ici à titre indicatif (PDF envoyé au client) et ne sont pas enregistrées en base de données.
                  </div>
                </section>

                {/* ─ Note interne ─ */}
                
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}