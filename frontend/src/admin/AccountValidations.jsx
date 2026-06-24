import React, { useMemo, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import { IconShield, IconClock, IconCheck, IconX, IconFile, IconBuilding, IconMail } from "./components/Icons";

const ACCOUNTS = [
  { id: "VA-08", company: "BioMed Diagnostics", contact: "Dr. Hicham Tazi", email: "h.tazi@biomed-dx.ma", date: "23 juin 2026", status: "En attente", docs: ["Registre de commerce", "Pièce d'identité du gérant"] },
  { id: "VA-07", company: "Institut Pasteur Casa", contact: "Mme. Salma Idrissi", email: "s.idrissi@pasteur-casa.ma", date: "22 juin 2026", status: "En attente", docs: ["Registre de commerce", "Attestation fiscale"] },
  { id: "VA-06", company: "Clinique Najah", contact: "Dr. Omar Fassi", email: "contact@clinique-najah.ma", date: "19 juin 2026", status: "Validé", docs: ["Registre de commerce"] },
  { id: "VA-05", company: "Distri-Lab Express", contact: "M. Rachid Amine", email: "r.amine@distrilab.ma", date: "16 juin 2026", status: "Refusé", docs: ["Registre de commerce"] },
];

const STATUSES = ["Tous", "En attente", "Validé", "Refusé"];
const badgeMap = { "En attente": "gl-badge-warning", "Validé": "gl-badge-success", "Refusé": "gl-badge-danger" };

export default function AccountValidations() {
  const [status, setStatus] = useState("En attente");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(
    () => ACCOUNTS.filter((a) => status === "Tous" || a.status === status),
    [status]
  );

  const sidebar = {
    eyebrow: "Sécurité des comptes",
    title: "Validations de comptes",
    description: "Vérifiez l'identité des nouveaux clients professionnels",
    sections: [
      {
        title: "Statuts",
        items: STATUSES.map((s) => ({
          key: s,
          label: s === "Tous" ? "Tous les comptes" : s,
          icon: s === "En attente" ? IconClock : s === "Validé" ? IconCheck : s === "Refusé" ? IconX : IconShield,
          count: s === "Tous" ? ACCOUNTS.length : ACCOUNTS.filter((a) => a.status === s).length,
          active: status === s,
          onClick: () => setStatus(s),
        })),
      },
    ],
    promo: {
      title: "Rappel sécurité",
      text: "Vérifiez toujours le registre de commerce avant de valider un nouveau compte professionnel.",
    },
  };

  return (
    <AdminLayout sidebar={sidebar}>
      <PageHead
        crumb={<>Admin&nbsp;/&nbsp;<b>Validations de comptes</b></>}
        title="Validation des comptes clients"
        description="Approuvez ou refusez les inscriptions des comptes professionnels."
      />

      <div className="gl-card gl-card-pad">
        <div className="gl-toolbar">
          <select className="gl-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="gl-table-wrap">
          <table className="gl-table">
            <thead><tr><th>Référence</th><th>Société</th><th>Contact</th><th>Date</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="is-clickable" onClick={() => setSelected(a)}>
                  <td className="gl-cell-mono">{a.id}</td>
                  <td style={{ fontWeight: 600 }}>{a.company}</td>
                  <td className="gl-cell-muted">{a.contact}</td>
                  <td className="gl-cell-muted">{a.date}</td>
                  <td><span className={`gl-badge ${badgeMap[a.status]}`}>{a.status}</span></td>
                  <td><button className="gl-btn gl-btn-ghost gl-btn-sm" onClick={(e) => { e.stopPropagation(); setSelected(a); }}>Examiner</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? selected.company : ""}
        subtitle={selected ? `Demande ${selected.id} · reçue le ${selected.date}` : ""}
        size="md"
        footer={
          selected?.status === "En attente" ? (
            <div className="gl-modal-foot between" style={{ width: "100%", padding: 0, border: "none", background: "transparent" }}>
              <button className="gl-btn gl-btn-danger" onClick={() => setSelected(null)}><IconX width={14} height={14} /> Refuser le compte</button>
              <button className="gl-btn gl-btn-primary" onClick={() => setSelected(null)}><IconCheck width={14} height={14} /> Valider le compte</button>
            </div>
          ) : (
            <button className="gl-btn gl-btn-ghost" onClick={() => setSelected(null)}>Fermer</button>
          )
        }
      >
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1, display: "flex", gap: 10, alignItems: "center" }}>
                <div className="gl-stat-icon"><IconBuilding width={16} height={16} /></div>
                <div>
                  <div style={{ fontSize: 11.5, color: "var(--gl-gray-500)" }}>Contact principal</div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{selected.contact}</div>
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", gap: 10, alignItems: "center" }}>
                <div className="gl-stat-icon"><IconMail width={16} height={16} /></div>
                <div>
                  <div style={{ fontSize: 11.5, color: "var(--gl-gray-500)" }}>Email</div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{selected.email}</div>
                </div>
              </div>
            </div>
            <div>
              <div className="gl-card-sub" style={{ marginBottom: 8 }}>Documents soumis</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selected.docs.map((d) => (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid var(--gl-gray-200)", borderRadius: "var(--gl-radius-sm)" }}>
                    <IconFile width={16} height={16} style={{ color: "var(--gl-bordeaux-700)" }} />
                    <span style={{ fontSize: 13, flex: 1 }}>{d}</span>
                    <button className="gl-btn gl-btn-ghost gl-btn-sm">Voir</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
