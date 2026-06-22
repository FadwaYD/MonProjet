import React, { useState } from "react";
import AdminLayout from "./Layout";
import { Badge, Card, Button, SearchBar, Modal, EmptyState } from "./components/UI";
import { MOCK } from "../mockData";
import "./admin.css";

export default function QuoteRequests() {
  const [quotes, setQuotes] = useState(MOCK.quotes);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [selected, setSelected] = useState(null);

  const filtered = quotes.filter((q) => {
    const matchSearch =
      q.client.toLowerCase().includes(search.toLowerCase()) ||
      q.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "tous" || q.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function updateStatus(id, status) {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q))
    );
    setSelected(null);
  }

  const counts = {
    "en attente": quotes.filter((q) => q.status === "en attente").length,
    accepté: quotes.filter((q) => q.status === "accepté").length,
    refusé: quotes.filter((q) => q.status === "refusé").length,
  };

  return (
    <AdminLayout title="Devis">
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1rem" }}>
        {[
          { label: "En attente", value: counts["en attente"], cls: "badge-warning" },
          { label: "Acceptés", value: counts["accepté"], cls: "badge-success" },
          { label: "Refusés", value: counts["refusé"], cls: "badge-danger" },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div
              className="stat-value"
              style={{ fontSize: 28 }}
            >
              <span className={`badge ${s.cls}`} style={{ fontSize: 20, padding: "4px 14px" }}>
                {s.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: "1rem", flexWrap: "wrap" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un devis…" />
        <select
          className="input"
          style={{ width: "auto" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="tous">Tous les statuts</option>
          <option value="en attente">En attente</option>
          <option value="accepté">Accepté</option>
          <option value="refusé">Refusé</option>
        </select>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon="📄" message="Aucun devis trouvé." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 500 }}>
                    {q.id}
                  </td>
                  <td>{q.client}</td>
                  <td style={{ color: "var(--color-text-muted)" }}>{q.date}</td>
                  <td style={{ fontWeight: 500 }}>{q.amount}</td>
                  <td>
                    <Badge status={q.status} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button size="sm" onClick={() => setSelected(q)}>
                        👁️ Voir
                      </Button>
                      {q.status === "en attente" && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => updateStatus(q.id, "accepté")}
                          >
                            ✓ Accepter
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(q.id, "refusé")}
                            style={{ color: "#A32D2D" }}
                          >
                            ✗ Refuser
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
        <Modal
          title={`Devis ${selected.id}`}
          onClose={() => setSelected(null)}
        >
          <div style={{ display: "grid", gap: 12 }}>
            {[
              ["Client", selected.client],
              ["Date", selected.date],
              ["Montant estimé", selected.amount],
              ["Statut", <Badge key="s" status={selected.status} />],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "0.5px solid var(--color-border)",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
          {selected.status === "en attente" && (
            <div style={{ display: "flex", gap: 8, marginTop: "1.25rem" }}>
              <Button
                variant="primary"
                onClick={() => updateStatus(selected.id, "accepté")}
                style={{ flex: 1, justifyContent: "center" }}
              >
                ✓ Accepter le devis
              </Button>
              <Button
                onClick={() => updateStatus(selected.id, "refusé")}
                style={{ flex: 1, justifyContent: "center", color: "#A32D2D" }}
              >
                ✗ Refuser
              </Button>
            </div>
          )}
        </Modal>
      )}
    </AdminLayout>
  );
}
