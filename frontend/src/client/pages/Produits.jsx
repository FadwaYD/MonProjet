import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:4000/api/produits";
const AUTOPLAY_DELAY = 4500;

function Produits() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categorieActive, setCategorieActive] = useState("Tous");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // transition d'affichage de la grille (fade lors d'un changement de filtre)
  const [gridVisible, setGridVisible] = useState(true);

  // carrousel
  const [slide, setSlide] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);
  const carouselTimer = useRef(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des produits");
        return res.json();
      })
      .then((data) => {
        // Protection : on vérifie que data.data est bien un tableau
        if (data.success && Array.isArray(data.data)) {
          setProduits(data.data);
        } else {
          console.error("Réponse API inattendue:", data);
          setError("Impossible de charger les produits");
          setProduits([]); // évite tout undefined
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Erreur serveur, réessayez plus tard");
        setProduits([]); // évite tout undefined
        setLoading(false);
      });
  }, []);

  // Debounce de la recherche : évite de refiltrer/re-render à chaque frappe
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 280);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fondu de la grille à chaque changement de filtre (catégorie ou recherche)
  useEffect(() => {
    setGridVisible(false);
    const t = setTimeout(() => setGridVisible(true), 180);
    return () => clearTimeout(t);
  }, [categorieActive, search]);

  // Génère la liste des catégories (statut) dynamiquement depuis les produits
  const categories = useMemo(
    () => [
      "Tous",
      ...Array.from(new Set((produits || []).map((p) => p.statut))).filter(Boolean),
    ],
    [produits]
  );

  const getImageUrl = (image) => {
    if (!image) return "https://via.placeholder.com/600x400?text=Produit";
    return image; // déjà une URL complète venant du backend
  };

  const produitsFiltres = useMemo(() => {
    const q = search.toLowerCase();
    return (produits || []).filter((produit) => {
      const categorieOk =
        categorieActive === "Tous" || produit.statut === categorieActive;

      const rechercheOk =
        produit.nom?.toLowerCase().includes(q) ||
        produit.marque?.toLowerCase().includes(q);

      return categorieOk && rechercheOk;
    });
  }, [produits, categorieActive, search]);

  // Produits vedettes pour le carrousel : en stock en priorité, limité à 5
  const produitsVedettes = useMemo(() => {
    const enStock = (produits || []).filter((p) => p.stock > 0);
    const source = enStock.length > 0 ? enStock : produits || [];
    return source.slice(0, 5);
  }, [produits]);

  const goToSlide = useCallback(
    (index) => {
      const total = produitsVedettes.length;
      if (total === 0) return;
      setSlide(((index % total) + total) % total);
    },
    [produitsVedettes.length]
  );

  const nextSlide = useCallback(() => goToSlide(slide + 1), [goToSlide, slide]);
  const prevSlide = useCallback(() => goToSlide(slide - 1), [goToSlide, slide]);

  // Autoplay du carrousel
  useEffect(() => {
    if (produitsVedettes.length <= 1 || isHoveringCarousel) return;
    carouselTimer.current = setInterval(() => {
      setSlide((s) => (s + 1) % produitsVedettes.length);
    }, AUTOPLAY_DELAY);
    return () => clearInterval(carouselTimer.current);
  }, [produitsVedettes.length, isHoveringCarousel]);

  return (
    <>
      {/* Animations globales de la page */}
      <style>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(-22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroGlow {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.06); }
        }
        @keyframes cardRise {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes dotPulse {
          0% { box-shadow: 0 0 0 0 rgba(21,128,61,0.5); }
          70% { box-shadow: 0 0 0 7px rgba(21,128,61,0); }
          100% { box-shadow: 0 0 0 0 rgba(21,128,61,0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes underlineGrow {
          from { width: 0; }
          to { width: 46px; }
        }
        @keyframes chipPop {
          0% { transform: scale(0.9); }
          60% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        @keyframes slideProgress {
          from { width: 0%; }
          to { width: 100%; }
        }

        .hero-anim {
          position: relative;
          animation: heroFadeIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
          overflow: hidden;
        }
        .hero-anim::before {
          content: "";
          position: absolute;
          top: -60%;
          right: -10%;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          animation: heroGlow 6s ease-in-out infinite;
          pointer-events: none;
        }
        .hero-title-underline {
          display: block;
          height: 4px;
          background: linear-gradient(90deg, #ffffff, rgba(255,255,255,0));
          border-radius: 4px;
          margin-top: 10px;
          animation: underlineGrow 0.9s 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* Carrousel */
        .carousel-wrap {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 14px 34px rgba(111,21,40,0.16);
          background: #1a1a1a;
        }
        .carousel-track {
          display: flex;
          transition: transform 0.6s cubic-bezier(0.65, 0, 0.35, 1);
          will-change: transform;
        }
        .carousel-slide {
          position: relative;
          min-width: 100%;
          height: 100%;
        }
        .carousel-slide-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: brightness(0.62);
          transform: scale(1.02);
          transition: transform 8s ease-out, filter 0.4s ease;
        }
        .carousel-slide.is-active .carousel-slide-image {
          transform: scale(1.12);
        }
        .carousel-caption {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 34px 40px;
          color: #fff;
          background: linear-gradient(0deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%);
        }
        .carousel-caption-eyebrow {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f3c9d1;
          opacity: 0;
          transform: translateY(10px);
          animation: fadeIn 0.6s 0.15s ease-out forwards;
        }
        .carousel-caption-title {
          font-size: 1.7rem;
          font-weight: 700;
          margin: 8px 0;
          opacity: 0;
          transform: translateY(14px);
          animation: fadeIn 0.6s 0.25s ease-out forwards;
        }
        .carousel-caption-price {
          font-size: 1.05rem;
          font-weight: 600;
          color: #ffd9df;
          opacity: 0;
          transform: translateY(14px);
          animation: fadeIn 0.6s 0.35s ease-out forwards;
        }
        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.16);
          color: #fff;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          transition: background 0.25s ease, transform 0.25s ease;
          z-index: 3;
        }
        .carousel-arrow:hover {
          background: rgba(139,0,32,0.85);
          transform: translateY(-50%) scale(1.08);
        }
        .carousel-arrow.prev { left: 16px; }
        .carousel-arrow.next { right: 16px; }
        .carousel-dots {
          position: absolute;
          bottom: 16px;
          right: 20px;
          display: flex;
          gap: 8px;
          z-index: 3;
        }
        .carousel-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.45);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.3s ease, transform 0.3s ease, width 0.3s ease;
        }
        .carousel-dot.active {
          background: #fff;
          width: 22px;
          border-radius: 5px;
        }
        .carousel-progress {
          position: absolute;
          top: 0;
          left: 0;
          height: 3px;
          background: #fff;
          animation: slideProgress ${AUTOPLAY_DELAY}ms linear;
        }

        .search-input {
          transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.2s ease;
        }
        .search-input:focus {
          border-color: #8b0020 !important;
          box-shadow: 0 0 0 4px rgba(139,0,32,0.14);
          outline: none;
          transform: translateY(-1px);
        }
        .search-input:hover {
          border-color: #c9a3ac;
        }

        .category-btn {
          transition: background 0.3s ease, color 0.3s ease, transform 0.18s ease, box-shadow 0.3s ease;
          position: relative;
        }
        .category-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 14px rgba(139,0,32,0.16);
        }
        .category-btn:active {
          transform: translateY(-1px) scale(0.96);
        }
        .category-btn.active {
          animation: chipPop 0.35s ease;
        }

        .grid-transition {
          transition: opacity 0.22s ease, transform 0.28s ease;
        }
        .grid-hidden {
          opacity: 0;
          transform: translateY(8px);
        }
        .grid-shown {
          opacity: 1;
          transform: translateY(0);
        }

        .product-card {
          opacity: 0;
          animation: cardRise 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, border-color 0.4s ease;
          border: 1px solid transparent;
        }
        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 36px rgba(111,21,40,0.18);
          border-color: rgba(139,0,32,0.15);
        }
        .product-card:hover .product-image {
          transform: scale(1.08);
        }
        .product-card:hover .product-prix {
          color: #6f1528;
          letter-spacing: 0.2px;
        }
        .product-card:hover .product-title {
          color: #8b0020;
        }
        .product-card:hover .product-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .product-image-wrap {
          overflow: hidden;
          position: relative;
        }
        .product-image-wrap::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.18) 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .product-card:hover .product-image-wrap::after {
          opacity: 1;
        }
        .product-image {
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
          display: block;
        }

        .stock-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #15803d;
          margin-right: 6px;
          animation: dotPulse 2s infinite;
        }

        .prix-anim {
          transition: color 0.3s ease, letter-spacing 0.3s ease;
        }

        .product-title {
          transition: color 0.3s ease;
        }

        .product-arrow {
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.35s ease, transform 0.35s ease;
          display: inline-block;
          margin-left: 6px;
          color: #8b0020;
        }

        .skeleton-card {
          border-radius: 16px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          animation: cardRise 0.55s ease-out forwards;
        }
        .skeleton-block {
          background: linear-gradient(90deg, #eef0f2 25%, #f7f8f9 37%, #eef0f2 63%);
          background-size: 800px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .spinner-ring {
          width: 34px;
          height: 34px;
          border: 3px solid #f1d9de;
          border-top-color: #8b0020;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 14px;
        }

        .fade-in-text {
          animation: fadeIn 0.45s ease-out both;
        }

        .empty-state {
          animation: fadeIn 0.55s ease-out both;
        }
      `}</style>

      <Navbar />

      {/* HERO */}
      <section style={styles.hero} className="hero-anim">
        <div style={styles.container}>
        <br />
          <h1 style={styles.heroTitle}>
            Nos produits
            <span className="hero-title-underline" />
          </h1>
          <p style={styles.heroText}>
            Découvrez notre catalogue complet de réactifs, verrerie et
            matériel biomédical.
          </p>
        </div>
      </section>

      {/* CARROUSEL PRODUITS VEDETTES */}
      {!loading && !error && produitsVedettes.length > 0 && (
        <section style={styles.carouselSection}>
          <div style={styles.container}>
            <div
              className="carousel-wrap"
              style={styles.carouselWrap}
              onMouseEnter={() => setIsHoveringCarousel(true)}
              onMouseLeave={() => setIsHoveringCarousel(false)}
            >
              <div
                className="carousel-track"
                style={{ transform: `translateX(-${slide * 100}%)` }}
              >
                {produitsVedettes.map((produit, i) => (
                  <Link
                    key={produit.id}
                    to={`/produit/${produit.id}`}
                    className={`carousel-slide${i === slide ? " is-active" : ""}`}
                    style={styles.carouselSlide}
                  >
                    <img
                      src={getImageUrl(produit.image)}
                      alt={produit.nom}
                      className="carousel-slide-image"
                    />
                    {i === slide && (
                      <div className="carousel-caption" key={`caption-${produit.id}-${slide}`}>
                        <span className="carousel-caption-eyebrow">{produit.marque}</span>
                        <div className="carousel-caption-title">{produit.nom}</div>
                        <div className="carousel-caption-price">
                          {Number(produit.prix).toFixed(2)} DH
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
              </div>

              {produitsVedettes.length > 1 && (
                <>
                  <button
                    className="carousel-arrow prev"
                    onClick={(e) => {
                      e.preventDefault();
                      prevSlide();
                    }}
                    aria-label="Précédent"
                  >
                    ‹
                  </button>
                  <button
                    className="carousel-arrow next"
                    onClick={(e) => {
                      e.preventDefault();
                      nextSlide();
                    }}
                    aria-label="Suivant"
                  >
                    ›
                  </button>

                  <div className="carousel-dots">
                    {produitsVedettes.map((_, i) => (
                      <button
                        key={i}
                        className={`carousel-dot${i === slide ? " active" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          goToSlide(i);
                        }}
                        aria-label={`Aller à la diapositive ${i + 1}`}
                      />
                    ))}
                  </div>

                  {!isHoveringCarousel && (
                    <div className="carousel-progress" key={slide} />
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FILTRE */}
      <section style={styles.filterSection}>
        <div style={styles.container}>
          <div style={styles.filterBar}>
            <input
              type="text"
              placeholder="Rechercher..."
              style={styles.search}
              className="search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            <div style={styles.categories}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategorieActive(cat)}
                  className={`category-btn${categorieActive === cat ? " active" : ""}`}
                  style={{
                    ...styles.categoryBtn,
                    background: categorieActive === cat ? "#8b0020" : "#f3f4f6",
                    color: categorieActive === cat ? "white" : "#334155",
                    boxShadow:
                      categorieActive === cat
                        ? "0 6px 14px rgba(139,0,32,0.25)"
                        : "none",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LISTE */}
      <section style={styles.productsSection}>
        <div style={styles.container}>
          {loading && (
            <>
              <div style={{ ...styles.resultText, display: "flex", alignItems: "center" }}>
                <span className="spinner-ring" style={{ marginRight: 10, marginBottom: 0 }}></span>
                Chargement des produits...
              </div>
              <div style={styles.grid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton-card"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className="skeleton-block" style={{ width: "100%", height: "220px" }} />
                    <div style={{ padding: "18px" }}>
                      <div className="skeleton-block" style={{ width: "40%", height: "12px", borderRadius: 4, marginBottom: 10 }} />
                      <div className="skeleton-block" style={{ width: "80%", height: "16px", borderRadius: 4, marginBottom: 10 }} />
                      <div className="skeleton-block" style={{ width: "60%", height: "12px", borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {error && (
            <p className="fade-in-text" style={{ ...styles.resultText, color: "#dc2626" }}>{error}</p>
          )}

          {!loading && !error && (
            <>
              <p className="fade-in-text" style={styles.resultText}>
                {produitsFiltres.length} produit(s)
              </p>

              <div
                className={`grid-transition ${gridVisible ? "grid-shown" : "grid-hidden"}`}
                style={styles.grid}
              >
                {produitsFiltres.map((produit, idx) => (
                  <Link
                    key={produit.id}
                    to={`/produit/${produit.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      className="product-card"
                      style={{ ...styles.card, animationDelay: `${Math.min(idx, 10) * 0.06}s` }}
                    >
                      <div className="product-image-wrap">
                        <img
                          src={getImageUrl(produit.image)}
                          alt={produit.nom}
                          style={styles.image}
                          className="product-image"
                        />
                      </div>

                      <div style={styles.body}>
                        <div style={styles.header}>
                          <span style={styles.marque}>{produit.marque}</span>

                          <span
                            style={{
                              ...styles.stock,
                              background:
                                produit.stock > 0 ? "#dcfce7" : "#fee2e2",
                              color:
                                produit.stock > 0 ? "#15803d" : "#b91c1c",
                            }}
                          >
                            {produit.stock > 0 && <span className="stock-dot"></span>}
                            {produit.stock > 0
                              ? "En stock"
                              : "Rupture de stock"}
                          </span>
                        </div>

                        <h3 style={styles.title} className="product-title">{produit.nom}</h3>

                        <p style={styles.desc}>{produit.description}</p>

                        <p style={styles.ref}>Réf: {produit.reference}</p>

                        <div style={styles.footerRow}>
                          <p style={styles.prix} className="product-prix prix-anim">
                            {Number(produit.prix).toFixed(2)} DH
                          </p>
                          <span className="product-arrow">→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {produitsFiltres.length === 0 && (
                <p className="empty-state" style={styles.resultText}>Aucun produit trouvé.</p>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

const styles = {
  hero: {
    background: "linear-gradient(135deg, #8b0020 0%, #6f1528 100%)",
    color: "white",
    padding: "76px 0",
  },

  heroTitle: {
    fontSize: "2.4rem",
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.02em",
  },

  heroText: {
    marginTop: "16px",
    color: "rgba(255,255,255,0.85)",
    fontSize: "1.05rem",
    maxWidth: "560px",
    lineHeight: 1.6,
  },

  container: {
    maxWidth: "1200px",
    margin: "auto",
    padding: "0 20px",
  },

  carouselSection: {
    background: "#fafafa",
    padding: "34px 0 6px",
  },

  carouselWrap: {
    height: "380px",
  },

  carouselSlide: {
    display: "block",
    textDecoration: "none",
  },

  filterSection: {
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    padding: "18px 0",
    position: "sticky",
    top: 0,
    zIndex: 10,
    backdropFilter: "blur(6px)",
  },

  filterBar: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  search: {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    width: "260px",
    fontSize: "0.95rem",
  },

  categories: {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    paddingBottom: "2px",
  },

  categoryBtn: {
    border: "none",
    padding: "10px 18px",
    borderRadius: "999px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontSize: "0.9rem",
    fontWeight: 500,
  },

  productsSection: {
    padding: "44px 0 90px",
    background: "#fafafa",
  },

  resultText: {
    marginBottom: "22px",
    color: "#64748b",
    fontSize: "0.95rem",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "26px",
  },

  card: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 14px rgba(0,0,0,0.07)",
  },

  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
  },

  body: {
    padding: "18px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  marque: {
    color: "#8b0020",
    fontSize: "13px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  stock: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    display: "inline-flex",
    alignItems: "center",
    fontWeight: 500,
  },

  title: {
    marginBottom: "8px",
    color: "#0f172a",
    fontSize: "1.05rem",
  },

  desc: {
    color: "#64748b",
    marginBottom: "10px",
    fontSize: "0.9rem",
    lineHeight: 1.5,
  },

  ref: {
    color: "#94a3b8",
    fontSize: "13px",
    marginBottom: "8px",
  },

  footerRow: {
    display: "flex",
    alignItems: "center",
    borderTop: "1px solid #f1f1f1",
    paddingTop: "10px",
    marginTop: "4px",
  },

  prix: {
    color: "#8b0020",
    fontWeight: "bold",
    fontSize: "17px",
  },
};

export default Produits;