import React, { useState } from "react";
import AdminLayout from "./Layout";
import { Badge, Card, Button, SearchBar, Modal, EmptyState } from "./components/UI";
import { MOCK } from "../mockData";
import "./admin.css";

const STATUS_FLOW = {
  "en attente": ["en cours", "annulé"],
  "en cours": ["livré", "annulé"],
  livré: [],
  annulé: [],
};

export default function Orders() {
  const [orders, setOrders] = useState(MOCK.orders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [selected, setSelected] = useState(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.client.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "tous" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function updateStatus(id, status) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
  }

  const counts = {
    total: orders.length,
    "en attente": orders.filter((o) => o.status === "en attente").length,
    "en cours": orders.filter((o) => o.status === "en cours").length,
    livré: orders.filter((o) => o.status === "livré").length,
  };

  return (
    <AdminLayout title="Commandes">
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: "1rem" }}>
        {[
          { label: "Total", value: counts.total },
          { label: "En attente", value: counts["en attente"] },
          { label: "En cours", value: counts["en cours"] },
          { label: "Livrées", value: counts.livré },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: "1rem", flexWrap: "wrap" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une commande…" />
        <select
          className="input"
          style={{ width: "auto" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="tous">Tous les statuts</option>
          <option value="en attente">En attente</option>
          <option value="en cours">En cours</option>
          <option value="livré">Livré</option>
          <option value="annulé">Annulé</option>
        </select>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon="🚚" message="Aucune commande trouvée." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Date</th>
                <th>Articles</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 500 }}>
                    {o.id}
                  </td>
                  <td>{o.client}</td>
                  <td style={{ color: "var(--color-text-muted)" }}>{o.date}</td>
                  <td>{o.items}</td>
                  <td style={{ fontWeight: 500 }}>{o.amount}</td>
                  <td>
                    <Badge status={o.status} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button size="sm" onClick={() => setSelected(o)}>
                        👁️ Détail
                      </Button>
                      {STATUS_FLOW[o.status]?.map((next) => (
                        <Button
                          key={next}
                          size="sm"
                          variant={next === "livré" || next === "en cours" ? "primary" : "default"}
                          onClick={() => updateStatus(o.id, next)}
                          style={next === "annulé" ? { color: "#A32D2D" } : {}}
                        >
                          → {next}
                        </Button>
                      ))}
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
          title={`Commande ${selected.id}`}
          onClose={() => setSelected(null)}
        >
          {[
            ["Client", selected.client],
            ["Date", selected.date],
            ["Articles", `${selected.items} article(s)`],
            ["Montant", selected.amount],
            ["Statut", <Badge key="s" status={selected.status} />],
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

          {STATUS_FLOW[selected.status]?.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: "1.25rem",
                flexWrap: "wrap",
              }}
            >
              {STATUS_FLOW[selected.status].map((next) => (
                <Button
                  key={next}
                  variant={next === "livré" || next === "en cours" ? "primary" : "default"}
                  onClick={() => updateStatus(selected.id, next)}
                  style={
                    next === "annulé"
                      ? { color: "#A32D2D", flex: 1, justifyContent: "center" }
                      : { flex: 1, justifyContent: "center" }
                  }
                >
                  Passer à : {next}
                </Button>
              ))}
            </div>
          )}
        </Modal>
      )}
    </AdminLayout>
  );
}
