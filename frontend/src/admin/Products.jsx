import React, { useEffect, useState, useCallback, useRef } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import {
  IconBox, IconFlask, IconPlus, IconSearch,
  IconEdit, IconTrash, IconAlert, IconDownload,
} from "./components/Icons";

const API = "http://localhost:4000/api/produits";

const STATUTS = ["Tous", "Réactif", "Consommable", "Matériel"];

const EMPTY_FORM = {
  reference: "",
  nom: "",
  marque: "",
  description: "",
  prix: 0,
  stock: 0,
  statut: "Réactif",
};

const COMPANY = {
  name:    "GRAND LABORATOIRE",
  address: "Résidence Oum El Koraa, Rue de Lille, RDC N° 46, Casablanca",
  tel:     "0522 44 17 83 — 0661 51 46 73",
  fax:     "0522 30 88 55",
  legal:   "S.A.R.L au capital de 800 000,00 Dhs — RC : 73377 — Patente : 32503929 — IF : 01621471 — CNSS : 2350487",
  bank:    "AttijariWafa Bank, Agence Dakar Casa — 007.780.0000.105000001314.58",
  ice:     "000527835000083",
};

const BORDEAUX_RGB = [122, 30, 46];
const GRAY_RGB     = [107, 114, 128];
const LIGHT_GRAY_RGB = [243, 244, 246];

