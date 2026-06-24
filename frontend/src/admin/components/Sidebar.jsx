import React from "react";

/**
 * Sidebar CONTEXTUELLE : son contenu change pour chaque page admin
 * (passé via la prop `sections`), contrairement au rail d'icônes et
 * à la barre supérieure qui restent fixes partout.
 *
 * sections: [{ title?: string, items: [{ key, label, icon, count, active, onClick }] }]
 * promo: { title, text, action } — carte d'information optionnelle en bas
 */
export default function Sidebar({ eyebrow, title, description, sections = [], promo }) {
  return (
    <aside className="gl-sidebar">
      <div className="gl-sidebar-head">
        {eyebrow && <div className="gl-sidebar-eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>

      {sections.map((section, idx) => (
        <div className="gl-sidebar-section" key={section.title || idx}>
          {section.title && <div className="gl-sidebar-section-title">{section.title}</div>}
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key || item.label}
                className={`gl-sidebar-item ${item.active ? "active" : ""}`}
                onClick={item.onClick}
              >
                {Icon && (
                  <span className="ic">
                    <Icon width={16} height={16} />
                  </span>
                )}
                <span className="lbl">{item.label}</span>
                {typeof item.count !== "undefined" && <span className="count">{item.count}</span>}
              </button>
            );
          })}
        </div>
      ))}

      {promo && (
        <div className="gl-sidebar-card">
          <h5>{promo.title}</h5>
          <p>{promo.text}</p>
          {promo.action}
        </div>
      )}
    </aside>
  );
}
