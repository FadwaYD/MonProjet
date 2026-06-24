import React, { useState } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import {
  IconChart, IconFile, IconCart, IconUsers, IconArrowUp, IconArrowDown,
  IconPlus, IconDownload, IconBox, IconTag, IconShield, IconClock,
} from "./components/Icons";

const stats = [
  { label: "Ventes du mois", value: "184 200 MAD", icon: IconChart, delta: "+12,4%", up: true },
  { label: "Devis en attente", value: "23", icon: IconFile, delta: "+5", up: true },
  { label: "Commandes en cours", value: "14", icon: IconCart, delta: "-2", up: false },
  { label: "Nouveaux clients", value: "9", icon: IconUsers, delta: "+3", up: true },
];

const weekly = [
  { d: "Lun", v: 38 }, { d: "Mar", v: 52 }, { d: "Mer", v: 44 }, { d: "Jeu", v: 70 },
  { d: "Ven", v: 61 }, { d: "Sam", v: 28 }, { d: "Dim", v: 14 },
];

const activity = [
  { id: 1, text: "Devis #DV-2031 envoyé à Clinilab Sarl", time: "09:42", icon: IconFile },
  { id: 2, text: "Nouveau client inscrit : LabTech Maroc", time: "08:55", icon: IconUsers },
  { id: 3, text: "Commande #CMD-1042 marquée comme livrée", time: "Hier", icon: IconCart },
  { id: 4, text: "Produit « Centrifugeuse CF-300 » mis à jour", time: "Hier", icon: IconBox },
  { id: 5, text: "Compte « BioMed Diagnostics » validé", time: "Lun", icon: IconShield },
];

const quickActions = [
  { label: "Ajouter un produit", icon: IconBox },
  { label: "Créer une catégorie", icon: IconTag },
  { label: "Nouveau devis manuel", icon: IconFile },
  { label: "Valider un compte", icon: IconShield },
];

export default function Dashboard() {
  const [quickOpen, setQuickOpen] = useState(false);
  const maxV = Math.max(...weekly.map((w) => w.v));

  const sidebar = {
    eyebrow: "Vue d'ensemble",
    title: "Tableau de bord",
    description: "Résumé de l'activité commerciale",
    sections: [
      {
        title: "Aperçu",
        items: [
          { key: "overview", label: "Vue générale", icon: IconChart, active: true },
          { key: "activity", label: "Activité récente", icon: IconClock },
          { key: "goals", label: "Objectifs du mois", icon: IconArrowUp },
        ],
      },
      {
        title: "Raccourcis",
        items: [
          { key: "qa-product", label: "Ajouter un produit", icon: IconBox, onClick: () => setQuickOpen(true) },
          { key: "qa-quote", label: "Créer un devis", icon: IconFile, onClick: () => setQuickOpen(true) },
          { key: "qa-client", label: "Nouveau client", icon: IconUsers, onClick: () => setQuickOpen(true) },
        ],
      },
    ],
    promo: {
      title: "Besoin d'aide ?",
      text: "Consultez le guide d'utilisation de l'espace admin ou contactez le support technique.",
      action: <button className="gl-btn gl-btn-sm" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", width: "100%" }}>Voir le guide</button>,
    },
  };

  return (
    <AdminLayout sidebar={sidebar}>
      <PageHead
        crumb={<>Admin&nbsp;/&nbsp;<b>Tableau de bord</b></>}
        title="Bonjour, Nouhaila 👋"
        description="Voici un aperçu de l'activité de Grand Laboratoire aujourd'hui."
        actions={
          <>
            <button className="gl-btn gl-btn-secondary"><IconDownload width={15} height={15} /> Exporter</button>
            <button className="gl-btn gl-btn-primary" onClick={() => setQuickOpen(true)}>
              <IconPlus width={15} height={15} /> Actions rapides
            </button>
          </>
        }
      />

      <div className="gl-grid-stats">
        {stats.map((s) => (
          <div className="gl-stat" key={s.label}>
            <div className="gl-stat-top">
              <div className="gl-stat-icon"><s.icon width={18} height={18} /></div>
              <span className={`gl-stat-delta ${s.up ? "up" : "down"}`}>
                {s.up ? <IconArrowUp width={12} height={12} /> : <IconArrowDown width={12} height={12} />}
                {s.delta}
              </span>
            </div>
            <div className="gl-stat-value">{s.value}</div>
            <div className="gl-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="gl-grid-2">
        <div className="gl-card gl-card-pad">
          <div className="gl-card-head">
            <div>
              <h3>Ventes de la semaine</h3>
              <div className="gl-card-sub">Total des commandes facturées, par jour</div>
            </div>
            <span className="gl-spec-tag">REF · GL-SALES-W25</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 180, padding: "10px 4px 0" }}>
            {weekly.map((w) => (
              <div key={w.d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: "100%",
                    maxWidth: 34,
                    height: `${(w.v / maxV) * 130 + 6}px`,
                    borderRadius: "8px 8px 3px 3px",
                    background: w.v === maxV
                      ? "linear-gradient(180deg, var(--gl-bordeaux-500), var(--gl-bordeaux-700))"
                      : "var(--gl-gray-200)",
                  }}
                />
                <span style={{ fontSize: 11.5, color: "var(--gl-gray-600)", fontWeight: 600 }}>{w.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gl-card gl-card-pad">
          <div className="gl-card-head">
            <h3>Activité récente</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {activity.map((a) => (
              <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div className="gl-stat-icon" style={{ width: 30, height: 30, flexShrink: 0 }}>
                  <a.icon width={14} height={14} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--gl-gray-900)", lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 11.5, color: "var(--gl-gray-500)", marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
        title="Actions rapides"
        subtitle="Lancez une action courante sans changer de page"
        size="sm"
        footer={<button className="gl-btn gl-btn-ghost" onClick={() => setQuickOpen(false)}>Fermer</button>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {quickActions.map((a) => (
            <button
              key={a.label}
              className="gl-sidebar-item"
              style={{ border: "1px solid var(--gl-gray-200)", padding: "12px 12px" }}
              onClick={() => setQuickOpen(false)}
            >
              <span className="ic"><a.icon width={17} height={17} /></span>
              <span className="lbl">{a.label}</span>
            </button>
          ))}
        </div>
      </Modal>
    </AdminLayout>
  );
}
