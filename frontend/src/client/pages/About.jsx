import React, { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

/* ------------------------------------------------------------------ */
/* Petit composant wrapper pour appliquer la révélation + un délai     */
/* ------------------------------------------------------------------ */
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
/* Compteur animé (0 -> valeur cible) quand visible                    */
/* ------------------------------------------------------------------ */
const Counter = ({ target, suffix = "", duration = 1400 }) => {
  const [ref, visible] = useReveal(0.6);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let start = null;
    let frame;

    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setValue(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
      else setValue(target);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [visible, target, duration]);

  return (
    <span ref={ref} style={styles.counterNumber}>
      {value}
      {suffix}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Carrousel équipe                                                    */
/* ------------------------------------------------------------------ */
const teamMembers = [
  { initials: "AF", name: "Dr. Amadou Faye", role: "Directeur Général" },
  { initials: "AD", name: "Mme Aïcha Diallo", role: "Directrice Commerciale" },
  { initials: "IN", name: "M. Ibrahim Ndiaye", role: "Responsable Logistique" },
  { initials: "FS", name: "Dr. Fatou Sow", role: "Responsable Qualité" },
];

const TeamCarousel = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = teamMembers.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 3800);
    return () => clearInterval(id);
  }, [paused, next]);

  const touchStartX = useRef(0);
  const handleTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) prev();
    else if (delta < -50) next();
  };

  return (
    <div
      style={styles.carouselWrapper}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        style={{ ...styles.carouselArrow, left: 0 }}
        className="carousel-arrow"
        onClick={prev}
        aria-label="Membre précédent"
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
          {teamMembers.map((m, i) => (
            <div style={styles.carouselSlide} key={i}>
              <div style={styles.memberCard} className="member-card">
                <div style={styles.avatar}>{m.initials}</div>
                <h4 style={{ margin: "0 0 6px" }}>{m.name}</h4>
                <p style={{ margin: 0, color: "#777" }}>{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        style={{ ...styles.carouselArrow, right: 0 }}
        className="carousel-arrow"
        onClick={next}
        aria-label="Membre suivant"
      >
        ›
      </button>

      <div style={styles.dotsRow}>
        {teamMembers.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Aller au membre ${i + 1}`}
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

/* ------------------------------------------------------------------ */
/* Page principale                                                     */
/* ------------------------------------------------------------------ */
const About = () => {
  return (
    <>
      <style>{globalCss}</style>
      <Navbar />

      {/* Hero */}
      <section style={styles.hero} className="hero-animated">
        <div style={styles.heroGlow} />
        <div style={styles.badge} className="fade-in-badge">
          🧪 À propos de nous
        </div>
        <h1 style={styles.heroTitle} className="fade-in-title">
          Grand Laboratoire
        </h1>
        <p style={styles.heroText} className="fade-in-text">
          Votre partenaire biomédical de référence en Afrique de l'Ouest
          depuis plus de 15 ans.
        </p>
      </section>

      {/* Bandeau statistiques */}
      <section style={styles.statsBar}>
        <Reveal style={styles.statItem}>
          <Counter target={15} suffix="+" />
          <p style={styles.counterLabel}>Années d'expérience</p>
        </Reveal>
        <Reveal delay={120} style={styles.statItem}>
          <Counter target={450} suffix="+" />
          <p style={styles.counterLabel}>Clients servis</p>
        </Reveal>
        <Reveal delay={240} style={styles.statItem}>
          <Counter target={2000} suffix="+" />
          <p style={styles.counterLabel}>Produits au catalogue</p>
        </Reveal>
      </section>

      {/* Histoire */}
      <section style={styles.historySection}>
        <Reveal style={styles.historyText}>
          <h2 style={styles.sectionTitle}>Notre histoire</h2>

          <p>
            Fondée en 2009, Grand Laboratoire est née de la vision de
            professionnels de la santé et de la recherche qui constataient le
            manque d'accès à des produits biomédicaux de qualité.
          </p>

          <p>
            Au fil des années, nous avons construit un réseau de partenaires
            internationaux et développé une expertise logistique reconnue.
          </p>

          <p>
            Aujourd'hui, nous servons plus de 450 clients avec un catalogue de
            plus de 2000 produits.
          </p>
        </Reveal>

        <Reveal delay={150} style={styles.imageContainer}>
          <img
            src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1000"
            alt="laboratoire"
            style={styles.image}
            className="history-img"
          />

          <div style={styles.experienceBox} className="experience-box">
            <h2 style={{ margin: 0 }}>15+</h2>
            <p style={{ margin: 0 }}>Années d'expérience</p>
          </div>
        </Reveal>
      </section>

      {/* Mission Vision Valeurs */}
      <section style={styles.cardsContainer}>
        {[
          { icon: "🎯", title: "Notre mission", text: "Fournir aux professionnels de la santé et de la recherche les meilleurs produits biomédicaux avec un service irréprochable." },
          { icon: "🏅", title: "Notre vision", text: "Devenir le leader incontesté de la distribution biomédicale en Afrique de l'Ouest." },
          { icon: "👥", title: "Nos valeurs", text: "Qualité, intégrité, réactivité et innovation guident chacune de nos actions." },
        ].map((c, i) => (
          <Reveal key={i} delay={i * 130} style={styles.card} className="card">
            <div style={styles.icon} className="card-icon">{c.icon}</div>
            <h3>{c.title}</h3>
            <p>{c.text}</p>
          </Reveal>
        ))}
      </section>

      {/* Engagements */}
      <section style={styles.engagementSection}>
        <Reveal as="h2" style={styles.sectionTitle}>
          Nos engagements
        </Reveal>
        <Reveal delay={80} as="p" style={styles.subtitle}>
          Des valeurs fortes qui définissent notre identité.
        </Reveal>

        <div style={styles.engagementGrid}>
          {[
            { icon: "🛡️", title: "Qualité", text: "Produits certifiés et conformes aux normes." },
            { icon: "❤️", title: "Intégrité", text: "Transparence totale dans nos relations." },
            { icon: "⚡", title: "Réactivité", text: "Livraison rapide et assistance continue." },
            { icon: "🌐", title: "Innovation", text: "Veille technologique permanente." },
          ].map((e, i) => (
            <Reveal key={i} delay={i * 100} style={styles.engagementCard} className="engagement-card">
              <div style={styles.icon} className="card-icon">{e.icon}</div>
              <h3>{e.title}</h3>
              <p>{e.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Equipe - carrousel */}
      <section style={styles.teamSection}>
        <Reveal as="h2" style={styles.sectionTitle}>
          Notre équipe
        </Reveal>
        <Reveal delay={80} as="p" style={styles.subtitle}>
          Des professionnels passionnés à votre service.
        </Reveal>

        <Reveal delay={160}>
          <TeamCarousel />
        </Reveal>
      </section>

      {/* Certifications */}
      {/* <section style={styles.certificationSection}>
        <Reveal as="h2" style={{ marginBottom: "40px" }}>
          Certifications &amp; Qualité
        </Reveal>

        <div style={styles.certificationGrid}>
          {["ISO 9001:2015", "ISO 13485", "Certification CE", "BPF"].map((c, i) => (
            <Reveal key={i} delay={i * 100} style={styles.certCard} className="cert-card">
              {c}
            </Reveal>
          ))}
        </div>
      </section> */}

      <Footer />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* CSS global : keyframes, hover, carrousel, responsive, reduced-motion*/
/* ------------------------------------------------------------------ */
const globalCss = `
  @keyframes floatGlow {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.55; }
    50% { transform: translate(20px, -15px) scale(1.08); opacity: 0.8; }
  }
  @keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .hero-animated { position: relative; overflow: hidden; }
  .fade-in-badge { animation: fadeSlideDown 0.7s ease both; }
  .fade-in-title { animation: fadeSlideDown 0.8s ease 0.15s both; }
  .fade-in-text { animation: fadeSlideDown 0.8s ease 0.3s both; }

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

  .card, .engagement-card, .member-card, .cert-card {
    transition: transform 0.35s ease, box-shadow 0.35s ease, background 0.35s ease;
  }
  .card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(139,0,32,0.15);
  }
  .engagement-card:hover {
    transform: translateY(-6px);
  }
  .card-icon {
    transition: transform 0.35s ease;
    display: inline-block;
  }
  .card:hover .card-icon, .engagement-card:hover .card-icon {
    transform: scale(1.18) rotate(-4deg);
  }
  .member-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 28px rgba(0,0,0,0.12);
  }
  .cert-card:hover {
    transform: translateY(-5px);
    background: rgba(255,255,255,0.08);
  }
  .history-img {
    transition: transform 0.6s ease;
  }
  .history-img:hover {
    transform: scale(1.03);
  }
  .experience-box {
    transition: transform 0.35s ease;
  }
  .experience-box:hover {
    transform: translateY(-4px);
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
    .reveal, .fade-in-badge, .fade-in-title, .fade-in-text,
    .card, .engagement-card, .member-card, .cert-card,
    .history-img, .experience-box, .carousel-arrow {
      animation: none !important;
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
    }
  }
`;

const styles = {
  hero: {
    background: "#751529",
    color: "white",
    textAlign: "center",
    padding: "90px 20px",
  },

  heroGlow: {
    position: "absolute",
    top: "-60px",
    right: "-60px",
    width: "260px",
    height: "260px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)",
    animation: "floatGlow 7s ease-in-out infinite",
    pointerEvents: "none",
  },

  badge: {
    display: "inline-block",
    background: "#8e3346",
    padding: "10px 20px",
    borderRadius: "20px",
    marginBottom: "20px",
    position: "relative",
  },

  heroTitle: {
    fontSize: "60px",
    marginBottom: "20px",
    position: "relative",
  },

  heroText: {
    fontSize: "22px",
    maxWidth: "700px",
    margin: "auto",
    position: "relative",
  },

  statsBar: {
    display: "flex",
    justifyContent: "center",
    gap: "70px",
    flexWrap: "wrap",
    padding: "50px 20px",
    background: "#fff",
  },

  statItem: {
    textAlign: "center",
  },

  counterNumber: {
    fontSize: "42px",
    fontWeight: "800",
    color: "#8b0020",
  },

  counterLabel: {
    margin: "6px 0 0",
    color: "#666",
    fontSize: "15px",
  },

  historySection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "50px",
    padding: "80px",
    flexWrap: "wrap",
  },

  historyText: {
    flex: 1,
    minWidth: "300px",
    lineHeight: "1.8",
  },

  imageContainer: {
    flex: 1,
    position: "relative",
    minWidth: "300px",
  },

  image: {
    width: "100%",
    borderRadius: "20px",
    display: "block",
  },

  experienceBox: {
    position: "absolute",
    bottom: "0",
    left: "0",
    background: "#8b0020",
    color: "white",
    padding: "20px",
    borderRadius: "0 15px 0 15px",
  },

  sectionTitle: {
    fontSize: "40px",
    marginBottom: "20px",
    textAlign: "center",
  },

  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    gap: "30px",
    padding: "70px",
    background: "#f8f8f8",
  },

  card: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
  },

  icon: {
    fontSize: "35px",
    marginBottom: "15px",
  },

  engagementSection: {
    padding: "80px",
    textAlign: "center",
  },

  subtitle: {
    color: "#666",
    marginBottom: "40px",
  },

  engagementGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "25px",
  },

  engagementCard: {
    padding: "25px",
    borderRadius: "12px",
  },

  teamSection: {
    padding: "80px",
    background: "#fafafa",
    textAlign: "center",
  },

  /* Carrousel */
  carouselWrapper: {
    position: "relative",
    maxWidth: "420px",
    margin: "40px auto 0",
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

  memberCard: {
    background: "white",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "#8b0020",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 15px",
    fontWeight: "bold",
  },

  carouselArrow: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "white",
    border: "1px solid #eee",
    color: "#8b0020",
    width: "40px",
    height: "40px",
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
    marginTop: "18px",
  },

  dot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    transition: "transform 0.25s ease, background 0.25s ease",
  },

  certificationSection: {
    background: "#6b1124",
    color: "white",
    textAlign: "center",
    padding: "80px",
  },

  certificationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: "20px",
  },

  certCard: {
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "20px",
    borderRadius: "10px",
  },
};

export default About;