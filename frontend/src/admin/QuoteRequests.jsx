/**
 * QuoteRequests.jsx
 * Schéma exact : gestion_laboratoire
 *   utilisateurs : id, ice, nom, prenom, nomLabo, email, telephone, role …
 *   produits     : id, nom, marque, reference, prix, stock, image, statut …
 *   commandes    : id, utilisateur_id, date_commande, total, statut
 *   details_commande : id, commande_id, produit_id, quantite, prix, remise
 *
 * Comportement des 3 boutons du devis :
 *   - Confirmer        -> PATCH /commandes/:id/confirmer
 *                          (le backend génère le PDF du devis et l'envoie par email au client,
 *                           puis passe le statut à "Confirmée")
 *   - Annuler           -> DELETE /commandes/:id  (suppression définitive de la commande)
 *   - En attente        -> PATCH /commandes/:id/statut { statut: "En attente" }
 *
 * Colonne "Date de péremption" :
 *   - Affichée uniquement pour les lignes dont le produit a pour statut "Réactif" ou "Consommable"
 *   - Purement front-end (state React local), AUCUNE persistance en base de données
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead    from "./components/PageHead";
import Modal       from "./components/Modal";
import {
  IconFile, IconClock, IconCheck, IconX, IconDownload,
  IconBuilding, IconCalendar,
} from "./components/Icons";

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:4000/api";
const STATUTS  = ["Tous", "En attente", "Confirmée", "Annulée"];

// Types de produits pour lesquels la date de péremption a du sens
const TYPES_AVEC_PEREMPTION = ["Réactif", "Consommable"];

const BADGE_CMD = {
  "En attente": { bg: "#FEF9C3", color: "#854D0E", dot: "#EAB308" },
  Confirmée:   { bg: "#DCFCE7", color: "#14532D", dot: "#22C55E" },
  Annulée:     { bg: "#FEE2E2", color: "#7F1D1D", dot: "#EF4444" },
  Expédiée:   { bg: "#DBEAFE", color: "#1E3A8A", dot: "#3B82F6" },
  Livrée:     { bg: "#F3F4F6", color: "#374151", dot: "#9CA3AF" },
};

const BADGE_PROD = {
  Réactif:    { bg: "#EDE9FE", color: "#4C1D95", dot: "#8B5CF6" },
  Consommable: { bg: "#FEF3C7", color: "#78350F", dot: "#F59E0B" },
  Matériel:   { bg: "#E0F2FE", color: "#0C4A6E", dot: "#0EA5E9" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtMontant = (v) =>
  v == null ? "—" : Number(v).toLocaleString("fr-MA", { minimumFractionDigits: 2 }) + " MAD";

const fullName = (nom, prenom) => [prenom, nom].filter(Boolean).join(" ") || "—";

// ─── Style input réutilisable ─────────────────────────────────────────────────
const inputStyle = (borderColor, textColor, bg = "#fff") => ({
  width: "100%", padding: "8px 11px", borderRadius: 8,
  border: `1.5px solid ${borderColor}`, fontSize: 13, fontWeight: 700,
  color: textColor, outline: "none", textAlign: "center",
  background: bg, boxSizing: "border-box",
});

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

// ─── Titre de section ─────────────────────────────────────────────────────────
function SectionTitle({ icon, label, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
      paddingBottom: 8, borderBottom: "2px solid #EEF2FF",
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 800, color: "#1E3A8A" }}>{label}</span>
      {right && <span style={{ marginLeft: "auto" }}>{right}</span>}
    </div>
  );
}

// ─── Valeur vide ─────────────────────────────────────────────────────────────
function Dash() {
  return <span style={{ color: "#D1D5DB", fontSize: 12 }}>Non renseigné</span>;
}

// ─── Wrapper champ d'édition ─────────────────────────────────────────────────
function EditField({ label, width, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, width }}>
      <label style={{
        fontSize: 10.5, fontWeight: 800, color: "#6B7280",
        textTransform: "uppercase", letterSpacing: ".07em",
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Mini-modal statut (dropdown inline dans tableau global) ──────────────────
function StatutPopover({ commande, onClose, onSave, anchorRef }) {
  const [statut,  setStatut]  = useState(commande.statut);
  const [loading, setLoading] = useState(false);
  const popRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        popRef.current && !popRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  const sauvegarder = async () => {
    if (statut === commande.statut) { onClose(); return; }
    setLoading(true);
    await onSave(commande.id, statut);
    setLoading(false);
    onClose();
  };

  const OPTS = ["En attente", "Confirmée", "Annulée"];
  const COLORS = {
    "En attente": { bg: "#FEF9C3", color: "#854D0E", dot: "#EAB308" },
    Confirmée:   { bg: "#DCFCE7", color: "#14532D", dot: "#22C55E" },
    Annulée:     { bg: "#FEE2E2", color: "#7F1D1D", dot: "#EF4444" },
  };

  return (
    <div ref={popRef} style={{
      position: "absolute", zIndex: 999, top: "calc(100% + 6px)", right: 0,
      background: "#fff", borderRadius: 12, padding: "14px 16px",
      boxShadow: "0 8px 32px rgba(37,99,235,.15), 0 2px 8px rgba(0,0,0,.08)",
      border: "1px solid #DBEAFE", minWidth: 220,
    }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>
        Modifier le statut
      </div>
      <div style={{ fontSize: 11.5, color: "#9CA3AF", marginBottom: 12, fontWeight: 600 }}>
        CMD-{String(commande.id).padStart(4, "0")}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {OPTS.map((opt) => {
          const s = COLORS[opt];
          const active = statut === opt;
          return (
            <button key={opt} onClick={() => setStatut(opt)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 10px", borderRadius: 8, cursor: "pointer",
              border: active ? `2px solid ${s.dot}` : "2px solid transparent",
              background: active ? s.bg : "#F9FAFB",
              fontWeight: active ? 700 : 500, fontSize: 13,
              color: active ? s.color : "#374151", transition: "all .12s",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
              {opt}
              {active && <span style={{ marginLeft: "auto", fontSize: 12, color: s.dot }}>✓</span>}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        <button onClick={onClose} style={{
          flex: 1, padding: "7px 0", borderRadius: 7, fontSize: 12.5, fontWeight: 600,
          border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280", cursor: "pointer",
        }}>Annuler</button>
        <button onClick={sauvegarder} disabled={loading} style={{
          flex: 1, padding: "7px 0", borderRadius: 7, fontSize: 12.5, fontWeight: 700,
          border: "none", background: loading ? "#93C5FD" : "#2563EB",
          color: "#fff", cursor: loading ? "not-allowed" : "pointer", transition: "background .12s",
        }}>{loading ? "…" : "Enregistrer"}</button>
      </div>
    </div>
  );
}

// ─── UI atoms ─────────────────────────────────────────────────────────────────
function Badge({ label, map }) {
  const s = map[label] || { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 999, fontSize: 11.5, fontWeight: 700,
      background: s.bg, color: s.color, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function Btn({ variant = "ghost", onClick, disabled, children, style = {} }) {
  const vars = {
    primary:   { background: "#2563EB", color: "#fff", border: "none" },
    danger:    { background: "#EF4444", color: "#fff", border: "none" },
    ghost:     { background: "#fff",    color: "#374151", border: "1.5px solid #E5E7EB" },
    red_ghost: { background: "#FFF5F5", color: "#DC2626", border: "1.5px solid #FECACA" },
    warning:   { background: "#F59E0B", color: "#fff",    border: "none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "7px 15px", borderRadius: 8, fontSize: 13, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .42 : 1,
      transition: "opacity .12s", ...vars[variant], ...style,
    }}>
      {children}
    </button>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const bg = { success: "#10B981", error: "#EF4444", info: "#F59E0B" }[toast.type] || "#6B7280";
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: bg, color: "#fff", padding: "12px 22px", borderRadius: 10,
      fontWeight: 700, fontSize: 13.5, boxShadow: "0 8px 32px rgba(0,0,0,.18)",
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
      background: "#F8FAFF", borderRadius: 10, padding: "12px 14px",
      display: "flex", gap: 11, alignItems: "flex-start", border: "1px solid #EEF2FF",
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        background: "#EFF6FF", color: "#2563EB",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 10.5, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
          {label}
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111827", marginTop: 3 }}>
          {value}
        </div>
      </div>
    </div>
  );
}

const TH = ({ children, center }) => (
  <th style={{
    padding: "10px 13px", textAlign: center ? "center" : "left",
    fontSize: 10.5, fontWeight: 700, color: "#6B7280",
    textTransform: "uppercase", letterSpacing: ".06em",
    borderBottom: "1.5px solid #F3F4F6", whiteSpace: "nowrap",
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

  // ── Confirmation pour les actions destructives du footer (delete | cancel) ──
  const [pendingAction, setPendingAction] = useState(null); // null | "delete" | "cancel"

  // ── Dates de péremption : 100% front-end, jamais envoyées/persistées en base ─
  // Forme : { [ligneId]: "YYYY-MM-DD" }
  const [datesPeremption, setDatesPeremption] = useState({});

  // ── Popover statut tableau global ─────────────────────────────────────────
  const [editPopover, setEditPopover] = useState(null);
  const editBtnRef = useRef(null);

  // ── Edition ligne dans le popup détail ────────────────────────────────────
  const [editLigne, setEditLigne] = useState(null);
  const [saveLoad,  setSaveLoad]  = useState(false);

  const notif = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
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

  // ── Annuler le devis = suppression définitive de la commande ───────────────
  const annulerCommande = async (id) => {
    setActionLoad(true);
    try {
      const res  = await fetch(`${API_BASE}/commandes/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { notif("Devis annulé et supprimé"); fermer(); fetchCommandes(); fetchStats(); }
      else notif(json.message || "Erreur", "error");
    } catch { notif("Erreur réseau", "error"); }
    finally   { setActionLoad(false); }
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
    finally   { setActionLoad(false); }  };

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

  // ── Export CSV ────────────────────────────────────────────────────────────
  const exporterCSV = () => {
    const cols = ["Référence","Prénom","Nom","Laboratoire","ICE","Email","Téléphone","Produits","Nb articles","Total","Date","Statut"];
    const rows = commandes.map((c) => [
      `CMD-${String(c.id).padStart(4,"0")}`,
      c.client_prenom, c.client_nom, c.laboratoire || "—",
      c.client_ice || "—", c.client_email, c.client_telephone || "—",
      `"${c.produits_resume || "—"}"`,
      c.nb_produits, c.total, fmtDate(c.date_commande), c.statut,
    ]);
    const csv  = [cols, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), {
      href: url, download: `devis_${new Date().toISOString().slice(0,10)}.csv`,
    }).click();
    URL.revokeObjectURL(url);
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
      <Toast toast={toast} />

      <PageHead
        crumb={<>Admin&nbsp;/&nbsp;<b>Demandes de devis</b></>}
        title="Demandes de devis"
        description="Consultez, confirmez ou annulez les commandes passées par vos clients."
        actions={
          <Btn variant="ghost" onClick={exporterCSV}>
            <IconDownload width={14} height={14} /> Exporter CSV
          </Btn>
        }
      />

      {/* ═══════════════════════ TABLEAU GLOBAL ═══════════════════════ */}
      <div style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        border: "1px solid #EEF2FF",
        boxShadow: "0 1px 3px rgba(0,0,0,.05), 0 8px 24px rgba(37,99,235,.06)",
      }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
          padding: "14px 20px", borderBottom: "1px solid #F0F4FF",
          background: "linear-gradient(135deg,#F8FAFF,#EFF6FF)",
        }}>
          <span style={{ fontSize: 18 }}>📋</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#1E3A8A" }}>Devis clients</span>
          <select value={filtre} onChange={(e) => setFiltre(e.target.value)} style={{
            padding: "6px 28px 6px 11px", borderRadius: 8,
            border: "1.5px solid #BFDBFE", fontSize: 13, fontWeight: 600,
            color: "#1E40AF", background: "#fff", cursor: "pointer", outline: "none",
          }}>
            {STATUTS.map((s) => <option key={s}>{s}</option>)}
          </select>
          {loading && <span style={{ fontSize: 12, color: "#93C5FD", fontWeight: 600 }}>Chargement…</span>}
          <span style={{
            marginLeft: "auto", fontSize: 12.5, fontWeight: 700, color: "#2563EB",
            background: "#EFF6FF", padding: "4px 12px", borderRadius: 999, border: "1px solid #BFDBFE",
          }}>
            {commandes.length} devis
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead style={{ background: "#FAFBFF" }}>
              <tr>
                <TH>Référence</TH>
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
                  <td colSpan={7} style={{ textAlign: "center", padding: "60px 0", color: "#9CA3AF" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 4 }}>Aucun devis trouvé</div>
                    <div style={{ fontSize: 13 }}>Essayez un autre filtre.</div>
                  </td>
                </tr>
              ) : commandes.map((c, idx) => (
                <tr key={c.id}
                  onClick={() => ouvrirModal(c)}
                  style={{ cursor: "pointer", borderBottom: idx < commandes.length - 1 ? "1px solid #F9FAFB" : "none", transition: "background .1s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#F5F8FF"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 13px" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12.5, fontWeight: 800, color: "#2563EB", background: "#EFF6FF", padding: "3px 8px", borderRadius: 6 }}>
                      CMD-{String(c.id).padStart(4, "0")}
                    </span>
                  </td>
                  <td style={{ padding: "14px 13px" }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: "#111827" }}>{fullName(c.client_nom, c.client_prenom)}</div>
                    <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 1 }}>{c.client_email}</div>
                  </td>
                  <td style={{ padding: "14px 13px" }}>
                    {c.laboratoire
                      ? <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                          <span style={{ fontSize: 14 }}>🏥</span> {c.laboratoire}
                        </div>
                      : <span style={{ color: "#D1D5DB", fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: "14px 13px" }}>
                    <Badge label={c.client_ville} map={BADGE_CMD} />
                  </td>
                  <td style={{ padding: "14px 13px", fontSize: 13, color: "#6B7280", whiteSpace: "nowrap" }}>
                    {fmtDate(c.date_commande)}
                  </td>
                  <td style={{ padding: "14px 13px" }}>
                    <Badge label={c.statut} map={BADGE_CMD} />
                  </td>
                  <td style={{ padding: "14px 13px" }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); ouvrirModal(c); }}
                        style={{
                          padding: "5px 13px", borderRadius: 7,
                          border: "1.5px solid #BFDBFE", background: "#EFF6FF",
                          fontSize: 12.5, fontWeight: 700, color: "#1D4ED8", cursor: "pointer",
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

      {/* ═══════════════════════ MODAL DÉTAIL ═══════════════════════ */}
      <Modal
        open={!!selected}
        onClose={fermer}
        title=""
        size="xl"
        footer={
          selected && (
            pendingAction === null ? (
              <div style={{
                display: "flex", justifyContent: "space-between", width: "100%",
                alignItems: "center", gap: 8, padding: "4px 0",
              }}>
                <Btn variant="red_ghost" disabled={actionLoad || confirmSendLoad} onClick={() => setPendingAction("delete")}>
                  <IconX width={13} height={13} /> Supprimer le devis
                </Btn>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="ghost" disabled={actionLoad || confirmSendLoad || selected.statut === "En attente"}
                    onClick={() => changerStatut(selected.id, "En attente")}>
                    <IconClock width={13} height={13} /> {actionLoad ? "…" : "En attente"}
                  </Btn>
                  <Btn variant="danger" disabled={actionLoad || confirmSendLoad || selected.statut === "Annulée"}
                    onClick={() => setPendingAction("cancel")}>
                    <IconX width={13} height={13} /> Annuler
                  </Btn>
                  <Btn variant="primary" disabled={actionLoad || confirmSendLoad || selected.statut === "Confirmée"}
                    onClick={() => confirmerEtEnvoyer(selected.id)}>
                    <IconCheck width={13} height={13} /> {confirmSendLoad ? "Envoi en cours…" : "Confirmer & envoyer le PDF"}
                  </Btn>
                </div>
              </div>
            ) : pendingAction === "delete" ? (
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <span style={{ fontSize: 13.5, color: "#DC2626", fontWeight: 700 }}>
                  ⚠️ Supprimer définitivement ce devis ?
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="ghost" onClick={() => setPendingAction(null)} disabled={actionLoad}>Annuler</Btn>
                  <Btn variant="danger" onClick={() => supprimer(selected.id)} disabled={actionLoad}>
                    {actionLoad ? "Suppression…" : "Oui, supprimer"}
                  </Btn>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <span style={{ fontSize: 13.5, color: "#DC2626", fontWeight: 700 }}>
                  ⚠️ Annuler ce devis ? La commande sera définitivement supprimée.
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="ghost" onClick={() => setPendingAction(null)} disabled={actionLoad}>Retour</Btn>
                  <Btn variant="danger" onClick={() => annulerCommande(selected.id)} disabled={actionLoad}>
                    {actionLoad ? "Annulation…" : "Oui, annuler"}
                  </Btn>
                </div>
              </div>
            )
          )
        }
      >
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            {/* ══ HEADER INTERNE ══ */}
            <div style={{
              background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
              borderRadius: "12px 12px 0 0",
              padding: "24px 28px 20px",
              display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{
                    fontFamily: "monospace", fontSize: 22, fontWeight: 900, color: "#fff",
                    letterSpacing: ".04em",
                  }}>
                    CMD-{String(selected.id).padStart(4, "0")}
                  </span>
                  <Badge label={selected.statut} map={BADGE_CMD} />
                </div>
                <div style={{ fontSize: 13, color: "#93C5FD", display: "flex", gap: 16 }}>
                  <span>📅 Reçu le {fmtDate(selected.date_commande)}</span>
                  <span>👤 {fullName(selected.client_nom, selected.client_prenom)}</span>
                  <span>🏥 {selected.laboratoire || "—"}</span>
                </div>
              </div>
              <div style={{
                textAlign: "right", background: "rgba(255,255,255,.12)",
                borderRadius: 12, padding: "10px 18px",
              }}>
                <div style={{ fontSize: 11, color: "#BFDBFE", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em" }}>
                  Total commande
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginTop: 2 }}>
                  {fmtMontant(selected.total)}
                </div>
              </div>
            </div>

            {/* ══ BODY ══ */}
            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 22 }}>

              {/* ─ Infos client ─ */}
              <section>
                <SectionTitle icon="👤" label="Informations client" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  <InfoCard icon={<IconBuilding width={16} height={16} />} label="Nom complet"
                    value={fullName(selected.client_nom, selected.client_prenom)} />
                  <InfoCard icon="🏥" label="Laboratoire"
                    value={selected.laboratoire || <Dash />} />
                  <InfoCard icon="🏙️" label="Ville"
                    value={selected.client_ville || <Dash />} />
                  <InfoCard icon="📧" label="Email"
                    value={
                      <a href={`mailto:${selected.client_email}`}
                        style={{ color: "#2563EB", fontWeight: 700, textDecoration: "none" }}>
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
                  right={loadDet && <span style={{ fontSize: 12, color: "#93C5FD" }}>Chargement…</span>}
                />

                <div style={{
                  border: "1.5px solid #DBEAFE", borderRadius: 12,
                  overflow: "hidden", boxShadow: "0 2px 8px rgba(37,99,235,.06)",
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "linear-gradient(90deg,#EFF6FF,#DBEAFE)" }}>
                        {[
                          ["Réf.", false], ["Produit", false], ["Marque", false],
                          ["Type", false], ["Qté", true], ["Prix unit.", true],
                          ["Remise", true], ["Péremption", true], ["Sous-total", true], ["", true],
                        ].map(([h, c], i) => (
                          <th key={i} style={{
                            padding: "11px 14px", textAlign: c ? "center" : "left",
                            fontSize: 11, fontWeight: 800, color: "#1E40AF",
                            textTransform: "uppercase", letterSpacing: ".07em",
                            borderBottom: "2px solid #BFDBFE",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loadDet ? (
                        <tr>
                          <td colSpan={10} style={{ textAlign: "center", padding: 32, color: "#9CA3AF" }}>
                            Chargement…
                          </td>
                        </tr>
                      ) : detail?.lignes?.length > 0 ? detail.lignes.map((l, i) => (
                        <React.Fragment key={l.id}>
                          {/* ── Ligne lecture ── */}
                          <tr
                            style={{
                              background: i % 2 === 0 ? "#fff" : "#F8FBFF",
                              borderBottom: "1px solid #EEF2FF",
                              transition: "background .1s",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#EFF6FF"}
                            onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#F8FBFF"}
                          >
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 11.5, color: "#6B7280", fontWeight: 600 }}>
                              {l.produit_reference}
                            </td>
                            <td style={{ padding: "12px 14px", fontWeight: 700, fontSize: 13.5, color: "#111827" }}>
                              {l.produit_nom}
                            </td>
                            <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>
                              {l.produit_marque}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <Badge label={l.produit_type} map={BADGE_PROD} />
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, color: "#2563EB", fontSize: 14 }}>
                              {l.quantite}
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center", fontSize: 13, color: "#374151" }}>
                              {fmtMontant(l.prix_unitaire)}
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              {Number(l.remise) > 0
                                ? <span style={{ background: "#FEF3C7", color: "#B45309", borderRadius: 6, padding: "3px 9px", fontWeight: 700, fontSize: 12 }}>
                                    -{l.remise}%
                                  </span>
                                : <span style={{ color: "#D1D5DB", fontSize: 12 }}>—</span>}
                            </td>
                            {/* ── Date de péremption : frontend uniquement, jamais persistée en base ── */}
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
                              {TYPES_AVEC_PEREMPTION.includes(l.produit_type) ? (
                                <input
                                  type="date"
                                  value={datesPeremption[l.id] || ""}
                                  onChange={(e) =>
                                    setDatesPeremption((prev) => ({ ...prev, [l.id]: e.target.value }))
                                  }
                                  title="Date de péremption (non enregistrée en base — affichage/PDF uniquement)"
                                  style={{
                                    padding: "5px 8px", borderRadius: 6,
                                    border: "1.5px solid #FDE68A", fontSize: 12, fontWeight: 600,
                                    color: "#92400E", background: "#FFFBEB", outline: "none",
                                  }}
                                />
                              ) : (
                                <span style={{ color: "#D1D5DB", fontSize: 12 }}>N/A</span>
                              )}
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 800, fontSize: 14, color: "#111827" }}>
                              {fmtMontant(l.sous_total)}
                            </td>
                            <td style={{ padding: "12px 14px", textAlign: "center" }}>
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
                                  width: 30, height: 30, borderRadius: 7,
                                  border: editLigne?.id === l.id ? "2px solid #2563EB" : "1.5px solid #E5E7EB",
                                  background: editLigne?.id === l.id ? "#EFF6FF" : "#fff",
                                  color: editLigne?.id === l.id ? "#2563EB" : "#9CA3AF",
                                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                  transition: "all .12s",
                                }}
                              >
                                <IconEdit size={13} />
                              </button>
                            </td>
                          </tr>

                          {/* ── Ligne édition inline ── */}
                          {editLigne?.id === l.id && (
                            <tr>
                              <td colSpan={10} style={{ padding: 0 }}>
                                <div style={{
                                  background: "linear-gradient(135deg,#EFF6FF,#F0F9FF)",
                                  borderTop: "2px dashed #93C5FD",
                                  borderBottom: "2px dashed #93C5FD",
                                  padding: "16px 18px",
                                }}>
                                  <div style={{ fontSize: 12, fontWeight: 800, color: "#1E3A8A", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                                    <span>✏️</span> Modifier — {l.produit_nom}
                                  </div>
                                  <div style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap" }}>

                                    {/* Quantité */}
                                    <EditField label="Quantité" width={80}>
                                      <input
                                        type="number" min={1}
                                        value={editLigne.quantite}
                                        onChange={(e) => setEditLigne((p) => ({ ...p, quantite: Number(e.target.value) }))}
                                        style={inputStyle("#BFDBFE", "#2563EB")}
                                      />
                                    </EditField>

                                    {/* Prix unitaire */}
                                    <EditField label="Prix unitaire (MAD)" width={120}>
                                      <input
                                        type="number" min={0} step="0.01"
                                        value={editLigne.prix_unitaire}
                                        onChange={(e) => setEditLigne((p) => ({ ...p, prix_unitaire: Number(e.target.value) }))}
                                        style={inputStyle("#BFDBFE", "#374151")}
                                      />
                                    </EditField>

                                    {/* Remise */}
                                    <EditField label="Remise (%)" width={90}>
                                      <input
                                        type="number" min={0} max={100} step="0.01"
                                        value={editLigne.remise}
                                        onChange={(e) => setEditLigne((p) => ({ ...p, remise: Number(e.target.value) }))}
                                        style={inputStyle("#FDE68A", "#B45309", "#FFFBEB")}
                                      />
                                    </EditField>

                                    {/* Aperçu sous-total */}
                                    <EditField label="Sous-total calculé" width="auto">
                                      <div style={{
                                        padding: "8px 16px", borderRadius: 8,
                                        background: "#EFF6FF", border: "2px solid #BFDBFE",
                                        fontSize: 14, fontWeight: 900, color: "#1D4ED8", whiteSpace: "nowrap",
                                      }}>
                                        {fmtMontant(
                                          Math.round(editLigne.quantite * editLigne.prix_unitaire * (1 - editLigne.remise / 100) * 100) / 100
                                        )}
                                      </div>
                                    </EditField>

                                    {/* Boutons */}
                                    <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "flex-end" }}>
                                      <button
                                        onClick={() => setEditLigne(null)}
                                        style={{
                                          padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                                          border: "1.5px solid #E5E7EB", background: "#fff", color: "#6B7280", cursor: "pointer",
                                        }}
                                      >
                                        Annuler
                                      </button>
                                      <button
                                        onClick={() => sauvegarderLigne(l.id)}
                                        disabled={saveLoad}
                                        style={{
                                          padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                                          border: "none", background: saveLoad ? "#93C5FD" : "#2563EB",
                                          color: "#fff", cursor: saveLoad ? "not-allowed" : "pointer",
                                          display: "flex", alignItems: "center", gap: 6,
                                        }}
                                      >
                                        {saveLoad ? "Enregistrement…" : "✓ Sauvegarder"}
                                      </button>
                                    </div>

                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )) : (
                        <tr>
                          <td colSpan={10} style={{ textAlign: "center", padding: 32, color: "#9CA3AF", fontSize: 13 }}>
                            Aucun produit associé
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {detail?.lignes?.length > 0 && (
                      <tfoot>
                        <tr style={{ background: "linear-gradient(90deg,#EFF6FF,#DBEAFE)", borderTop: "2px solid #BFDBFE" }}>
                          <td colSpan={8} style={{ padding: "13px 14px", fontWeight: 800, fontSize: 13, color: "#1E40AF", textAlign: "right" }}>
                            Total commande
                          </td>
                          <td colSpan={2} style={{ padding: "13px 14px", textAlign: "center", fontWeight: 900, fontSize: 16, color: "#1D4ED8" }}>
                            {fmtMontant(selected.total)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
                <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>ℹ️</span> Les dates de péremption sont saisies ici à titre indicatif (PDF envoyé au client) et ne sont pas enregistrées en base de données.
                </div>
              </section>

              {/* ─ Note interne ─ */}
              <section>
                <SectionTitle icon="📝" label="Note interne" />
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ajouter un commentaire interne sur ce devis…"
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 10,
                    border: "1.5px solid #E5E7EB", fontSize: 13, resize: "vertical",
                    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                    color: "#374151", background: "#FAFAFA", lineHeight: 1.6,
                    transition: "border-color .15s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#93C5FD"}
                  onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
                />
              </section>

            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
