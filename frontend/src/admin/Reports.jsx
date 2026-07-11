import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import { IconChart, IconUsers, IconBox, IconDownload, IconArrowUp, IconArrowDown } from "./components/Icons";

const API_URL = "http://localhost:4000/api/admin";

const REPORTS = [
  { key: "sales", label: "Rapport des ventes", icon: IconChart },
  { key: "clients", label: "Rapport des clients", icon: IconUsers },
  { key: "products", label: "Rapport des produits", icon: IconBox },
];

function fmtMAD(n) {
  return `${Number(n || 0).toLocaleString("fr-FR")} MAD`;
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function firstDayOfYearISO() {
  return `${new Date().getFullYear()}-01-01`;
}
function formatDateFR(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// Évite l'erreur "Unexpected token '<'" quand une route renvoie du HTML
// (404, page d'erreur, index.html) au lieu de JSON.
async function safeJson(res, label) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error(`${label} n'a pas renvoyé du JSON (statut ${res.status}) :`, text.slice(0, 200));
    throw new Error(`Réponse invalide de "${label}" (statut ${res.status})`);
  }
}

export default function Reports() {
  const [active, setActive] = useState("sales");
  const [exportOpen, setExportOpen] = useState(false);

  const [dateFrom, setDateFrom] = useState(firstDayOfYearISO());
  const [dateTo, setDateTo]     = useState(todayISO());

  const [exportFormat, setExportFormat] = useState("csv");
  const [exportFrom, setExportFrom]     = useState(dateFrom);
  const [exportTo, setExportTo]         = useState(dateTo);
  const [exporting, setExporting]       = useState(false);

  const [stats, setStats]                   = useState(null);
  const [monthly, setMonthly]               = useState([]);
  const [topProducts, setTopProducts]       = useState([]);
  const [clientsStatus, setClientsStatus]   = useState(null);
  const [productsStatus, setProductsStatus] = useState([]);
  const [ordersStatus, setOrdersStatus]     = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = `from=${dateFrom}&to=${dateTo}`;

      const [statsRes, monthlyRes, topRes, clientsRes, productsRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/reports/stats?${qs}`).then((r) => safeJson(r, "stats")),
        fetch(`${API_URL}/reports/monthly?${qs}`).then((r) => safeJson(r, "monthly")),
        fetch(`${API_URL}/reports/top-products?${qs}&limit=6`).then((r) => safeJson(r, "top-products")),
        fetch(`${API_URL}/reports/clients-status`).then((r) => safeJson(r, "clients-status")),
        fetch(`${API_URL}/reports/products-status`).then((r) => safeJson(r, "products-status")),
        fetch(`${API_URL}/reports/orders-status?${qs}`).then((r) => safeJson(r, "orders-status")),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (monthlyRes.success) setMonthly(monthlyRes.data);
      if (topRes.success) setTopProducts(topRes.data);
      if (clientsRes.success) setClientsStatus(clientsRes.data);
      if (productsRes.success) setProductsStatus(productsRes.data);
      if (ordersRes.success) setOrdersStatus({ ...ordersRes.data, montants: ordersRes.montants });

      if (!statsRes.success) throw new Error(statsRes.message || "Erreur de chargement des statistiques");
    } catch (e) {
      setError(e.message || "Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  function openExport() {
    setExportFrom(dateFrom);
    setExportTo(dateTo);
    setExportOpen(true);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const url = `${API_URL}/reports/export?format=${exportFormat}&type=${active}&from=${exportFrom}&to=${exportTo}`;

      const res = await fetch(url);
      if (!res.ok) {
        await res.text();
        throw new Error(`Échec de l'export (${res.status})`);
      }

      const blob = await res.blob();
      const extension = exportFormat === "xlsx" ? "xlsx" : exportFormat === "pdf" ? "pdf" : "csv";
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `rapport_${active}_${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(link.href);

      setExportOpen(false);
    } catch (e) {
      window.alert(e.message || "Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  }

  const totalClients = clientsStatus ? clientsStatus.valides + clientsStatus.en_attente : 0;
  const totalProduits = productsStatus.reduce((s, p) => s + p.total, 0);

  const sidebar = {
    eyebrow: "Analyse",
    title: "Rapports",
    description: "Indicateurs de performance",
    sections: [
      {
        title: "Rapports disponibles",
        items: REPORTS.map((r) => ({
          key: r.key, label: r.label, icon: r.icon,
          active: active === r.key, onClick: () => setActive(r.key),
        })),
      },
      {
        title: "Export",
        items: [{ key: "export", label: "Exporter les données", icon: IconDownload, onClick: openExport }],
      },
    ],
  };

  return (
    <AdminLayout sidebar={sidebar}>
      <PageHead
        crumb={<>Admin&nbsp;/&nbsp;<b>Rapports</b></>}
        title={REPORTS.find((r) => r.key === active)?.label}
        description={`Période : ${formatDateFR(dateFrom)} – ${formatDateFR(dateTo)}`}
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ padding: "7px 10px", fontSize: 12.5, borderRadius: 8 }} />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ padding: "7px 10px", fontSize: 12.5, borderRadius: 8 }} />
            </div>
            <button className="gl-btn gl-btn-primary" onClick={openExport}>
              <IconDownload width={15} height={15} /> Exporter
            </button>
          </div>
        }
      />

      {error && (
        <div style={{
          background: "#F7E7E5", border: "1px solid #E6BEB9", borderRadius: 10,
          padding: "12px 16px", color: "#A8433D", fontSize: 13.5, marginBottom: 16, fontWeight: 600,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ═══════════════════════ RAPPORT VENTES ═══════════════════════ */}
      {active === "sales" && (
        <>
          <div className="gl-grid-stats">
            <div className="gl-stat">
              <div className="gl-stat-top">
                <div className="gl-stat-icon"><IconChart width={18} height={18} /></div>
                {stats && (
                  <span className={`gl-stat-delta ${stats.chiffre_affaires_delta_pct >= 0 ? "up" : "down"}`}>
                    {stats.chiffre_affaires_delta_pct >= 0
                      ? <IconArrowUp width={12} height={12} />
                      : <IconArrowDown width={12} height={12} />}
                    {stats.chiffre_affaires_delta_pct >= 0 ? "+" : ""}{stats.chiffre_affaires_delta_pct}%
                  </span>
                )}
              </div>
              <div className="gl-stat-value">{loading ? "…" : stats ? fmtMAD(stats.chiffre_affaires) : "—"}</div>
              <div className="gl-stat-label">Chiffre d'affaires (période)</div>
            </div>

            <div className="gl-stat">
              <div className="gl-stat-top"><div className="gl-stat-icon"><IconBox width={18} height={18} /></div></div>
              <div className="gl-stat-value">{loading ? "…" : topProducts.reduce((s, p) => s + p.sales, 0)}</div>
              <div className="gl-stat-label">Articles vendus (top produits)</div>
            </div>

            <div className="gl-stat">
              <div className="gl-stat-top"><div className="gl-stat-icon"><IconChart width={18} height={18} /></div></div>
              <div className="gl-stat-value">
                {loading || !monthly.length ? "—" : fmtMAD(Math.round(stats?.chiffre_affaires / monthly.length))}
              </div>
              <div className="gl-stat-label">Moyenne mensuelle</div>
            </div>

            <div className="gl-stat">
              <div className="gl-stat-top"><div className="gl-stat-icon"><IconBox width={18} height={18} /></div></div>
              <div className="gl-stat-value">{loading ? "…" : stats?.produits_stock_faible ?? "—"}</div>
              <div className="gl-stat-label">Produits en stock faible</div>
            </div>
          </div>

          <div className="gl-card gl-card-pad">
            <div className="gl-card-head">
              <div>
                <h3>Répartition des commandes</h3>
                <div className="gl-card-sub">Par statut, sur la période sélectionnée</div>
              </div>
            </div>

            {loading ? (
              <EmptyState text="Chargement…" />
            ) : !ordersStatus || (ordersStatus.confirmee + ordersStatus.en_attente + ordersStatus.annulee === 0) ? (
              <EmptyState text="Aucune commande sur cette période." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: "8px 4px" }}>
                <OrderStatusBar
                  label="Confirmées"
                  value={ordersStatus.confirmee}
                  montant={ordersStatus.montants.confirmee}
                  total={ordersStatus.confirmee + ordersStatus.en_attente + ordersStatus.annulee}
                  color="linear-gradient(90deg, #3A7D5C, #265E43)"
                />
                <OrderStatusBar
                  label="En attente"
                  value={ordersStatus.en_attente}
                  montant={ordersStatus.montants.en_attente}
                  total={ordersStatus.confirmee + ordersStatus.en_attente + ordersStatus.annulee}
                  color="linear-gradient(90deg, #C99A4C, #B8863A)"
                />
                <OrderStatusBar
                  label="Annulées"
                  value={ordersStatus.annulee}
                  montant={ordersStatus.montants.annulee}
                  total={ordersStatus.confirmee + ordersStatus.en_attente + ordersStatus.annulee}
                  color="linear-gradient(90deg, #A8433D, #7A1F30)"
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════ RAPPORT CLIENTS ═══════════════════════ */}
      {active === "clients" && (
        <>
          <div className="gl-grid-stats">
            <div className="gl-stat">
              <div className="gl-stat-top"><div className="gl-stat-icon"><IconUsers width={18} height={18} /></div></div>
              <div className="gl-stat-value">{loading ? "…" : totalClients}</div>
              <div className="gl-stat-label">Total clients enregistrés</div>
            </div>
            <div className="gl-stat">
              <div className="gl-stat-top"><div className="gl-stat-icon"><IconUsers width={18} height={18} /></div></div>
              <div className="gl-stat-value">{loading ? "…" : clientsStatus?.valides ?? "—"}</div>
              <div className="gl-stat-label">Comptes validés</div>
            </div>
            <div className="gl-stat">
              <div className="gl-stat-top"><div className="gl-stat-icon"><IconUsers width={18} height={18} /></div></div>
              <div className="gl-stat-value">{loading ? "…" : clientsStatus?.en_attente ?? "—"}</div>
              <div className="gl-stat-label">Comptes en attente</div>
            </div>
            <div className="gl-stat">
              <div className="gl-stat-top">
                <div className="gl-stat-icon"><IconArrowUp width={18} height={18} /></div>
                {stats && (
                  <span className="gl-stat-delta up">
                    <IconArrowUp width={12} height={12} />+{stats.clients_nouveaux_periode}
                  </span>
                )}
              </div>
              <div className="gl-stat-value">{loading ? "…" : stats?.clients_nouveaux_periode ?? "—"}</div>
              <div className="gl-stat-label">Nouveaux clients (période)</div>
            </div>
          </div>

          <div className="gl-card gl-card-pad">
            <div className="gl-card-head">
              <div>
                <h3>Répartition des comptes clients</h3>
                <div className="gl-card-sub">Validés vs en attente de validation</div>
              </div>
            </div>

            {loading ? (
              <EmptyState text="Chargement…" />
            ) : !clientsStatus || totalClients === 0 ? (
              <EmptyState text="Aucun client enregistré." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "6px 4px" }}>
                <RepartitionBar
                  label="Comptes validés"
                  value={clientsStatus.valides}
                  total={totalClients}
                  color="linear-gradient(90deg, var(--gl-bordeaux-500), var(--gl-bordeaux-700))"
                />
                <RepartitionBar
                  label="Comptes en attente"
                  value={clientsStatus.en_attente}
                  total={totalClients}
                  color="linear-gradient(90deg, #C99A4C, #B8863A)"
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════ RAPPORT PRODUITS ═══════════════════════ */}
      {active === "products" && (
        <>
          <div className="gl-grid-stats">
            <div className="gl-stat">
              <div className="gl-stat-top"><div className="gl-stat-icon"><IconBox width={18} height={18} /></div></div>
              <div className="gl-stat-value">{loading ? "…" : totalProduits}</div>
              <div className="gl-stat-label">Total produits au catalogue</div>
            </div>
            <div className="gl-stat">
              <div className="gl-stat-top"><div className="gl-stat-icon"><IconBox width={18} height={18} /></div></div>
              <div className="gl-stat-value">{loading ? "…" : stats?.produits_stock_faible ?? "—"}</div>
              <div className="gl-stat-label">Stock faible (&lt;{stats?.seuil_stock_faible ?? 10})</div>
            </div>
            <div className="gl-stat">
              <div className="gl-stat-top"><div className="gl-stat-icon"><IconBox width={18} height={18} /></div></div>
              <div className="gl-stat-value">
                {loading ? "…" : productsStatus.reduce((s, p) => s + Number(p.stock_total || 0), 0)}
              </div>
              <div className="gl-stat-label">Unités totales en stock</div>
            </div>
            <div className="gl-stat">
              <div className="gl-stat-top"><div className="gl-stat-icon"><IconChart width={18} height={18} /></div></div>
              <div className="gl-stat-value">{loading ? "…" : productsStatus.length}</div>
              <div className="gl-stat-label">Catégories actives</div>
            </div>
          </div>

          <div className="gl-grid-2">
            <div className="gl-card gl-card-pad">
              <div className="gl-card-head">
                <div>
                  <h3>Répartition par catégorie</h3>
                  <div className="gl-card-sub">Nombre de produits par type</div>
                </div>
              </div>

              {loading ? (
                <EmptyState text="Chargement…" />
              ) : productsStatus.length === 0 ? (
                <EmptyState text="Aucun produit enregistré." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "6px 4px" }}>
                  {productsStatus.map((p, i) => (
                    <RepartitionBar
                      key={p.statut}
                      label={p.statut}
                      value={p.total}
                      total={totalProduits}
                      color={
                        i % 3 === 0 ? "linear-gradient(90deg, var(--gl-bordeaux-500), var(--gl-bordeaux-700))"
                        : i % 3 === 1 ? "linear-gradient(90deg, #C99A4C, #B8863A)"
                        : "linear-gradient(90deg, #8FA893, #6F8A73)"
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="gl-card gl-card-pad">
              <div className="gl-card-head"><h3>Top produits vendus</h3></div>

              {loading ? (
                <EmptyState text="Chargement…" small />
              ) : topProducts.length === 0 ? (
                <EmptyState text="Aucune vente sur cette période." small />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {topProducts.map((p) => (
                    <div key={p.name + p.reference} style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingBottom: 10, borderBottom: "1px solid var(--gl-gray-100)" }}>
                      <div>
                        <div style={{ fontSize: 12.8, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--gl-gray-500)" }}>{p.sales} ventes</div>
                      </div>
                      <span className="gl-spec-tag">{p.revenue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="gl-card gl-card-pad" style={{ marginTop: 16 }}>
            <div className="gl-card-head"><h3>Détail par catégorie</h3></div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {productsStatus.map((p) => (
                <div key={p.statut} style={{
                  flex: "1 1 160px", background: "var(--gl-gray-50, #FAFAFA)", borderRadius: 10,
                  padding: "12px 16px", border: "1px solid var(--gl-gray-100)",
                }}>
                  <div style={{ fontSize: 11, color: "var(--gl-gray-500)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>
                    {p.statut}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{p.total}</div>
                  <div style={{ fontSize: 11.5, color: "var(--gl-gray-500)" }}>{p.stock_total} unités en stock</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════ MODAL EXPORT ═══════════════════════ */}
      <Modal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title={`Exporter — ${REPORTS.find((r) => r.key === active)?.label}`}
        subtitle="Choisissez le format et la période"
        size="sm"
        footer={
          <>
            <button className="gl-btn gl-btn-ghost" onClick={() => setExportOpen(false)} disabled={exporting}>
              Annuler
            </button>
            <button className="gl-btn gl-btn-primary" onClick={handleExport} disabled={exporting}>
              <IconDownload width={14} height={14} /> {exporting ? "Export en cours…" : "Télécharger"}
            </button>
          </>
        }
      >
        <div className="gl-field">
          <label>Format</label>
          <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
            <option value="csv">CSV</option>
            <option value="pdf">PDF (bientôt disponible)</option>
            <option value="xlsx">Excel (.xlsx) (bientôt disponible)</option>
          </select>
        </div>
        <div className="gl-field-row">
          <div className="gl-field">
            <label>Du</label>
            <input type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)} />
          </div>
          <div className="gl-field">
            <label>Au</label>
            <input type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)} />
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────
function EmptyState({ text, small }) {
  return (
    <div style={{ padding: small ? "20px 0" : "40px 0", textAlign: "center", color: "var(--gl-gray-500)", fontSize: 13 }}>
      {text}
    </div>
  );
}

function RepartitionBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12.5, color: "var(--gl-gray-500)", fontWeight: 600 }}>{value} ({pct}%)</span>
      </div>
      <div style={{ height: 10, borderRadius: 6, background: "var(--gl-gray-100)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width .3s ease" }} />
      </div>
    </div>
  );
}

function OrderStatusBar({ label, value, montant, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12.5, color: "var(--gl-gray-500)", fontWeight: 600 }}>
          {value} commande{value > 1 ? "s" : ""} · {fmtMAD(montant)}
        </span>
      </div>
      <div style={{ height: 12, borderRadius: 7, background: "var(--gl-gray-100)", overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: color,
          transition: "width .3s ease", display: "flex", alignItems: "center", justifyContent: "flex-end",
        }}>
          {pct > 8 && (
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", paddingRight: 8 }}>{pct}%</span>
          )}
        </div>
      </div>
    </div>
  );
}