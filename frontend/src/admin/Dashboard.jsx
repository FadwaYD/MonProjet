import React from "react";
import AdminLayout from "./Layout";
import { StatCard, Card, ProgressBar } from "./components/UI";
import { Badge } from "./components/UI";
import { MOCK } from "../mockData";
import "./admin.css";

function MiniChart({ data, months }) {
  const max = Math.max(...data);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 4,
        height: 80,
        marginTop: "0.75rem",
      }}
    >
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <div
            title={`${v}k MAD`}
            style={{
              width: "100%",
              height: Math.round((v / max) * 64),
              background: "var(--color-primary)",
              borderRadius: "3px 3px 0 0",
              opacity: 0.7,
              cursor: "default",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.7)}
          />
          <span style={{ fontSize: 9, color: "var(--color-text-hint)" }}>
            {months[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div className="stats">
        {MOCK.stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid2">
        <Card title="Revenus mensuels 2026">
          <MiniChart data={MOCK.chartData} months={MOCK.chartMonths} />
        </Card>

        <Card title="Top produits">
          {MOCK.topProducts.map((p) => (
            <div key={p.name} style={{ marginBottom: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 3,
                }}
              >
                <span>{p.name}</span>
                <span style={{ color: "var(--color-text-muted)" }}>{p.pct}%</span>
              </div>
              <ProgressBar pct={p.pct} />
            </div>
          ))}
        </Card>
      </div>

      {/* Recent orders */}
      <Card title="Dernières commandes">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Date</th>
              <th>Montant</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {MOCK.orders.map((o) => (
              <tr key={o.id}>
                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{o.id}</td>
                <td>{o.client}</td>
                <td style={{ color: "var(--color-text-muted)" }}>{o.date}</td>
                <td>{o.amount}</td>
                <td>
                  <Badge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Bottom row */}
      <div className="grid2">
        <Card title="Devis récents">
          <table>
            <thead>
              <tr>
                <th>Réf.</th>
                <th>Client</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {MOCK.quotes.slice(0, 4).map((q) => (
                <tr key={q.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{q.id}</td>
                  <td>{q.client}</td>
                  <td>
                    <Badge status={q.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Répartition par catégorie">
          {MOCK.categoryRevenue.map((c) => (
            <div key={c.name} style={{ marginBottom: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 3,
                }}
              >
                <span>{c.name}</span>
                <span style={{ color: "var(--color-text-muted)" }}>{c.pct}%</span>
              </div>
              <ProgressBar pct={c.pct} />
            </div>
          ))}
        </Card>
      </div>
    </AdminLayout>
  );
}
