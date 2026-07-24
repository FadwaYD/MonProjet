import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaFlask,
  FaVial,
  FaTools,
  FaTruck,
  FaUsers,
  FaBox,
  FaAward,
} from "react-icons/fa";

const API_BASE_URL = "http://localhost:4000";

// Construit l'URL complète de l'image, que l'API renvoie
// déjà une URL complète ou juste un nom de fichier.
function getImageUrl(image) {
  if (!image) return "/placeholder.png";
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return `${API_BASE_URL}/uploads/${image}`;
}

// Sélectionne des produits en essayant de couvrir un maximum
// de statuts différents (Réactif / Consommable / Matériel),
// façon "un peu de chaque tiroir" avant de compléter.
function getFeaturedProduits(produits, count = 4) {
  if (!Array.isArray(produits) || produits.length === 0) return [];

  const parStatut = {};
  produits.forEach((p) => {
    const key = p.statut || "Autre";
    if (!parStatut[key]) parStatut[key] = [];
    parStatut[key].push(p);
  });

  const statuts = Object.keys(parStatut);
  const featured = [];
  let index = 0;
  let securite = 0;
  const maxIterations = produits.length * Math.max(statuts.length, 1) + 10;

  while (featured.length < count && featured.length < produits.length) {
    const statut = statuts[index % statuts.length];
    const liste = parStatut[statut];
    if (liste && liste.length > 0) {
      featured.push(liste.shift());
    }
    index++;
    securite++;
    if (securite > maxIterations) break; // anti-boucle infinie
  }

  return featured;
}

/* ==========================
   REVEAL — apparition au scroll
========================== */
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity .7s cubic-bezier(.22,.61,.36,1) ${delay}ms, transform .7s cubic-bezier(.22,.61,.36,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ==========================
   COMPTEUR — chiffres animés
========================== */
function Counter({ value, suffix = "" }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !done.current) {
          done.current = true;
          const duration = 1400;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(value * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <h2 ref={ref} style={styles.statNumber}>
      {display.toLocaleString("fr-FR")}
      {suffix}
    </h2>
  );
}

/* ==========================
   LIGNE DE TITRATION — motif signature
========================== */
function TitrationDivider() {
  return (
    <div style={styles.dividerWrap} aria-hidden="true">
      <svg width="100%" height="46" viewBox="0 0 1200 46" preserveAspectRatio="none" style={{ display: "block" }}>
        <line x1="0" y1="23" x2="1200" y2="23" stroke="url(#lineGrad)" strokeWidth="1.5" />
        <defs>
          <linearGradient id="lineGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#8b0000" stopOpacity="0" />
            <stop offset="50%" stopColor="#c8a24d" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8b0000" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="0" cy="23" r="5" fill="#c8a24d" className="dropTravel" />
      </svg>
    </div>
  );
}

/* ==========================
   HERO CAROUSEL — photos qui défilent
   automatiquement, façon rack d'éprouvettes
   qui se remplissent (curseur de progression),
   avec effet Ken Burns et légende par slide
========================== */
const HERO_SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1631556763178-b96af5e9993e?auto=format&fit=crop&w=1920&q=80",
    alt: "Rack de tubes à essai remplis de réactifs colorés en laboratoire",
    eyebrow: "Réactifs & analyses",
    title: "Des réactifs préparés",
    pan: "center 30%",
  },
  {
    src: "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?auto=format&fit=crop&w=1920&q=80",
    alt: "Technicien tenant des ballons de verrerie de laboratoire",
    eyebrow: "Verrerie professionnelle",
    title: "Une verrerie choisie",
    pan: "center 40%",
  },
  {
    src: "https://images.unsplash.com/photo-1628863353691-0071c8c1874c?auto=format&fit=crop&w=1920&q=80",
    alt: "Ballon d'Erlenmeyer en verre transparent sur paillasse de laboratoire",
    eyebrow: "Instruments de mesure",
    title: "Du matériel calibré",
    pan: "center center",
  },
  {
    src: "https://images.unsplash.com/photo-1748263582756-082fe4adaa5b?auto=format&fit=crop&w=1920&q=80",
    alt: "Tubes Eppendorf rangés dans un portoir de laboratoire biomédical",
    eyebrow: "Stocks & disponibilité",
    title: "Un stock large",
    pan: "center 35%",
  },
];

