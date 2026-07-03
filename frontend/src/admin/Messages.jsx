import React, { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import { IconMail, IconSend } from "./components/Icons";

const API_URL = "http://localhost:4000";

const FOLDERS = ["Nouveau", "Traité", "Archivé"];

// Petites icônes locales (pas de dépendance externe)
const IconArchive = (props) => (
  <svg width={props.width || 16} height={props.height || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);
const IconTrash = (props) => (
  <svg width={props.width || 16} height={props.height || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const IconRestore = (props) => (
  <svg width={props.width || 16} height={props.height || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);
const IconAlertTriangle = (props) => (
  <svg width={props.width || 22} height={props.height || 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function Messages() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState("Nouveau");
  const [active, setActive] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/contacts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const json = await res.json();
      if (json.success) {
        setContacts(json.data);
        const firstVisible = json.data.find((c) => c.statut === "Nouveau" && !c.archive);
        setActive(firstVisible || null);
      }
    } catch (err) {
      console.error("Erreur chargement contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const matchesFolder = (c, f) => {
    if (f === "Archivé") return !!c.archive;
    if (f === "Nouveau") return c.statut === "Nouveau" && !c.archive;
    if (f === "Traité") return c.statut === "Traité" && !c.archive;
    return false;
  };

  const visible = contacts.filter((c) => matchesFolder(c, folder));

  const selectFolder = (f) => {
    setFolder(f);
    const first = contacts.filter((c) => matchesFolder(c, f))[0] || null;
    setActive(first);
    setReplyText("");
    setFeedback(null);
  };

  const selectThread = (c) => {
    setActive(c);
    setReplyText("");
    setFeedback(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("fr-FR");
    const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return `${day} à ${time}`;
  };

  const handleSendReply = async () => {
    if (!active || !replyText.trim()) return;
    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/contacts/${active.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ replyMessage: replyText }),
      });
      const json = await res.json();

      if (json.success) {
        setFeedback({ type: "success", text: "Réponse envoyée avec succès." });
        setReplyText("");
        setContacts((prev) => prev.map((c) => (c.id === active.id ? { ...c, statut: "Traité" } : c)));
        setActive((prev) => (prev ? { ...prev, statut: "Traité" } : prev));
      } else {
        setFeedback({ type: "error", text: json.message || "Échec de l'envoi." });
      }
    } catch (err) {
      console.error("Erreur envoi réponse:", err);
      setFeedback({ type: "error", text: "Erreur réseau lors de l'envoi." });
    } finally {
      setSending(false);
    }
  };

  const goToNext = (deletedId) => {
    const remaining = contacts.filter((c) => c.id !== deletedId && matchesFolder(c, folder));
    setActive(remaining[0] || null);
  };

  const handleArchive = async () => {
    if (!active) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/contacts/${active.id}/archive`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const json = await res.json();
      if (json.success) {
        const updatedId = active.id;
        setContacts((prev) => prev.map((c) => (c.id === updatedId ? { ...c, archive: 1 } : c)));
        goToNext(updatedId);
        setFeedback(null);
      }
    } catch (err) {
      console.error("Erreur archivage:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!active) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/contacts/${active.id}/restore`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const json = await res.json();
      if (json.success) {
        const updatedId = active.id;
        setContacts((prev) => prev.map((c) => (c.id === updatedId ? { ...c, archive: 0 } : c)));
        goToNext(updatedId);
        setFeedback(null);
      }
    } catch (err) {
      console.error("Erreur restauration:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!active) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/contacts/${active.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      const json = await res.json();
      if (json.success) {
        const deletedId = active.id;
        setContacts((prev) => prev.filter((c) => c.id !== deletedId));
        goToNext(deletedId);
        setFeedback(null);
      }
    } catch (err) {
      console.error("Erreur suppression:", err);
    } finally {
      setActionLoading(false);
      setDeleteModalOpen(false);
    }
  };

  const sidebar = {
    eyebrow: "Communication",
    title: "Messages",
    description: "Échanges avec les clients",
    sections: [
      {
        title: "Dossiers",
        items: FOLDERS.map((f) => ({
          key: f,
          label: f,
          icon: f === "Archivé" ? IconArchive : IconMail,
          count: contacts.filter((c) => matchesFolder(c, f)).length,
          active: folder === f,
          onClick: () => selectFolder(f),
        })),
      },
    ],
  };

  return (
    <AdminLayout sidebar={sidebar}>
      <PageHead
        crumb={<>Admin&nbsp;/&nbsp;<b>Messages</b></>}
        title={folder === "Nouveau" ? "Boîte de réception" : folder === "Traité" ? "Messages traités" : "Messages archivés"}
        description="Centralisez et répondez aux messages de contact reçus depuis le site."
      />

      <div className="gl-card" style={{ display: "grid", gridTemplateColumns: "320px 1fr", minHeight: 480, overflow: "hidden" }}>
        <div style={{ borderRight: "1px solid var(--gl-gray-100)", overflowY: "auto" }}>
          {loading ? (
            <div className="gl-empty"><h4>Chargement…</h4></div>
          ) : visible.length === 0 ? (
            <div className="gl-empty">
              <div className="gl-empty-icon"><IconMail width={20} height={20} /></div>
              <h4>Dossier vide</h4>
            </div>
          ) : (
            visible.map((c) => (
              <button
                key={c.id}
                onClick={() => selectThread(c)}
                style={{
                  display: "block", width: "100%", textAlign: "left", padding: "14px 18px",
                  borderBottom: "1px solid var(--gl-gray-100)",
                  background: active?.id === c.id ? "var(--gl-bordeaux-50)" : "transparent",
                  border: "none",
                  borderLeft: active?.id === c.id ? "3px solid var(--gl-bordeaux-700)" : "3px solid transparent",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: c.statut === "Nouveau" ? 700 : 600, fontSize: 13 }}>{c.nom}</span>
                  <span style={{ fontSize: 11, color: "var(--gl-gray-500)" }}>{formatDate(c.created_at)}</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: c.statut === "Nouveau" ? 700 : 500, color: "var(--gl-gray-900)", marginTop: 4 }}>
                  {c.sujet}
                </div>
                <div style={{ fontSize: 12, color: "var(--gl-gray-500)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.message}
                </div>
              </button>
            ))
          )}
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column" }}>
          {active ? (
            <>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                borderBottom: "1px solid var(--gl-gray-100)", paddingBottom: 16, marginBottom: 16,
              }}>
                <div>
                  <h3 style={{ fontSize: 16 }}>{active.sujet}</h3>
                  <div className="gl-name-cell" style={{ marginTop: 10 }}>
                    <div className="gl-avatar">{active.nom.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div className="name">{active.nom}</div>
                      <div className="sub">{active.email} — {formatDate(active.created_at)}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {active.archive ? (
                    <button
                      className="gl-btn gl-btn-ghost gl-btn-icon"
                      title="Restaurer"
                      onClick={handleRestore}
                      disabled={actionLoading}
                    >
                      <IconRestore width={16} height={16} />
                    </button>
                  ) : (
                    <button
                      className="gl-btn gl-btn-ghost gl-btn-icon"
                      title="Archiver"
                      onClick={handleArchive}
                      disabled={actionLoading}
                    >
                      <IconArchive width={16} height={16} />
                    </button>
                  )}
                  <button
                    className="gl-btn gl-btn-ghost gl-btn-icon"
                    title="Supprimer"
                    onClick={() => setDeleteModalOpen(true)}
                    disabled={actionLoading}
                    style={{ color: "#c0392b" }}
                  >
                    <IconTrash width={16} height={16} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--gl-gray-900)", flex: 1, whiteSpace: "pre-wrap" }}>
                {active.message}
              </p>

              {active.archive ? (
                <div style={{
                  padding: "12px 16px", background: "var(--gl-gray-50, #f7f7f7)", borderRadius: "var(--gl-radius-sm)",
                  fontSize: 13, color: "var(--gl-gray-500)", textAlign: "center",
                }}>
                  📁 Ce message est archivé. Restaurez-le pour pouvoir y répondre.
                </div>
              ) : active.statut === "Traité" ? (
                <div style={{
                  padding: "12px 16px", background: "var(--gl-gray-50, #f7f7f7)", borderRadius: "var(--gl-radius-sm)",
                  fontSize: 13, color: "var(--gl-gray-500)", textAlign: "center",
                }}>
                  ✓ Ce message a déjà été traité.
                </div>
              ) : (
                <div style={{ borderTop: "1px solid var(--gl-gray-100)", paddingTop: 16 }}>
                  {feedback && (
                    <div style={{
                      marginBottom: 10, padding: "8px 12px", borderRadius: "var(--gl-radius-sm)", fontSize: 13,
                      background: feedback.type === "success" ? "#e7f7ee" : "#fdecec",
                      color: feedback.type === "success" ? "#1e7a45" : "#c0392b",
                    }}>
                      {feedback.text}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                    <textarea
                      rows={3}
                      placeholder="Rédigez votre réponse au client…"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      style={{
                        flex: 1, border: "1px solid var(--gl-gray-200)", borderRadius: "var(--gl-radius-sm)",
                        padding: 10, fontFamily: "var(--gl-font-body)", fontSize: 13.5, resize: "vertical",
                      }}
                    />
                    <button
                      className="gl-btn gl-btn-primary"
                      onClick={handleSendReply}
                      disabled={sending || !replyText.trim()}
                      style={{ opacity: sending || !replyText.trim() ? 0.6 : 1 }}
                    >
                      <IconSend width={14} height={14} /> {sending ? "Envoi…" : "Envoyer"}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="gl-empty" style={{ margin: "auto" }}>
              <div className="gl-empty-icon"><IconMail width={20} height={20} /></div>
              <h4>Sélectionnez une conversation</h4>
            </div>
          )}
        </div>
      </div>

      {/* Modale de confirmation de suppression */}
      <Modal
        open={deleteModalOpen}
        onClose={() => !actionLoading && setDeleteModalOpen(false)}
        title="Supprimer ce message"
        size="sm"
        footer={
          <>
            <button
              className="gl-btn gl-btn-ghost"
              onClick={() => setDeleteModalOpen(false)}
              disabled={actionLoading}
            >
              Annuler
            </button>
            <button
              className="gl-btn"
              onClick={confirmDelete}
              disabled={actionLoading}
              style={{
                background: "#c0392b",
                color: "#fff",
                opacity: actionLoading ? 0.7 : 1,
              }}
            >
              {actionLoading ? "Suppression…" : "Supprimer définitivement"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{
            flexShrink: 0, width: 44, height: 44, borderRadius: "50%",
            background: "#fdecec", color: "#c0392b",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconAlertTriangle width={22} height={22} />
          </div>
          <div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--gl-gray-900)", margin: 0 }}>
              Vous êtes sur le point de supprimer définitivement le message de{" "}
              <strong>{active?.nom}</strong> ({active?.email}).
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--gl-gray-500)", marginTop: 8 }}>
              Cette action est irréversible et ne peut pas être annulée.
            </p>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}