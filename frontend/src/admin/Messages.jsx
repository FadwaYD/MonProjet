import React, { useState } from "react";
import AdminLayout from "./components/AdminLayout";
import PageHead from "./components/PageHead";
import Modal from "./components/Modal";
import { IconMail, IconSend, IconPaperclip, IconPlus } from "./components/Icons";

const FOLDERS = ["Boîte de réception", "Envoyés", "Archivés"];

const THREADS = [
  { id: 1, folder: "Boîte de réception", from: "Dr. Bensaid — Clinique Al Amal", subject: "Devis mis à jour", preview: "Pouvez-vous m'envoyer le devis mis à jour pour les lits médicalisés…", time: "10:24", unread: true },
  { id: 2, folder: "Boîte de réception", from: "Clinilab Sarl", subject: "Commande bien reçue", preview: "Merci, la commande CMD-1042 est bien arrivée en bon état.", time: "09:02", unread: true },
  { id: 3, folder: "Boîte de réception", from: "LabTech Maroc", subject: "Disponibilité centrifugeuse", preview: "Bonjour, la centrifugeuse CF-300 est-elle toujours disponible ?", time: "Hier", unread: false },
  { id: 4, folder: "Envoyés", from: "Vous → BioMed Diagnostics", subject: "Confirmation de devis DV-2029", preview: "Bonjour, veuillez trouver ci-joint le devis demandé…", time: "Lun", unread: false },
  { id: 5, folder: "Archivés", from: "Institut Pasteur Casa", subject: "Ancienne demande de partenariat", preview: "Suite à notre échange du mois dernier…", time: "12 juin", unread: false },
];

export default function Messages() {
  const [folder, setFolder] = useState("Boîte de réception");
  const visible = THREADS.filter((t) => t.folder === folder);
  const [active, setActive] = useState(visible[0] || null);
  const [composeOpen, setComposeOpen] = useState(false);

  const selectFolder = (f) => {
    setFolder(f);
    const first = THREADS.filter((t) => t.folder === f)[0] || null;
    setActive(first);
  };

  const sidebar = {
    eyebrow: "Communication",
    title: "Messages",
    description: "Échanges avec les clients",
    sections: [
      {
        title: "Dossiers",
        items: FOLDERS.map((f) => ({
          key: f,
          label: f,
          icon: IconMail,
          count: THREADS.filter((t) => t.folder === f).length,
          active: folder === f,
          onClick: () => selectFolder(f),
        })),
      },
    ],
  };

  return (
    <AdminLayout sidebar={sidebar}>
      <PageHead
        crumb={<>Admin&nbsp;/&nbsp;<b>Messages</b></>}
        title={folder}
        description="Centralisez les échanges avec vos clients."
        actions={<button className="gl-btn gl-btn-primary" onClick={() => setComposeOpen(true)}><IconPlus width={15} height={15} /> Nouveau message</button>}
      />

      <div className="gl-card" style={{ display: "grid", gridTemplateColumns: "320px 1fr", minHeight: 480, overflow: "hidden" }}>
        <div style={{ borderRight: "1px solid var(--gl-gray-100)", overflowY: "auto" }}>
          {visible.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t)}
              style={{
                display: "block", width: "100%", textAlign: "left", padding: "14px 18px",
                borderBottom: "1px solid var(--gl-gray-100)", background: active?.id === t.id ? "var(--gl-bordeaux-50)" : "transparent", border: "none",
                borderLeft: active?.id === t.id ? "3px solid var(--gl-bordeaux-700)" : "3px solid transparent",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: t.unread ? 700 : 600, fontSize: 13 }}>{t.from}</span>
                <span style={{ fontSize: 11, color: "var(--gl-gray-500)" }}>{t.time}</span>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: t.unread ? 700 : 500, color: "var(--gl-gray-900)", marginTop: 4 }}>{t.subject}</div>
              <div style={{ fontSize: 12, color: "var(--gl-gray-500)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.preview}</div>
            </button>
          ))}
          {visible.length === 0 && (
            <div className="gl-empty"><div className="gl-empty-icon"><IconMail width={20} height={20} /></div><h4>Dossier vide</h4></div>
          )}
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column" }}>
          {active ? (
            <>
              <div style={{ borderBottom: "1px solid var(--gl-gray-100)", paddingBottom: 16, marginBottom: 16 }}>
                <h3 style={{ fontSize: 16 }}>{active.subject}</h3>
                <div className="gl-name-cell" style={{ marginTop: 10 }}>
                  <div className="gl-avatar">{active.from.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="name">{active.from}</div>
                    <div className="sub">{active.time}</div>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--gl-gray-900)", flex: 1 }}>{active.preview} Nous restons à votre disposition pour toute information complémentaire concernant cette demande.</p>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", borderTop: "1px solid var(--gl-gray-100)", paddingTop: 16 }}>
                <textarea rows={2} placeholder="Répondre…" style={{ flex: 1, border: "1px solid var(--gl-gray-200)", borderRadius: "var(--gl-radius-sm)", padding: 10, fontFamily: "var(--gl-font-body)", fontSize: 13.5 }} />
                <button className="gl-btn gl-btn-ghost gl-btn-icon"><IconPaperclip width={16} height={16} /></button>
                <button className="gl-btn gl-btn-primary"><IconSend width={14} height={14} /> Envoyer</button>
              </div>
            </>
          ) : (
            <div className="gl-empty" style={{ margin: "auto" }}>
              <div className="gl-empty-icon"><IconMail width={20} height={20} /></div>
              <h4>Sélectionnez une conversation</h4>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Nouveau message"
        subtitle="Envoyer un message à un client"
        size="md"
        footer={
          <>
            <button className="gl-btn gl-btn-ghost" onClick={() => setComposeOpen(false)}>Annuler</button>
            <button className="gl-btn gl-btn-primary" onClick={() => setComposeOpen(false)}><IconSend width={14} height={14} /> Envoyer</button>
          </>
        }
      >
        <div className="gl-field"><label>Destinataire</label><input placeholder="Nom du client ou email" /></div>
        <div className="gl-field"><label>Sujet</label><input placeholder="Objet du message" /></div>
        <div className="gl-field"><label>Message</label><textarea rows={5} placeholder="Rédigez votre message…" /></div>
      </Modal>
    </AdminLayout>
  );
}
