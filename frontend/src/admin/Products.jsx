import React, { useState } from "react";
import AdminLayout from "./Layout";
import { Badge, Card, Button, SearchBar, Modal, FormField, EmptyState } from "./components/UI";
import { MOCK } from "../mockData";
import "./admin.css";

const EMPTY_PRODUCT = { name: "", cat: "", stock: "", price: "", status: "actif" };

export default function Products() {
  const [products, setProducts] = useState(MOCK.products);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.cat.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "tous" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_PRODUCT);
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditing(p.id);
    setForm({ name: p.name, cat: p.cat, stock: p.stock, price: p.price, status: p.status });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editing) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editing ? { ...p, ...form, stock: Number(form.stock) } : p))
      );
    } else {
      setProducts((prev) => [
        ...prev,
        { id: Date.now(), ...form, stock: Number(form.stock) },
      ]);
    }
    setModalOpen(false);
  }

  function handleDelete(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteId(null);
  }

  const stockBadge = (stock) => {
    if (stock === 0) return "rupture";
    if (stock <= 10) return "faible";
    return "actif";
  };

  return (
    <AdminLayout title="Produits">
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un produit…" />
        <select
          className="input"
          style={{ width: "auto" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="tous">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="faible">Stock faible</option>
          <option value="rupture">Rupture</option>
        </select>
        <Button variant="primary" onClick={openAdd} style={{ marginLeft: "auto" }}>
          + Ajouter un produit
        </Button>
      </div>

      <Card>
        <div className="card-title">
          <span>
            Produits{" "}
            <span
              className="badge badge-gray"
              style={{ fontWeight: 400, marginLeft: 6 }}
            >
              {filtered.length}
            </span>
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="📦" message="Aucun produit trouvé." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Stock</th>
                <th>Prix</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td>
                    <span className="badge badge-gray">{p.cat}</span>
                  </td>
                  <td
                    style={{
                      color: p.stock === 0 ? "#A32D2D" : p.stock <= 10 ? "#854F0B" : "inherit",
                      fontWeight: p.stock <= 10 ? 500 : 400,
                    }}
                  >
                    {p.stock}
                  </td>
                  <td>{p.price}</td>
                  <td>
                    <Badge status={stockBadge(p.stock)} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button size="sm" onClick={() => openEdit(p)}>
                        ✏️ Modifier
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(p.id)}>
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Add/Edit modal */}
      {modalOpen && (
        <Modal
          title={editing ? "Modifier le produit" : "Ajouter un produit"}
          onClose={() => setModalOpen(false)}
        >
          <FormField label="Nom du produit *">
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Chaise ergonomique"
            />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Catégorie">
              <select
                className="input"
                value={form.cat}
                onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value }))}
              >
                <option value="">Sélectionner…</option>
                {MOCK.categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Stock">
              <input
                className="input"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                placeholder="0"
              />
            </FormField>
          </div>
          <FormField label="Prix (MAD)">
            <input
              className="input"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="Ex: 1 290 MAD"
            />
          </FormField>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: "1rem" }}>
            <Button onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleSave}>
              {editing ? "Enregistrer" : "Ajouter"}
            </Button>
          </div>
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <Modal title="Supprimer le produit ?" onClose={() => setDeleteId(null)}>
          <p style={{ fontSize: 13, marginBottom: "1rem", color: "var(--color-text-muted)" }}>
            Cette action est irréversible. Le produit sera définitivement supprimé.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button variant="primary" onClick={() => handleDelete(deleteId)} style={{ background: "#A32D2D", borderColor: "#A32D2D" }}>
              Supprimer
            </Button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
