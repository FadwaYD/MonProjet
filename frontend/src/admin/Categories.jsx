import React, { useState } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import { IconTag, IconPlus, IconEdit, IconTrash, IconBox, IconFlask } from "./components/Icons";

const CATEGORIES = [
  { id: "C-01", name: "Réactifs", count: 42, status: "Active", desc: "Réactifs chimiques et biologiques pour analyse." },
  { id: "C-02", name: "Verrerie de laboratoire", count: 67, status: "Active", desc: "Béchers, fioles, pipettes, tubes à essai…" },
  { id: "C-03", name: "Produits chimiques", count: 38, status: "Active", desc: "Solvants, acides, bases et solutions diverses." },
  { id: "C-04", name: "Matériel scientifique", count: 29, status: "Active", desc: "Centrifugeuses, microscopes, balances de précision." },
  { id: "C-05", name: "Matériel médical (vente)", count: 24, status: "Active", desc: "Équipements médicaux destinés à la vente." },
  { id: "C-06", name: "Matériel médical (location)", count: 16, status: "Archivée", desc: "Équipements proposés en location courte/longue durée." },
];

export default function Categories() {
  const [filter, setFilter] = useState("Toutes");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const visible = CATEGORIES.filter((c) => filter === "Toutes" || c.status === filter);

  const sidebar = {
    eyebrow: "Organisation",
    title: "Catégories",
    description: "Classer les produits du catalogue",
    sections: [
      {
        title: "Filtres",
        items: [
          { key: "all", label: "Toutes les catégories", icon: IconTag, count: CATEGORIES.length, active: filter === "Toutes", onClick: () => setFilter("Toutes") },
          { key: "active", label: "Catégories actives", icon: IconBox, count: CATEGORIES.filter((c) => c.status === "Active").length, active: filter === "Active", onClick: () => setFilter("Active") },
          { key: "archived", label: "Catégories archivées", icon: IconFlask, count: CATEGORIES.filter((c) => c.status === "Archivée").length, active: filter === "Archivée", onClick: () => setFilter("Archivée") },
        ],
      },
    ],
    promo: {
      title: "Astuce",
      text: "Archivez une catégorie plutôt que de la supprimer pour conserver l'historique des produits liés.",
    },
  };

  return (
    <AdminLayout sidebar={sidebar}>
      <PageHead
        crumb={<>Admin&nbsp;/&nbsp;<b>Catégories</b></>}
        title="Catégories de produits"
        description="Organisez le catalogue par famille de produits."
        actions={
          <button className="gl-btn gl-btn-primary" onClick={() => setAddOpen(true)}>
            <IconPlus width={15} height={15} /> Ajouter une catégorie
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {visible.map((c) => (
          <div className="gl-card gl-card-pad" key={c.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="gl-stat-icon"><IconTag width={17} height={17} /></div>
              <span className={`gl-badge ${c.status === "Active" ? "gl-badge-success" : "gl-badge-neutral"}`}>{c.status}</span>
            </div>
            <h3 style={{ marginTop: 14, fontSize: 15 }}>{c.name}</h3>
            <p style={{ fontSize: 12.5, color: "var(--gl-gray-600)", marginTop: 6, lineHeight: 1.5, minHeight: 36 }}>{c.desc}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--gl-gray-100)" }}>
              <span className="gl-spec-tag">{c.count} produits</span>
              <div className="gl-row-actions">
                <button className="gl-btn gl-btn-ghost gl-btn-icon" onClick={() => setEditing(c)}><IconEdit width={15} height={15} /></button>
                <button className="gl-btn gl-btn-ghost gl-btn-icon"><IconTrash width={15} height={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Ajouter une catégorie"
        subtitle="Créez une nouvelle famille de produits"
        size="sm"
        footer={
          <>
            <button className="gl-btn gl-btn-ghost" onClick={() => setAddOpen(false)}>Annuler</button>
            <button className="gl-btn gl-btn-primary" onClick={() => setAddOpen(false)}>Créer la catégorie</button>
          </>
        }
      >
        <div className="gl-field">
          <label>Nom de la catégorie</label>
          <input placeholder="Ex. Consommables de laboratoire" />
        </div>
        <div className="gl-field">
          <label>Description</label>
          <textarea rows={3} placeholder="Brève description de la catégorie" />
        </div>
        <div className="gl-field">
          <label>Statut</label>
          <select><option>Active</option><option>Archivée</option></select>
        </div>
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Modifier « ${editing?.name || ""} »`}
        size="sm"
        footer={
          <>
            <button className="gl-btn gl-btn-ghost" onClick={() => setEditing(null)}>Annuler</button>
            <button className="gl-btn gl-btn-primary" onClick={() => setEditing(null)}>Enregistrer</button>
          </>
        }
      >
        {editing && (
          <>
            <div className="gl-field">
              <label>Nom de la catégorie</label>
              <input defaultValue={editing.name} />
            </div>
            <div className="gl-field">
              <label>Description</label>
              <textarea rows={3} defaultValue={editing.desc} />
            </div>
          </>
        )}
      </Modal>
    </AdminLayout>
  );
}
