import React, { useState } from "react";
import AdminLayout from "./Layout";
import { Badge, Card, Button, Avatar, Modal, EmptyState } from "./components/UI";
import { MOCK } from "../mockData";
import "./admin.css";

export default function AccountValidations() {
  const [validations, setValidations] = useState(MOCK.validations);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("tous");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModal, setRejectModal] = useState(null);

  function updateStatus(id, status) {
    setValidations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
    setSelected(null);
    setRejectModal(null);
    setRejectReason("");
  }

  const filtered = validations.filter((v) => {
    if (filter === "en attente") return v.status === "en attente";
    if (filter === "traités") return v.status !== "en attente";
    return true;
  });

  const pending = validations.filter((v) => v.status === "en attente").length;
  const validated = validations.filter((v) => v.status === "validé").length;
  const rejected = validations.filter((v) => v.status === "rejeté").length;

  return (
    <AdminLayout title="Validations de comptes">
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
          { label: "En attente", value: pending, cls: "badge-warning" },
          { label: "Validés", value: validated, cls: "badge-success" },
          { label: "Rejetés", value: rejected, cls: "badge-danger" },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">
              <span
                className={`badge ${s.cls}`}
                style={{ fontSize: 18, padding: "3px 14px" }}
              >
                {s.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        {["tous", "en attente", "traités"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "primary" : "default"}
            size="sm"
            onClick={() => setFilter(f)}
            style={{ textTransform: "capitalize" }}
          >
            {f}
            {f === "en attente" && pending > 0 && (
              <span
                className="badge badge-warning"
                style={{ marginLeft: 4, padding: "1px 6px" }}
              >
                {pending}
              </span>
            )}
          </Button>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon="✅" message="Aucune demande à afficher." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Demandeur</th>
                <th>Entreprise</th>
                <th>Type</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={v.name} size={30} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{v.name}</div>
                        <div style={{ fontSize: 11, color: "var(--color-text-hint)" }}>
                          {v.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{v.company}</td>
                  <td>
                    <span className="badge badge-gray">{v.type}</span>
                  </td>
                  <td style={{ color: "var(--color-text-muted)" }}>{v.date}</td>
                  <td>
                    <Badge status={v.status} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button size="sm" onClick={() => setSelected(v)}>
                        👁️ Voir
                      </Button>
                      {v.status === "en attente" && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => updateStatus(v.id, "validé")}
                          >
                            ✓ Valider
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setRejectModal(v)}
                            style={{ color: "#A32D2D" }}
                          >
                            ✗ Rejeter
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Detail modal */}
      {selected && (
        <Modal title="Demande de compte" onClose={() => setSelected(null)}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: "1rem",
              paddingBottom: "1rem",
              borderBottom: "0.5px solid var(--color-border)",
            }}
          >
            <Avatar name={selected.name} size={48} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 15 }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {selected.email}
              </div>
            </div>
            <Badge status={selected.status} />
          </div>

          {[
            ["Entreprise", selected.company],
            ["Type d'activité", selected.type],
            ["Date de demande", selected.date],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "9px 0",
                borderBottom: "0.5px solid var(--color-border)",
                fontSize: 13,
              }}
            >
              <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </div>
          ))}

          {selected.status === "en attente" && (
            <div style={{ display: "flex", gap: 8, marginTop: "1.25rem" }}>
              <Button
                variant="primary"
                onClick={() => updateStatus(selected.id, "validé")}
                style={{ flex: 1, justifyContent: "center" }}
              >
                ✓ Valider le compte
              </Button>
              <Button
                onClick={() => {
                  setSelected(null);
                  setRejectModal(selected);
                }}
                style={{ flex: 1, justifyContent: "center", color: "#A32D2D" }}
              >
                ✗ Rejeter
              </Button>
            </div>
          )}
        </Modal>
      )}

      {/* Reject modal with reason */}
      {rejectModal && (
        <Modal
          title={`Rejeter la demande de ${rejectModal.name}`}
          onClose={() => setRejectModal(null)}
        >
          <p
            style={{
              fontSize: 13,
              color: "var(--color-text-muted)",
              marginBottom: "1rem",
            }}
          >
            Indiquez optionnellement la raison du rejet. Cette information peut être
            envoyée au demandeur.
          </p>
          <textarea
            className="input"
            rows={4}
            style={{ resize: "vertical" }}
            placeholder="Raison du rejet (optionnel)…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: "1rem",
            }}
          >
            <Button onClick={() => setRejectModal(null)}>Annuler</Button>
            <Button
              onClick={() => updateStatus(rejectModal.id, "rejeté")}
              style={{
                background: "#A32D2D",
                color: "#fff",
                borderColor: "#A32D2D",
              }}
            >
              Confirmer le rejet
            </Button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
