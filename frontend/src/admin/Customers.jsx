import React, { useMemo, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import { IconUsers, IconBuilding, IconMail, IconCalendar, IconCart, IconFile, IconPlus } from "./components/Icons";

const CUSTOMERS = [
  { id: "CL-301", name: "Clinilab Sarl", type: "Clinique privée", email: "contact@clinilab.ma", since: "Jan. 2024", orders: 18, segment: "VIP" },
  { id: "CL-302", name: "LabTech Maroc", type: "Laboratoire d'analyses", email: "achats@labtech.ma", since: "Mars 2024", orders: 11, segment: "VIP" },
  { id: "CL-303", name: "BioMed Diagnostics", type: "Laboratoire d'analyses", email: "info@biomed-dx.ma", since: "Juin 2026", orders: 1, segment: "Nouveau" },
  { id: "CL-304", name: "Clinique Al Amal", type: "Clinique privée", email: "direction@alamal-clinique.ma", since: "Fév. 2023", orders: 27, segment: "VIP" },
  { id: "CL-305", name: "Institut Pasteur Casa", type: "Institut de recherche", email: "logistique@pasteur-casa.ma", since: "Mai 2026", orders: 2, segment: "Nouveau" },
  { id: "CL-306", name: "Pharma Plus Distribution", type: "Distributeur", email: "commandes@pharmaplus.ma", since: "Sept. 2022", orders: 0, segment: "Inactif" },
];

const SEGMENTS = ["Tous", "VIP", "Nouveau", "Inactif"];
const badgeMap = { VIP: "gl-badge-success", Nouveau: "gl-badge-info", Inactif: "gl-badge-neutral" };

export default function Customers() {
  const [segment, setSegment] = useState("Tous");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(
    () => CUSTOMERS.filter((c) => segment === "Tous" || c.segment === segment),
    [segment]
  );

  const sidebar = {
    eyebrow: "Relation client",
    title: "Clients",
    description: "Segments de la clientèle B2B",
    sections: [
      {
        title: "Segments",
        items: SEGMENTS.map((s) => ({
          key: s,
          label: s === "Tous" ? "Tous les clients" : `Clients ${s.toLowerCase()}`,
          icon: IconUsers,
          count: s === "Tous" ? CUSTOMERS.length : CUSTOMERS.filter((c) => c.segment === s).length,
          active: segment === s,
          onClick: () => setSegment(s),
        })),
      },
    ],
    promo: {
      title: "Rétention",
      text: "4 clients VIP représentent 68% du chiffre d'affaires de ce trimestre.",
    },
  };

  return (
    <AdminLayout sidebar={sidebar}>
      <PageHead
        crumb={<>Admin&nbsp;/&nbsp;<b>Clients</b></>}
        title="Portefeuille clients"
        description="Consultez les comptes clients et leur historique d'achats."
        actions={<button className="gl-btn gl-btn-primary"><IconPlus width={15} height={15} /> Ajouter un client</button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {filtered.map((c) => (
          <div className="gl-card gl-card-pad" key={c.id} style={{ cursor: "pointer" }} onClick={() => setSelected(c)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="gl-name-cell">
                <div className="gl-avatar">{c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</div>
                <div>
                  <div className="name">{c.name}</div>
                  <div className="sub">{c.type}</div>
                </div>
              </div>
              <span className={`gl-badge ${badgeMap[c.segment]}`}>{c.segment}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--gl-gray-100)", fontSize: 12.5 }}>
              <span className="gl-cell-muted">Client depuis {c.since}</span>
              <span style={{ fontWeight: 700 }}>{c.orders} commande(s)</span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        subtitle={selected?.type}
        size="md"
        footer={
          <>
            <button className="gl-btn gl-btn-ghost" onClick={() => setSelected(null)}>Fermer</button>
            <button className="gl-btn gl-btn-primary"><IconFile width={14} height={14} /> Créer un devis</button>
          </>
        }
      >
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div className="gl-card gl-card-pad" style={{ flex: 1, boxShadow: "none", background: "var(--gl-gray-50)" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--gl-gray-600)", fontSize: 12 }}><IconMail width={14} height={14} /> Email</div>
                <div style={{ fontWeight: 700, marginTop: 4, fontSize: 13.5 }}>{selected.email}</div>
              </div>
              <div className="gl-card gl-card-pad" style={{ flex: 1, boxShadow: "none", background: "var(--gl-gray-50)" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--gl-gray-600)", fontSize: 12 }}><IconCalendar width={14} height={14} /> Client depuis</div>
                <div style={{ fontWeight: 700, marginTop: 4, fontSize: 13.5 }}>{selected.since}</div>
              </div>
            </div>
            <div className="gl-card gl-card-pad" style={{ boxShadow: "none", background: "var(--gl-gray-50)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--gl-gray-600)", fontSize: 12 }}><IconCart width={14} height={14} /> Activité</div>
              <div style={{ fontWeight: 700, marginTop: 4, fontSize: 13.5 }}>{selected.orders} commande(s) passées au total</div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
