import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaArrowUp,
  FaFlask,
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaPaperPlane,
  FaCheck,
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

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <footer style={styles.footer}>
      <style>{globalCss}</style>

      <div style={styles.glowLeft} />
      <div style={styles.glowRight} />
      <div style={styles.topAccent} />

      <div style={styles.container}>
        {/* Newsletter */}
        <Reveal style={styles.newsletterBand} className="newsletter-band">
          <div style={styles.newsletterText}>
            <h3 style={styles.newsletterTitle}>Restez informés</h3>
            <p style={styles.newsletterSub}>
              Nouveautés produits, offres et actualités du secteur biomédical.
            </p>
          </div>

          <form style={styles.newsletterForm} onSubmit={handleSubscribe}>
            <div style={styles.newsletterInputWrap}>
              <FaEnvelope size={13} color="rgba(255,255,255,0.55)" />
              <input
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.newsletterInput}
                className="newsletter-input"
              />
            </div>
            <button type="submit" style={styles.newsletterBtn} className="newsletter-btn">
              {subscribed ? <FaCheck size={13} /> : <FaPaperPlane size={13} />}
              {subscribed ? "Inscrit !" : "S'abonner"}
            </button>
          </form>
        </Reveal>

        {/* Colonnes */}
        <div style={styles.grid} className="footer-grid">
          <Reveal style={styles.brandCol} className="footer-col">
            <div style={styles.brandRow}>
              <div style={styles.brandIconBox}>
                <FaFlask size={16} color="#fff" />
              </div>
              <h3 style={styles.brandTitle}>Grand Laboratoire</h3>
            </div>
            <p style={styles.brandText}>
              Votre partenaire biomédical de référence en Afrique de l'Ouest,
              depuis plus de 15 ans.
            </p>

            <div style={styles.socialRow}>
              <a href="#" style={styles.socialIcon} className="social-icon" aria-label="Facebook">
                <FaFacebookF size={13} />
              </a>
              <a href="#" style={styles.socialIcon} className="social-icon" aria-label="LinkedIn">
                <FaLinkedinIn size={13} />
              </a>
              <a href="#" style={styles.socialIcon} className="social-icon" aria-label="Instagram">
                <FaInstagram size={13} />
              </a>
            </div>
          </Reveal>

          <Reveal delay={80} style={styles.col} className="footer-col">
            <h4 style={styles.colTitle}>Navigation</h4>
            <nav style={styles.linkList}>
              <Link to="/" style={styles.link} className="footer-link">Accueil</Link>
              <Link to="/produits" style={styles.link} className="footer-link">Produits</Link>
              <Link to="/services" style={styles.link} className="footer-link">Services</Link>
              <Link to="/about" style={styles.link} className="footer-link">À propos</Link>
              <Link to="/contact" style={styles.link} className="footer-link">Contact</Link>
            </nav>
          </Reveal>

          <Reveal delay={140} style={styles.col} className="footer-col">
            <h4 style={styles.colTitle}>Nos services</h4>
            <nav style={styles.linkList}>
              <Link to="/services" style={styles.link} className="footer-link">Vente de matériel</Link>
              <Link to="/services" style={styles.link} className="footer-link">Location</Link>
              <Link to="/services" style={styles.link} className="footer-link">Maintenance</Link>
              <Link to="/services" style={styles.link} className="footer-link">Livraison</Link>
            </nav>
          </Reveal>

          <Reveal delay={200} style={styles.col} className="footer-col">
            <h4 style={styles.colTitle}>Contact</h4>
            <div style={styles.infoRow} className="footer-info">
              <FaMapMarkerAlt size={13} color="#ff8fa3" />
              <span>Dakar, Sénégal</span>
            </div>
            <div style={styles.infoRow} className="footer-info">
              <FaPhoneAlt size={13} color="#ff8fa3" />
              <span>+221 33 123 45 67</span>
            </div>
            <div style={styles.infoRow} className="footer-info">
              <FaClock size={13} color="#ff8fa3" />
              <span>Lun-Ven : 8h - 18h</span>
            </div>
          </Reveal>
        </div>

        {/* Certifications */}
        <Reveal delay={260} style={styles.certRow}>
          {["ISO 9001:2015", "ISO 13485", "Certification CE", "BPF"].map((c, i) => (
            <span key={i} style={styles.certBadge} className="cert-badge">
              {c}
            </span>
          ))}
        </Reveal>

        {/* Bottom bar */}
        <Reveal delay={320} style={styles.bottomBar}>
          <p style={styles.copyright}>© 2024 Grand Laboratoire — Tous droits réservés</p>

          <div style={styles.legalLinks}>
            <a href="#" style={styles.legalLink} className="legal-link">Mentions légales</a>
            <span style={styles.legalDivider}>·</span>
            <a href="#" style={styles.legalLink} className="legal-link">Confidentialité</a>
          </div>

          <button
            onClick={scrollToTop}
            style={styles.topBtn}
            className="top-btn"
            aria-label="Retour en haut de la page"
          >
            <FaArrowUp size={13} />
          </button>
        </Reveal>
      </div>
    </footer>
  );
}

