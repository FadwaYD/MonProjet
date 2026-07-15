import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaStar,
  FaHeart,
  FaFileInvoice,
  FaChevronLeft,
  FaChevronRight,
  FaSpinner,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_URL = "http://localhost:4000/api/produits";

/* ------------------------------------------------------------------ */
/* Hook : révèle un élément (fade + slide up) quand il entre à l'écran */
/* ------------------------------------------------------------------ */
const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
};

const Reveal = ({ children, delay = 0, style = {}, as: Tag = "div", ...rest }) => {
  const [ref, visible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

/* ------------------------------------------------------------------ */
/* Carrousel générique pour les produits similaires                    */
/* ------------------------------------------------------------------ */
const useCardsPerView = () => {
  const [count, setCount] = useState(1);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1100) setCount(3);
      else if (window.innerWidth >= 700) setCount(2);
      else setCount(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return count;
};

const SimilarCarousel = ({ items, getImageUrl }) => {
  const perView = useCardsPerView();
  const totalSlides = Math.ceil(items.length / perView);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (index > totalSlides - 1) setIndex(0);
  }, [totalSlides, index]);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % totalSlides),
    [totalSlides]
  );
  const prev = () => setIndex((i) => (i - 1 + totalSlides) % totalSlides);

  useEffect(() => {
    if (paused || totalSlides <= 1) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [paused, next, totalSlides]);

  const touchStartX = useRef(0);
  const handleTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) prev();
    else if (delta < -50) next();
  };

  const slides = [];
  for (let s = 0; s < totalSlides; s++) {
    slides.push(items.slice(s * perView, s * perView + perView));
  }

  return (
    <div
      style={styles.similarCarouselWrapper}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {totalSlides > 1 && (
        <button
          style={{ ...styles.carouselArrow, left: "-8px" }}
          className="carousel-arrow"
          onClick={prev}
          aria-label="Produits précédents"
        >
          <FaChevronLeft size={14} />
        </button>
      )}

      <div style={styles.carouselTrack}>
        <div
          style={{
            ...styles.carouselInner,
            transform: `translateX(-${index * 100}%)`,
          }}
        >
          {slides.map((group, s) => (
            <div style={styles.carouselSlide} key={s}>
              <div style={styles.similarGrid}>
                {group.map((item) => (
                  <Link
                    key={item.id}
                    to={`/produit/${item.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div style={styles.similarCard} className="similar-card">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.nom}
                        style={styles.similarImage}
                        className="similar-image"
                      />

                      <h4 style={styles.similarName}>{item.nom}</h4>

                      <p style={styles.similarBrand}>{item.marque}</p>

                      <span style={styles.priceSmall}>
                        {Number(item.prix).toFixed(2)} DH
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalSlides > 1 && (
        <button
          style={{ ...styles.carouselArrow, right: "-8px" }}
          className="carousel-arrow"
          onClick={next}
          aria-label="Produits suivants"
        >
          <FaChevronRight size={14} />
        </button>
      )}

      {totalSlides > 1 && (
        <div style={styles.dotsRow}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Aller au groupe ${i + 1}`}
              style={{
                ...styles.dot,
                background: i === index ? "#8b0020" : "#d9d9d9",
                transform: i === index ? "scale(1.25)" : "scale(1)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function DetailProduit() {
  const { id } = useParams();

  const [produit, setProduit] = useState(null);
  const [similaires, setSimilaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantite, setQuantite] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [favori, setFavori] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const { ajouterAuPanier, messagePanier } = useCart();

  useEffect(() => {
    setLoading(true);
    setError(null);
    setQuantite(1);
    setActiveImage(0);
    setFavori(false);

    fetch(`${API_URL}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Produit introuvable");
        return res.json();
      })
      .then((result) => {
        const data = result.data || result;

        if (!data || !data.id) {
          throw new Error("Produit introuvable");
        }

        setProduit(data);
        setLoading(false);

        fetch(API_URL)
          .then((res) => res.json())
          .then((listResult) => {
            const liste = listResult.data || [];
            const autres = liste.filter(
              (p) => String(p.id) !== String(data.id)
            );
            setSimilaires(autres);
          })
          .catch(() => setSimilaires([]));
      })
      .catch((err) => {
        console.error(err);
        setError("Produit introuvable ou erreur serveur");
        setLoading(false);
      });
  }, [id]);

  const getImageUrl = (image) => {
    if (!image) return "https://via.placeholder.com/600x400?text=Produit";
    return image;
  };

  const handleAddToCart = () => {
    ajouterAuPanier(produit, quantite);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  if (loading) {
    return (
      <>
        <style>{globalCss}</style>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.loadingBox}>
            <FaSpinner className="spin-icon" size={22} color="#8b0020" />
            <p style={{ margin: 0, color: "#64748b" }}>Chargement du produit...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !produit) {
    return (
      <>
        <style>{globalCss}</style>
        <Navbar />
        <div style={styles.container}>
          <Link to="/produits" style={styles.back} className="back-link">
            <FaArrowLeft />
            Retour aux produits
          </Link>
          <p style={{ color: "#dc2626" }}>{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  const gallery = [produit.image, produit.image, produit.image];

  return (
    <>
      <style>{globalCss}</style>
      <Navbar />

      <div style={styles.container}>
        <Link to="/produits" style={styles.back} className="back-link">
          <FaArrowLeft />
          Retour aux produits
        </Link>

        <Reveal style={styles.productCard}>
          {/* Galerie - carrousel */}
          <div style={styles.left}>
            <div style={styles.imageBox}>
              <img
                key={activeImage}
                src={getImageUrl(gallery[activeImage])}
                alt={produit.nom}
                style={styles.mainImage}
                className="main-image-fade"
              />

              <button
                style={styles.favorite}
                className={`favorite-btn ${favori ? "favorite-active" : ""}`}
                onClick={() => setFavori(!favori)}
                aria-label="Ajouter aux favoris"
              >
                <FaHeart color={favori ? "#8b0020" : "#cbd5e1"} />
              </button>
            </div>

            <div style={styles.thumbnailContainer}>
              {gallery.map((img, i) => (
                <img
                  key={i}
                  src={getImageUrl(img)}
                  alt=""
                  onClick={() => setActiveImage(i)}
                  style={{
                    ...styles.thumbnail,
                    borderColor: activeImage === i ? "#8b0020" : "#ddd",
                    borderWidth: activeImage === i ? "2px" : "1px",
                  }}
                  className="thumbnail-img"
                />
              ))}
            </div>
          </div>

          {/* Infos */}
          <div style={styles.right}>
            <div style={styles.badgeRow}>
              <span style={styles.brand}>{produit.marque}</span>

              <span
                style={{
                  ...styles.stock,
                  background: produit.stock > 0 ? "#dcfce7" : "#fee2e2",
                  color: produit.stock > 0 ? "#15803d" : "#b91c1c",
                }}
              >
                {produit.stock > 0 ? "En stock" : "Rupture de stock"}
              </span>
            </div>

            <h1 style={styles.h1}>{produit.nom}</h1>

            <p style={styles.ref}>Référence : {produit.reference}</p>

            <p style={styles.description}>{produit.description}</p>

            <div style={styles.rating}>
              <FaStar color="#f59e0b" />
              <FaStar color="#f59e0b" />
              <FaStar color="#f59e0b" />
              <FaStar color="#f59e0b" />
              <FaStar color="#f59e0b" />
              <span style={styles.ratingText}>(12 avis)</span>
            </div>

            <h2 style={styles.price}>
              {Number(produit.prix).toFixed(2)} DH
            </h2>

            <div style={styles.infoGrid}>
              <div style={styles.infoBox} className="info-box">
                <small style={styles.infoLabel}>Stock disponible</small>
                <h4 style={styles.infoValue}>{produit.stock} unités</h4>
              </div>

              <div style={styles.infoBox} className="info-box">
                <small style={styles.infoLabel}>Marque</small>
                <h4 style={styles.infoValue}>{produit.marque}</h4>
              </div>

              <div style={styles.infoBox} className="info-box">
                <small style={styles.infoLabel}>Référence</small>
                <h4 style={styles.infoValue}>{produit.reference}</h4>
              </div>

              <div style={styles.infoBox} className="info-box">
                <small style={styles.infoLabel}>Catégorie</small>
                <h4 style={styles.infoValue}>{produit.statut}</h4>
              </div>
            </div>

            <div style={styles.alert}>
              Connectez-vous pour consulter les prix et effectuer une demande
              de devis.
            </div>

            {messagePanier && (
              <div style={{ ...styles.messageErreur, ...styles.msgAnim }}>
                {messagePanier}
              </div>
            )}

            <div style={styles.actions}>
              <div style={styles.qty}>
                <button
                  style={styles.qtyBtn}
                  className="qty-btn"
                  onClick={() => quantite > 1 && setQuantite(quantite - 1)}
                >
                  -
                </button>

                <span style={styles.qtyValue}>{quantite}</span>

                <button
                  style={styles.qtyBtn}
                  className="qty-btn"
                  onClick={() =>
                    quantite < produit.stock && setQuantite(quantite + 1)
                  }
                  disabled={quantite >= produit.stock}
                >
                  +
                </button>
              </div>

              <button
                style={{
                  ...styles.cartBtn,
                  opacity: produit.stock <= 0 ? 0.5 : 1,
                  cursor: produit.stock <= 0 ? "not-allowed" : "pointer",
                }}
                className={`cart-btn ${justAdded ? "cart-btn-added" : ""}`}
                onClick={handleAddToCart}
                disabled={produit.stock <= 0}
              >
                <FaShoppingCart />
                {justAdded ? "Ajouté !" : "Ajouter au panier"}
              </button>
            </div>

            <button style={styles.devisBtn} className="devis-btn">
              <FaFileInvoice />
              Demander un devis
            </button>
          </div>
        </Reveal>

        {/* Description */}
        <Reveal delay={100} style={styles.tabs}>
          <h2 style={styles.tabsTitle}>Description</h2>
          <p style={styles.tabsText}>{produit.description}</p>
        </Reveal>

        {/* Produits similaires - carrousel */}
        {similaires.length > 0 && (
          <section style={styles.similarSection}>
            <Reveal as="h2" style={styles.similarTitle}>
              Produits similaires
            </Reveal>

            <Reveal delay={100}>
              <SimilarCarousel items={similaires} getImageUrl={getImageUrl} />
            </Reveal>
          </section>
        )}
      </div>

      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* CSS global                                                           */
/* ------------------------------------------------------------------ */
const globalCss = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes slideInMsg {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes heartPop {
    0% { transform: scale(1); }
    40% { transform: scale(1.35); }
    100% { transform: scale(1); }
  }
  @keyframes addedPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.04); }
    100% { transform: scale(1); }
  }

  .reveal {
    opacity: 0;
    transform: translateY(32px);
    transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .reveal-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .spin-icon {
    animation: spin 0.9s linear infinite;
  }

  .back-link {
    transition: gap 0.25s ease, color 0.25s ease;
  }
  .back-link:hover {
    color: #a30028;
    gap: 12px;
  }

  .main-image-fade {
    animation: fadeIn 0.35s ease both;
    transition: transform 0.5s ease;
  }
  .main-image-fade:hover {
    transform: scale(1.02);
  }

  .thumbnail-img {
    transition: transform 0.25s ease, border-color 0.25s ease;
  }
  .thumbnail-img:hover {
    transform: translateY(-3px);
  }

  .favorite-btn {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .favorite-btn:hover {
    transform: scale(1.08);
  }
  .favorite-active svg {
    animation: heartPop 0.4s ease;
  }

  .info-box {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .info-box:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.06);
  }

  .qty-btn {
    transition: background 0.2s ease;
  }
  .qty-btn:hover:not(:disabled) {
    background: #eef2f7;
  }

  .cart-btn {
    transition: background 0.3s ease, transform 0.25s ease, box-shadow 0.3s ease;
  }
  .cart-btn:hover:not(:disabled) {
    background: #a30028;
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(139,0,32,0.3);
  }
  .cart-btn-added {
    animation: addedPulse 0.4s ease;
    background: #15803d !important;
  }

  .devis-btn {
    transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease;
  }
  .devis-btn:hover {
    background: #8b0020;
    color: #fff;
    transform: translateY(-2px);
  }

  .similar-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .similar-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  }
  .similar-image {
    transition: transform 0.4s ease;
  }
  .similar-card:hover .similar-image {
    transform: scale(1.05);
  }

  .carousel-arrow {
    transition: background 0.25s ease, transform 0.25s ease, color 0.25s ease;
  }
  .carousel-arrow:hover {
    background: #8b0020;
    color: #fff;
    transform: translateY(-50%) scale(1.08);
  }

  .msg-anim {
    animation: slideInMsg 0.4s ease both;
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal, .spin-icon, .back-link, .main-image-fade, .thumbnail-img,
    .favorite-btn, .favorite-active svg, .info-box, .qty-btn, .cart-btn,
    .cart-btn-added, .devis-btn, .similar-card, .similar-image, .carousel-arrow {
      animation: none !important;
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
`;

const styles = {
  container: {
    maxWidth: "1300px",
    margin: "auto",
    padding: "30px 20px",
  },

  loadingBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "60px 0",
  },

  back: {
    textDecoration: "none",
    color: "#8b0020",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
    fontWeight: 500,
  },

  productCard: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
    background: "#fff",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 3px 15px rgba(0,0,0,0.08)",
    alignItems: "start",
  },

  left: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  imageBox: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    borderRadius: "15px",
  },

  mainImage: {
    width: "100%",
    height: "380px",
    objectFit: "cover",
    borderRadius: "15px",
    display: "block",
  },

  favorite: {
    position: "absolute",
    top: "15px",
    right: "15px",
    border: "none",
    background: "#fff",
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },

  thumbnailContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
  },

  thumbnail: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "10px",
    border: "1px solid #ddd",
    cursor: "pointer",
  },

  right: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  brand: {
    background: "#fdecef",
    color: "#8b0020",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
  },

  stock: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
  },

  h1: {
    margin: 0,
    fontSize: "26px",
    color: "#0f172a",
    lineHeight: 1.3,
  },

  ref: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
  },

  description: {
    margin: 0,
    color: "#334155",
    lineHeight: 1.6,
  },

  rating: {
    display: "flex",
    gap: "5px",
    alignItems: "center",
  },

  ratingText: {
    marginLeft: "8px",
    color: "#64748b",
    fontSize: "14px",
  },

  price: {
    margin: 0,
    color: "#8b0020",
    fontSize: "32px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  infoBox: {
    background: "#f8fafc",
    padding: "14px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  infoLabel: {
    color: "#94a3b8",
    fontSize: "12px",
  },

  infoValue: {
    margin: 0,
    color: "#0f172a",
    fontSize: "15px",
  },

  alert: {
    background: "#fff1f2",
    color: "#8b0020",
    padding: "15px",
    borderRadius: "10px",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  messageErreur: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "12px 15px",
    borderRadius: "10px",
    fontSize: "14px",
  },

  msgAnim: {
    animation: "slideInMsg 0.4s ease both",
  },

  actions: {
    display: "flex",
    gap: "15px",
  },

  qty: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden",
  },

  qtyBtn: {
    border: "none",
    background: "#f8fafc",
    width: "40px",
    height: "44px",
    fontSize: "18px",
    cursor: "pointer",
  },

  qtyValue: {
    width: "40px",
    textAlign: "center",
    fontWeight: 600,
  },

  cartBtn: {
    flex: 1,
    background: "#8b0020",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "0 14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: 600,
  },

  devisBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "2px solid #8b0020",
    background: "#fff",
    color: "#8b0020",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: 600,
  },

  tabs: {
    marginTop: "30px",
    background: "#fff",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },

  tabsTitle: {
    margin: "0 0 12px 0",
    color: "#0f172a",
  },

  tabsText: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
  },

  similarSection: {
    marginTop: "40px",
  },

  similarTitle: {
    margin: "0 0 20px 0",
    color: "#0f172a",
  },

  similarCarouselWrapper: {
    position: "relative",
    padding: "0 40px",
  },

  carouselTrack: {
    overflow: "hidden",
    borderRadius: "10px",
  },

  carouselInner: {
    display: "flex",
    transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
  },

  carouselSlide: {
    flex: "0 0 100%",
    padding: "4px",
  },

  similarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "20px",
  },

  similarCard: {
    background: "#fff",
    padding: "15px",
    borderRadius: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  similarImage: {
    width: "100%",
    height: "180px",
    objectFit: "contain",
    borderRadius: "10px",
    marginBottom: "6px",
    background: "#f8fafc",
    padding: "8px",
    boxSizing: "border-box",
  },

  similarName: {
    margin: 0,
    color: "#0f172a",
    fontSize: "15px",
  },

  similarBrand: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
  },

  priceSmall: {
    color: "#8b0020",
    fontWeight: "bold",
    marginTop: "4px",
  },

  carouselArrow: {
    position: "absolute",
    top: "35%",
    transform: "translateY(-50%)",
    background: "white",
    border: "1px solid #eee",
    color: "#8b0020",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  dotsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "20px",
  },

  dot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.25s ease, background 0.25s ease",
  },
};

export default DetailProduit;