function formatPrix(prix) {
  const n = Number(prix);
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(2)} DH`;
}

function StockBadge({ label }) {
  const styles = {
    "En stock":     { background: "#d1fae5", color: "#065f46" },
    "Stock faible": { background: "#fef3c7", color: "#92400e" },
    "Rupture":      { background: "#fee2e2", color: "#991b1b" },
  };
  const s = styles[label] || styles["En stock"];
  return (
    <span style={{ ...s, padding: "2px 8px", borderRadius: 20, fontSize: 10.5, fontWeight: 700, display: "inline-block", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function TypeBadge({ statut }) {
  const styles = {
    "Réactif":     { background: "#ede9fe", color: "#5b21b6" },
    "Consommable": { background: "#e0f2fe", color: "#0369a1" },
    "Matériel":    { background: "#f0fdf4", color: "#166534" },
  };
  const s = styles[statut] || {};
  return (
    <span style={{ ...s, padding: "2px 8px", borderRadius: 20, fontSize: 10.5, fontWeight: 700, display: "inline-block", whiteSpace: "nowrap" }}>
      {statut}
    </span>
  );
}

// ─── Photo produit (miniature avec placeholder) ──────────────────────────────
function ProductThumb({ src, alt, size = 36 }) {
  return src ? (
    <img
      src={src} alt={alt}
      style={{ width: size, height: size, borderRadius: 8, objectFit: "cover", border: "1px solid var(--gl-gray-200)", flexShrink: 0 }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: 8, background: "var(--gl-gray-100)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "var(--gl-gray-400)", fontSize: size * 0.4, flexShrink: 0,
    }}>
      <IconBox width={size * 0.5} height={size * 0.5} />
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, required, placeholder, min, step }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gl-gray-600)" }}>
        {label}{required && <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder || label} required={required} min={min} step={step}
        style={{
          padding: "8px 12px", borderRadius: 8,
          border: "1px solid var(--gl-gray-200)", fontSize: 13.5,
          outline: "none", background: "var(--gl-gray-50)", color: "var(--gl-gray-900)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
        onBlur={(e)  => (e.target.style.borderColor = "var(--gl-gray-200)")}
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gl-gray-600)" }}>Description</label>
      <textarea
        name={name} value={value} onChange={onChange} placeholder={placeholder || label} rows={3}
        style={{
          padding: "8px 12px", borderRadius: 8,
          border: "1px solid var(--gl-gray-200)", fontSize: 13.5,
          outline: "none", background: "var(--gl-gray-50)", color: "var(--gl-gray-900)",
          resize: "vertical", fontFamily: "inherit",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
        onBlur={(e)  => (e.target.style.borderColor = "var(--gl-gray-200)")}
      />
    </div>
  );
}

// ─── Champ upload image avec aperçu ──────────────────────────────────────────
function ImageField({ currentUrl, onFileChange, onRemove }) {
  const [preview, setPreview] = useState(currentUrl || null);
  const inputRef = useRef(null);

  useEffect(() => { setPreview(currentUrl || null); }, [currentUrl]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileChange(file);
  }

  function handleRemove() {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onRemove();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gl-gray-600)" }}>Photo du produit</label>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {preview ? (
          <img src={preview} alt="Aperçu" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", border: "1px solid var(--gl-gray-200)" }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: 10, background: "var(--gl-gray-100)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gl-gray-400)" }}>
            <IconBox width={26} height={26} />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            type="button"
            className="gl-btn gl-btn-secondary"
            style={{ fontSize: 12.5, padding: "6px 12px" }}
            onClick={() => inputRef.current?.click()}
          >
            {preview ? "Changer la photo" : "Ajouter une photo"}
          </button>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              style={{ fontSize: 12, color: "#c53030", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
            >
              Retirer la photo
            </button>
          )}
        </div>
        <input
          ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFile} style={{ display: "none" }}
        />
      </div>
      <span style={{ fontSize: 11, color: "var(--gl-gray-400)" }}>JPG, PNG, WEBP ou GIF — 5 Mo max</span>
    </div>
  );
}

function ExportMenu({ produits }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement("script");
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function exportExcel() {
    setOpen(false);
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js");
      const workbook = new window.ExcelJS.Workbook();
      const ws = workbook.addWorksheet("Catalogue");

      ws.columns = [
        { width: 16 }, { width: 32 }, { width: 18 }, { width: 36 },
        { width: 12 }, { width: 14 }, { width: 10 }, { width: 14 },
      ];

      ws.mergeCells("A1:A3");
      const logoCell = ws.getCell("A1");
      logoCell.value = "GL";
      logoCell.font = { bold: true, size: 22, color: { argb: "FFFFFFFF" } };
      logoCell.alignment = { vertical: "middle", horizontal: "center" };
      logoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7A1E2E" } };

      ws.mergeCells("B1:H1");
      const nameCell = ws.getCell("B1");
      nameCell.value = COMPANY.name;
      nameCell.font = { bold: true, size: 20, color: { argb: "FF7A1E2E" } };
      nameCell.alignment = { vertical: "middle" };

      ws.mergeCells("B2:H2");
      ws.getCell("B2").value = COMPANY.address;
      ws.getCell("B2").font = { size: 10, color: { argb: "FF6B7280" } };

      ws.mergeCells("B3:H3");
      ws.getCell("B3").value = `Tél : ${COMPANY.tel}   —   Casablanca, le ${new Date().toLocaleDateString("fr-FR")}`;
      ws.getCell("B3").font = { size: 10, color: { argb: "FF6B7280" } };

      ws.getRow(4).height = 6;

      ws.mergeCells("A5:H5");
      const titleCell = ws.getCell("A5");
      titleCell.value = `Catalogue des produits — ${produits.length} article(s)`;
      titleCell.font = { bold: true, size: 12, color: { argb: "FF374151" } };

      ws.getRow(6).height = 6;

      const headerRow = ws.getRow(7);
      headerRow.values = ["Référence", "Nom", "Marque", "Description", "Prix (DH)", "Type", "Stock (u.)", "État stock"];
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7A1E2E" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
      headerRow.height = 20;

      produits.forEach((p, i) => {
        const row = ws.addRow([
          p.reference, p.nom, p.marque, p.description || "—",
          Number(p.prix) || 0, p.statut, p.stock, p.stockLabel,
        ]);
        row.getCell(5).numFmt = '#,##0.00 "DH"';
        row.eachCell((cell) => { cell.alignment = { vertical: "middle" }; });
        if (i % 2 === 1) {
          row.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
          });
        }
      });

      const footerStart = ws.lastRow.number + 2;
      ws.mergeCells(`A${footerStart}:H${footerStart}`);
      ws.getCell(`A${footerStart}`).value = COMPANY.legal;
      ws.getCell(`A${footerStart}`).font = { italic: true, size: 8, color: { argb: "FF9CA3AF" } };

      ws.mergeCells(`A${footerStart + 1}:H${footerStart + 1}`);
      ws.getCell(`A${footerStart + 1}`).value = `ICE N° : ${COMPANY.ice}   —   ${COMPANY.bank}`;
      ws.getCell(`A${footerStart + 1}`).font = { italic: true, size: 8, color: { argb: "FF9CA3AF" } };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob   = new Blob([buffer], { type: "application/octet-stream" });
      const url    = URL.createObjectURL(blob);
      const a      = document.createElement("a");
      a.href = url; a.download = `catalogue_produits_${new Date().toISOString().slice(0,10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Erreur export Excel : " + e.message);
    }
  }

  async function exportPDF() {
    setOpen(false);
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(...BORDEAUX_RGB);
      doc.roundedRect(14, 9, 16, 16, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text("GL", 22, 19.5, { align: "center" });

      doc.setTextColor(...BORDEAUX_RGB);
      doc.setFontSize(18);
      doc.text(COMPANY.name, 34, 17);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...GRAY_RGB);
      doc.text(COMPANY.address, 34, 23);
      doc.text(`Tél : ${COMPANY.tel}`, 34, 27.5);

      doc.setFontSize(9);
      doc.text(`Casablanca, le ${new Date().toLocaleDateString("fr-FR")}`, pageWidth - 14, 17, { align: "right" });

      doc.setDrawColor(...BORDEAUX_RGB);
      doc.setLineWidth(0.6);
      doc.line(14, 32, pageWidth - 14, 32);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(55, 65, 81);
      doc.text(`Catalogue des produits — ${produits.length} article(s)`, 14, 39);

      doc.autoTable({
        startY: 44,
        head: [["Référence", "Nom", "Marque", "Prix", "Type", "Stock", "État"]],
        body: produits.map((p) => [
          p.reference, p.nom, p.marque, formatPrix(p.prix), p.statut, `${p.stock} u.`, p.stockLabel,
        ]),
        styles: { fontSize: 8.5, cellPadding: 3 },
        headStyles: { fillColor: BORDEAUX_RGB, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: LIGHT_GRAY_RGB },
        columnStyles: {
          0: { cellWidth: 22 }, 1: { cellWidth: 70 }, 2: { cellWidth: 30 },
          3: { cellWidth: 24 }, 4: { cellWidth: 26 }, 5: { cellWidth: 18 }, 6: { cellWidth: 26 },
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 6) {
            const val = data.cell.raw;
            const colors = { "En stock": [209, 250, 229], "Stock faible": [254, 243, 199], "Rupture": [254, 226, 226] };
            if (colors[val]) {
              doc.setFillColor(...colors[val]);
              doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "F");
              doc.setFontSize(8.5); doc.setTextColor(50);
              doc.text(val, data.cell.x + 2, data.cell.y + data.cell.height / 2 + 1);
            }
          }
        },
        margin: { left: 14, right: 14, top: 44 },
        didDrawPage: () => {
          const h = doc.internal.pageSize.getHeight();
          doc.setDrawColor(...BORDEAUX_RGB);
          doc.setLineWidth(0.4);
          doc.line(14, h - 16, pageWidth - 14, h - 16);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7); doc.setTextColor(...GRAY_RGB);
          doc.text(COMPANY.legal, pageWidth / 2, h - 11, { align: "center" });
          doc.text(`ICE N° : ${COMPANY.ice}   —   ${COMPANY.bank}`, pageWidth / 2, h - 7.5, { align: "center" });
        },
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8); doc.setTextColor(...GRAY_RGB);
        doc.text(`Page ${i} / ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 3, { align: "right" });
      }

      doc.save(`catalogue_produits_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (e) {
      alert("Erreur export PDF : " + e.message);
    }
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="gl-btn gl-btn-secondary" onClick={() => setOpen((v) => !v)}>
        <IconDownload width={15} height={15} /> Exporter ▾
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#fff", border: "1px solid var(--gl-gray-200)", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.10)", minWidth: 170, zIndex: 100, overflow: "hidden" }}>
          <button onClick={exportExcel} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13.5, color: "var(--gl-gray-800)", textAlign: "left" }}>
            <span style={{ fontSize: 18 }}>📗</span>
            <div><div style={{ fontWeight: 600 }}>Excel (.xlsx)</div><div style={{ fontSize: 11, color: "var(--gl-gray-500)" }}>Tableau modifiable</div></div>
          </button>
          <div style={{ height: 1, background: "var(--gl-gray-100)" }} />
          <button onClick={exportPDF} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13.5, color: "var(--gl-gray-800)", textAlign: "left" }}>
            <span style={{ fontSize: 18 }}>📕</span>
            <div><div style={{ fontWeight: 600 }}>PDF (.pdf)</div><div style={{ fontSize: 11, color: "var(--gl-gray-500)" }}>Tableau mis en page A4</div></div>
          </button>
        </div>
      )}
    </div>
  );
}