const SLIDE_DURATION = 5500; // ms

function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef(null);

  const goTo = (index) => {
    setActive(index);
    setProgressKey((k) => k + 1); // relance l'animation de la barre de progression
  };

  useEffect(() => {
    if (paused) return undefined;
    timeoutRef.current = setTimeout(() => {
      setActive((prev) => (prev + 1) % HERO_SLIDES.length);
      setProgressKey((k) => k + 1);
    }, SLIDE_DURATION);
    return () => clearTimeout(timeoutRef.current);
  }, [active, paused]);

  const current = HERO_SLIDES[active];

  return (
    <div
      style={styles.heroCarousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {HERO_SLIDES.map((slide, i) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          style={{
            ...styles.heroCarouselImg,
            objectPosition: slide.pan,
            opacity: i === active ? 1 : 0,
            transform: i === active ? "scale(1.08)" : "scale(1.14)",
            transitionDuration: i === active ? `${SLIDE_DURATION + 900}ms` : "1.1s",
          }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.style.display = "none";
          }}
        />
      ))}

      {/* voile bordeaux pour garder le texte lisible par-dessus les photos */}
      <div style={styles.heroCarouselVeil} />

      {/* légende de la photo en cours, façon étiquette d'échantillon */}
      <div key={`caption-${active}`} className="heroCaption" style={styles.heroCaption} aria-hidden="true">
        <span style={styles.heroCaptionEyebrow}>{current.eyebrow}</span>
        <span style={styles.heroCaptionTitle}>{current.title}</span>
      </div>

      {/* curseur de progression : rack d'éprouvettes qui se remplissent, façon labo */}
      <div style={styles.heroTubeRack} aria-hidden="true">
        <span style={styles.heroTubeRackLabel}>
          Éch. 0{active + 1} <span style={{ opacity: 0.5 }}>/ 0{HERO_SLIDES.length}</span>
        </span>

        <div style={styles.heroTubeRow}>
          {HERO_SLIDES.map((_, i) => {
            const state = i < active ? "done" : i === active ? "active" : "idle";
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Voir la photo ${i + 1}`}
                className="heroTubeBtn"
                style={styles.heroTubeBtnWrap}
              >
                <svg width="16" height="44" viewBox="0 0 16 44" style={{ display: "block", overflow: "visible" }}>
                  <defs>
                    <clipPath id={`tubeClip-${i}`}>
                      <path d="M3 3 H13 V29 A5 5 0 0 1 3 29 Z" />
                    </clipPath>
                    <linearGradient id={`liquidGrad-${i}`} x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#f6a7bb" />
                      <stop offset="100%" stopColor={GOLD} />
                    </linearGradient>
                  </defs>

                  {/* graduations façon éprouvette graduée */}
                  <line x1="0.5" y1="10" x2="3" y2="10" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
                  <line x1="0.5" y1="17" x2="3" y2="17" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
                  <line x1="0.5" y1="24" x2="3" y2="24" stroke="rgba(255,255,255,.35)" strokeWidth="1" />

                  {/* liquide restant (tube déjà "consommé") */}
                  {state === "done" && (
                    <rect x="3" y="11" width="10" height="18" fill={GOLD} opacity="0.85" clipPath={`url(#tubeClip-${i})`} />
                  )}

                  {/* liquide qui monte pendant la lecture du slide actif */}
                  {state === "active" && (
                    <rect
                      key={progressKey}
                      x="3"
                      y="3"
                      width="10"
                      height="26"
                      fill={`url(#liquidGrad-${i})`}
                      clipPath={`url(#tubeClip-${i})`}
                      className="heroTubeLiquid"
                      style={{ animationPlayState: paused ? "paused" : "running" }}
                    />
                  )}

                  {/* verre de l'éprouvette, par-dessus le liquide */}
                  <path
                    d="M3 3 H13 V29 A5 5 0 0 1 3 29 Z"
                    fill="none"
                    stroke={state === "idle" ? "rgba(255,255,255,.4)" : GOLD}
                    strokeWidth="1.2"
                  />

                  {/* bulles d'effervescence, uniquement sur l'éprouvette active */}
                  {state === "active" && (
                    <>
                      <circle cx="6.5" cy="23" r="1" fill="#fff" className="heroTubeBubble1" />
                      <circle cx="9.5" cy="25" r="0.7" fill="#fff" className="heroTubeBubble2" />
                    </>
                  )}

                  {/* bouchon */}
                  <rect
                    x="2.5"
                    y="0"
                    width="11"
                    height="3"
                    rx="1.2"
                    fill={state === "idle" ? "rgba(255,255,255,.35)" : GOLD}
                  />
                </svg>
              </button>
            );
          })}

          {/* témoin lecture / pause, cohérent avec le thème labo */}
          <span
            style={styles.heroPauseDot}
            title={paused ? "Lecture en pause" : "Lecture automatique"}
          >
            <span
              style={{
                ...styles.heroPauseDotCore,
                background: paused ? "rgba(255,255,255,.5)" : GOLD,
              }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ==========================
   GALERIE — grille photo avec zoom au survol
========================== */
const GALLERY_PHOTOS = [
  {
    src: "https://images.unsplash.com/photo-1628863353691-0071c8c1874c?auto=format&fit=crop&w=900&q=80",
    alt: "Ballon d'Erlenmeyer en verrerie de laboratoire",
    span: "tall",
  },
  {
    src: "https://images.unsplash.com/photo-1698808342955-500cb9b9a25e?auto=format&fit=crop&w=700&q=80",
    alt: "Microscope de précision posé sur une paillasse",
    span: "normal",
  },
  {
    src: "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?auto=format&fit=crop&w=700&q=80",
    alt: "Technicien manipulant des ballons de laboratoire colorés",
    span: "normal",
  },
  {
    src: "https://images.unsplash.com/photo-1631556763178-b96af5e9993e?auto=format&fit=crop&w=1400&q=80",
    alt: "Rangée de tubes à essai remplis de réactifs colorés",
    span: "wide",
  },
];

function Gallery() {
  return (
    <section style={styles.sectionGray}>
      <div style={styles.container}>
        <Reveal>
          <span style={{ ...styles.eyebrow, display: "block", textAlign: "center" }}>
            Dans nos locaux
          </span>
          <h2 style={styles.sectionTitleCenter}>Notre laboratoire en images</h2>
          <p style={styles.sectionSubtitleCenter}>
            Un aperçu de notre matériel, de nos stocks et de nos équipes sur le terrain.
          </p>
        </Reveal>

        <div className="galleryGridResponsive" style={styles.galleryGrid}>
          {GALLERY_PHOTOS.map((photo, i) => (
            <Reveal key={photo.src} delay={i * 80}>
              <div
                className="hoverImg"
                style={{
                  ...styles.galleryItem,
                  gridColumn: photo.span === "wide" ? "span 2" : "span 1",
                  gridRow: photo.span === "tall" ? "span 2" : "span 1",
                }}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  style={styles.galleryImg}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/placeholder.png";
                  }}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Home() {
  const [produits, setProduits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    fetch("http://localhost:4000/api/produits")
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setProduits(data.data);
        } else {
          setProduits([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setProduits([]);
      });
  }, []);

  const produitsVedette = getFeaturedProduits(produits, 4);

  return (
    <>
      <style>{`
        * { font-family: 'Inter', sans-serif; }
        h1, h2, h3 { font-family: 'Fraunces', serif; }

        @keyframes dropFall {
          0%   { transform: translateX(0); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateX(1194px); opacity: 0; }
        }
        .dropTravel { animation: dropFall 4.5s ease-in-out infinite; }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-18px) translateX(10px); }
        }
        @keyframes floatSlower {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(14px); }
        }
        @keyframes rotateOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(90,180,110,.55); }
          70% { box-shadow: 0 0 0 8px rgba(90,180,110,0); }
        }
        @keyframes pulseDotGold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(200,162,77,.55); }
          70% { box-shadow: 0 0 0 6px rgba(200,162,77,0); }
        }
        @keyframes heroFade {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes captionFade {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes tubeFillRise {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes tubeBubbleRise1 {
          0%   { transform: translateY(0) scale(0.6); opacity: 0; }
          15%  { opacity: 1; }
          90%  { opacity: 0; }
          100% { transform: translateY(-20px) scale(1); opacity: 0; }
        }
        @keyframes tubeBubbleRise2 {
          0%   { transform: translateY(0) scale(0.5); opacity: 0; }
          25%  { opacity: .9; }
          90%  { opacity: 0; }
          100% { transform: translateY(-16px) scale(0.9); opacity: 0; }
        }

        .heroBadge { animation: heroFade .7s ease both; }
        .heroTitle { animation: heroFade .8s ease .1s both; }
        .heroSubtitle { animation: heroFade .8s ease .22s both; }
        .heroButtons { animation: heroFade .8s ease .34s both; }
        .heroOrbit { animation: rotateOrbit 40s linear infinite; }
        .heroBlobA { animation: floatSlow 9s ease-in-out infinite; }
        .heroBlobB { animation: floatSlower 11s ease-in-out infinite; }
        .heroCaption { animation: captionFade .6s cubic-bezier(.22,.61,.36,1) both; }

        .stockDot { animation: pulseDot 2.2s ease-out infinite; }

        .heroTubeLiquid {
          transform-box: fill-box;
          transform-origin: bottom;
          animation: tubeFillRise ${SLIDE_DURATION}ms linear forwards;
        }
        .heroTubeBubble1 { animation: tubeBubbleRise1 1.6s ease-in infinite; }
        .heroTubeBubble2 { animation: tubeBubbleRise2 1.9s ease-in infinite .4s; }

        .heroTubeBtn { background: transparent; border: none; padding: 4px 3px; cursor: pointer; transition: transform .25s ease; }
        .heroTubeBtn:hover { transform: translateY(-4px); }

        .hoverLift { transition: transform .35s cubic-bezier(.22,.61,.36,1), box-shadow .35s ease; }
        .hoverLift:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(91,7,20,0.16); }

        .hoverImg { overflow: hidden; position: relative; }
        .hoverImg img { transition: transform .6s cubic-bezier(.22,.61,.36,1); }
        .hoverImg:hover img { transform: scale(1.08) rotate(0.3deg); }

        .productCard { position: relative; }
        .productCard::after {
          content: "";
          position: absolute; inset: 0;
          border-radius: 16px;
          border: 1px solid rgba(200,162,77,0);
          transition: border-color .35s ease;
          pointer-events: none;
        }
        .productCard:hover::after { border-color: rgba(200,162,77,0.55); }

        .serviceIconSpin { transition: transform .5s cubic-bezier(.34,1.56,.64,1), background .3s ease; }
        .serviceCard:hover .serviceIconSpin { transform: rotate(14deg) scale(1.08); background: rgba(139,0,0,0.14); }

        .btnPrimaryHover { position: relative; overflow: hidden; }
        .btnPrimaryHover:hover { background:#7a0026 !important; box-shadow:0 10px 26px rgba(139,0,45,0.4); transform: translateY(-2px); }
        .btnSecondaryHover:hover { background:rgba(255,255,255,0.14) !important; transform: translateY(-2px); }
        .btnWhiteHover:hover { background:#f2dde1 !important; transform: translateY(-2px); }
        .btnBorderHover:hover { background:rgba(255,255,255,0.14) !important; transform: translateY(-2px); }
        .linkHover { position: relative; }
        .linkHover::after {
          content: ""; position: absolute; left: 0; bottom: -3px; width: 0; height: 1px;
          background: #8b0000; transition: width .3s ease;
        }
        .linkHover:hover::after { width: 100%; }

        .btn, .btnPrimaryHover, .btnSecondaryHover, .btnWhiteHover, .btnBorderHover {
          transition: background .25s ease, box-shadow .25s ease, transform .25s ease;
        }

        @media (max-width: 900px) {
          .heroTubeRackResponsive { left: 24px !important; bottom: 24px !important; }
          .heroCaptionResponsive { left: 24px !important; right: 24px !important; }
        }

        @media (max-width: 768px) {
          .galleryGridResponsive { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <Navbar />

      {/* HERO */}
      <section style={styles.hero}>
        <HeroCarousel />
        <div style={styles.overlay}></div>

        {/* motif décoratif : molécule orbitale + bulles de réactif */}
        <div style={styles.heroOrbitWrap} className="heroOrbit" aria-hidden="true">
          <svg width="420" height="420" viewBox="0 0 420 420" style={{ opacity: 0.35 }}>
            <circle cx="210" cy="210" r="150" stroke="#f6a7bb" strokeOpacity="0.35" strokeWidth="1" fill="none" />
            <circle cx="210" cy="60" r="7" fill="#c8a24d" />
            <circle cx="360" cy="210" r="5" fill="#f6a7bb" />
            <circle cx="60" cy="210" r="5" fill="#f6a7bb" />
            <circle cx="210" cy="360" r="7" fill="#c8a24d" />
          </svg>
        </div>
        <div style={styles.heroBlobA} className="heroBlobA" aria-hidden="true" />
        <div style={styles.heroBlobB} className="heroBlobB" aria-hidden="true" />

        <div style={styles.heroContent}>
          <div className="heroBadge" style={styles.badge}>
            🔬 Leader des solutions biomédicales
          </div>

          <h1 className="heroTitle" style={styles.title}>
            Votre partenaire
            <br />
            <span style={styles.titlePink}>biomédical de</span>
            <br />
            confiance
          </h1>

          <p className="heroSubtitle" style={styles.subtitle}>
            Réactifs, verrerie, produits chimiques et matériel médical.
            Grand Laboratoire vous accompagne depuis plus de 15 ans.
          </p>

          <div className="heroButtons" style={styles.buttons}>
            <button
              className="btnPrimaryHover"
              style={styles.btnPrimary}
              onClick={() => navigate("/produits")}
            >
              Découvrir nos produits →
            </button>
            <Link to="/contact" className="btnSecondaryHover" style={styles.btnSecondary}>
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      <TitrationDivider />

      {/* STATS */}
      <section style={styles.statsSection}>
        <div style={styles.stats}>
          <Reveal delay={0}>
            <div className="hoverLift" style={styles.statCard}>
              <div style={styles.statIconWrap}>
                <FaBox size={24} color="#8b0000" />
              </div>
              <Counter value={produits?.length || 0} />
              <p style={styles.statLabel}>Produits</p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="hoverLift" style={styles.statCard}>
              <div style={styles.statIconWrap}>
                <FaUsers size={24} color="#8b0000" />
              </div>
              <Counter value={450} suffix="+" />
              <p style={styles.statLabel}>Clients</p>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="hoverLift" style={styles.statCard}>
              <div style={styles.statIconWrap}>
                <FaAward size={24} color="#8b0000" />
              </div>
              <Counter value={15} />
              <p style={styles.statLabel}>Ans d'expérience</p>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="hoverLift" style={styles.statCard}>
              <div style={styles.statIconWrap}>
                <FaTruck size={24} color="#8b0000" />
              </div>
              <Counter value={12000} suffix="+" />
              <p style={styles.statLabel}>Livraisons</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PRODUITS */}
      <section style={styles.section}>
        <div style={styles.container}>
          <Reveal>
            <div style={styles.headerRow}>
              <div>
                <span style={styles.eyebrow}>Catalogue</span>
                <h2 style={styles.sectionTitle}>Produits en vedette</h2>
                <p style={styles.sectionSubtitle}>
                  Réactifs, consommables et matériel — un aperçu de notre gamme.
                </p>
              </div>

              <Link to="/produits" className="linkHover" style={styles.link}>
                Voir tout →
              </Link>
            </div>
          </Reveal>

          <div style={styles.grid}>
            {produitsVedette.map((p, i) => {
              const statutColor = (STATUT_STYLES[p.statut] || STATUT_STYLES.default).color;
              return (
                <Reveal key={p.id} delay={(i % 4) * 100}>
                  <div
                    className="hoverLift productCard"
                    style={{ ...styles.productCard, cursor: "pointer" }}
                    onClick={() => navigate(`/produit/${p.id}`)}
                  >
                    <div className="hoverImg" style={{ position: "relative" }}>
                      <img
                        src={getImageUrl(p.image)}
                        alt={p.nom}
                        style={styles.image}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                      <span
                        style={{
                          ...styles.statutBadgeFloating,
                          color: statutColor,
                        }}
                      >
                        {p.statut}
                      </span>
                    </div>

                    <div style={styles.productBody}>
                      <span style={styles.brand}>{p.marque}</span>
                      <h3 style={styles.productTitle}>{p.nom}</h3>
                      <p style={styles.productDesc}>{p.description}</p>

                      <div style={styles.cardFooter}>
                        <span style={styles.stock}>
                          <span className="stockDot" style={styles.stockDot} />
                          {p.stock > 0 ? "En stock" : "Rupture"}
                        </span>
                        <span style={styles.reference}>Réf: {p.reference}</span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section style={styles.sectionGray}>
        <div style={styles.container}>
          <Reveal>
            <span style={{ ...styles.eyebrow, display: "block", textAlign: "center" }}>
              Ce que nous faisons
            </span>
            <h2 style={styles.sectionTitleCenter}>Nos services</h2>
            <p style={styles.sectionSubtitleCenter}>
              Solutions complètes pour laboratoires et hôpitaux.
            </p>
          </Reveal>

          <div style={styles.grid}>
            {[
              { icon: FaFlask, title: "Vente matériel médical", desc: "Matériel neuf et reconditionné." },
              { icon: FaVial, title: "Location matériel", desc: "Location flexible courte et longue durée." },
              { icon: FaFlask, title: "Produits laboratoire", desc: "Réactifs et verrerie professionnelle." },
              { icon: FaTools, title: "Maintenance", desc: "Support et maintenance technique." },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <div className="hoverLift serviceCard" style={styles.serviceCard}>
                  <div className="serviceIconSpin" style={styles.serviceIconWrap}>
                    <s.icon color="#8b0000" size={24} />
                  </div>
                  <h3 style={styles.serviceTitle}>{s.title}</h3>
                  <p style={styles.serviceDesc}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIE PHOTO */}
      <Gallery /><br />

      {/* CTA */}
      {/* <section style={styles.cta}>
        <div style={styles.ctaOverlay} aria-hidden="true" />
        <div style={{ ...styles.container, position: "relative", zIndex: 2 }}>
          <Reveal>
            <h2 style={styles.ctaTitle}>Besoin d'un devis ?</h2>
            <p style={styles.ctaSubtitle}>Recevez votre devis sous 24h.</p>

            <div style={styles.ctaButtons}>
              <Link to="/inscription" className="btnWhiteHover" style={styles.btnWhite}>
                Créer un compte
              </Link>
              <Link to="/contact" className="btnBorderHover" style={styles.btnBorder}>
                Nous contacter
              </Link>
            </div>
          </Reveal>
        </div>
      </section> */}

      <Footer />
    </>
  );
}

/* ==========================
   STYLES — thème bordeaux
   raffiné, avec touche or
========================== */
const GOLD = "#c8a24d";
const BORDEAUX_DEEP = "#3d0a10";

// Palette de couleurs par statut produit (Réactif / Consommable / Matériel)
const STATUT_STYLES = {
  "Réactif": { color: "#8b0000" },
  "Consommable": { color: "#a3781f" }, // dérivé du or GOLD, plus lisible sur fond blanc
  "Matériel": { color: "#2e7d42" },
  default: { color: "#8b0000" },
};

const styles = {
  hero: {
    minHeight: "100vh",
    paddingTop: "80px",
    background: `linear-gradient(150deg, ${BORDEAUX_DEEP} 0%, #6b0f1a 45%, #8f0f22 100%)`,
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },

  heroCarousel: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
  },

  heroCarouselImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "opacity 1.2s ease, transform linear",
    willChange: "opacity, transform",
  },

  heroCarouselVeil: {
    position: "absolute",
    inset: 0,
    background: `linear-gradient(150deg, ${BORDEAUX_DEEP}e6 0%, #6b0f1acc 45%, #8f0f2299 100%)`,
  },

  heroCaption: {
    position: "absolute",
    left: "80px",
    bottom: "128px",
    zIndex: 3,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    maxWidth: "360px",
  },

  heroCaptionEyebrow: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "11px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: GOLD,
  },

  heroCaptionTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: "1.15rem",
    color: "rgba(255,255,255,0.92)",
    lineHeight: 1.3,
  },

  heroTubeRack: {
    position: "absolute",
    left: "80px",
    bottom: "34px",
    zIndex: 3,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "10px",
  },

  heroTubeRackLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "11px",
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.75)",
    textTransform: "uppercase",
  },

  heroTubeRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    padding: "6px 10px 4px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    backdropFilter: "blur(4px)",
  },

  heroTubeBtnWrap: {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    lineHeight: 0,
  },

  heroPauseDot: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "16px",
    height: "44px",
  },

  heroPauseDotCore: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    display: "inline-block",
    animation: "pulseDotGold 2.4s ease-out infinite",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 78% 28%, rgba(255,255,255,0.10), transparent 55%), radial-gradient(circle at 15% 85%, rgba(200,162,77,0.10), transparent 45%)",
  },

  heroOrbitWrap: {
    position: "absolute",
    top: "50%",
    right: "-60px",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },

  heroBlobA: {
    position: "absolute",
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(200,162,77,0.28), transparent 70%)",
    top: "18%",
    left: "8%",
    filter: "blur(2px)",
  },

  heroBlobB: {
    position: "absolute",
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(246,167,187,0.25), transparent 70%)",
    bottom: "14%",
    left: "22%",
  },

  heroContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1300px",
    margin: "auto",
    padding: "0 80px",
    color: "#fff",
  },

  badge: {
    display: "inline-block",
    padding: "10px 18px",
    borderRadius: "30px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    marginBottom: "30px",
    fontSize: "0.95rem",
    backdropFilter: "blur(6px)",
  },

  title: {
    fontSize: "4.5rem",
    fontWeight: "700",
    lineHeight: "1.05",
    marginBottom: "20px",
    letterSpacing: "-0.01em",
  },

  titlePink: { color: "#f6a7bb" },

  subtitle: {
    fontSize: "1.3rem",
    marginBottom: "30px",
    color: "rgba(255,255,255,0.9)",
    maxWidth: "600px",
    lineHeight: 1.6,
  },

  buttons: { display: "flex", gap: "15px", flexWrap: "wrap" },

  btnPrimary: {
    background: "#b3002d",
    color: "#fff",
    padding: "15px 30px",
    borderRadius: "10px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
  },

  btnSecondary: {
    background: "transparent",
    border: "1px solid white",
    color: "#fff",
    padding: "15px 30px",
    borderRadius: "10px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
  },

  container: { maxWidth: "1200px", margin: "auto", padding: "0 20px" },

  dividerWrap: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
    marginTop: "-4px",
  },

  statsSection: { marginTop: "0px" },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px 0",
  },

  statCard: {
    background: "#fff",
    padding: "30px 20px",
    textAlign: "center",
    borderRadius: "14px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },

  statIconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(139,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },

  statNumber: { fontSize: "1.8rem", margin: "0 0 4px", color: "#1a1a1a" },
  statLabel: { color: "#666", margin: 0 },

  section: { padding: "80px 0" },
  sectionGray: { padding: "80px 0", background: "#f7f7f7" },

  eyebrow: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "0.75rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: GOLD,
    fontWeight: 600,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "40px",
    flexWrap: "wrap",
    gap: "16px",
  },

  sectionTitle: { fontSize: "2rem", margin: "6px 0 6px" },
  sectionSubtitle: { color: "#666", margin: 0 },

  sectionTitleCenter: { textAlign: "center", fontSize: "2.2rem", margin: "6px 0 10px" },
  sectionSubtitleCenter: { textAlign: "center", marginBottom: "40px", color: "#666" },

  link: { color: "#8b0000", fontWeight: "600", textDecoration: "none", alignSelf: "center" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "24px",
  },

  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridAutoRows: "140px",
    gap: "16px",
  },

  galleryItem: {
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },

  galleryImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  productCard: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },

  image: { width: "100%", height: "200px", objectFit: "cover", display: "block" },

  // Badge de statut flottant sur l'image du produit, façon étiquette d'échantillon
  statutBadgeFloating: {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: "rgba(255,255,255,0.94)",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    fontFamily: "'IBM Plex Mono', monospace",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },

  productBody: { padding: "18px" },

  brand: {
    color: "#8b0000",
    fontSize: "0.8rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  productTitle: { fontSize: "18px", margin: "8px 0" },
  productDesc: { color: "#666", fontSize: "0.9rem", lineHeight: "1.5" },

  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "14px",
    paddingTop: "12px",
    borderTop: "1px solid #f0f0f0",
  },

  stock: {
    color: "#2e7d42",
    fontSize: "0.85rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  stockDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#5ab46e",
    display: "inline-block",
  },

  reference: { fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#999" },

  serviceCard: {
    background: "#fff",
    padding: "30px 25px",
    borderRadius: "14px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
  },

  serviceIconWrap: {
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    background: "rgba(139,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },

  serviceTitle: { margin: "0 0 8px", fontSize: "1.1rem" },
  serviceDesc: { color: "#666", margin: 0, fontSize: "0.92rem" },

  cta: {
    background: `linear-gradient(150deg, ${BORDEAUX_DEEP}, #85001f, #b0002d)`,
    color: "#fff",
    textAlign: "center",
    padding: "90px 20px",
    position: "relative",
    overflow: "hidden",
  },

  ctaOverlay: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 30% 20%, rgba(200,162,77,0.14), transparent 55%)",
  },

  ctaTitle: { fontSize: "2.2rem", margin: "0 0 10px" },
  ctaSubtitle: { color: "rgba(255,255,255,0.85)", marginBottom: "30px" },

  ctaButtons: { display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" },

  btnWhite: {
    background: "#fff",
    color: "#8b0000",
    padding: "12px 25px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
  },

  btnBorder: {
    background: "transparent",
    border: "1px solid #fff",
    color: "#fff",
    padding: "12px 25px",
    borderRadius: "10px",
    fontWeight: "600",
    textDecoration: "none",
    display: "inline-block",
  },
};

export default Home;