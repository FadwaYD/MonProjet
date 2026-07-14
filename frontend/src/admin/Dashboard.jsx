import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import {
  IconChart, IconFile, IconCart, IconUsers, IconArrowUp, IconArrowDown,
  IconDownload, IconBox, IconTag, IconShield, IconClock, IconMail,
} from "./components/Icons";


const API_URL = "http://localhost:4000";

const ACTIVITY_ICONS = {
  commande: IconCart,
  client: IconUsers,
  message: IconMail,
};

// Contenu du guide d'utilisation de l'espace admin (Grand Laboratoire)
const guideSections = [
  {
    icon: IconChart,
    title: "Tableau de bord",
    text: "Vue d'ensemble de l'activité : ventes du mois, messages non traités, commandes en cours et nouveaux clients. Le graphique affiche le nombre de devis générés par jour sur les 7 derniers jours.",
  },
  {
    icon: IconBox,
    title: "Produits & catégories",
    text: "Ajoutez, modifiez ou archivez vos produits. Organisez votre catalogue en catégories via le raccourci « Créer une catégorie » dans les actions rapides.",
  },
  {
    icon: IconCart,
    title: "Commandes",
    text: "Suivez les commandes en cours, changez leur statut (en attente, validée, expédiée, livrée) et générez un devis manuel si besoin.",
  },
  {
    icon: IconUsers,
    title: "Clients",
    text: "Consultez la liste des clients, validez les nouveaux comptes en attente et accédez à leur historique de commandes.",
  },
  {
    icon: IconMail,
    title: "Messages",
    text: "Les messages non traités apparaissent sur le tableau de bord. Traitez-les rapidement pour garder ce compteur à zéro.",
  },
  {
    icon: IconDownload,
    title: "Export du rapport",
    text: "Le bouton « Exporter en PDF » en haut du tableau de bord télécharge une capture fidèle de la page (statistiques, graphique, activité) au format PDF.",
  },
];

