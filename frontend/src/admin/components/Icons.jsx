import React from "react";

/**
 * Jeu d'icônes SVG minimal (style "outline", trait 1.8) pour éviter
 * toute dépendance externe (lucide-react, etc.) non garantie dans le projet.
 * Toutes les icônes héritent de la couleur du texte (currentColor).
 */
const base = (props) => ({
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  ...props,
});

export const IconDashboard = (p) => (
  <svg {...base(p)}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
);
export const IconBox = (p) => (
  <svg {...base(p)}><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>
);
export const IconTag = (p) => (
  <svg {...base(p)}><path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L3 3v6.59a2 2 0 0 0 .59 1.41l9.59 9.59a2 2 0 0 0 2.82 0l4.59-4.59a2 2 0 0 0 0-2.59Z" /><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" /></svg>
);
export const IconFile = (p) => (
  <svg {...base(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" /></svg>
);
export const IconCart = (p) => (
  <svg {...base(p)}><circle cx="9" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /><path d="M2 3h2l2.4 12.2A2 2 0 0 0 8.4 17h8.2a2 2 0 0 0 2-1.6L21 7H6" /></svg>
);
export const IconUsers = (p) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" /><circle cx="17.5" cy="9" r="2.6" /><path d="M15 14.2c2.6.6 4.5 2.7 4.5 5.3" /></svg>
);
export const IconMessage = (p) => (
  <svg {...base(p)}><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
export const IconChart = (p) => (
  <svg {...base(p)}><path d="M3 21V9M10 21V4M17 21v-7M3 21h18" /></svg>
);
export const IconShield = (p) => (
  <svg {...base(p)}><path d="M12 22s8-3.5 8-10.5V5l-8-3-8 3v6.5C4 18.5 12 22 12 22Z" /><path d="m9 12 2 2 4-4" /></svg>
);
export const IconBell = (p) => (
  <svg {...base(p)}><path d="M6 8a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8Z" /><path d="M9.5 17a2.5 2.5 0 0 0 5 0" /></svg>
);
export const IconMail = (p) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
);
export const IconSearch = (p) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
export const IconChevronDown = (p) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconLogout = (p) => (
  <svg {...base(p)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
);
export const IconSettings = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 13a7.97 7.97 0 0 0 0-2l2-1.6-2-3.4-2.4.7a8 8 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a8 8 0 0 0-1.7 1l-2.4-.7-2 3.4L6.6 11a8 8 0 0 0 0 2l-2 1.6 2 3.4 2.4-.7c.5.4 1.1.8 1.7 1l.3 2.5h4l.3-2.5a8 8 0 0 0 1.7-1l2.4.7 2-3.4z" /></svg>
);
export const IconUser = (p) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20.5c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5" /></svg>
);
export const IconPlus = (p) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconEdit = (p) => (
  <svg {...base(p)}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
);
export const IconTrash = (p) => (
  <svg {...base(p)}><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
);
export const IconX = (p) => (
  <svg {...base(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const IconCheck = (p) => (
  <svg {...base(p)}><path d="M20 6 9 17l-5-5" /></svg>
);
export const IconFilter = (p) => (
  <svg {...base(p)}><path d="M3 4h18l-7 9v6l-4 2v-8z" /></svg>
);
export const IconDownload = (p) => (
  <svg {...base(p)}><path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" /></svg>
);
export const IconMore = (p) => (
  <svg {...base(p)}><circle cx="12" cy="5" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.3" fill="currentColor" stroke="none" /></svg>
);
export const IconEye = (p) => (
  <svg {...base(p)}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const IconClock = (p) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
);
export const IconArrowUp = (p) => (
  <svg {...base(p)}><path d="M12 19V5M5 12l7-7 7 7" /></svg>
);
export const IconArrowDown = (p) => (
  <svg {...base(p)}><path d="M12 5v14M5 12l7 7 7-7" /></svg>
);
export const IconFlask = (p) => (
  <svg {...base(p)}><path d="M9 2h6M10 2v6.5L4.7 18a2 2 0 0 0 1.7 3h11.2a2 2 0 0 0 1.7-3L14 8.5V2" /><path d="M7.5 15h9" /></svg>
);
export const IconPaperclip = (p) => (
  <svg {...base(p)}><path d="M21 11.5 12.2 20a4 4 0 0 1-5.7-5.7l8-8a2.7 2.7 0 0 1 3.8 3.8l-7.6 7.6" /></svg>
);
export const IconSend = (p) => (
  <svg {...base(p)}><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4Z" /></svg>
);
export const IconBuilding = (p) => (
  <svg {...base(p)}><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" /></svg>
);
export const IconCalendar = (p) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
);
export const IconAlert = (p) => (
  <svg {...base(p)}><path d="M12 9v4M12 17h.01" /><path d="m10.3 3.9-8 14A1.5 1.5 0 0 0 3.6 20h16.8a1.5 1.5 0 0 0 1.3-2.2l-8-14a1.5 1.5 0 0 0-2.6 0Z" /></svg>
);
