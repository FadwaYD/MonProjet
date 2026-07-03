import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useOutsideClick from "./useOutsideClick";
import {
  IconBell, IconMail, IconSearch, IconChevronDown,
  IconLogout, IconSettings, IconUser,
} from "./Icons";

const API_URL = "http://localhost:4000";

// Palette de couleurs pour les avatars (cycle selon l'id)
const AVATAR_COLORS = ["#7C3AED", "#0EA5E9", "#F59E0B", "#EF4444", "#10B981", "#EC4899"];
const getAvatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

/**
 * Barre de navigation supérieure — reste strictement identique sur
 * l'ensemble des pages admin, y compris ses pop-up (notifications,
 * messages, profil).
 */
export default function TopNavbar() {
  const [openMenu, setOpenMenu] = useState(null); // "notif" | "mail" | "profile" | null
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loadingMail, setLoadingMail] = useState(true);
  const ref = useOutsideClick(!!openMenu, () => setOpenMenu(null));

  const toggle = (name) => setOpenMenu((cur) => (cur === name ? null : name));

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/notifications/latest-clients`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        const json = await res.json();

        if (json.success) {
          const formatted = json.data.map((c) => ({
            id: c.id,
            who: (c.nom || "").slice(0, 2).toUpperCase(),
            text: `Compte client « ${c.nomLabo || `${c.prenom} ${c.nom}`} » en attente de validation.`,
            time: formatDateTime(c.created_at),
            unread: true,
          }));
          setNotifications(formatted);
        }
      } catch (err) {
        console.error("Erreur chargement notifications:", err);
      } finally {
        setLoadingNotif(false);
      }
    };

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/contacts/latest`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        const json = await res.json();

        if (json.success) {
          const formatted = json.data.map((c) => ({
            id: c.id,
            who: c.nom,
            text: `${c.sujet} — ${c.message}`,
            time: formatDateTime(c.created_at),
            unread: c.statut === "Nouveau",
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.error("Erreur chargement messages:", err);
      } finally {
        setLoadingMail(false);
      }
    };

    fetchNotifications();
    fetchMessages();
  }, []);

  const unreadNotif = notifications.filter((n) => n.unread).length;
  const unreadMail = messages.filter((m) => m.unread).length;

  return (
    <header className="gl-topbar">
      <style>{notifStyles}</style>

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
            <div className="gl-popover gl-popover-wa">
              <div className="gl-popover-head">
                <h4>
                  Messages
                  {unreadMail > 0 && <span className="count-badge">{unreadMail}</span>}
                </h4>
              </div>
              <div className="gl-popover-list">
                {loadingMail ? (
                  <div className="gl-popover-item gl-popover-empty">
                    <p>Chargement…</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="gl-popover-item gl-popover-empty">
                    <p>Aucun message pour le moment.</p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <Link
                      key={m.id}
                      to="/admin/messages"
                      onClick={() => setOpenMenu(null)}
                      className={`gl-popover-item ${m.unread ? "unread" : ""}`}
                    >
                      <div className="pic" style={{ background: getAvatarColor(m.id) }}>
                        {m.who.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="txt">
                        <div className="txt-row">
                          <strong>{m.who}</strong>
                          <span className="time">{m.time}</span>
                        </div>
                        <p>{m.text}</p>
                      </div>
                    </Link>
                  ))
                )}
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
            <div className="gl-popover gl-popover-wa">
              <div className="gl-popover-head">
                <h4>
                  Notifications
                  {unreadNotif > 0 && <span className="count-badge">{unreadNotif}</span>}
                </h4>
              </div>
              <div className="gl-popover-list">
                {loadingNotif ? (
                  <div className="gl-popover-item gl-popover-empty">
                    <p>Chargement…</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="gl-popover-item gl-popover-empty">
                    <p>Aucune nouvelle demande client.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`gl-popover-item ${n.unread ? "unread" : ""}`}>
                      <div className="pic" style={{ background: getAvatarColor(n.id) }}>
                        {n.who}
                      </div>
                      <div className="txt">
                        <div className="txt-row">
                          <strong>Nouveau client</strong>
                          <span className="time">{n.time}</span>
                        </div>
                        <p>{n.text}</p>
                      </div>
                    </div>
                  ))
                )}
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

/**
 * Formate une date SQL en "JJ/MM/AAAA à HH:MM"
 */
function formatDateTime(dateString) {
  const date = new Date(dateString);
  const day = date.toLocaleDateString("fr-FR");
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${day} à ${time}`;
}

const notifStyles = `
.gl-popover-wa {
  width: 340px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0,0,0,0.18);
  border: 1px solid #eee;
}
.gl-popover-wa .gl-popover-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #7a1f2b;
  color: #fff;
}
.gl-popover-wa .gl-popover-head h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.gl-popover-wa .gl-popover-head a {
  color: #f3d9dc;
  font-size: 12.5px;
  text-decoration: none;
}
.gl-popover-wa .gl-popover-head a:hover {
  text-decoration: underline;
}
.count-badge {
  background: #fff;
  color: #7a1f2b;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
}
.gl-popover-wa .gl-popover-list {
  max-height: 360px;
  overflow-y: auto;
  background: #fff;
}
.gl-popover-wa .gl-popover-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
  transition: background 0.15s ease;
  text-decoration: none;
  color: inherit;
}
.gl-popover-wa .gl-popover-item:hover {
  background: #faf5f5;
}
.gl-popover-wa .gl-popover-item.unread {
  background: #fdf3f1;
}
.gl-popover-wa .gl-popover-item .pic {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
.gl-popover-wa .txt {
  flex: 1;
  min-width: 0;
}
.gl-popover-wa .txt-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.gl-popover-wa .txt-row strong {
  font-size: 13.5px;
  color: #222;
}
.gl-popover-wa .txt .time {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  flex-shrink: 0;
}
.gl-popover-wa .txt p {
  margin: 2px 0 0;
  font-size: 12.5px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.gl-popover-empty {
  justify-content: center;
  padding: 24px 16px !important;
}
.gl-popover-empty p {
  color: #999 !important;
  text-align: center;
  width: 100%;
}
`;