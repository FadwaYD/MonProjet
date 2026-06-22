import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MOCK } from "../mockData";

const NAV_ITEMS = [
  { path: "/admin", icon: "🏠", label: "Dashboard" },
  { path: "/admin/produits", icon: "📦", label: "Produits" },
  { path: "/admin/categories", icon: "🏷️", label: "Catégories" },
  { path: "/admin/devis", icon: "📄", label: "Devis" },
  { path: "/admin/commandes", icon: "🚚", label: "Commandes" },
  { path: "/admin/clients", icon: "👥", label: "Clients" },
  { path: "/admin/messages", icon: "💬", label: "Messages" },
  { path: "/admin/rapports", icon: "📊", label: "Rapports" },
  { path: "/admin/validations", icon: "✅", label: "Validations" },
];

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unread = MOCK.messages.filter((m) => !m.read).length;
  const pending = MOCK.validations.filter((v) => v.status === "en attente").length;

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <span>🛒</span>
          <span>AdminShop</span>
        </div>

        <nav style={{ flex: 1, padding: "0.5rem 0" }}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);
            return (
              <div
                key={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.path === "/admin/messages" && unread > 0 && (
                  <span className="badge badge-danger nav-badge">{unread}</span>
                )}
                {item.path === "/admin/validations" && pending > 0 && (
                  <span className="badge badge-warning nav-badge">{pending}</span>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" onClick={() => navigate("/")}>
            <span className="nav-icon">🌐</span>
            <span>Voir le site</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span>Paramètres</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="btn mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1 style={{ fontSize: 16, fontWeight: 500 }}>{title}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="btn icon-btn"
              onClick={() => navigate("/admin/messages")}
              title="Messages"
              style={{ position: "relative" }}
            >
              💬
              {unread > 0 && (
                <span
                  className="badge badge-danger"
                  style={{ position: "absolute", top: -6, right: -6, padding: "1px 5px", fontSize: 10 }}
                >
                  {unread}
                </span>
              )}
            </button>
            <div
              className="avatar"
              style={{
                width: 34, height: 34, fontSize: 13, cursor: "pointer",
                background: "#EEEDFE", color: "#534AB7"
              }}
              title="Admin"
            >
              AD
            </div>
          </div>
        </header>

        <main className="page">{children}</main>
      </div>
    </div>
  );
}
