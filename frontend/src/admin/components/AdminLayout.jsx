import React from "react";
import TopNavbar from "./TopNavbar";
import IconRail from "./IconRail";
import Sidebar from "./Sidebar";
import "../../styles/theme.css";
import "../../styles/components.css";
import "../../styles/admin-layout.css";

/**
 * Coquille commune à toutes les pages admin.
 *  - <TopNavbar />  : identique partout (recherche, notifications, profil…)
 *  - <IconRail />   : identique partout (navigation entre sections)
 *  - <Sidebar />    : CONTEXTUELLE — son contenu (sidebar prop) change
 *                     selon la page passée par le composant appelant.
 *
 * Usage :
 *  <AdminLayout sidebar={{ eyebrow, title, description, sections, promo }}>
 *    ...contenu de la page...
 *  </AdminLayout>
 */
export default function AdminLayout({ sidebar, children }) {
  return (
    <div className="gl-shell">
      <TopNavbar />
      <IconRail />
      <Sidebar {...sidebar} />
      <main className="gl-main">{children}</main>
    </div>
  );
}