export default function Products() {
  const [produits, setProduits]         = useState([]);
  const [allStats, setAllStats]         = useState({ total: 0, rupture: 0, faible: 0, byStatut: {} });
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeCat, setActiveCat]       = useState("Tous");
  const [query, setQuery]               = useState("");
  const [formModal, setFormModal]       = useState(false);
  const [viewTarget, setViewTarget]     = useState(null);   // fiche détail / photo
  const [editTarget, setEditTarget]     = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [imageFile, setImageFile]       = useState(null);   // nouveau fichier sélectionné
  const [removeImage, setRemoveImage]   = useState(false);  // suppression explicite
  const [formErr, setFormErr]           = useState("");
  const [formBusy, setFormBusy]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProduits = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (activeCat !== "Tous") params.set("statut", activeCat);
      if (query)               params.set("q", query);
      const res  = await fetch(`${API}?${params}`);
      const json = await res.json();
      if (json.success) setProduits(json.data);
      else throw new Error(json.message);
    } catch (e) { setError(e.message || "Impossible de contacter le serveur"); }
    finally { setLoading(false); }
  }, [activeCat, query]);

  const fetchStats = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/stats`);
      const json = await res.json();
      if (json.success) {
        const byStatut = {};
        json.byStatut.forEach((r) => { byStatut[r.statut] = Number(r.total); });
        setAllStats({
          total:   Number(json.total.total)   || 0,
          rupture: Number(json.total.rupture) || 0,
          faible:  Number(json.total.faible)  || 0,
          byStatut,
        });
      }
    } catch (_) {}
  }, []);

  useEffect(() => { fetchProduits(); }, [fetchProduits]);
  useEffect(() => { fetchStats(); },   [fetchStats]);

  const refresh = () => { fetchProduits(); fetchStats(); };

  function openAdd() {
    setEditTarget(null); setForm(EMPTY_FORM);
    setImageFile(null); setRemoveImage(false);
    setFormErr(""); setFormModal(true);
  }

  function openEdit(p) {
    setEditTarget(p);
    setForm({
      reference: p.reference,
      nom: p.nom,
      marque: p.marque,
      description: p.description || "",
      prix: p.prix ?? 0,
      stock: p.stock,
      statut: p.statut,
    });
    setImageFile(null); setRemoveImage(false);
    setFormErr(""); setFormModal(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageFile(file) { setImageFile(file); setRemoveImage(false); }
  function handleImageRemove()   { setImageFile(null); setRemoveImage(true); }

  async function handleSubmit() {
    setFormErr("");
    if (!form.reference || !form.nom || !form.marque || !form.statut) {
      setFormErr("Référence, nom, marque et type sont obligatoires."); return;
    }
    setFormBusy(true);
    try {
      const url    = editTarget ? `${API}/${editTarget.id}` : API;
      const method = editTarget ? "PUT" : "POST";

      const fd = new FormData();
      fd.append("nom", form.nom);
      fd.append("reference", form.reference);
      fd.append("marque", form.marque);
      fd.append("description", form.description || "");
      fd.append("prix", Number(form.prix) || 0);
      fd.append("stock", Number(form.stock));
      fd.append("statut", form.statut);
      if (imageFile) fd.append("image", imageFile);
      if (removeImage) fd.append("removeImage", "true");

      const res  = await fetch(url, { method, body: fd }); // pas de Content-Type manuel avec FormData
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setFormModal(false); refresh();
    } catch (e) { setFormErr(e.message); }
    finally { setFormBusy(false); }
  }

  async function handleDelete() {
    try {
      const res  = await fetch(`${API}/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setDeleteTarget(null); refresh();
    } catch (e) { alert(e.message); }
  }

  const sidebar = {
    eyebrow: "Catalogue", title: "Produits", description: "Filtrer par famille de produits",
    sections: [
      { title: "Familles", items: STATUTS.map((s) => ({
        key: s, label: s, icon: s === "Réactif" ? IconFlask : IconBox,
        active: activeCat === s,
        count: s === "Tous" ? allStats.total : (allStats.byStatut[s] || 0),
        onClick: () => { setActiveCat(s); setQuery(""); },
      }))},
      { title: "Alertes", items: [{
        key: "alerte", label: "Stock faible / Rupture", icon: IconAlert,
        count: (allStats.rupture || 0) + (allStats.faible || 0),
        active: false,
        onClick: () => { setActiveCat("Tous"); setQuery(""); },
      }]},
    ],
  };

  return (
    <AdminLayout sidebar={sidebar}>
      <PageHead
        crumb={<>Admin&nbsp;/&nbsp;<b>Produits</b></>}
        title="Catalogue des produits"
        description="Gérez les réactifs, consommables et matériels du catalogue."
        actions={
          <>
            <ExportMenu produits={produits} />
            <button className="gl-btn gl-btn-primary" onClick={openAdd}>
              <IconPlus width={15} height={15} /> Ajouter un produit
            </button>
          </>
        }
      />

      {error && (
        <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 10, padding: "12px 16px", color: "#c53030", fontSize: 13.5, marginBottom: 16 }}>
          ⚠️ {error}
        </div>
      )}

      <div className="gl-card gl-card-pad">
        <div className="gl-toolbar">
          <div className="gl-search">
            <IconSearch width={15} height={15} />
            <input placeholder="Rechercher par nom, référence ou marque…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="gl-select" value={activeCat} onChange={(e) => setActiveCat(e.target.value)}>
            {STATUTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <style>{`
          .gl-table-compact { font-size: 12.5px; table-layout: fixed; width: 100%; }
          .gl-table-compact th, .gl-table-compact td { padding: 7px 8px !important; }
          .gl-table-compact th { font-size: 10.5px !important; white-space: nowrap; }
          .gl-table-compact .gl-cell-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .gl-product-cell { display: flex; align-items: center; gap: 10px; }
          .gl-row-clickable { cursor: pointer; }
        `}</style>
        <div className="gl-table-wrap">
          <table className="gl-table gl-table-compact">
            <colgroup>
              <col style={{ width: "9%" }} />
              <col style={{ width: "26%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "9%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Référence</th><th>Produit</th><th>Description</th>
                <th>Marque</th><th>Prix</th><th>Type</th><th>Stock</th><th>État</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9}><div className="gl-empty"><p style={{ color: "var(--gl-gray-400)" }}>Chargement…</p></div></td></tr>
              )}
              {!loading && produits.map((p) => (
                <tr key={p.id} className="gl-row-clickable" onClick={() => setViewTarget(p)}>
                  <td className="gl-cell-mono">{p.reference}</td>
                  <td>
                    <div className="gl-product-cell">
                      <ProductThumb src={p.image} alt={p.nom} />
                      <span className="gl-cell-truncate" style={{ fontWeight: 600 }} title={p.nom}>{p.nom}</span>
                    </div>
                  </td>
                  <td className="gl-cell-muted gl-cell-truncate" title={p.description || ""}>
                    {p.description || <span style={{ color: "var(--gl-gray-300)" }}>—</span>}
                  </td>
                  <td className="gl-cell-muted gl-cell-truncate" title={p.marque}>{p.marque}</td>
                  <td style={{ fontWeight: 600 }}>{formatPrix(p.prix)}</td>
                  <td><TypeBadge statut={p.statut} /></td>
                  <td className="gl-cell-muted">{p.stock} u.</td>
                  <td><StockBadge label={p.stockLabel} /></td>
                </tr>
              ))}
              {!loading && produits.length === 0 && (
                <tr><td colSpan={9}>
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
          <span>{produits.length} produit(s) affiché(s)</span>
        </div>
      </div>

      {/* ── Fiche détail produit (photo + description + actions) ──────────── */}
      <Modal
        open={!!viewTarget} onClose={() => setViewTarget(null)}
        title={viewTarget?.nom} subtitle={`Réf. ${viewTarget?.reference}`} size="md"
        footer={
          <>
            <button className="gl-btn gl-btn-ghost" style={{ color: "#c53030" }} onClick={() => { setDeleteTarget(viewTarget); setViewTarget(null); }}>
              <IconTrash width={14} height={14} /> Supprimer
            </button>
            <button className="gl-btn gl-btn-primary" onClick={() => { openEdit(viewTarget); setViewTarget(null); }}>
              <IconEdit width={14} height={14} /> Modifier
            </button>
          </>
        }
      >
        {viewTarget && (
          <div style={{ display: "flex", gap: 18 }}>
            <ProductThumb src={viewTarget.image} alt={viewTarget.nom} size={120} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <TypeBadge statut={viewTarget.statut} />
                <StockBadge label={viewTarget.stockLabel} />
              </div>
              <div style={{ fontSize: 13, color: "var(--gl-gray-600)" }}>
                <strong>Marque :</strong> {viewTarget.marque}
              </div>
              <div style={{ fontSize: 13, color: "var(--gl-gray-600)" }}>
                <strong>Prix :</strong> {formatPrix(viewTarget.prix)} &nbsp;—&nbsp; <strong>Stock :</strong> {viewTarget.stock} u.
              </div>
              <div style={{ fontSize: 13.5, color: "var(--gl-gray-700)", lineHeight: 1.6, marginTop: 4 }}>
                {viewTarget.description || <span style={{ color: "var(--gl-gray-400)" }}>Aucune description renseignée.</span>}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Popup Ajout / Modification ──────────────────────────────────── */}
      <Modal
        open={formModal} onClose={() => setFormModal(false)}
        title={editTarget ? "Modifier le produit" : "Ajouter un produit"}
        subtitle={editTarget ? `Réf. ${editTarget.reference}` : "Renseignez les informations du nouvel article"}
        size="md"
        footer={
          <>
            <button className="gl-btn gl-btn-ghost" onClick={() => setFormModal(false)} disabled={formBusy}>Annuler</button>
            <button className="gl-btn gl-btn-primary" onClick={handleSubmit} disabled={formBusy}>
              {formBusy ? "Enregistrement…" : editTarget ? "Enregistrer" : "Ajouter le produit"}
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {formErr && (
            <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 8, padding: "10px 14px", color: "#c53030", fontSize: 13 }}>
              {formErr}
            </div>
          )}

          <ImageField
            currentUrl={editTarget?.image}
            onFileChange={handleImageFile}
            onRemove={handleImageRemove}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Référence" name="reference" value={form.reference} onChange={handleChange} required placeholder="Ex. P-1042" />
            <Field label="Marque" name="marque" value={form.marque} onChange={handleChange} required placeholder="Ex. BioMerieux" />
          </div>
          <Field label="Nom du produit" name="nom" value={form.nom} onChange={handleChange} required placeholder="Ex. Réactif R-204 Buffer pH 7" />
          <TextAreaField label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Détails, composition, usage…" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field label="Prix (DH)" name="prix" type="number" value={form.prix} onChange={handleChange} min={0} step="0.01" required placeholder="Ex. 120.00" />
            <Field label="Quantité en stock" name="stock" type="number" value={form.stock} onChange={handleChange} min={0} required />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gl-gray-600)" }}>
                Type <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
              </label>
              <select name="statut" value={form.statut} onChange={handleChange}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--gl-gray-200)", fontSize: 13.5, background: "var(--gl-gray-50)", color: "var(--gl-gray-900)" }}>
                <option value="Réactif">Réactif</option>
                <option value="Consommable">Consommable</option>
                <option value="Matériel">Matériel</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Popup Suppression ───────────────────────────────────────────── */}
      <Modal
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        title="Confirmer la suppression" size="sm"
        footer={
          <>
            <button className="gl-btn gl-btn-ghost" onClick={() => setDeleteTarget(null)}>Annuler</button>
            <button className="gl-btn" style={{ background: "#e53e3e", color: "#fff" }} onClick={handleDelete}>
              Supprimer définitivement
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, color: "var(--gl-gray-700)", lineHeight: 1.6 }}>
          Voulez-vous vraiment supprimer <strong>{deleteTarget?.nom}</strong>{" "}
          <span style={{ color: "var(--gl-gray-400)", fontSize: 12 }}>({deleteTarget?.reference})</span> ?
          Cette action est irréversible.
        </p>
      </Modal>
    </AdminLayout>
  );
}