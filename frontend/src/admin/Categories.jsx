import React, { useState } from "react";
import AdminLayout from "./Layout";
import { Card, Button, SearchBar, Modal, FormField, EmptyState } from "./components/UI";
import { MOCK } from "../mockData";
import "./admin.css";

const EMPTY_CAT = { name: "", active: true };

export default function Categories() {
  const [categories, setCategories] = useState(MOCK.categories);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_CAT);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_CAT);
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditing(c.id);
    setForm({ name: c.name, active: c.active });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editing) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editing ? { ...c, ...form } : c))
      );
    } else {
      setCategories((prev) => [
        ...prev,
        { id: Date.now(), name: form.name, products: 0, active: form.active },
      ]);
    }
    setModalOpen(false);
  }

  function toggleActive(id) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  }

  function handleDelete(id) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  const total = categories.reduce((s, c) => s + c.products, 0);
  const active = categories.filter((c) => c.active).length;

  return (
    <AdminLayout title="Catégories">
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1rem" }}>
        {[
          { label: "Total catégories", value: categories.length },
          { label: "Catégories actives", value: active },
          { label: "Total produits", value: total },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Rechercher une catégorie…"
        />
        <Button
          variant="primary"
          onClick={openAdd}
          style={{ marginLeft: "auto" }}
        >
          + Ajouter une catégorie
        </Button>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon="🏷️" message="Aucune catégorie trouvée." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Produits</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td>
                    <span className="badge badge-gray">{c.products} produits</span>
                  </td>
                  <td>
                    <span
                      className={`badge ${c.active ? "badge-success" : "badge-gray"}`}
                    >
                      {c.active ? "actif" : "inactif"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button size="sm" onClick={() => openEdit(c)}>
                        ✏️ Modifier
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => toggleActive(c.id)}
                      >
                        {c.active ? "Désactiver" : "Activer"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(c.id)}
                        style={{ color: "#A32D2D" }}
                      >
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

      {/* Modal */}
      {modalOpen && (
        <Modal
          title={editing ? "Modifier la catégorie" : "Ajouter une catégorie"}
          onClose={() => setModalOpen(false)}
        >
          <FormField label="Nom de la catégorie *">
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Mobilier"
            />
          </FormField>
          <FormField label="Statut">
            <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
              {["actif", "inactif"].map((s) => (
                <label
                  key={s}
                  style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13 }}
                >
                  <input
                    type="radio"
                    name="status"
                    checked={form.active === (s === "actif")}
                    onChange={() => setForm((f) => ({ ...f, active: s === "actif" }))}
                  />
                  {s}
                </label>
              ))}
            </div>
          </FormField>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: "1rem",
            }}
          >
            <Button onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleSave}>
              {editing ? "Enregistrer" : "Ajouter"}
            </Button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
