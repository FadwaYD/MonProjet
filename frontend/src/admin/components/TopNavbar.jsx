import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useOutsideClick from "./useOutsideClick";
import {
  IconBell, IconMail, IconSearch, IconChevronDown,
  IconLogout, IconCheck, IconX,
} from "./Icons";

const API_URL = "http://localhost:4000";

// Palette de couleurs pour les avatars (cycle selon l'id)
const AVATAR_COLORS = ["#7C3AED", "#0EA5E9", "#F59E0B", "#EF4444", "#10B981", "#EC4899"];
const getAvatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

// Clé localStorage pour la liste "à faire" (100% front-end, propre à ce navigateur)
const TODO_KEY = "gl_todos";

// Raccourcis de recherche rapide — adapte les chemins si tes routes diffèrent
const QUICK_LINKS = [
  { label: "Tableau de bord", path: "/admin" },
  { label: "Produits", path: "/admin/produits" },
  { label: "Demandes de devis", path: "/admin/devis" },
  { label: "Clients", path: "/admin/clients" },
  { label: "Messages", path: "/admin/messages" },
];

// Actions rapides — raccourcis de création, accessibles depuis n'importe quelle page
// (adapte les chemins/paramètres si tes pages gèrent la création différemment)


/**
 * Barre de navigation supérieure — reste strictement identique sur
 * l'ensemble des pages admin, y compris ses pop-up (notifications,
 * messages, profil, à-faire, recherche).
 */
export default function TopNavbar() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null); // "notif" | "mail" | "profile" | "todo" | "search" | "actions" | null
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loadingMail, setLoadingMail] = useState(true);
  const ref = useOutsideClick(!!openMenu, () => setOpenMenu(null));

  // ── Horloge live (JJ/MM/AAAA à HH:MM, convention du projet) ────────────────
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // ── Liste "à faire" — persistée en localStorage, propre au navigateur ──────
  const [todos, setTodos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(TODO_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [newTodo, setNewTodo] = useState("");
  const todoInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(TODO_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const text = newTodo.trim();
    if (!text) return;
    setTodos((prev) => [{ id: Date.now(), text, done: false }, ...prev]);
    setNewTodo("");
    todoInputRef.current?.focus();
  };
  const toggleTodo = (id) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const removeTodo = (id) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const pendingTodos = todos.filter((t) => !t.done).length;

  // ── Recherche rapide ─────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const filteredLinks = QUICK_LINKS.filter((l) =>
    l.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );
  const goToLink = (path) => {
    setOpenMenu(null);
    setSearchQuery("");
    navigate(path);
  };

  const toggle = (name) => setOpenMenu((cur) => (cur === name ? null : name));

  // ── Déconnexion : purge la session et renvoie vers l'écran de connexion ────
  const deconnecter = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setOpenMenu(null);
    navigate("/login");
  };

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
        <span className="gl-clock" title="Date et heure actuelles">
          {formatDateTime(now)}
        </span>
      </div>

      <div className="gl-topbar-right" ref={ref}>
      

        {/* ── Recherche rapide ── */}
        <div className="gl-popover-wrap">
          <button className="gl-icon-btn" onClick={() => toggle("search")} aria-label="Recherche">
            <IconSearch width={19} height={19} />
          </button>
          {openMenu === "search" && (
            <div className="gl-popover gl-popover-wa">
              <div className="gl-popover-head">
                <h4>Recherche rapide</h4>
              </div>
              <div style={{ padding: 10, background: "#fff" }}>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Aller à une page…"
                  className="gl-search-input"
                />
              </div>
              <div className="gl-popover-list">
                {filteredLinks.length === 0 ? (
                  <div className="gl-popover-item gl-popover-empty">
                    <p>Aucune page correspondante.</p>
                  </div>
                ) : (
                  filteredLinks.map((l) => (
                    <button
                      key={l.path}
                      className="gl-popover-item"
                      style={{ width: "100%", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                      onClick={() => goToLink(l.path)}
                    >
                      <div className="txt">
                        <div className="txt-row"><strong>{l.label}</strong></div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── À faire ── */}
        <div className="gl-popover-wrap">
          <button className="gl-icon-btn" onClick={() => toggle("todo")} aria-label="À faire">
            <IconCheck width={19} height={19} />
            {pendingTodos > 0 && <span className="dot" />}
          </button>
          {openMenu === "todo" && (
            <div className="gl-popover gl-popover-wa">
              <div className="gl-popover-head">
                <h4>
                  À faire
                  {pendingTodos > 0 && <span className="count-badge">{pendingTodos}</span>}
                </h4>
              </div>
              <div style={{ display: "flex", gap: 6, padding: 10, background: "#fff", borderBottom: "1px solid #f2f2f2" }}>
                <input
                  ref={todoInputRef}
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  placeholder="Ajouter une tâche…"
                  className="gl-search-input"
                />
                <button className="gl-todo-add-btn" onClick={addTodo}>+</button>
              </div>
              <div className="gl-popover-list">
                {todos.length === 0 ? (
                  <div className="gl-popover-item gl-popover-empty">
                    <p>Aucune tâche pour le moment.</p>
                  </div>
                ) : (
                  todos.map((t) => (
                    <div key={t.id} className="gl-todo-item">
                      <button
                        className={`gl-todo-check ${t.done ? "done" : ""}`}
                        onClick={() => toggleTodo(t.id)}
                        aria-label="Marquer comme terminé"
                      >
                        {t.done && <IconCheck width={11} height={11} />}
                      </button>
                      <span className={`gl-todo-text ${t.done ? "done" : ""}`}>{t.text}</span>
                      <button className="gl-todo-remove" onClick={() => removeTodo(t.id)} aria-label="Supprimer">
                        <IconX width={12} height={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
              <button className="gl-menu-item danger" onClick={deconnecter}>
                <IconLogout width={16} height={16} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Formate une date SQL/Date en "JJ/MM/AAAA à HH:MM"
 */
function formatDateTime(dateString) {
  const date = new Date(dateString);
  const day = date.toLocaleDateString("fr-FR");
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${day} à ${time}`;
}

const notifStyles = `
.gl-clock {
  font-size: 12px;
  font-weight: 600;
  color: #8a5a63;
  margin-left: 14px;
  padding-left: 14px;
  border-left: 1px solid #eee;
  white-space: nowrap;
}
.gl-search-input {
  flex: 1;
  border: 1.5px solid #eee;
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 13px;
  outline: none;
}
.gl-search-input:focus {
  border-color: #7a1f2b;
}
.gl-todo-add-btn {
  width: 34px;
  border-radius: 8px;
  border: none;
  background: #7a1f2b;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.gl-todo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid #f2f2f2;
}
.gl-todo-check {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid #ddd;
  background: #fff;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gl-todo-check.done {
  background: #7a1f2b;
  border-color: #7a1f2b;
}
.gl-todo-text {
  flex: 1;
  font-size: 13px;
  color: #222;
}
.gl-todo-text.done {
  color: #aaa;
  text-decoration: line-through;
}
.gl-todo-remove {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #bbb;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gl-todo-remove:hover {
  background: #f7e7e5;
  color: #a8433d;
}
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
