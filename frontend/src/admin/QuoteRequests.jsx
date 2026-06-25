import React, { useMemo, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import { IconFile, IconClock, IconCheck, IconX, IconDownload, IconBuilding, IconCalendar } from "./components/Icons";

const QUOTES = [
  { id: "DV-2031", client: "Clinilab Sarl", product: "Verrerie de précision (lot)", amount: "4 200 MAD", date: "24 juin 2026", status: "En attente" },
  { id: "DV-2030", client: "LabTech Maroc", product: "Centrifugeuse CF-300", amount: "18 400 MAD", date: "23 juin 2026", status: "Validé" },
  { id: "DV-2029", client: "BioMed Diagnostics", product: "Kit réactifs immuno x10", amount: "12 500 MAD", date: "21 juin 2026", status: "En attente" },
  { id: "DV-2028", client: "Clinique Al Amal", product: "Lit médicalisé électrique x2", amount: "19 800 MAD", date: "19 juin 2026", status: "Refusé" },
  { id: "DV-2027", client: "Institut Pasteur Casa", product: "Acide chlorhydrique 37% (20L)", amount: "2 800 MAD", date: "15 juin 2026", status: "Archivé" },
  { id: "DV-2026", client: "Clinilab Sarl", product: "Microscope binoculaire", amount: "6 100 MAD", date: "12 juin 2026", status: "Validé" },
];

const STATUSES = ["Tous", "En attente", "Validé", "Refusé", "Archivé"];
const badgeMap = { "En attente": "gl-badge-warning", "Validé": "gl-badge-success", "Refusé": "gl-badge-danger", "Archivé": "gl-badge-neutral" };

export default function QuoteRequests() {
  const [status, setStatus] = useState("Tous");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(
    () => QUOTES.filter((q) => status === "Tous" || q.status === status),
    [status]
  );

  const sidebar = {
    eyebrow: "Devis",
    title: "Demandes de devis",
    description: "Suivi par statut de traitement",
    sections: [
      {
        title: "Statuts",
        items: STATUSES.map((s) => ({
          key: s,
          label: s === "Tous" ? "Tous les devis" : s,
          icon: s === "En attente" ? IconClock : s === "Validé" ? IconCheck : s === "Refusé" ? IconX : IconFile,
          count: s === "Tous" ? QUOTES.length : QUOTES.filter((q) => q.status === s).length,
          active: status === s,
          onClick: () => setStatus(s),
        })),
      },
    ],
    promo: {
      title: "Délai moyen",
      text: "Le délai moyen de traitement d'un devis est de 1,8 jour ce mois-ci.",
    },
  };

  return (
    <AdminLayout sidebar={sidebar}>
      <PageHead
        crumb={<>Admin&nbsp;/&nbsp;<b>Demandes de devis</b></>}
        title="Demandes de devis"
        description="Validez, refusez ou archivez les demandes reçues des clients."
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
              <tr>
                <th>Référence</th><th>Client</th><th>Produit / service</th><th>Montant estimé</th><th>Date</th><th>Statut</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id} className="is-clickable" onClick={() => setSelected(q)}>
                  <td className="gl-cell-mono">{q.id}</td>
                  <td style={{ fontWeight: 600 }}>{q.client}</td>
                  <td className="gl-cell-muted">{q.product}</td>
                  <td>{q.amount}</td>
                  <td className="gl-cell-muted">{q.date}</td>
                  <td><span className={`gl-badge ${badgeMap[q.status]}`}>{q.status}</span></td>
                  <td><button className="gl-btn gl-btn-ghost gl-btn-sm" onClick={(e) => { e.stopPropagation(); setSelected(q); }}>Détails</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Devis ${selected.id}` : ""}
        subtitle={selected ? `Demandé le ${selected.date}` : ""}
        size="md"
        footer={
          <div className="gl-modal-foot between" style={{ width: "100%", padding: 0, border: "none", background: "transparent" }}>
            <button className="gl-btn gl-btn-danger" onClick={() => setSelected(null)}><IconX width={14} height={14} /> Refuser</button>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="gl-btn gl-btn-ghost" onClick={() => setSelected(null)}>Fermer</button>
              <button className="gl-btn gl-btn-primary" onClick={() => setSelected(null)}><IconCheck width={14} height={14} /> Valider le devis</button>
            </div>
          </div>
        }
      >
        {selected && (
          <>
            <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
              <div style={{ flex: 1, display: "flex", gap: 10, alignItems: "center" }}>
                <div className="gl-stat-icon"><IconBuilding width={16} height={16} /></div>
                <div>
                  <div style={{ fontSize: 11.5, color: "var(--gl-gray-500)" }}>Client</div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{selected.client}</div>
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", gap: 10, alignItems: "center" }}>
                <div className="gl-stat-icon"><IconCalendar width={16} height={16} /></div>
                <div>
                  <div style={{ fontSize: 11.5, color: "var(--gl-gray-500)" }}>Date de demande</div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{selected.date}</div>
                </div>
              </div>
            </div>
            <div className="gl-card gl-card-pad" style={{ background: "var(--gl-gray-50)", boxShadow: "none" }}>
              <div className="gl-card-head"><h3>Détail de la demande</h3></div>
              <div className="gl-table-wrap">
                <table className="gl-table">
                  <thead><tr><th>Article</th><th>Quantité</th><th>Montant estimé</th></tr></thead>
                  <tbody>
                    <tr><td>{selected.product}</td><td className="gl-cell-muted">1</td><td>{selected.amount}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="gl-field" style={{ marginTop: 16 }}>
              <label>Note interne (visible par l'équipe seulement)</label>
              <textarea rows={2} placeholder="Ajouter un commentaire sur ce devis…" />
            </div>
          </>
        )}
      </Modal>
    </AdminLayout>
  );
}
