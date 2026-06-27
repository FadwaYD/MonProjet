import React, { useState } from "react";
import { Link } from "react-router-dom";
import useOutsideClick from "./useOutsideClick";
import {
  IconBell, IconMail, IconSearch, IconChevronDown,
  IconLogout, IconSettings, IconUser,
} from "./Icons";

const notifications = [
  { id: 1, who: "FY", text: "Nouvelle demande de devis pour Verrerie de précision.", time: "Il y a 12 min", unread: true },
  { id: 2, who: "AV", text: "Compte client « Clinilab Sarl » en attente de validation.", time: "Il y a 38 min", unread: true },
  { id: 3, who: "ST", text: "Stock faible : Réactif R-204 (8 unités restantes).", time: "Il y a 2 h", unread: false },
  { id: 4, who: "CM", text: "Commande #CMD-1042 marquée comme livrée.", time: "Hier", unread: false },
];

const messages = [
  { id: 1, who: "Dr. Bensaid", text: "Pouvez-vous m'envoyer le devis mis à jour ?", time: "10:24", unread: true },
  { id: 2, who: "Clinilab Sarl", text: "Merci, commande bien reçue.", time: "09:02", unread: true },
  { id: 3, who: "LabTech Maroc", text: "Disponibilité du matériel de centrifugation ?", time: "Hier", unread: false },
];

/**
 * Barre de navigation supérieure — reste strictement identique sur
 * l'ensemble des pages admin, y compris ses pop-up (notifications,
 * messages, profil).
 */
export default function TopNavbar() {
  const [openMenu, setOpenMenu] = useState(null); // "notif" | "mail" | "profile" | null
  const ref = useOutsideClick(!!openMenu, () => setOpenMenu(null));

  const toggle = (name) => setOpenMenu((cur) => (cur === name ? null : name));
  const unreadNotif = notifications.filter((n) => n.unread).length;
  const unreadMail = messages.filter((m) => m.unread).length;

  return (
    <header className="gl-topbar">
      <div className="gl-topbar-left">
        <Link to="/admin" className="gl-brand">
          <div className="gl-brand-mark">GL</div>
          <div className="gl-brand-text">
            <strong>Grand Laboratoire</strong>
            <span>Espace administration</span>
          </div>
        </Link>
        
      </div>

      <div className="gl-topbar-right" ref={ref}>
        <div className="gl-popover-wrap">
          <button className="gl-icon-btn" onClick={() => toggle("mail")} aria-label="Messages">
            <IconMail width={19} height={19} />
            {unreadMail > 0 && <span className="dot" />}
          </button>
          {openMenu === "mail" && (
            <div className="gl-popover">
              <div className="gl-popover-head">
                <h4>Messages</h4>
                <Link to="/admin/messages" onClick={() => setOpenMenu(null)}>Tout voir</Link>
              </div>
              <div className="gl-popover-list">
                {messages.map((m) => (
                  <div key={m.id} className={`gl-popover-item ${m.unread ? "unread" : ""}`}>
                    <div className="pic">{m.who.split(" ").map((w) => w[0]).join("").slice(0, 2)}</div>
                    <div className="txt">
                      <p><strong>{m.who} — </strong>{m.text}</p>
                      <span>{m.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="gl-popover-wrap">
          <button className="gl-icon-btn" onClick={() => toggle("notif")} aria-label="Notifications">
            <IconBell width={19} height={19} />
            {unreadNotif > 0 && <span className="dot" />}
          </button>
          {openMenu === "notif" && (
            <div className="gl-popover">
              <div className="gl-popover-head">
                <h4>Notifications</h4>
                <a href="#" onClick={(e) => e.preventDefault()}>Tout marquer comme lu</a>
              </div>
              <div className="gl-popover-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`gl-popover-item ${n.unread ? "unread" : ""}`}>
                    <div className="pic">{n.who}</div>
                    <div className="txt">
                      <p>{n.text}</p>
                      <span>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="gl-topbar-divider" />

        <div className="gl-popover-wrap">
          <button className="gl-profile-btn" onClick={() => toggle("profile")}>
            <div className="gl-avatar">NM</div>
            <div className="gl-profile-info">
              <strong>Nouhaila M.</strong>
              <span>Administrateur</span>
            </div>
            <IconChevronDown width={15} height={15} />
          </button>
          {openMenu === "profile" && (
            <div className="gl-popover gl-popover-sm" style={{ padding: "6px 0" }}>
              <button className="gl-menu-item"><IconUser width={16} height={16} /> Mon profil</button>
              <button className="gl-menu-item"><IconSettings width={16} height={16} /> Paramètres</button>
              <div className="gl-menu-sep" />
              <button className="gl-menu-item danger"><IconLogout width={16} height={16} /> Déconnexion</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
