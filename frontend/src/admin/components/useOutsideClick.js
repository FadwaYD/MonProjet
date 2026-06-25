import { useEffect, useRef } from "react";

/**
 * Ferme un popover/menu lorsqu'on clique en dehors de son conteneur.
 * Retourne un ref à attacher à l'élément conteneur du popover.
 */
export default function useOutsideClick(isOpen, onClose) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen, onClose]);

  return ref;
}
