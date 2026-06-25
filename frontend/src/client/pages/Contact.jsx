import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
  FaQuestionCircle,
} from "react-icons/fa";

function Contact() {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Contactez-nous</h1>

        <p style={styles.heroText}>
          Notre équipe est à votre disposition pour répondre à toutes vos
          questions.
        </p>
      </section>

      {/* CONTACT */}
      <section style={styles.section}>
        <div style={styles.container}>
          {/* FORMULAIRE */}
          <div style={styles.formCard}>
            <h2 style={styles.title}>
              <FaPaperPlane color="#8b0020" /> Envoyer un message
            </h2>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label>Nom complet</label>
                <input
                  type="text"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label>Sujet</label>
              <input
                type="text"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Message</label>
              <textarea
                rows="6"
                style={styles.textarea}
              ></textarea>
            </div>

            <button style={styles.button}>
              <FaPaperPlane />
              Envoyer le message
            </button>
          </div>

          {/* SIDEBAR */}
          <div style={styles.sidebar}>
            {/* Coordonnées */}
            <div style={styles.infoCard}>
              <h3>Coordonnées</h3>

              <div style={styles.infoItem}>
                <FaMapMarkerAlt color="#8b0020" />
                <div>
                  <strong>Adresse</strong>
                  <p>123 Avenue des Sciences, Dakar, Sénégal</p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <FaPhoneAlt color="#8b0020" />
                <div>
                  <strong>Téléphone</strong>
                  <p>+221 33 123 45 67</p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <FaEnvelope color="#8b0020" />
                <div>
                  <strong>Email</strong>
                  <p>contact@grandlaboratoire.sn</p>
                </div>
              </div>

              <div style={styles.infoItem}>
                <FaClock color="#8b0020" />
                <div>
                  <strong>Horaires</strong>
                  <p>Lun-Ven: 8h-18h</p>
                  <p>Sam: 9h-13h</p>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div style={styles.infoCard}>
              <h3>
                <FaQuestionCircle color="#8b0020" /> FAQ
              </h3>

              <div style={styles.faqItem}>
                Comment créer un compte client ?
              </div>

              <div style={styles.faqItem}>
                Les prix sont-ils visibles sans compte ?
              </div>

              <div style={styles.faqItem}>
                Quel délai pour recevoir un devis ?
              </div>

              <div style={styles.faqItem}>
                Livrez-vous hors du Sénégal ?
              </div>

              <div style={styles.faqItem}>
                Proposez-vous de la location ?
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

const styles = {
  hero: {
    background: "#6f1528",
    color: "white",
    textAlign: "center",
    padding: "70px 20px",
  },

  heroTitle: {
    fontSize: "55px",
    marginBottom: "15px",
  },

  heroText: {
    fontSize: "18px",
  },

  section: {
    background: "#f8f9fb",
    padding: "60px 20px",
  },

  container: {
    maxWidth: "1200px",
    margin: "auto",
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "25px",
  },

  formCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },

  title: {
    marginBottom: "25px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px",
  },

  input: {
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    marginTop: "5px",
  },

  textarea: {
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    resize: "none",
    marginTop: "5px",
  },

  button: {
    background: "#8b0020",
    color: "white",
    border: "none",
    padding: "14px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "600",
  },

  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  infoCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },

  infoItem: {
    display: "flex",
    gap: "12px",
    marginTop: "18px",
    alignItems: "flex-start",
  },

  faqItem: {
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
    cursor: "pointer",
    color: "#334155",
  },
};

export default Contact;