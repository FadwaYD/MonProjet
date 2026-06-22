import React, { useState } from "react";

/* ── Badge ─────────────────────────────────────────────── */
const STATUS_CLASSES = {
  actif: "badge-success",
  livré: "badge-success",
  accepté: "badge-success",
  validé: "badge-success",
  vip: "badge-info",
  "en cours": "badge-info",
  "en attente": "badge-warning",
  faible: "badge-warning",
  refusé: "badge-danger",
  rupture: "badge-danger",
  annulé: "badge-danger",
  inactif: "badge-gray",
  rejeté: "badge-danger",
};

export function Badge({ status }) {
  const cls = STATUS_CLASSES[status] || "badge-gray";
  return <span className={`badge ${cls}`}>{status}</span>;
}

/* ── Avatar ─────────────────────────────────────────────── */
export function Avatar({ name, size = 32 }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

/* ── StatCard ───────────────────────────────────────────── */
export function StatCard({ label, value, change, up, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        <span style={{ marginRight: 6 }}>{icon}</span>
        {label}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-change" style={{ color: up ? "#3B6D11" : "#A32D2D" }}>
        {up ? "▲" : "▼"} {change} ce mois
      </div>
    </div>
  );
}

/* ── Card ───────────────────────────────────────────────── */
export function Card({ title, action, children, style }) {
  return (
    <div className="card" style={style}>
      {title && (
        <div className="card-title">
          <span>{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Button ─────────────────────────────────────────────── */
export function Button({ children, onClick, variant = "default", size = "md", style }) {
  const cls = variant === "primary" ? "btn btn-primary" : "btn";
  const padding = size === "sm" ? "3px 10px" : "6px 16px";
  const fontSize = size === "sm" ? 12 : 13;
  return (
    <button className={cls} onClick={onClick} style={{ padding, fontSize, ...style }}>
      {children}
    </button>
  );
}

/* ── SearchBar ──────────────────────────────────────────── */
export function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", marginBottom: "1rem" }}>
      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-secondary)" }}>
        🔍
      </span>
      <input
        className="input"
        style={{ paddingLeft: 32, maxWidth: 320 }}
        placeholder={placeholder || "Rechercher…"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/* ── Modal ──────────────────────────────────────────────── */
export function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        padding: "1.5rem", width: 480, maxWidth: "90vw",
        maxHeight: "80vh", overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: 16, fontWeight: 500 }}>{title}</h2>
          <button className="btn" onClick={onClose} style={{ padding: "3px 10px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── FormField ──────────────────────────────────────────── */
export function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="label">{label}</div>
      {children}
    </div>
  );
}

/* ── ProgressBar ────────────────────────────────────────── */
export function ProgressBar({ pct }) {
  return (
    <div className="progress">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ── EmptyState ─────────────────────────────────────────── */
export function EmptyState({ icon, message }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-secondary)" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{message}</p>
    </div>
  );
}
