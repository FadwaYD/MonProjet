import React, { useMemo, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import {
  IconBox, IconFlask, IconPlus, IconSearch, IconEdit, IconTrash,
  IconAlert, IconDownload,
} from "./components/Icons";

const CATEGORIES = ["Tous", "Réactifs", "Verrerie de laboratoire", "Produits chimiques", "Matériel scientifique", "Matériel médical"];

const PRODUCTS = [
  { id: "P-1042", name: "Réactif R-204 (Buffer pH 7)", cat: "Réactifs", price: "320 MAD", stock: 8, status: "Stock faible" },
  { id: "P-1043", name: "Bécher en verre borosilicaté 500ml", cat: "Verrerie de laboratoire", price: "85 MAD", stock: 64, status: "En stock" },
  { id: "P-1044", name: "Centrifugeuse de table CF-300", cat: "Matériel scientifique", price: "18 400 MAD", stock: 3, status: "En stock" },
  { id: "P-1045", name: "Acide chlorhydrique 37% (1L)", cat: "Produits chimiques", price: "140 MAD", stock: 0, status: "Rupture" },
  { id: "P-1046", name: "Lit médicalisé électrique", cat: "Matériel médical", price: "9 900 MAD", stock: 5, status: "En stock" },
  { id: "P-1047", name: "Kit de réactifs immuno (50 tests)", cat: "Réactifs", price: "1 250 MAD", stock: 12, status: "En stock" },
  { id: "P-1048", name: "Pipette graduée 10ml (lot de 10)", cat: "Verrerie de laboratoire", price: "210 MAD", stock: 41, status: "En stock" },
  { id: "P-1049", name: "Concentrateur d'oxygène portable", cat: "Matériel médical", price: "7 300 MAD", stock: 2, status: "Stock faible" },
];

function StatusBadge({ status }) {
  const map = {
    "En stock": "gl-badge-success",
    "Stock faible": "gl-badge-warning",
    Rupture: "gl-badge-danger",
  };
  return <span className={`gl-badge ${map[status]}`}>{status}</span>;
}

export default function Products() {
  const [activeCat, setActiveCat] = useState("Tous");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCat = activeCat === "Tous" || p.cat === activeCat;
      const matchQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [activeCat, query]);

  const lowStockCount = PRODUCTS.filter((p) => p.status !== "En stock").length;

  const sidebar = {
    eyebrow: "Catalogue",
    title: "Produits",
    description: "Filtrer par famille de produits",
    sections: [
      {
        title: "Familles",
        items: CATEGORIES.map((c) => ({
          key: c,
          label: c,
          icon: c === "Réactifs" ? IconFlask : IconBox,
          active: activeCat === c,
          count: c === "Tous" ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === c).length,
          onClick: () => setActiveCat(c),
        })),
      },
      {
        title: "Alertes",
        items: [
          { key: "low", label: "Stock faible / rupture", icon: IconAlert, count: lowStockCount, onClick: () => setActiveCat("Tous") },
        ],
      },
    ],
  };

  return (
    <AdminLayout sidebar={sidebar}>
      <PageHead
        crumb={<>Admin&nbsp;/&nbsp;<b>Produits</b></>}
        title="Catalogue des produits"
        description="Gérez les réactifs, la verrerie, le matériel scientifique et médical."
        actions={
          <>
            <button className="gl-btn gl-btn-secondary"><IconDownload width={15} height={15} /> Exporter</button>
            <button className="gl-btn gl-btn-primary" onClick={() => setAddOpen(true)}>
              <IconPlus width={15} height={15} /> Ajouter un produit
            </button>
          </>
        }
      />

      <div className="gl-card gl-card-pad">
        <div className="gl-toolbar">
          <div className="gl-search">
            <IconSearch width={15} height={15} />
            <input placeholder="Rechercher par nom ou référence…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="gl-select" value={activeCat} onChange={(e) => setActiveCat(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="gl-table-wrap">
          <table className="gl-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="gl-cell-mono">{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td className="gl-cell-muted">{p.cat}</td>
                  <td>{p.price}</td>
                  <td className="gl-cell-muted">{p.stock} u.</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <div className="gl-row-actions">
                      <button className="gl-btn gl-btn-ghost gl-btn-icon"><IconEdit width={15} height={15} /></button>
                      <button className="gl-btn gl-btn-ghost gl-btn-icon"><IconTrash width={15} height={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7}>
                  <div className="gl-empty">
                    <div className="gl-empty-icon"><IconSearch width={20} height={20} /></div>
                    <h4>Aucun produit trouvé</h4>
                    <p>Essayez une autre recherche ou catégorie.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="gl-pagination">
          <span>{filtered.length} produit(s) sur {PRODUCTS.length}</span>
          <div className="gl-pagination-btns">
            <button className="gl-page-btn active">1</button>
            <button className="gl-page-btn">2</button>
            <button className="gl-page-btn">›</button>
          </div>
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Ajouter un produit"
        subtitle="Renseignez les informations du nouvel article du catalogue"
        size="md"
        footer={
          <>
            <button className="gl-btn gl-btn-ghost" onClick={() => setAddOpen(false)}>Annuler</button>
            <button className="gl-btn gl-btn-primary" onClick={() => setAddOpen(false)}>Enregistrer le produit</button>
          </>
        }
      >
        <div className="gl-field">
          <label>Nom du produit</label>
          <input placeholder="Ex. Centrifugeuse de table CF-300" />
        </div>
        <div className="gl-field-row">
          <div className="gl-field">
            <label>Catégorie</label>
            <select>{CATEGORIES.filter((c) => c !== "Tous").map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="gl-field">
            <label>Prix (MAD)</label>
            <input type="number" placeholder="0,00" />
          </div>
        </div>
        <div className="gl-field-row">
          <div className="gl-field">
            <label>Quantité en stock</label>
            <input type="number" placeholder="0" />
          </div>
          <div className="gl-field">
            <label>Statut</label>
            <select><option>En stock</option><option>Stock faible</option><option>Rupture</option></select>
          </div>
        </div>
        <div className="gl-field">
          <label>Description</label>
          <textarea rows={3} placeholder="Caractéristiques techniques, usage recommandé…" />
        </div>
      </Modal>
    </AdminLayout>
  );
}
