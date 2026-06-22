import React, { useState } from "react";
import AdminLayout from "./Layout";
import { Card, Button, Avatar, Modal, FormField, EmptyState } from "./components/UI";
import { MOCK } from "../mockData";
import "./admin.css";

export default function Messages() {
  const [messages, setMessages] = useState(MOCK.messages);
  const [selected, setSelected] = useState(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState("tous");

  function openMessage(msg) {
    setSelected(msg);
    if (!msg.read) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
      );
    }
  }

  function sendReply() {
    if (!replyText.trim()) return;
    setReplyText("");
    setReplyOpen(false);
    alert(`Réponse envoyée à ${selected.from} ✓`);
  }

  function deleteMessage(id) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setSelected(null);
  }

  const filtered = messages.filter((m) => {
    if (filter === "non lus") return !m.read;
    if (filter === "lus") return m.read;
    return true;
  });

  const unread = messages.filter((m) => !m.read).length;

  return (
    <AdminLayout title="Messages">
      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
          marginBottom: "1rem",
        }}
      >
        {[
          { label: "Total messages", value: messages.length },
          { label: "Non lus", value: unread },
          { label: "Lus", value: messages.length - unread },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        {["tous", "non lus", "lus"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "primary" : "default"}
            size="sm"
            onClick={() => setFilter(f)}
            style={{ textTransform: "capitalize" }}
          >
            {f}
            {f === "non lus" && unread > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: 4, padding: "1px 6px" }}>
                {unread}
              </span>
            )}
          </Button>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon="💬" message="Aucun message trouvé." />
        ) : (
          filtered.map((msg) => (
            <div
              key={msg.id}
              onClick={() => openMessage(msg)}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                padding: "12px 0",
                borderBottom: "0.5px solid var(--color-border)",
                cursor: "pointer",
                fontWeight: msg.read ? 400 : 600,
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--color-bg)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {!msg.read && (
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    marginTop: 14,
                    flexShrink: 0,
                  }}
                />
              )}
              <Avatar name={msg.from} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 2,
                  }}
                >
                  <span style={{ fontSize: 13 }}>{msg.from}</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-hint)",
                      fontWeight: 400,
                    }}
                  >
                    {msg.time}
                  </span>
                </div>
                <div style={{ fontSize: 13, marginBottom: 2 }}>{msg.subject}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                    fontWeight: 400,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {msg.body}
                </div>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Message detail modal */}
      {selected && !replyOpen && (
        <Modal
          title={selected.subject}
          onClose={() => setSelected(null)}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "0.5px solid var(--color-border)",
            }}
          >
            <Avatar name={selected.from} size={40} />
            <div>
              <div style={{ fontWeight: 500 }}>{selected.from}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {selected.email} · {selected.time}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--color-text-muted)" }}>
            {selected.body}
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: "1.25rem" }}>
            <Button
              variant="primary"
              onClick={() => setReplyOpen(true)}
              style={{ flex: 1, justifyContent: "center" }}
            >
              ↩️ Répondre
            </Button>
            <Button
              onClick={() => deleteMessage(selected.id)}
              style={{ color: "#A32D2D" }}
            >
              🗑️ Supprimer
            </Button>
          </div>
        </Modal>
      )}

      {/* Reply modal */}
      {replyOpen && selected && (
        <Modal
          title={`Répondre à ${selected.from}`}
          onClose={() => setReplyOpen(false)}
        >
          <div
            style={{
              padding: "8px 12px",
              background: "var(--color-bg)",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
              fontSize: 12,
              color: "var(--color-text-muted)",
              borderLeft: "2px solid var(--color-border-strong)",
            }}
          >
            <div style={{ fontWeight: 500, marginBottom: 2 }}>{selected.from} a écrit :</div>
            {selected.body}
          </div>
          <FormField label="Votre réponse">
            <textarea
              className="input"
              rows={5}
              style={{ resize: "vertical" }}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Écrire votre réponse…"
            />
          </FormField>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "1rem" }}>
            <Button onClick={() => setReplyOpen(false)}>Annuler</Button>
            <Button variant="primary" onClick={sendReply}>
              ✉️ Envoyer
            </Button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
