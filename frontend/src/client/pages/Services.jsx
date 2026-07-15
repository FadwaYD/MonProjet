import React, { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaShieldAlt,
  FaCalendarAlt,
  FaFlask,
  FaTools,
  FaTruck,
  FaCheckCircle,
} from "react-icons/fa";

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
/* Carrousel générique pour les cartes de service                      */
/* ------------------------------------------------------------------ */
const useCardsPerView = () => {
  const [count, setCount] = useState(1);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1000) setCount(2);
      else setCount(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return count;
};

const ServicesCarousel = ({ services }) => {
  const perView = useCardsPerView();
  const totalSlides = Math.ceil(services.length / perView);
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
    if (paused) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [paused, next]);

  const touchStartX = useRef(0);
  const handleTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) prev();
    else if (delta < -50) next();
  };

  const slides = [];
  for (let s = 0; s < totalSlides; s++) {
    slides.push(services.slice(s * perView, s * perView + perView));
  }

  return (
    <div
      style={styles.carouselWrapper}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        style={{ ...styles.carouselArrow, left: "-10px" }}
        className="carousel-arrow"
        onClick={prev}
        aria-label="Service précédent"
      >
        ‹
      </button>

      <div style={styles.carouselTrack}>
        <div
          style={{
            ...styles.carouselInner,
            transform: `translateX(-${index * 100}%)`,
          }}
        >
          {slides.map((group, s) => (
            <div style={styles.carouselSlide} key={s}>
              <div style={styles.grid}>
                {group.map((service, i) => (
                  <div key={i} style={styles.card} className="service-card">
                    <div style={styles.iconBox} className="icon-box">
                      {service.icon}
                    </div>

                    <h2 style={styles.cardTitle}>{service.title}</h2>

                    <p style={styles.description}>{service.description}</p>

                    <div>
                      {service.options.map((item, j) => (
                        <div key={j} style={styles.option}>
                          <FaCheckCircle size={12} color="#c30039" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <button style={styles.button} className="cta-button">
                      Demander un devis →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        style={{ ...styles.carouselArrow, right: "-10px" }}
        className="carousel-arrow"
        onClick={next}
        aria-label="Service suivant"
      >
        ›
      </button>

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
    </div>
  );
};

function Services() {
  const services = [
    {
      icon: <FaCalendarAlt size={30} color="#8b0020" />,
      title: "Location de matériel médical",
      description:
        "Location flexible de matériel médical pour courts et longs termes.",
      options: [
        "Contrats flexibles",
        "Maintenance incluse",
        "Remplacement rapide",
        "Assistance 24/7",
      ],
    },
    {
      icon: <FaFlask size={30} color="#8b0020" />,
      title: "Fourniture de produits de laboratoire",
      description: "Fourniture complète de réactifs, verrerie et consommables.",
      options: [
        "Catalogue exhaustif",
        "Stock permanent",
        "Livraison express",
        "Produits certifiés",
      ],
    },
    {
      icon: <FaTools size={30} color="#8b0020" />,
      title: "Maintenance et assistance technique",
      description: "Maintenance préventive et curative pour vos équipements.",
      options: [
        "Maintenance préventive",
        "Réparation sur site",
        "Contrats annuels",
        "Hotline technique",
      ],
    },
    {
      icon: <FaTruck size={30} color="#8b0020" />,
      title: "Livraison et installation",
      description: "Livraison complète, installation et mise en service.",
      options: [
        "Livraison nationale",
        "Installation sur site",
        "Mise en service",
        "Formation utilisateur",
      ],
    },
  ];

  return (
    <>
      <style>{globalCss}</style>
      <Navbar />

      {/* HERO */}
      <section style={styles.hero} className="hero-animated">
        <div style={styles.heroGlow} />
        <div style={styles.container}>
          <br /><br />
          <h1 style={styles.heroTitle} className="fade-in-title">
            Nos services
          </h1>

          <p style={styles.heroText} className="fade-in-text">
            Des solutions complètes pour équiper, maintenir et faire
            fonctionner vos laboratoires et structures médicales.
          </p>
        </div>
      </section>

      {/* SERVICE PRINCIPAL */}
      <section style={styles.mainSection}>
        <div style={styles.mainCard}>
          <Reveal style={styles.mainContent}>
            <div style={styles.iconBox} className="icon-box">
              <FaShieldAlt size={30} color="#8b0020" />
            </div>

            <h2>Vente de matériel médical</h2>

            <p>
              Vente de matériel médical neuf et reconditionné de qualité
              professionnelle.
            </p>

            <ul style={styles.list}>
              <li>✔ Matériel neuf garanti</li>
              <li>✔ Reconditionnement certifié</li>
              <li>✔ Livraison et installation</li>
              <li>✔ Formation à l'utilisation</li>
            </ul>

            <button style={styles.button} className="cta-button">
              Demander un devis →
            </button>
          </Reveal>

          <Reveal delay={150} style={{ overflow: "hidden" }}>
            <img
              src="https://images.unsplash.com/photo-1646956141021-d687dcfe5fb9?w=1200"
              alt="matériel de laboratoire médical"
              style={styles.mainImage}
              className="main-img"
            />
          </Reveal>
        </div>
      </section>

      {/* AUTRES SERVICES - carrousel */}
      <section style={styles.servicesSection}>
        <Reveal as="h2" style={styles.sectionTitle}>
          Découvrez tous nos services
        </Reveal>
        <Reveal delay={80} as="p" style={styles.sectionSubtitle}>
          Faites glisser ou utilisez les flèches pour tout voir.
        </Reveal>

        <Reveal delay={160}>
          <ServicesCarousel services={services} />
        </Reveal>
      </section>

      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* CSS global                                                           */
/* ------------------------------------------------------------------ */
const globalCss = `
  @keyframes floatGlow {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
    50% { transform: translate(-20px, 15px) scale(1.08); opacity: 0.75; }
  }
  @keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hero-animated { position: relative; overflow: hidden; }
  .fade-in-title { animation: fadeSlideDown 0.8s ease both; }
  .fade-in-text { animation: fadeSlideDown 0.8s ease 0.15s both; }

  .reveal {
    opacity: 0;
    transform: translateY(36px);
    transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .reveal-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .service-card {
    transition: transform 0.35s ease, box-shadow 0.35s ease;
  }
  .service-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 32px rgba(139,0,32,0.14);
  }
  .icon-box {
    transition: transform 0.35s ease, background 0.35s ease;
  }
  .service-card:hover .icon-box {
    transform: scale(1.12) rotate(-4deg);
    background: #f8d3da;
  }
  .cta-button {
    transition: background 0.3s ease, transform 0.25s ease, box-shadow 0.3s ease;
  }
  .cta-button:hover {
    background: #a30028;
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(139,0,32,0.3);
  }
  .main-img {
    transition: transform 0.6s ease;
  }
  .main-img:hover {
    transform: scale(1.04);
  }

  .carousel-arrow {
    transition: background 0.25s ease, transform 0.25s ease;
  }
  .carousel-arrow:hover {
    background: #8b0020;
    color: #fff;
    transform: translateY(-50%) scale(1.08);
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal, .fade-in-title, .fade-in-text,
    .service-card, .icon-box, .cta-button, .main-img, .carousel-arrow {
      animation: none !important;
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
`;

const styles = {
  hero: {
    background: "#6f1528",
    color: "white",
    textAlign: "center",
    padding: "70px 20px",
  },

  heroGlow: {
    position: "absolute",
    top: "-50px",
    left: "-50px",
    width: "240px",
    height: "240px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 70%)",
    animation: "floatGlow 8s ease-in-out infinite",
    pointerEvents: "none",
  },

  heroTitle: {
    fontSize: "55px",
    marginBottom: "15px",
    position: "relative",
  },

  heroText: {
    fontSize: "20px",
    maxWidth: "700px",
    margin: "auto",
    lineHeight: "1.8",
    position: "relative",
  },

  container: {
    maxWidth: "1200px",
    margin: "auto",
  },

  mainSection: {
    padding: "60px 20px",
  },

  mainCard: {
    maxWidth: "1200px",
    margin: "auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "#fff",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
  },

  mainContent: {
    padding: "40px",
  },

  mainImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  iconBox: {
    width: "60px",
    height: "60px",
    background: "#fdecef",
    borderRadius: "15px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "20px",
  },

  list: {
    marginTop: "20px",
    marginBottom: "25px",
    lineHeight: "2",
    listStyle: "none",
    padding: 0,
  },

  button: {
    background: "#8b0020",
    color: "white",
    border: "none",
    padding: "14px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  servicesSection: {
    padding: "20px 20px 90px",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: "36px",
    marginBottom: "10px",
    color: "#0f172a",
  },

  sectionSubtitle: {
    color: "#64748b",
    marginBottom: "10px",
  },

  /* Carrousel */
  carouselWrapper: {
    position: "relative",
    maxWidth: "1200px",
    margin: "40px auto 0",
    padding: "0 45px",
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

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: "25px",
  },

  card: {
    background: "white",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0 3px 15px rgba(0,0,0,0.08)",
    textAlign: "left",
  },

  cardTitle: {
    marginBottom: "15px",
    color: "#0f172a",
  },

  description: {
    color: "#64748b",
    lineHeight: "1.8",
    marginBottom: "20px",
  },

  option: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
    color: "#475569",
  },

  carouselArrow: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "white",
    border: "1px solid #eee",
    color: "#8b0020",
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    fontSize: "22px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    zIndex: 2,
  },

  dotsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginTop: "24px",
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

export default Services;