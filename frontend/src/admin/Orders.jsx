import React, { useMemo, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import { IconCart, IconClock, IconCheck, IconX, IconDownload, IconBox } from "./components/Icons";

const ORDERS = [
  { id: "CMD-1042", client: "Clinilab Sarl", items: 3, amount: "4 850 MAD", date: "24 juin 2026", status: "Livrée" },
  { id: "CMD-1041", client: "LabTech Maroc", items: 1, amount: "18 400 MAD", date: "23 juin 2026", status: "Expédiée" },
  { id: "CMD-1040", client: "BioMed Diagnostics", items: 5, amount: "9 200 MAD", date: "22 juin 2026", status: "En préparation" },
  { id: "CMD-1039", client: "Clinique Al Amal", items: 2, amount: "19 800 MAD", date: "20 juin 2026", status: "Expédiée" },
  { id: "CMD-1038", client: "Institut Pasteur Casa", items: 8, amount: "3 100 MAD", date: "18 juin 2026", status: "Annulée" },
  { id: "CMD-1037", client: "Clinilab Sarl", items: 1, amount: "6 100 MAD", date: "14 juin 2026", status: "Livrée" },
];

const STATUSES = ["Toutes", "En préparation", "Expédiée", "Livrée", "Annulée"];
const badgeMap = { "En préparation": "gl-badge-warning", "Expédiée": "gl-badge-info", "Livrée": "gl-badge-success", "Annulée": "gl-badge-danger" };

const TIMELINE = [
  { label: "Commande reçue", done: true },
  { label: "En préparation", done: true },
  { label: "Expédiée", done: true },
  { label: "Livrée", done: false },
];

export default function Orders() {
  const [status, setStatus] = useState("Toutes");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(
    () => ORDERS.filter((o) => status === "Toutes" || o.status === status),
    [status]
  );

  const sidebar = {
    eyebrow: "Ventes",
    title: "Commandes",
    description: "Suivi logistique des commandes clients",
    sections: [
      {
        title: "Statuts",
        items: STATUSES.map((s) => ({
          key: s,
          label: s === "Toutes" ? "Toutes les commandes" : s,
          icon: s === "En préparation" ? IconBox : s === "Expédiée" ? IconClock : s === "Livrée" ? IconCheck : s === "Annulée" ? IconX : IconCart,
          count: s === "Toutes" ? ORDERS.length : ORDERS.filter((o) => o.status === s).length,
          active: status === s,
          onClick: () => setStatus(s),
        })),
      },
    ],
  };

  return (
    <AdminLayout sidebar={sidebar}>
      <PageHead
        crumb={<>Admin&nbsp;/&nbsp;<b>Commandes</b></>}
        title="Commandes clients"
        description="Suivez la préparation, l'expédition et la livraison des commandes."
        actions={<button className="gl-btn gl-btn-secondary"><IconDownload width={15} height={15} /> Exporter</button>}
      />

      <div className="gl-card gl-card-pad">
        <div className="gl-toolbar">
          <select className="gl-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="gl-table-wrap">
          <table className="gl-table">
            <thead>
              <tr><th>N° commande</th><th>Client</th><th>Articles</th><th>Montant</th><th>Date</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="is-clickable" onClick={() => setSelected(o)}>
                  <td className="gl-cell-mono">{o.id}</td>
                  <td style={{ fontWeight: 600 }}>{o.client}</td>
                  <td className="gl-cell-muted">{o.items} article(s)</td>
                  <td>{o.amount}</td>
                  <td className="gl-cell-muted">{o.date}</td>
                  <td><span className={`gl-badge ${badgeMap[o.status]}`}>{o.status}</span></td>
                  <td><button className="gl-btn gl-btn-ghost gl-btn-sm" onClick={(e) => { e.stopPropagation(); setSelected(o); }}>Suivre</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Commande ${selected.id}` : ""}
        subtitle={selected ? `${selected.client} · ${selected.amount}` : ""}
        size="sm"
        footer={<button className="gl-btn gl-btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setSelected(null)}>Marquer l'étape suivante</button>}
      >
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {TIMELINE.map((t, i) => (
              <div key={t.label} style={{ display: "flex", gap: 12, position: "relative", paddingBottom: i < TIMELINE.length - 1 ? 28 : 0 }}>
                {i < TIMELINE.length - 1 && (
                  <div style={{ position: "absolute", left: 9, top: 22, width: 2, height: "calc(100% - 12px)", background: t.done ? "var(--gl-bordeaux-500)" : "var(--gl-gray-200)" }} />
                )}
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0, zIndex: 1,
                  background: t.done ? "var(--gl-bordeaux-700)" : "var(--gl-white)",
                  border: t.done ? "none" : "2px solid var(--gl-gray-300)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {t.done && <IconCheck width={11} height={11} style={{ color: "#fff" }} />}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: t.done ? 700 : 500, color: t.done ? "var(--gl-gray-900)" : "var(--gl-gray-500)" }}>{t.label}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