const globalCss = `
  @keyframes floatGlowFooter {
    0%, 100% { transform: translate(0,0) scale(1); opacity: 0.5; }
    50% { transform: translate(15px,-10px) scale(1.1); opacity: 0.75; }
  }

  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .reveal-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .footer-col {
    border-left: 1px solid rgba(255,255,255,0.08);
    padding-left: 24px;
  }
  .footer-col:first-child {
    border-left: none;
    padding-left: 0;
  }

  .footer-link {
    position: relative;
    transition: color 0.25s ease, padding-left 0.25s ease;
  }
  .footer-link::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -3px;
    width: 0;
    height: 1px;
    background: #ff8fa3;
    transition: width 0.25s ease;
  }
  .footer-link:hover {
    color: #ff8fa3;
    padding-left: 4px;
  }
  .footer-link:hover::after {
    width: 100%;
  }

  .footer-info {
    transition: transform 0.25s ease;
  }
  .footer-info:hover {
    transform: translateX(3px);
  }

  .social-icon {
    transition: background 0.25s ease, transform 0.25s ease;
  }
  .social-icon:hover {
    background: #ff8fa3;
    color: #5a0000;
    transform: translateY(-3px);
  }

  .newsletter-input {
    transition: all 0.2s ease;
  }
  .newsletter-input::placeholder {
    color: rgba(255,255,255,0.5);
  }

  .newsletter-btn {
    transition: background 0.25s ease, transform 0.25s ease;
  }
  .newsletter-btn:hover {
    background: #ff8fa3;
    color: #5a0000;
    transform: translateY(-2px);
  }

  .cert-badge {
    transition: background 0.25s ease, transform 0.25s ease;
  }
  .cert-badge:hover {
    background: rgba(255,255,255,0.14);
    transform: translateY(-2px);
  }

  .legal-link {
    transition: color 0.25s ease;
  }
  .legal-link:hover {
    color: #ff8fa3;
  }

  .top-btn {
    transition: background 0.25s ease, transform 0.25s ease;
  }
  .top-btn:hover {
    background: #ff8fa3;
    color: #5a0000;
    transform: translateY(-3px);
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal, .footer-link, .footer-link::after, .footer-info,
    .social-icon, .newsletter-btn, .cert-badge, .legal-link, .top-btn {
      animation: none !important;
      transition: none !important;
      opacity: 1 !important;
      transform: none !important;
      width: auto !important;
    }
  }

  @media (max-width: 900px) {
    .footer-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .footer-col {
      border-left: none !important;
      padding-left: 0 !important;
    }
    .newsletter-band {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
  }
  @media (max-width: 480px) {
    .footer-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

const styles = {
  footer: {
    background: "linear-gradient(180deg, #5a0000 0%, #430000 100%)",
    color: "white",
    position: "relative",
    overflow: "hidden",
  },

  glowLeft: {
    position: "absolute",
    top: "-80px",
    left: "-80px",
    width: "260px",
    height: "260px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,143,163,0.18) 0%, rgba(255,255,255,0) 70%)",
    animation: "floatGlowFooter 9s ease-in-out infinite",
    pointerEvents: "none",
  },

  glowRight: {
    position: "absolute",
    bottom: "-100px",
    right: "-60px",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(139,0,32,0.35) 0%, rgba(255,255,255,0) 70%)",
    animation: "floatGlowFooter 11s ease-in-out infinite",
    pointerEvents: "none",
  },

  topAccent: {
    height: "4px",
    width: "100%",
    background: "linear-gradient(90deg, #8b0020, #ff8fa3, #8b0020)",
    position: "relative",
    zIndex: 1,
  },

  container: {
    maxWidth: "1300px",
    margin: "auto",
    padding: "50px 40px 30px",
    position: "relative",
    zIndex: 1,
  },

  newsletterBand: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "28px 32px",
    marginBottom: "45px",
  },

  newsletterText: {
    minWidth: "220px",
  },

  newsletterTitle: {
    margin: "0 0 6px",
    fontSize: "20px",
  },

  newsletterSub: {
    margin: 0,
    color: "rgba(255,255,255,0.65)",
    fontSize: "14px",
  },

  newsletterForm: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  newsletterInputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "8px",
    padding: "0 14px",
  },

  newsletterInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "white",
    padding: "12px 0",
    fontSize: "14px",
    minWidth: "200px",
  },

  newsletterBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#8b0020",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "0 20px",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr 1fr 1fr",
    gap: "30px",
  },

  col: {},

  brandCol: {
    paddingRight: "10px",
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },

  brandIconBox: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  brandTitle: {
    margin: 0,
    fontSize: "19px",
  },

  brandText: {
    margin: "0 0 18px",
    color: "rgba(255,255,255,0.65)",
    lineHeight: "1.6",
    fontSize: "14px",
  },

  socialRow: {
    display: "flex",
    gap: "10px",
  },

  socialIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
  },

  colTitle: {
    margin: "0 0 18px",
    fontSize: "15px",
    letterSpacing: "0.3px",
    color: "#fff",
  },

  linkList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  link: {
    color: "rgba(255,255,255,0.7)",
    textDecoration: "none",
    fontSize: "14px",
    display: "inline-block",
    width: "fit-content",
  },

  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
    color: "rgba(255,255,255,0.7)",
    fontSize: "14px",
  },

  certRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "40px",
    paddingTop: "28px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },

  certBadge: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "20px",
    padding: "6px 14px",
  },

  bottomBar: {
    marginTop: "24px",
    paddingTop: "22px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },

  copyright: {
    margin: 0,
    color: "rgba(255,255,255,0.55)",
    fontSize: "13px",
  },

  legalLinks: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  legalLink: {
    color: "rgba(255,255,255,0.55)",
    textDecoration: "none",
    fontSize: "13px",
  },

  legalDivider: {
    color: "rgba(255,255,255,0.3)",
  },

  topBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.3)",
    background: "transparent",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default Footer;