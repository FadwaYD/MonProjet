import React from "react";
import { NavLink } from "react-router-dom";
import {
  IconDashboard, IconBox, IconTag, IconFile, IconCart,
  IconUsers, IconMessage, IconChart, IconShield,
} from "./Icons";

export const RAIL_ITEMS = [
  { to: "/admin", label: "Tableau de bord", icon: IconDashboard, end: true },
  { to: "/admin/produits", label: "Produits", icon: IconBox },
  { to: "/admin/devis", label: "Demandes de devis", icon: IconFile },
  { to: "/admin/clients", label: "Clients", icon: IconUsers },
  { to: "/admin/messages", label: "Messages", icon: IconMessage },
  { to: "/admin/rapports", label: "Rapports", icon: IconChart },
  { to: "/admin/validations", label: "Validations de comptes", icon: IconShield },
];

/**
 * Rail d'icônes vertical — TOUJOURS identique, quelle que soit la page.
 * C'est la navigation principale entre les grandes sections admin.
 * La sidebar contextuelle (à côté) change elle, selon la page active.
 */
export default function IconRail() {
  return (
    <nav className="gl-rail">
      {RAIL_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `gl-rail-link ${isActive ? "active" : ""}`}
        >
          <Icon width={20} height={20} />
          <span className="gl-rail-tooltip">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
