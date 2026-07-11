/**
 * Customers.jsx
 * ── Design (thème Bordeaux, aligné sur Products.jsx) ───────────────────────
 * Reprend l'identité visuelle du catalogue produits :
 *   - Palette "cave à vin" (bordeaux profond / lie-de-vin / doré cire-de-bouchon)
 *   - Typographie Space Grotesk (titres) + Inter (corps) + IBM Plex Mono (réf/chiffres)
 *   - Étiquette-échantillon RefTag pour le code ICE
 *   - Toolbar avec recherche + filtre, comme la page Produits
 *   - Toasts au lieu des alert() natifs
 * Aucune logique métier (API, endpoints, champs) n'a été modifiée.
 */

import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import { IconUsers, IconPlus, IconSearch } from "./components/Icons";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API = "http://localhost:4000/api/clients";

// ─── FILTRES ─────────────────────────────────────────────────────────────────
const FILTRES = [
  { key: "tous", label: "Tous",       statut: "tous" },
  { key: "0",    label: "Clients",    statut: "0" },
  { key: "1",    label: "En attente", statut: "1" },
];

// ─── Design tokens (identiques à Products.jsx) ───────────────────────────────
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

// Statut -> couleur (harmonisé avec la palette bordeaux : vert succès / doré cire-de-bouchon)
const STATUT_STYLE = {
  0: { bg: C.successSoft, color: "#265E43", dot: C.success, label: "Client" },
  1: { bg: C.claySoft,    color: "#8A5423", dot: C.clay,    label: "En attente" },
};

