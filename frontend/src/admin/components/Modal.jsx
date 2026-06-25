import React, { useEffect } from "react";
import { IconX } from "./Icons";

/**
 * Modale générique réutilisable pour toutes les pop-up admin
 * (ajout produit, détail devis, validation compte, etc.)
 *
 * Props :
 *  - open: bool
 *  - onClose: () => void
 *  - title, subtitle: string
 *  - size: "sm" | "md" | "lg"
 *  - footer: ReactNode (boutons d'action)
 *  - children: contenu du corps
 */
export default function Modal({ open, onClose, title, subtitle, size = "md", footer, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="gl-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={`gl-modal gl-modal-${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="gl-modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="gl-modal-close" onClick={onClose} aria-label="Fermer">
            <IconX width={15} height={15} />
          </button>
        </div>
        <div className="gl-modal-body">{children}</div>
        {footer && <div className="gl-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
