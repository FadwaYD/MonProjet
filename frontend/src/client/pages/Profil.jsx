/**
 * Profil.jsx
 * ── Design v2 (thème Bordeaux) — VERSION SANS SIDEBAR ──────────────────────
 * Permet à un client connecté de :
 *   - Consulter / modifier ses informations (nom, prénom, email, téléphone,
 *     ville, nom du labo, ICE)
 *   - Changer son mot de passe
 * Utilise les routes /api/client/profile et /api/client/change-password
 * (accessibles à tout utilisateur connecté, pas seulement l'admin).
 *
 * Cette version ne dépend plus de AdminLayout / PageHead / sidebar :
 * elle exporte directement la carte (header + onglets + formulaires),
 * prête à être insérée dans n'importe quel layout.
 */

import React, { useEffect, useState } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_URL = "http://localhost:4000/api/client";

function getToken() {
  return localStorage.getItem("token");
}

// ─── Design tokens ────────────────────────────────────────────────────────
const FONT_DISPLAY = "'Space Grotesk', 'Inter', sans-serif";
const FONT_BODY    = "'Inter', -apple-system, sans-serif";

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

// ─── ICÔNES INLINE ───────────────────────────────────────────────────────────
function IconUser({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}
function IconLock({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
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
function IconBadge({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M8.5 13.5L6 21l6-3 6 3-2.5-7.5" />
    </svg>
  );
}
function IconArrowLeft({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </svg>
  );
}

// ─── UI atoms ─────────────────────────────────────────────────────────────
function Btn({ variant = "ghost", onClick, disabled, children, style = {}, type = "button" }) {
  const vars = {
    primary:   { background: C.petrol, color: C.white, border: "none" },
    danger:    { background: C.danger, color: C.white, border: "none" },
    ghost:     { background: C.white,  color: C.inkSoft, border: `1.5px solid ${C.line}` },
    success:   { background: C.successSoft, color: "#265E43", border: `1.5px solid ${C.successLine}` },
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
        fontFamily: FONT_BODY, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? .5 : 1,
        transition: "opacity .15s ease, transform .12s ease, box-shadow .15s ease",
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

// ─── CHAMP FORMULAIRE ──────────────────────────────────────────────────────
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
          padding: "10px 13px", borderRadius: 8,
          border: `1.5px solid ${C.line}`, fontSize: 13.5,
          outline: "none", background: C.paperSoft, color: C.ink, fontFamily: FONT_BODY,
          transition: "border-color .18s ease, box-shadow .18s ease",
        }}
        onFocus={(e) => (e.target.style.borderColor = C.petrol)}
        onBlur={(e)  => (e.target.style.borderColor = C.line)}
      />
    </div>
  );
}

function Avatar({ nom, prenom, size = 56 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${C.petrol}, ${C.petrolDark})`,
      color: C.white, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size * 0.34,
      boxShadow: "0 4px 14px rgba(122,31,48,.25)",
    }}>
      {`${(nom || " ")[0]}${(prenom || " ")[0]}`.toUpperCase()}
    </div>
  );
}

// ─── Onglet en pastille ───────────────────────────────────────────────────
function PillTab({ active, onClick, icon: Icon, children }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "9px 18px", borderRadius: 999,
      border: active ? `1.5px solid ${C.petrol}` : `1.5px solid ${C.line}`,
      cursor: "pointer", fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
      background: active ? C.petrol : C.white,
      color: active ? C.white : C.inkSoft,
      boxShadow: active ? "0 4px 12px rgba(122,31,48,.22)" : "none",
      transition: "background .18s ease, color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .12s ease",
    }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <Icon size={14} />
      {children}
    </button>
  );
}

// ─── Bouton retour ────────────────────────────────────────────────────────
function BackButton({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        background: "transparent", border: "none", cursor: "pointer",
        padding: "6px 4px", marginBottom: 14,
        fontFamily: FONT_BODY, fontSize: 13, fontWeight: 700,
        color: hover ? C.petrol : C.inkSoft,
        transform: hover ? "translateX(-3px)" : "translateX(0)",
        transition: "color .18s ease, transform .18s ease",
      }}
    >
      <IconArrowLeft size={15} />
      Retour
    </button>
  );
}

// ─── FORMULAIRES VIDES ─────────────────────────────────────────────────────
const EMPTY_PROFIL = { nom: "", prenom: "", email: "", telephone: "", ville: "", nomLabo: "", ice: "" };
const EMPTY_PASSWORD = { ancien_mdp: "", nouveau_mdp: "", confirmer_mdp: "" };

// ─── COMPOSANT PRINCIPAL (sans layout / sidebar) ──────────────────────────
export default function Profil({ onBack }) {
  const [activeTab, setActiveTab] = useState("profil");
  const [loading, setLoading] = useState(true);
  const [tabKey, setTabKey] = useState(0);

  function switchTab(tab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setTabKey((k) => k + 1);
  }

  function handleBack() {
    if (typeof onBack === "function") onBack();
    else if (typeof window !== "undefined" && window.history.length > 1) window.history.back();
  }

  const [profil, setProfil] = useState(EMPTY_PROFIL);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD);

  const [savingProfil, setSavingProfil] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [toast, setToast] = useState(null);
  const notif = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    chargerProfil();
  }, []);

  async function chargerProfil() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfil({
          nom: data.data.nom || "",
          prenom: data.data.prenom || "",
          email: data.data.email || "",
          telephone: data.data.telephone || "",
          ville: data.data.ville || "",
          nomLabo: data.data.nomLabo || "",
          ice: data.data.ice || "",
        });
      } else {
        notif(data.message || "Impossible de charger le profil", "error");
      }
    } catch (e) {
      notif("Erreur de connexion au serveur", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleProfilSubmit(e) {
    e.preventDefault();
    setSavingProfil(true);
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(profil),
      });
      const data = await res.json();
      notif(data.message, data.success ? "success" : "error");
    } catch (e) {
      notif("Erreur de connexion au serveur", "error");
    } finally {
      setSavingProfil(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setSavingPassword(true);
    try {
      const res = await fetch(`${API_URL}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      notif(data.message, data.success ? "success" : "error");
      if (data.success) setPasswordForm(EMPTY_PASSWORD);
    } catch (e) {
      notif("Erreur de connexion au serveur", "error");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div style={{
      fontFamily: FONT_BODY, color: C.ink, width: "100%",
      minHeight: "100vh", display: "flex", justifyContent: "center",
      alignItems: "flex-start", padding: "48px 20px", boxSizing: "border-box",
      background: C.paper,
    }}>
      <style>{`
        ${GOOGLE_FONTS_IMPORT}
        @keyframes cardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tabIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <Toast toast={toast} />

      <div style={{ width: "100%", maxWidth: 640 }}>
        <BackButton onClick={handleBack} />

        {/* ── Carte unique, centrée ───────────────────────────────────── */}
        <div style={{
          background: C.white, borderRadius: 14, overflow: "hidden",
          border: `1px solid ${C.line}`,
          boxShadow: "0 1px 3px rgba(36,16,20,.04), 0 10px 28px rgba(122,31,48,.06)",
          width: "100%",
          animation: "cardIn .32s ease",
        }}>
        {/* ── Header horizontal : avatar + identité + badge rôle ────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "28px 32px", background: C.paperSoft,
          borderBottom: `1px solid ${C.line}`,
        }}>
          {loading ? (
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.sageSoft }} />
          ) : (
            <Avatar nom={profil.nom} prenom={profil.prenom} size={56} />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: FONT_DISPLAY, color: C.ink }}>
              {profil.prenom || "Client"} {profil.nom}
            </div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 2 }}>
              {profil.email || "—"}
            </div>
            {profil.nomLabo && (
              <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>
                {profil.nomLabo}
              </div>
            )}
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 999,
            background: C.sageSoft,
            border: `1px solid ${C.sageLine}`,
            color: C.inkSoft, fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: ".05em",
            flexShrink: 0,
          }}>
            <IconBadge size={12} /> Client
          </div>
        </div>

        {/* ── Navigation par pastilles ───────────────────────────────── */}
        <div style={{ display: "flex", gap: 10, padding: "20px 32px 0" }}>
          <PillTab active={activeTab === "profil"} onClick={() => switchTab("profil")} icon={IconUser}>
            Informations
          </PillTab>
          <PillTab active={activeTab === "securite"} onClick={() => switchTab("securite")} icon={IconLock}>
            Sécurité
          </PillTab>
        </div>

        {/* ── Contenu ─────────────────────────────────────────────────── */}
        <div key={tabKey} style={{ padding: "28px 32px 36px", animation: "tabIn .22s ease" }}>
          {loading ? (
            <div style={{ color: C.muted, fontSize: 13.5 }}>Chargement du profil…</div>
          ) : activeTab === "profil" ? (
            <>
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: FONT_DISPLAY, color: C.ink }}>
                  Informations personnelles
                </div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 3 }}>
                  Ces informations sont visibles uniquement par vous et l'administrateur.
                </div>
              </div>

              <form onSubmit={handleProfilSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Prénom" name="prenom" value={profil.prenom}
                    onChange={(e) => setProfil((p) => ({ ...p, prenom: e.target.value }))} required />
                  <Field label="Nom" name="nom" value={profil.nom}
                    onChange={(e) => setProfil((p) => ({ ...p, nom: e.target.value }))} required />
                </div>

                <Field label="Adresse email" name="email" type="email" value={profil.email}
                  onChange={(e) => setProfil((p) => ({ ...p, email: e.target.value }))} required />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Téléphone" name="telephone" value={profil.telephone}
                    onChange={(e) => setProfil((p) => ({ ...p, telephone: e.target.value }))}
                    placeholder="+212 6XX XXX XXX" />
                  <Field label="Ville" name="ville" value={profil.ville}
                    onChange={(e) => setProfil((p) => ({ ...p, ville: e.target.value }))}
                    placeholder="Casablanca" />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Nom du laboratoire" name="nomLabo" value={profil.nomLabo}
                    onChange={(e) => setProfil((p) => ({ ...p, nomLabo: e.target.value }))}
                    placeholder="Laboratoire Atlas" />
                  <Field label="ICE" name="ice" value={profil.ice}
                    onChange={(e) => setProfil((p) => ({ ...p, ice: e.target.value }))}
                    placeholder="ICE001234567" />
                </div>

                <div>
                  <Btn variant="primary" type="submit" disabled={savingProfil}>
                    <IconCheck size={13} /> {savingProfil ? "Enregistrement…" : "Enregistrer les modifications"}
                  </Btn>
                </div>
              </form>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: FONT_DISPLAY, color: C.ink }}>
                  Sécurité du compte
                </div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 3 }}>
                  Choisissez un mot de passe fort et ne le partagez avec personne.
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
                <Field label="Mot de passe actuel" name="ancien_mdp" type="password"
                  value={passwordForm.ancien_mdp}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, ancien_mdp: e.target.value }))}
                  required />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Nouveau mot de passe" name="nouveau_mdp" type="password"
                    value={passwordForm.nouveau_mdp}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, nouveau_mdp: e.target.value }))}
                    required />
                  <Field label="Confirmer le mot de passe" name="confirmer_mdp" type="password"
                    value={passwordForm.confirmer_mdp}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmer_mdp: e.target.value }))}
                    required />
                </div>

                <div style={{
                  fontSize: 11.5, color: C.muted, background: C.paperSoft,
                  border: `1px solid ${C.lineSoft}`, borderRadius: 8, padding: "9px 12px",
                }}>
                  Le mot de passe doit contenir au moins 6 caractères.
                </div>

                <div>
                  <Btn variant="primary" type="submit" disabled={savingPassword}>
                    <IconCheck size={13} /> {savingPassword ? "Modification…" : "Changer le mot de passe"}
                  </Btn>
                
                </div>
                
              </form>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}