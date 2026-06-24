import React, { useState } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import { IconChart, IconUsers, IconBox, IconDownload, IconArrowUp, IconArrowDown } from "./components/Icons";

const REPORTS = [
  { key: "sales", label: "Rapport des ventes", icon: IconChart },
  { key: "clients", label: "Rapport des clients", icon: IconUsers },
  { key: "products", label: "Rapport des produits", icon: IconBox },
];

const monthly = [
  { m: "Jan", v: 120 }, { m: "Fév", v: 145 }, { m: "Mar", v: 132 }, { m: "Avr", v: 168 },
  { m: "Mai", v: 184 }, { m: "Juin", v: 201 },
];

const topProducts = [
  { name: "Centrifugeuse de table CF-300", sales: 14, revenue: "257 600 MAD" },
  { name: "Kit de réactifs immuno (50 tests)", sales: 38, revenue: "47 500 MAD" },
  { name: "Lit médicalisé électrique", sales: 6, revenue: "59 400 MAD" },
  { name: "Bécher en verre borosilicaté 500ml", sales: 210, revenue: "17 850 MAD" },
];

export default function Reports() {
  const [active, setActive] = useState("sales");
  const [exportOpen, setExportOpen] = useState(false);
  const maxV = Math.max(...monthly.map((m) => m.v));

  const sidebar = {
    eyebrow: "Analyse",
    title: "Rapports",
    description: "Indicateurs de performance",
    sections: [
      {
        title: "Rapports disponibles",
        items: REPORTS.map((r) => ({ key: r.key, label: r.label, icon: r.icon, active: active === r.key, onClick: () => setActive(r.key) })),
      },
      {
        title: "Export",
        items: [{ key: "export", label: "Exporter les données", icon: IconDownload, onClick: () => setExportOpen(true) }],
      },
    ],
  };

  return (
    <AdminLayout sidebar={sidebar}>
      <PageHead
        crumb={<>Admin&nbsp;/&nbsp;<b>Rapports</b></>}
        title={REPORTS.find((r) => r.key === active)?.label}
        description="Période : 1er janvier 2026 – 24 juin 2026"
        actions={<button className="gl-btn gl-btn-primary" onClick={() => setExportOpen(true)}><IconDownload width={15} height={15} /> Exporter</button>}
      />

      <div className="gl-grid-stats">
        <div className="gl-stat">
          <div className="gl-stat-top">
            <div className="gl-stat-icon"><IconChart width={18} height={18} /></div>
            <span className="gl-stat-delta up"><IconArrowUp width={12} height={12} />+18,2%</span>
          </div>
          <div className="gl-stat-value">950 300 MAD</div>
          <div className="gl-stat-label">Chiffre d'affaires (6 mois)</div>
        </div>
        <div className="gl-stat">
          <div className="gl-stat-top">
            <div className="gl-stat-icon"><IconUsers width={18} height={18} /></div>
            <span className="gl-stat-delta up"><IconArrowUp width={12} height={12} />+6</span>
          </div>
          <div className="gl-stat-value">42</div>
          <div className="gl-stat-label">Clients actifs</div>
        </div>
        <div className="gl-stat">
          <div className="gl-stat-top">
            <div className="gl-stat-icon"><IconBox width={18} height={18} /></div>
            <span className="gl-stat-delta down"><IconArrowDown width={12} height={12} />-3</span>
          </div>
          <div className="gl-stat-value">17</div>
          <div className="gl-stat-label">Produits en stock faible</div>
        </div>
        <div className="gl-stat">
          <div className="gl-stat-top">
            <div className="gl-stat-icon"><IconChart width={18} height={18} /></div>
            <span className="gl-stat-delta up"><IconArrowUp width={12} height={12} />+2,1 j</span>
          </div>
          <div className="gl-stat-value">3,4 j</div>
          <div className="gl-stat-label">Délai moyen de livraison</div>
        </div>
      </div>

      <div className="gl-grid-2">
        <div className="gl-card gl-card-pad">
          <div className="gl-card-head">
            <div>
              <h3>Évolution du chiffre d'affaires</h3>
              <div className="gl-card-sub">Cumul mensuel, en MAD (milliers)</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 190, padding: "10px 4px 0" }}>
            {monthly.map((m) => (
              <div key={m.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "var(--gl-gray-600)", fontWeight: 700 }}>{m.v}k</span>
                <div style={{
                  width: "100%", maxWidth: 36, height: `${(m.v / maxV) * 120 + 6}px`,
                  borderRadius: "8px 8px 3px 3px",
                  background: "linear-gradient(180deg, var(--gl-bordeaux-500), var(--gl-bordeaux-700))",
                }} />
                <span style={{ fontSize: 11.5, color: "var(--gl-gray-600)", fontWeight: 600 }}>{m.m}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gl-card gl-card-pad">
          <div className="gl-card-head"><h3>Top produits</h3></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topProducts.map((p) => (
              <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingBottom: 10, borderBottom: "1px solid var(--gl-gray-100)" }}>
                <div>
                  <div style={{ fontSize: 12.8, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--gl-gray-500)" }}>{p.sales} ventes</div>
                </div>
                <span className="gl-spec-tag">{p.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Exporter le rapport"
        subtitle="Choisissez le format et la période"
        size="sm"
        footer={
          <>
            <button className="gl-btn gl-btn-ghost" onClick={() => setExportOpen(false)}>Annuler</button>
            <button className="gl-btn gl-btn-primary" onClick={() => setExportOpen(false)}><IconDownload width={14} height={14} /> Télécharger</button>
          </>
        }
      >
        <div className="gl-field"><label>Format</label><select><option>PDF</option><option>Excel (.xlsx)</option><option>CSV</option></select></div>
        <div className="gl-field-row">
          <div className="gl-field"><label>Du</label><input type="date" defaultValue="2026-01-01" /></div>
          <div className="gl-field"><label>Au</label><input type="date" defaultValue="2026-06-24" /></div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