// ─── ICÔNES INLINE ───────────────────────────────────────────────────────────
function IconEye({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function IconPencil({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
function IconTrash({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}
function IconCheck({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconClock({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}

// ─── Étiquette-échantillon pour le code ICE (identique à RefTag de Products) ─
function RefTag({ text, tone = C.petrol, size = "md" }) {
  const big = size === "lg";
  const xs  = size === "xs";
  if (!text) return <span style={{ color: C.muted, fontSize: 12, fontStyle: "italic" }}>—</span>;
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

// ─── UI atoms (identiques à Products.jsx) ────────────────────────────────────
function Btn({ variant = "ghost", onClick, disabled, children, style = {}, type = "button" }) {
  const vars = {
    primary:   { background: C.petrol, color: C.white, border: "none" },
    danger:    { background: C.danger, color: C.white, border: "none" },
    ghost:     { background: C.white,  color: C.inkSoft, border: `1.5px solid ${C.line}` },
    red_ghost: { background: C.dangerSoft, color: C.danger, border: `1.5px solid ${C.dangerLine}` },
    success:   { background: C.successSoft, color: "#265E43", border: `1.5px solid ${C.successLine}` },
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

function StatutBadge({ statut, size = "md" }) {
  const s = STATUT_STYLE[statut] || { bg: C.sageSoft, color: C.inkSoft, dot: C.muted, label: "—" };
  const sm = size === "sm";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: sm ? 4 : 5,
      padding: sm ? "2px 8px" : "3px 10px", borderRadius: 999,
      fontSize: sm ? 10.5 : 11.5, fontWeight: 700,
      fontFamily: FONT_BODY, background: s.bg, color: s.color, whiteSpace: "nowrap",
    }}>
      <span style={{ width: sm ? 5 : 6, height: sm ? 5 : 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
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

function Avatar({ nom, prenom, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${C.petrol}, ${C.petrolDark})`,
      color: C.white, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size * 0.36,
      boxShadow: "0 2px 6px rgba(122,31,48,.25)",
    }}>
      {`${(nom || " ")[0]}${(prenom || " ")[0]}`.toUpperCase()}
    </div>
  );
}

// ─── BOUTON D'ACTION (icône seule, taille fixe) ──────────────────────────────
function ActionBtn({ title, onClick, children, variant = "ghost" }) {
  const variants = {
    ghost:   { background: C.white,      color: C.inkSoft, border: `1px solid ${C.line}` },
    success: { background: C.successSoft, color: "#265E43", border: `1px solid ${C.successLine}` },
    danger:  { background: C.dangerSoft,  color: C.danger,  border: `1px solid ${C.dangerLine}` },
  };
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 26, height: 26, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 7, cursor: "pointer",
        transition: "transform .12s ease, box-shadow .12s ease, filter .12s ease",
        ...variants[variant],
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.filter = "brightness(0.97)";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 3px 6px rgba(36,16,20,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "";
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {children}
    </button>
  );
}

// ─── CHAMP FORMULAIRE (restylé bordeaux) ─────────────────────────────────────
function Field({ label, name, type = "text", value, onChange, required, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, fontFamily: FONT_BODY, textTransform: "uppercase", letterSpacing: ".04em" }}>
        {label}{required && <span style={{ color: C.danger, marginLeft: 2 }}>*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder || label} required={required}
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

// ─── TUILE INFO (dans popup détail) ──────────────────────────────────────────
function InfoTile({ label, value }) {
  return (
    <div style={{
      flex: 1, background: C.paperSoft, borderRadius: 10,
      padding: "10px 14px", border: `1px solid ${C.line}`,
    }}>
      <div style={{ fontSize: 9.5, color: C.muted, fontWeight: 700, fontFamily: FONT_BODY, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, fontFamily: FONT_BODY }}>{value || "—"}</div>
    </div>
  );
}

// ─── FORMULAIRE VIDE ─────────────────────────────────────────────────────────
const EMPTY = {
  ice: "", nom: "", prenom: "", nomLabo: "",
  email: "", telephone: "", mot_de_passe: "",
  message: "", statut: 1,
};

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────
export default function Customers() {
  const [clients, setClients]       = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filtre, setFiltre]         = useState("tous");
  const [query, setQuery]           = useState("");

  const [detail, setDetail]         = useState(null);

  const [formModal, setFormModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [formErr, setFormErr]       = useState("");
  const [formBusy, setFormBusy]     = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

  const [toast, setToast] = useState(null);
  const notif = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Fetch liste filtrée ───────────────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}?statut=${filtre}`);
      const json = await res.json();
      if (json.success) setClients(json.data);
      else throw new Error(json.message);
    } catch (e) { setError(e.message || "Impossible de contacter le serveur"); }
    finally { setLoading(false); }
  }, [filtre]);

  // ── Fetch tous (compteurs) ────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const res  = await fetch(`${API}?statut=tous`);
      const json = await res.json();
      if (json.success) setAllClients(json.data);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchClients(); fetchAll(); }, [fetchClients, fetchAll]);

  const count = (val) => allClients.filter((c) => c.statut === val).length;

  // ── Filtrage local par recherche (nom, prénom, email, labo, ICE) ──────────
  const q = query.trim().toLowerCase();
  const visibleClients = q
    ? clients.filter((c) => {
        const haystack = [c.nom, c.prenom, c.email, c.nomLabo, c.ice, c.telephone]
          .filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(q);
      })
    : clients;

  // ── Accepter ─────────────────────────────────────────────────────────────
  async function accepter(client, e) {
    e.stopPropagation();
    try {
      const res  = await fetch(`${API}/${client.id}/accepter`, { method: "PATCH" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      notif("Client validé avec succès");
      fetchClients(); fetchAll();
      if (detail?.id === client.id)
        setDetail((prev) => ({ ...prev, statut: 0, label: "Client" }));
    } catch (e) { notif(e.message, "error"); }
  }

  // ── Ouvrir ajout ─────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null); setForm(EMPTY); setFormErr(""); setFormModal(true);
  }

  // ── Ouvrir modif ─────────────────────────────────────────────────────────
  function openEdit(client, e) {
    e?.stopPropagation();
    setEditTarget(client);
    setForm({
      ice:         client.ice         || "",
      nom:         client.nom,
      prenom:      client.prenom,
      nomLabo:     client.nomLabo     || "",
      email:       client.email,
      telephone:   client.telephone   || "",
      mot_de_passe: "",
      message:     client.message     || "",
      statut:      client.statut,
    });
    setFormErr(""); setFormModal(true);
  }

  // ── Soumettre formulaire ──────────────────────────────────────────────────
  async function handleSubmit() {
    setFormErr("");
    if (!form.nom || !form.prenom || !form.email) {
      setFormErr("Nom, prénom et email sont obligatoires."); return;
    }
    if (!editTarget && !form.mot_de_passe) {
      setFormErr("Le mot de passe est obligatoire."); return;
    }
    setFormBusy(true);
    try {
      const url    = editTarget ? `${API}/${editTarget.id}` : API;
      const method = editTarget ? "PUT" : "POST";
      const body   = { ...form, statut: Number(form.statut) };
      if (editTarget && !body.mot_de_passe) delete body.mot_de_passe;
      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      notif(editTarget ? "Client mis à jour" : "Client ajouté");
      setFormModal(false); fetchClients(); fetchAll();
    } catch (e) { setFormErr(e.message); }
    finally { setFormBusy(false); }
  }

  // ── Supprimer ────────────────────────────────────────────────────────────
  async function handleDelete() {
    try {
      const res  = await fetch(`${API}/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      notif("Client supprimé");
      setDeleteTarget(null); setDetail(null); fetchClients(); fetchAll();
    } catch (e) { notif(e.message, "error"); }
  }

  // ── Sidebar ──────────────────────────────────────────────────────────────
  const sidebar = {
    eyebrow: "Administration",
    title: "Clients",
    description: "Filtrer par statut de compte",
    sections: [{
      title: "Filtres",
      items: FILTRES.map((f) => ({
        key: f.key, label: f.label, icon: IconUsers,
        count: f.key === "tous" ? allClients.length : count(Number(f.key)),
        active: filtre === f.key,
        onClick: () => setFiltre(f.key),
      })),
    }],
    promo: {
      title: "Validation",
      text: "Les demandes en attente nécessitent votre approbation avant d'accéder à la plateforme.",
    },
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <AdminLayout sidebar={sidebar}>
      <style>{GOOGLE_FONTS_IMPORT}</style>
      <div style={{ fontFamily: FONT_BODY, color: C.ink }}>
        <Toast toast={toast} />

        <PageHead
          crumb={<>Admin&nbsp;/&nbsp;<b>Clients</b></>}
          title="Portefeuille clients"
          description="Gérez les comptes clients et validez les nouvelles demandes."
          actions={
            <Btn variant="primary" onClick={openAdd}>
              <IconPlus width={15} height={15} /> Ajouter un client
            </Btn>
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

        {/* ═══════════════════════ TABLEAU GLOBAL (compact, style Produits) ═══════════════════════ */}
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
            }}>👥</span>
            <span style={{
              fontSize: 13, fontWeight: 700, color: C.petrolDark, fontFamily: FONT_DISPLAY,
              letterSpacing: ".01em",
            }}>Répertoire clients</span>

            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: C.white, border: `1.5px solid ${C.petrolLine}`, borderRadius: 8,
              padding: "5px 10px", minWidth: 220,
            }}>
              <IconSearch width={13} height={13} color={C.petrol} />
              <input
                placeholder="Rechercher par nom, email, ICE…"
                value={query} onChange={(e) => setQuery(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: 12, fontFamily: FONT_BODY, width: "100%", background: "transparent", color: C.ink }}
              />
            </div>

            <select value={filtre} onChange={(e) => setFiltre(e.target.value)} style={{
              padding: "5px 24px 5px 9px", borderRadius: 7,
              border: `1.5px solid ${C.petrolLine}`, fontSize: 12, fontWeight: 600,
              fontFamily: FONT_BODY, color: C.petrolDark, background: C.white,
              cursor: "pointer", outline: "none",
            }}>
              {FILTRES.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>

            {loading && <span style={{ fontSize: 11.5, color: C.petrol, fontWeight: 600 }}>Chargement…</span>}

            <span style={{
              marginLeft: "auto", fontSize: 11, fontWeight: 700, color: C.petrolDark,
              fontFamily: FONT_MONO, background: C.white, padding: "3px 10px",
              borderRadius: 999, border: `1px solid ${C.petrolLine}`,
            }}>
              {visibleClients.length} client(s)
            </span>
          </div>

          {/* Table compacte */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
              <colgroup>
                <col style={{ width: "14%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead style={{ background: C.paperSoft }}>
                <tr>
                  <TH>ICE</TH>
                  <TH>Nom</TH>
                  <TH>Prénom</TH>
                  <TH>Laboratoire</TH>
                  <TH center>Statut</TH>
                  <TH center>Actions</TH>
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
                {!loading && visibleClients.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
                      <div style={{ fontSize: 30, marginBottom: 8, opacity: .6 }}>🔍</div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, marginBottom: 3, fontFamily: FONT_DISPLAY }}>
                        Aucun client trouvé
                      </div>
                      <div style={{ fontSize: 12 }}>Essayez une autre recherche ou catégorie.</div>
                    </td>
                  </tr>
                )}
                {!loading && visibleClients.map((c, idx) => (
                  <tr key={c.id}
                    onClick={() => setDetail(c)}
                    style={{ cursor: "pointer", borderBottom: idx < visibleClients.length - 1 ? `1px solid ${C.lineSoft}` : "none", transition: "background .1s" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.paperSoft}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "8px 8px", overflow: "hidden" }}>
                      <RefTag text={c.ice} tone={STATUT_STYLE[c.statut]?.dot || C.petrol} size="xs" />
                    </td>

                    <td style={{ padding: "8px 8px", overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar nom={c.nom} prenom={c.prenom} size={30} />
                        <span style={{ fontWeight: 700, fontSize: 12.5, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={c.nom}>
                          {c.nom}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: "8px 8px", fontSize: 12, color: C.inkSoft, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.prenom}
                    </td>

                    <td style={{ padding: "8px 8px", fontSize: 11.5, color: C.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={c.nomLabo || ""}>
                      {c.nomLabo || <span style={{ color: C.muted }}>—</span>}
                    </td>

                    <td style={{ padding: "8px 8px", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                        <StatutBadge statut={c.statut} size="sm" />
                        {c.statut === 1 && (
                          <ActionBtn title="Valider ce client" variant="success" onClick={(e) => accepter(c, e)}>
                            <IconCheck size={12} />
                          </ActionBtn>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: "8px 8px" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
                        <ActionBtn title="Voir le détail" onClick={(e) => { e.stopPropagation(); setDetail(c); }}>
                          <IconEye size={13} />
                        </ActionBtn>
                        <ActionBtn title="Modifier" onClick={(e) => openEdit(c, e)}>
                          <IconPencil size={13} />
                        </ActionBtn>
                        <ActionBtn title="Supprimer" variant="danger" onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }}>
                          <IconTrash size={13} />
                        </ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            POPUP DÉTAIL CLIENT
        ═══════════════════════════════════════════════════════════════════ */}
        <Modal
          open={!!detail}
          onClose={() => setDetail(null)}
          title={detail ? `${detail.nom} ${detail.prenom}` : ""}
          subtitle={detail && <RefTag text={detail.ice} size="xs" />}
          size="md"
          footer={
            <>
              <Btn variant="ghost" onClick={() => setDetail(null)}>Fermer</Btn>
              {detail?.statut === 1 && (
                <Btn variant="success" onClick={(e) => accepter(detail, e)}>
                  <IconCheck width={13} height={13} /> Accepter ce client
                </Btn>
              )}
              <Btn variant="primary" onClick={(e) => { const t = detail; setDetail(null); openEdit(t, e); }}>
                <IconPencil width={13} height={13} /> Modifier
              </Btn>
            </>
          }
        >
          {detail && (
            <div style={{ fontFamily: FONT_BODY, color: C.ink, display: "flex", flexDirection: "column", gap: 12 }}>
              <style>{GOOGLE_FONTS_IMPORT}</style>

              {/* Bannière statut */}
              <div style={{
                padding: "10px 14px", borderRadius: 10,
                background: detail.statut === 0 ? C.successSoft : C.claySoft,
                border: `1px solid ${detail.statut === 0 ? C.successLine : C.clayLine}`,
                fontSize: 13, fontWeight: 600,
                color: detail.statut === 0 ? "#265E43" : "#8A5423",
              }}>
                {detail.statut === 0
                  ? "✓ Ce compte est actif — le client a accès à la plateforme."
                  : "⏳ Demande en attente — ce compte n'est pas encore validé."}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar nom={detail.nom} prenom={detail.prenom} size={52} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, fontFamily: FONT_DISPLAY, color: C.ink }}>
                    {detail.nom} {detail.prenom}
                  </div>
                  <div style={{ fontSize: 12.5, color: C.inkSoft }}>{detail.nomLabo || "Sans établissement"}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <InfoTile label="Email"     value={detail.email} />
                <InfoTile label="Téléphone" value={detail.telephone} />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <InfoTile label="Laboratoire / Établissement" value={detail.nomLabo} />
                <InfoTile label="Code ICE"                    value={detail.ice} />
              </div>
            </div>
          )}
        </Modal>

        {/* ═══════════════════════════════════════════════════════════════════
            POPUP AJOUT / MODIFICATION
        ═══════════════════════════════════════════════════════════════════ */}
        <Modal
          open={formModal}
          onClose={() => setFormModal(false)}
          title={editTarget ? "Modifier le client" : "Ajouter un client"}
          subtitle={editTarget ? <RefTag text={editTarget.ice} size="xs" /> : "Renseignez les informations du nouveau client"}
          size="md"
          footer={
            <>
              <Btn variant="ghost" onClick={() => setFormModal(false)} disabled={formBusy}>Annuler</Btn>
              <Btn variant="primary" onClick={handleSubmit} disabled={formBusy}>
                <IconCheck width={13} height={13} /> {formBusy ? "Enregistrement…" : editTarget ? "Enregistrer" : "Ajouter"}
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Nom"    name="nom"    value={form.nom}
                onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} required />
              <Field label="Prénom" name="prenom" value={form.prenom}
                onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))} required />
            </div>

            <Field label="Laboratoire / Établissement" name="nomLabo" value={form.nomLabo}
              onChange={(e) => setForm((p) => ({ ...p, nomLabo: e.target.value }))} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Email" name="email" type="email" value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
              <Field label="Téléphone" name="telephone" type="tel" value={form.telephone}
                onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Code ICE" name="ice" value={form.ice}
                onChange={(e) => setForm((p) => ({ ...p, ice: e.target.value }))} />

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, fontFamily: FONT_BODY, textTransform: "uppercase", letterSpacing: ".04em" }}>
                  Statut
                </label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm((p) => ({ ...p, statut: Number(e.target.value) }))}
                  style={{
                    padding: "9px 12px", borderRadius: 8,
                    border: `1.5px solid ${C.line}`, fontSize: 13.5,
                    background: C.paperSoft, color: C.ink, fontFamily: FONT_BODY,
                  }}
                >
                  <option value={1}>En attente</option>
                  <option value={0}>Client (accepté)</option>
                </select>
              </div>
            </div>

            <Field
              label={editTarget ? "Nouveau mot de passe (laisser vide = inchangé)" : "Mot de passe"}
              name="mot_de_passe" type="password"
              value={form.mot_de_passe}
              onChange={(e) => setForm((p) => ({ ...p, mot_de_passe: e.target.value }))}
              required={!editTarget}
              placeholder={editTarget ? "Laisser vide pour ne pas modifier" : "Mot de passe"}
            />
          </div>
        </Modal>

        {/* ═══════════════════════════════════════════════════════════════════
            POPUP CONFIRMATION SUPPRESSION
        ═══════════════════════════════════════════════════════════════════ */}
        <Modal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Confirmer la suppression"
          size="sm"
          footer={
            <>
              <Btn variant="ghost" onClick={() => setDeleteTarget(null)}>Annuler</Btn>
              <Btn variant="danger" onClick={handleDelete}>Supprimer définitivement</Btn>
            </>
          }
        >
          <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, fontFamily: FONT_BODY }}>
            Voulez-vous vraiment supprimer{" "}
            <strong style={{ color: C.ink }}>{deleteTarget?.nom} {deleteTarget?.prenom}</strong> ?
            Cette action est irréversible.
          </p>
        </Modal>
      </div>
    </AdminLayout>
  );
}
