import React, { useState } from "react";
import AdminLayout from "./Layout";
import { Badge, Card, Button, SearchBar, Avatar, Modal, EmptyState } from "./components/UI";
import { MOCK } from "../mockData";
import "./admin.css";

export default function Customers() {
  const [customers] = useState(MOCK.customers);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [selected, setSelected] = useState(null);

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "tous" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const vipCount = customers.filter((c) => c.status === "vip").length;
  const activeCount = customers.filter((c) => c.status === "actif").length;
  const totalRevenue = "69 449 MAD";

  return (
    <AdminLayout title="Clients">
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
          { label: "Total clients", value: customers.length },
          { label: "Clients actifs", value: activeCount },
          { label: "Clients VIP", value: vipCount },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un client…"
        />
        <select
          className="input"
          style={{ width: "auto" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="tous">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="vip">VIP</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon="👥" message="Aucun client trouvé." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Commandes</th>
                <th>Total dépensé</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Avatar name={c.name} size={32} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{c.name}</div>
                        <div
                          style={{ fontSize: 11, color: "var(--color-text-hint)" }}
                        >
                          Depuis {c.joined}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "var(--color-text-muted)" }}>
                    {c.email}
                  </td>
                  <td style={{ color: "var(--color-text-muted)" }}>
                    {c.phone}
                  </td>
                  <td>{c.orders}</td>
                  <td style={{ fontWeight: 500 }}>{c.total}</td>
                  <td>
                    <Badge status={c.status} />
                  </td>
                  <td>
                    <Button size="sm" onClick={() => setSelected(c)}>
                      👁️ Voir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Customer detail modal */}
      {selected && (
        <Modal
          title="Fiche client"
          onClose={() => setSelected(null)}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: "1.25rem",
              paddingBottom: "1rem",
              borderBottom: "0.5px solid var(--color-border)",
            }}
          >
            <Avatar name={selected.name} size={48} />
            <div>
              <div style={{ fontWeight: 500, fontSize: 15 }}>
                {selected.name}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}
              >
                Client depuis {selected.joined}
              </div>
            </div>
            <Badge status={selected.status} />
          </div>

          {[
            ["Email", selected.email],
            ["Téléphone", selected.phone],
            ["Nombre de commandes", selected.orders],
            ["Total dépensé", selected.total],
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

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: "1.25rem",
            }}
          >
            <Button
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => setSelected(null)}
            >
              ✉️ Envoyer un message
            </Button>
            <Button
              variant="primary"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => setSelected(null)}
            >
              📦 Voir commandes
            </Button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