export default function Dashboard() {
  const [guideOpen, setGuideOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [weeklyDevis, setWeeklyDevis] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const dashboardRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token") || ""}` };

        const [statsRes, weeklyDevisRes, activityRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/dashboard/stats`, { headers }),
          fetch(`${API_URL}/api/admin/dashboard/weekly-devis`, { headers }),
          fetch(`${API_URL}/api/admin/dashboard/activity`, { headers }),
        ]);

        const statsJson = await statsRes.json();
        const weeklyDevisJson = await weeklyDevisRes.json();
        const activityJson = await activityRes.json();

        if (statsJson.success) setStats(statsJson.data);
        if (weeklyDevisJson.success) setWeeklyDevis(weeklyDevisJson.data);
        if (activityJson.success) setActivity(activityJson.data);
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const maxV = weeklyDevis.length > 0 ? Math.max(...weeklyDevis.map((w) => w.v), 1) : 1;
  const weekDevisTotal = weeklyDevis.reduce((sum, w) => sum + w.v, 0);

  const statCards = stats ? [
    {
      label: "Ventes du mois",
      value: `${stats.ventesMois.value.toLocaleString("fr-FR")} MAD`,
      icon: IconChart,
      delta: stats.ventesMois.delta,
      up: stats.ventesMois.up,
    },
    {
      label: "Messages non traités",
      value: String(stats.messagesNonTraites.value),
      icon: IconFile,
      delta: stats.messagesNonTraites.delta,
      up: stats.messagesNonTraites.up,
    },
    {
      label: "Commandes en cours",
      value: String(stats.commandesEnCours.value),
      icon: IconCart,
      delta: stats.commandesEnCours.delta,
      up: stats.commandesEnCours.up,
    },
    {
      label: "Nouveaux clients",
      value: String(stats.nouveauxClients.value),
      icon: IconUsers,
      delta: stats.nouveauxClients.delta,
      up: stats.nouveauxClients.up,
    },
  ] : [];



  // Barre latérale professionnelle : résumé rapide basé sur les vraies données
  const sidebar = {
    eyebrow: "Vue d'ensemble",
    title: "Tableau de bord",
    description: "Résumé de l'activité commerciale",
    customContent: (
      <div style={{ display: "flex", flexDirection: "column", gap: 22, padding: "4px 2px" }}>
        {/* Résumé du jour */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)", marginBottom: 12,
          }}>
            Résumé rapide
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SidebarStat
              icon={IconMail}
              label="Messages non traités"
              value={loading || !stats ? "…" : stats.messagesNonTraites.value}
              tone={!loading && stats && stats.messagesNonTraites.value > 0 ? "warn" : "neutral"}
            />
            <SidebarStat
              icon={IconCart}
              label="Commandes en cours"
              value={loading || !stats ? "…" : stats.commandesEnCours.value}
              tone="neutral"
            />
            <SidebarStat
              icon={IconUsers}
              label="Nouveaux clients (mois)"
              value={loading || !stats ? "…" : stats.nouveauxClients.value}
              tone="positive"
            />
          </div>
        </div>

        {/* Mini résumé de la semaine */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)", marginBottom: 12,
          }}>
            Cette semaine
          </div>
          <div style={{
            background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
              {loading ? "…" : `${weekDevisTotal.toLocaleString("fr-FR")} devis`}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              Devis générés sur 7 jours
            </div>
            {!loading && weeklyDevis.length > 0 && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 40, marginTop: 14 }}>
                {weeklyDevis.map((w) => (
                  <div
                    key={w.d}
                    title={`${w.d} : ${w.v} devis`}
                    style={{
                      flex: 1,
                      height: `${(w.v / maxV) * 100}%`,
                      minHeight: 3,
                      borderRadius: 2,
                      background: "rgba(255,255,255,0.55)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    promo: {
      title: "Besoin d'aide ?",
      text: "Consultez le guide d'utilisation de l'espace admin ou contactez le support technique.",
      action: (
        <button
          className="gl-btn gl-btn-sm"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff", width: "100%" }}
          onClick={() => setGuideOpen(true)}
        >
          Voir le guide
        </button>
      ),
    },
  };

  return (
    <AdminLayout sidebar={sidebar}>
      {/*
        Wrapper "no-scroll" : occupe toute la hauteur disponible de la zone de contenu
        d'AdminLayout et empêche le débordement. Si un scroll global apparaît malgré tout,
        c'est que le conteneur parent dans AdminLayout a lui-même une hauteur "auto" au
        lieu de 100% / 100vh — voir la remarque à la fin de la réponse.
      */}
      <div
        style={{
          height: "100%",
          maxHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
    

        {/* Tout ce qui est à l'intérieur de cette div est capturé tel quel dans le PDF exporté */}
        <div
          ref={dashboardRef}
          style={{
            background: "#fff",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div className="gl-grid-stats" style={{ flexShrink: 0 }}>
            {loading || !stats ? (
              <div className="gl-empty" style={{ gridColumn: "1 / -1" }}><h4>Chargement des statistiques…</h4></div>
            ) : (
              statCards.map((s) => (
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
              ))
            )}
          </div>

          <div
            className="gl-grid-2"
            style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateRows: "1fr" }}
          >
            <div className="gl-card gl-card-pad" style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
              <div className="gl-card-head" style={{ flexShrink: 0 }}>
                <div>
                  <h3>Devis générés cette semaine</h3>
                  <div className="gl-card-sub">Nombre de devis générés, par jour</div>
                </div>
                <span className="gl-spec-tag">REF · GL-DEVIS-W25</span>
              </div>
              {loading ? (
                <div className="gl-empty"><h4>Chargement…</h4></div>
              ) : (
                <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "flex-end", gap: 14, padding: "10px 4px 0" }}>
                  {weeklyDevis.map((w) => (
                    <div key={w.d} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                      <div
                        title={`${w.d} : ${w.v} devis`}
                        style={{
                          width: "100%",
                          maxWidth: 34,
                          height: `${(w.v / maxV) * 85 + 6}%`,
                          borderRadius: "8px 8px 3px 3px",
                          background: w.v === maxV && w.v > 0
                            ? "linear-gradient(180deg, var(--gl-bordeaux-500), var(--gl-bordeaux-700))"
                            : "var(--gl-gray-200)",
                        }}
                      />
                      <span style={{ fontSize: 11.5, color: "var(--gl-gray-600)", fontWeight: 600, flexShrink: 0 }}>{w.d}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="gl-card gl-card-pad" style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
              <div className="gl-card-head" style={{ flexShrink: 0 }}>
                <h3>Activité récente</h3>
              </div>
              {loading ? (
                <div className="gl-empty"><h4>Chargement…</h4></div>
              ) : activity.length === 0 ? (
                <div className="gl-empty"><h4>Aucune activité récente</h4></div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden", flex: 1, minHeight: 0 }}>
                  {activity.slice(0, 5).map((a) => {
                    const Icon = ACTIVITY_ICONS[a.type] || IconClock;
                    return (
                      <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div className="gl-stat-icon" style={{ width: 28, height: 28, flexShrink: 0 }}>
                          <Icon width={13} height={13} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, color: "var(--gl-gray-900)", lineHeight: 1.4,
                            overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box",
                            WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                          }}>
                            {a.text}
                          </div>
                          <div style={{ fontSize: 11.5, color: "var(--gl-gray-500)", marginTop: 2 }}>{a.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Guide d'utilisation de l'espace admin */}
      <Modal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="Guide d'utilisation — Espace admin"
        subtitle="Grand Laboratoire · prise en main rapide de chaque section"
        size="md"
        footer={<button className="gl-btn gl-btn-primary" onClick={() => setGuideOpen(false)}>Compris</button>}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {guideSections.map((g) => (
            <div key={g.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div className="gl-stat-icon" style={{ width: 34, height: 34, flexShrink: 0 }}>
                <g.icon width={16} height={16} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--gl-gray-900)" }}>{g.title}</div>
                <div style={{ fontSize: 12.5, color: "var(--gl-gray-600)", lineHeight: 1.5, marginTop: 2 }}>
                  {g.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </AdminLayout>
  );
}

function SidebarStat({ icon: Icon, label, value, tone }) {
  const toneColors = {
    warn: "#f0b429",
    positive: "#34d399",
    neutral: "rgba(255,255,255,0.85)",
  };
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
      borderRadius: 10, background: "rgba(255,255,255,0.06)",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(255,255,255,0.1)", color: toneColors[tone] || toneColors.neutral,
      }}>
        <Icon width={14} height={14} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.3 }}>{label}</div>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{value}</div>
    </div>
  );
}