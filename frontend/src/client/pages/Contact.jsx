import React, { useState } from "react";
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

const API_URL = "http://localhost:4000/api/contacts";

function Contact() {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.nom || !formData.email || !formData.sujet || !formData.message) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    fetch(API_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData),
})
  .then(async (res) => {
    const text = await res.text(); // texte brut, pas .json()
    console.log("Status:", res.status);
    console.log("Réponse brute:", text);
    return JSON.parse(text);
  })
  .then((data) => {
    setLoading(false);
    setSuccess(data.message);
    setFormData({ nom: "", email: "", sujet: "", message: "" });
  })
  .catch((err) => {
    console.error(err);
    setLoading(false);
    setError("Erreur serveur, réessayez plus tard.");
  });
  };

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
          <form style={styles.formCard} onSubmit={handleSubmit}>
            <h2 style={styles.title}>
              <FaPaperPlane color="#8b0020" /> Envoyer un message
            </h2>

            {success && <div style={styles.successMsg}>{success}</div>}
            {error && <div style={styles.errorMsg}>{error}</div>}

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label>Nom complet</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label>Sujet</label>
              <input
                type="text"
                name="sujet"
                value={formData.sujet}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label>Message</label>
              <textarea
                rows="6"
                name="message"
                value={formData.message}
                onChange={handleChange}
                style={styles.textarea}
              ></textarea>
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              <FaPaperPlane />
              {loading ? "Envoi en cours..." : "Envoyer le message"}
            </button>
          </form>

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

  successMsg: {
    background: "#dcfce7",
    color: "#15803d",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
  },

  errorMsg: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
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