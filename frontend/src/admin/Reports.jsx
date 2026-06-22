import React, { useState } from "react";
import AdminLayout from "./Layout";
import { Card, ProgressBar } from "./components/UI";
import { MOCK } from "../mockData";
import "./admin.css";

function BarChart({ data, months }) {
  const max = Math.max(...data);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 6,
        height: 140,
        marginTop: "1rem",
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
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: "var(--color-text-hint)",
              whiteSpace: "nowrap",
            }}
          >
            {v}k
          </div>
          <div
            style={{
              width: "100%",
              height: Math.round((v / max) * 110),
              background: "var(--color-primary)",
              borderRadius: "3px 3px 0 0",
              opacity: 0.75,
              transition: "opacity 0.15s",
              cursor: "default",
            }}
            title={`${v}k MAD`}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.75)}
          />
          <div style={{ fontSize: 9, color: "var(--color-text-hint)" }}>
            {months[i]}
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutSlice({ pct, color, offset }) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <circle
      cx="60"
      cy="60"
      r={r}
      fill="none"
      stroke={color}
      strokeWidth="18"
      strokeDasharray={`${dash} ${circ}`}
      strokeDashoffset={-offset}
      style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
    />
  );
}

const DONUT_COLORS = ["#534AB7", "#9FE1CB", "#AFA9EC", "#D3D1C7"];

export default function Reports() {
  const [period, setPeriod] = useState("2026");

  const summaryStats = [
    { label: "Chiffre d'affaires", value: "284 500 MAD", change: "+23%", up: true },
    { label: "Panier moyen", value: "228 MAD", change: "+4%", up: true },
    { label: "Taux de conversion", value: "3.8%", change: "+0.5pt", up: true },
    { label: "Taux de retour", value: "1.2%", change: "-0.3pt", up: true },
  ];

  // Compute donut offsets
  let cumulPct = 0;
  const circumference = 2 * Math.PI * 50;
  const donutSlices = MOCK.categoryRevenue.map((c, i) => {
    const dashOffset = -(cumulPct / 100) * circumference;
    cumulPct += c.pct;
    return { ...c, color: DONUT_COLORS[i], offset: dashOffset };
  });

  return (
    <AdminLayout title="Rapports">
      {/* Period selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        {["2024", "2025", "2026"].map((y) => (
          <button
            key={y}
            className={`btn ${period === y ? "btn-primary" : ""}`}
            onClick={() => setPeriod(y)}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="stats" style={{ marginBottom: "1rem" }}>
        {summaryStats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div
              className="stat-change"
              style={{ color: s.up ? "#3B6D11" : "#A32D2D" }}
            >
              {s.up ? "▲" : "▼"} {s.change} vs {Number(period) - 1}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid2">
        <Card title={`Revenus mensuels ${period}`}>
          <BarChart data={MOCK.chartData} months={MOCK.chartMonths} />
        </Card>

        <Card title="Répartition par catégorie">
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Donut SVG */}
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
              {donutSlices.map((s) => (
                <circle
                  key={s.name}
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={s.color}
                  strokeWidth="18"
                  strokeDasharray={`${(s.pct / 100) * circumference} ${circumference}`}
                  strokeDashoffset={s.offset}
                  style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
                />
              ))}
              <text
                x="60"
                y="64"
                textAnchor="middle"
                fontSize="11"
                fill="var(--color-text-muted)"
              >
                2026
              </text>
            </svg>

            {/* Legend */}
            <div style={{ flex: 1 }}>
              {MOCK.categoryRevenue.map((c, i) => (
                <div
                  key={c.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: DONUT_COLORS[i],
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1 }}>{c.name}</span>
                  <span style={{ fontWeight: 500 }}>{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Top products + category details */}
      <div className="grid2">
        <Card title="Top produits vendus">
          {MOCK.topProducts.map((p) => (
            <div key={p.name} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                <span>{p.name}</span>
                <span style={{ color: "var(--color-text-muted)" }}>{p.pct}%</span>
              </div>
              <ProgressBar pct={p.pct} />
            </div>
          ))}
        </Card>

        <Card title="Revenus par catégorie">
          <table>
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Part</th>
                <th>Revenus (est.)</th>
              </tr>
            </thead>
            <tbody>
              {MOCK.categoryRevenue.map((c) => (
                <tr key={c.name}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>{c.pct}%</td>
                  <td>
                    {Math.round(284500 * (c.pct / 100)).toLocaleString("fr-MA")} MAD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminLayout>
  );
}
