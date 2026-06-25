import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import { IconUsers, IconMail, IconPlus } from "./components/Icons";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API = "http://localhost:4000/api/clients";

// ─── FILTRES ─────────────────────────────────────────────────────────────────
const FILTRES = [
  { key: "tous",  label: "Tous",           statut: "tous" },
  { key: "0",     label: "Clients",        statut: "0" },
  { key: "1",     label: "En attente",     statut: "1" },
];

// ─── BADGE ───────────────────────────────────────────────────────────────────
function Badge({ statut }) {
  const isClient = statut === 0;
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11.5,
      fontWeight: 700,
      background: isClient ? "#d1fae5" : "#fef3c7",
      color: isClient ? "#065f46" : "#92400e",
    }}>
      {isClient ? "✓ Client" : "⏳ En attente"}
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
      flex: 1, background: "var(--gl-gray-50)",
      borderRadius: 10, padding: "10px 14px",
      border: "1px solid var(--gl-gray-100)",
    }}>
      <div style={{ fontSize: 11, color: "var(--gl-gray-500)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--gl-gray-900)" }}>{value || "—"}</div>
    </div>
  );
}

// ─── FORMULAIRE VIDE ─────────────────────────────────────────────────────────
const EMPTY = { nom: "", prenom: "", nomLabo: "", telephone: "", gmail: "", codeICE: "", motDePasse: "", statut: 1 };

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────
export default function Customers() {
  const [clients, setClients]         = useState([]);
  const [allClients, setAllClients]   = useState([]); // toujours tous, pour les compteurs
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [filtre, setFiltre]           = useState("tous");

  // Popup détail
  const [detail, setDetail]           = useState(null);

  // Popup ajout / modif
  const [formModal, setFormModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [form, setForm]               = useState(EMPTY);
  const [formErr, setFormErr]         = useState("");
  const [formBusy, setFormBusy]       = useState(false);

  // Popup suppression
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Fetch liste filtrée (affichage) ──────────────────────────────────────
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

  // ── Fetch tous les clients (compteurs sidebar) ────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const res  = await fetch(`${API}?statut=tous`);
      const json = await res.json();
      if (json.success) setAllClients(json.data);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchClients(); fetchAll(); }, [fetchClients, fetchAll]);

  // ── Compteurs exacts depuis allClients ────────────────────────────────────
  const count = (val) => allClients.filter((c) => c.statut === val).length;

  // ── Accepter un client ───────────────────────────────────────────────────
  async function accepter(client, e) {
    e.stopPropagation();
    try {
      const res  = await fetch(`${API}/${client.id}/accepter`, { method: "PATCH" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      fetchClients(); fetchAll();
      if (detail?.id === client.id) setDetail((prev) => ({ ...prev, statut: 0, label: "Client" }));
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
    setForm({ nom: client.nom, prenom: client.prenom, nomLabo: client.nomLabo || "",
      telephone: client.telephone || "", gmail: client.gmail, codeICE: client.codeICE || "",
      motDePasse: "", statut: client.statut });
    setFormErr(""); setFormModal(true);
  }

  // ── Soumettre formulaire ─────────────────────────────────────────────────
  async function handleSubmit() {
    setFormErr("");
    if (!form.nom || !form.prenom || !form.gmail) { setFormErr("Nom, prénom et email sont obligatoires."); return; }
    if (!editTarget && !form.motDePasse) { setFormErr("Le mot de passe est obligatoire."); return; }
    setFormBusy(true);
    try {
      const url    = editTarget ? `${API}/${editTarget.id}` : API;
      const method = editTarget ? "PUT" : "POST";
      const body   = { ...form, statut: Number(form.statut) };
      if (editTarget && !body.motDePasse) delete body.motDePasse;
      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
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
    promo: { title: "Validation", text: "Les demandes en attente nécessitent votre approbation avant d'accéder à la plateforme." },
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

      {/* ── Feedback état ──────────────────────────────────────────────── */}
      {loading && <p style={{ textAlign: "center", padding: 40, color: "var(--gl-gray-400)", fontSize: 14 }}>Chargement…</p>}
      {error   && (
        <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 10, padding: "12px 16px", color: "#c53030", fontSize: 13.5, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Grille cartes ──────────────────────────────────────────────── */}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {clients.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 48, color: "var(--gl-gray-400)", fontSize: 14 }}>
              Aucun enregistrement pour ce filtre.
            </div>
          )}

          {clients.map((c) => (
            <div key={c.id} className="gl-card gl-card-pad" style={{ cursor: "pointer" }} onClick={() => setDetail(c)}>

              {/* En-tête carte */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div className="gl-name-cell">
                  <div className="gl-avatar">{initials(c.nom, c.prenom)}</div>
                  <div>
                    <div className="name">{c.nom} {c.prenom}</div>
                    <div className="sub">{c.nomLabo || "—"}</div>
                  </div>
                </div>
                <Badge statut={c.statut} />
              </div>

              {/* Email */}
              <div style={{ fontSize: 12.5, color: "var(--gl-gray-500)", marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <IconMail width={13} height={13} /> {c.gmail}
              </div>

              {/* Actions */}
              <div
                style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--gl-gray-100)" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Bouton Accepter — visible seulement si en attente */}
                {c.statut === 1 && (
                  <button
                    className="gl-btn"
                    style={{ flex: 1, fontSize: 12, padding: "5px 0", background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7", fontWeight: 700 }}
                    onClick={(e) => accepter(c, e)}
                  >
                    ✓ Accepter
                  </button>
                )}

                {/* Bouton Voir */}
                <button
                  className="gl-btn gl-btn-ghost"
                  style={{ flex: 1, fontSize: 12, padding: "5px 0" }}
                  onClick={(e) => { e.stopPropagation(); setDetail(c); }}
                >
                  Voir
                </button>

                {/* Bouton Modifier */}
                <button
                  className="gl-btn gl-btn-ghost"
                  style={{ flex: 1, fontSize: 12, padding: "5px 0" }}
                  onClick={(e) => openEdit(c, e)}
                >
                  Modifier
                </button>

                {/* Bouton Supprimer */}
                <button
                  className="gl-btn"
                  style={{ flex: 1, fontSize: 12, padding: "5px 0", background: "#fff0f0", color: "#c53030", border: "1px solid #fed7d7" }}
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
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
            <button className="gl-btn gl-btn-primary" onClick={(e) => { setDetail(null); openEdit(detail, e); }}>
              Modifier
            </button>
          </>
        }
      >
        {detail && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Statut banner */}
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

            {/* Infos ligne 1 */}
            <div style={{ display: "flex", gap: 10 }}>
              <InfoTile label="Nom" value={detail.nom} />
              <InfoTile label="Prénom" value={detail.prenom} />
            </div>

            {/* Infos ligne 2 */}
            <div style={{ display: "flex", gap: 10 }}>
              <InfoTile label="Email" value={detail.gmail} />
              <InfoTile label="Téléphone" value={detail.telephone} />
            </div>

            {/* Infos ligne 3 */}
            <div style={{ display: "flex", gap: 10 }}>
              <InfoTile label="Laboratoire / Établissement" value={detail.nomLabo} />
              <InfoTile label="Code ICE" value={detail.codeICE} />
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
            <button className="gl-btn gl-btn-ghost" onClick={() => setFormModal(false)} disabled={formBusy}>Annuler</button>
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
            <Field label="Nom"    name="nom"    value={form.nom}    onChange={(e) => setForm((p) => ({ ...p, nom:    e.target.value }))} required />
            <Field label="Prénom" name="prenom" value={form.prenom} onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))} required />
          </div>

          <Field label="Laboratoire / Établissement" name="nomLabo" value={form.nomLabo} onChange={(e) => setForm((p) => ({ ...p, nomLabo: e.target.value }))} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Email" name="gmail" type="email" value={form.gmail} onChange={(e) => setForm((p) => ({ ...p, gmail: e.target.value }))} required />
            <Field label="Téléphone" name="telephone" type="tel" value={form.telephone} onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Code ICE" name="codeICE" value={form.codeICE} onChange={(e) => setForm((p) => ({ ...p, codeICE: e.target.value }))} />

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gl-gray-600)" }}>Statut</label>
              <select
                value={form.statut}
                onChange={(e) => setForm((p) => ({ ...p, statut: Number(e.target.value) }))}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--gl-gray-200)", fontSize: 13.5, background: "var(--gl-gray-50)", color: "var(--gl-gray-900)" }}
              >
                <option value={1}>En attente</option>
                <option value={0}>Client (accepté)</option>
              </select>
            </div>
          </div>

          <Field
            label={editTarget ? "Nouveau mot de passe (laisser vide = inchangé)" : "Mot de passe"}
            name="motDePasse" type="password"
            value={form.motDePasse}
            onChange={(e) => setForm((p) => ({ ...p, motDePasse: e.target.value }))}
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
            <button className="gl-btn" style={{ background: "#e53e3e", color: "#fff" }} onClick={handleDelete}>
              Supprimer définitivement
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, color: "var(--gl-gray-700)", lineHeight: 1.6 }}>
          Voulez-vous vraiment supprimer <strong>{deleteTarget?.nom} {deleteTarget?.prenom}</strong> ?
          Cette action est irréversible.
        </p>
      </Modal>
    </AdminLayout>
  );
}
