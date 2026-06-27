import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import { IconUsers, IconMail, IconPlus } from "./components/Icons";

// ─── ICÔNES INLINE ───────────────────────────────────────────────────────────
function IconEye({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function IconEyeOff({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
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

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API = "http://localhost:4000/api/clients";

// ─── FILTRES ─────────────────────────────────────────────────────────────────
const FILTRES = [
  { key: "tous", label: "Tous",       statut: "tous" },
  { key: "0",    label: "Clients",    statut: "0" },
  { key: "1",    label: "En attente", statut: "1" },
];

// ─── BADGE ───────────────────────────────────────────────────────────────────
function Badge({ statut }) {
  const isClient = statut === 0;
  return (
    <span
      title={isClient ? "Client" : "En attente"}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 30, height: 30, borderRadius: "50%",
        background: isClient ? "#d1fae5" : "#fef3c7",
        color:      isClient ? "#065f46" : "#92400e",
        boxShadow: `0 0 0 3px ${isClient ? "#ecfdf5" : "#fffbeb"}`,
      }}
    >
      {isClient ? <IconCheck size={14} /> : <IconClock size={14} />}
    </span>
  );
}

// ─── INITIALES AVATAR ────────────────────────────────────────────────────────
function initials(nom, prenom) {
  return `${(nom || " ")[0]}${(prenom || " ")[0]}`.toUpperCase();
}

// ─── CHAMP FORMULAIRE ────────────────────────────────────────────────────────
function Field({ label, name, type = "text", value, onChange, required, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gl-gray-600)" }}>
        {label}{required && <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder || label} required={required}
        style={{
          padding: "8px 12px", borderRadius: 8,
          border: "1px solid var(--gl-gray-200)", fontSize: 13.5,
          outline: "none", background: "var(--gl-gray-50)", color: "var(--gl-gray-900)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
        onBlur={(e)  => (e.target.style.borderColor = "var(--gl-gray-200)")}
      />
    </div>
  );
}

// ─── TUILE INFO (dans popup détail) ──────────────────────────────────────────
function InfoTile({ label, value }) {
  return (
    <div style={{
      flex: 1, background: "var(--gl-gray-50)", borderRadius: 10,
      padding: "10px 14px", border: "1px solid var(--gl-gray-100)",
    }}>
      <div style={{ fontSize: 11, color: "var(--gl-gray-500)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--gl-gray-900)" }}>{value || "—"}</div>
    </div>
  );
}

// ─── BOUTON D'ACTION (icône seule, taille fixe) ──────────────────────────────
function ActionBtn({ title, onClick, children, variant = "ghost" }) {
  const variants = {
    ghost:   { background: "#fff",     color: "var(--gl-gray-500)", border: "1px solid var(--gl-gray-200)" },
    success: { background: "#d1fae5", color: "#065f46",           border: "1px solid #6ee7b7" },
    danger:  { background: "#fff0f0", color: "#c53030",           border: "1px solid #fed7d7" },
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
        e.currentTarget.style.boxShadow = "0 3px 6px rgba(0,0,0,0.12)";
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

  const [detail, setDetail]         = useState(null);

  const [formModal, setFormModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [formErr, setFormErr]       = useState("");
  const [formBusy, setFormBusy]     = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

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

  // ── Accepter ─────────────────────────────────────────────────────────────
  async function accepter(client, e) {
    e.stopPropagation();
    try {
      const res  = await fetch(`${API}/${client.id}/accepter`, { method: "PATCH" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      fetchClients(); fetchAll();
      if (detail?.id === client.id)
        setDetail((prev) => ({ ...prev, statut: 0, label: "Client" }));
    } catch (e) { alert(e.message); }
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
      setDeleteTarget(null); setDetail(null); fetchClients(); fetchAll();
    } catch (e) { alert(e.message); }
  }

  // ── Sidebar ──────────────────────────────────────────────────────────────
  const sidebar = {
    eyebrow: "Administration",
    title: "Clients",
    description: "Gestion des demandes et comptes clients",
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
      <PageHead
        crumb={<>Admin&nbsp;/&nbsp;<b>Clients</b></>}
        title="Portefeuille clients"
        description="Gérez les comptes clients et validez les nouvelles demandes."
        actions={
          <button className="gl-btn gl-btn-primary" onClick={openAdd}>
            <IconPlus width={15} height={15} /> Ajouter un client
          </button>
        }
      />

      {/* ── Feedback état ───────────────────────────────────────────────── */}
      {loading && (
        <p style={{ textAlign: "center", padding: 40, color: "var(--gl-gray-400)", fontSize: 14 }}>
          Chargement…
        </p>
      )}
      {error && (
        <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 10, padding: "12px 16px", color: "#c53030", fontSize: 13.5, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && (
  <div style={{
    overflowX: "auto", borderRadius: 16,
    border: "1px solid var(--gl-gray-200)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 10px 24px rgba(0,0,0,0.05)",
    background: "#fff",
  }}>
    <table style={{
      width: "100%", borderCollapse: "collapse",
      fontSize: 13, color: "var(--gl-gray-800)", lineHeight: 1.4,
      tableLayout: "fixed",
    }}>
      <colgroup>
        <col style={{ width: "18%" }} />{/* ICE */}
        <col style={{ width: "22%" }} />{/* Nom */}
        <col style={{ width: "16%" }} />{/* Prénom */}
        <col style={{ width: "24%" }} />{/* Laboratoire */}
        <col style={{ width: "13%" }} />{/* Statut */}
        <col style={{ width: "15%" }} />{/* Actions */}
      </colgroup>
      <thead>
        <tr style={{
          background: "linear-gradient(180deg, var(--gl-gray-50), #ffffff)",
          borderBottom: "2px solid #7c2d40",
        }}>
          {["ICE", "Nom", "Prénom", "Laboratoire", "Statut", "Actions"].map((h) => (
            <th key={h} style={{
              padding: "14px 16px", textAlign: "left",
              fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em",
              color: "var(--gl-gray-500)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {clients.length === 0 && (
          <tr>
            <td colSpan={6} style={{ textAlign: "center", padding: 56, color: "var(--gl-gray-400)", fontSize: 13.5 }}>
              Aucun enregistrement pour ce filtre.
            </td>
          </tr>
        )}
        {clients.map((c, idx) => (
          <tr
            key={c.id}
            style={{
              borderBottom: "1px solid var(--gl-gray-100)", cursor: "pointer",
              background: idx % 2 === 1 ? "var(--gl-gray-50)" : "#fff",
              transition: "background .12s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fbeef1")}
            onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 1 ? "var(--gl-gray-50)" : "#fff")}
            onClick={() => setDetail(c)}
          >
            <td style={{ padding: "14px 16px", wordBreak: "break-word", fontSize: 12, color: "var(--gl-gray-500)", fontWeight: 500 }}>
              {c.ice || "—"}
            </td>

            <td style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="gl-avatar" style={{ width: 30, height: 30, fontSize: 11.5, flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>
                  {initials(c.nom, c.prenom)}
                </div>
                <span style={{ fontWeight: 700, wordBreak: "break-word", minWidth: 0, color: "var(--gl-gray-900)" }}>{c.nom}</span>
              </div>
            </td>

            <td style={{ padding: "14px 16px", wordBreak: "break-word", color: "var(--gl-gray-700)" }}>{c.prenom}</td>

            <td style={{ padding: "14px 16px", color: "var(--gl-gray-500)", wordBreak: "break-word" }}>
              {c.nomLabo || "—"}
            </td>

            <td style={{ padding: "14px 16px" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Badge statut={c.statut} />
                {c.statut === 1 && (
                  <ActionBtn title="Valider ce client" variant="success" onClick={(e) => accepter(c, e)}>
                    <IconCheck size={13} />
                  </ActionBtn>
                )}
              </div>
            </td>

            <td style={{ padding: "14px 16px" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "flex-start" }}>
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
)}

      {/* ═══════════════════════════════════════════════════════════════════
          POPUP DÉTAIL CLIENT
      ═══════════════════════════════════════════════════════════════════ */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.nom} ${detail.prenom}` : ""}
        subtitle={detail?.nomLabo || "Sans établissement"}
        size="md"
        footer={
          <>
            <button className="gl-btn gl-btn-ghost" onClick={() => setDetail(null)}>Fermer</button>
            {detail?.statut === 1 && (
              <button
                className="gl-btn"
                style={{ background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7", fontWeight: 700 }}
                onClick={(e) => accepter(detail, e)}
              >
                ✓ Accepter ce client
              </button>
            )}
            <button
              className="gl-btn gl-btn-primary"
              onClick={(e) => { setDetail(null); openEdit(detail, e); }}
            >
              Modifier
            </button>
          </>
        }
      >
        {detail && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Bannière statut */}
            <div style={{
              padding: "10px 14px", borderRadius: 10,
              background: detail.statut === 0 ? "#ecfdf5" : "#fffbeb",
              border: `1px solid ${detail.statut === 0 ? "#6ee7b7" : "#fcd34d"}`,
              fontSize: 13, fontWeight: 600,
              color: detail.statut === 0 ? "#065f46" : "#92400e",
            }}>
              {detail.statut === 0
                ? "✓ Ce compte est actif — le client a accès à la plateforme."
                : "⏳ Demande en attente — ce compte n'est pas encore validé."}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <InfoTile label="Nom"    value={detail.nom} />
              <InfoTile label="Prénom" value={detail.prenom} />
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
        subtitle={editTarget ? `${editTarget.nom} ${editTarget.prenom}` : "Remplissez les informations"}
        size="md"
        footer={
          <>
            <button className="gl-btn gl-btn-ghost" onClick={() => setFormModal(false)} disabled={formBusy}>
              Annuler
            </button>
            <button className="gl-btn gl-btn-primary" onClick={handleSubmit} disabled={formBusy}>
              {formBusy ? "Enregistrement…" : editTarget ? "Enregistrer" : "Ajouter"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {formErr && (
            <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 8, padding: "10px 14px", color: "#c53030", fontSize: 13 }}>
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
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gl-gray-600)" }}>Statut</label>
              <select
                value={form.statut}
                onChange={(e) => setForm((p) => ({ ...p, statut: Number(e.target.value) }))}
                style={{
                  padding: "8px 12px", borderRadius: 8,
                  border: "1px solid var(--gl-gray-200)", fontSize: 13.5,
                  background: "var(--gl-gray-50)", color: "var(--gl-gray-900)",
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
            <button className="gl-btn gl-btn-ghost" onClick={() => setDeleteTarget(null)}>Annuler</button>
            <button
              className="gl-btn"
              style={{ background: "#e53e3e", color: "#fff" }}
              onClick={handleDelete}
            >
              Supprimer définitivement
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, color: "var(--gl-gray-700)", lineHeight: 1.6 }}>
          Voulez-vous vraiment supprimer{" "}
          <strong>{deleteTarget?.nom} {deleteTarget?.prenom}</strong> ?
          Cette action est irréversible.
        </p>
      </Modal>
    </AdminLayout>
  );
}
