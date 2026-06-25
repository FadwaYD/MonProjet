import React from "react";
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
      description:
        "Fourniture complète de réactifs, verrerie et consommables.",
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
      description:
        "Maintenance préventive et curative pour vos équipements.",
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
      description:
        "Livraison complète, installation et mise en service.",
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
      <Navbar />

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.heroTitle}>Nos services</h1>

          <p style={styles.heroText}>
            Des solutions complètes pour équiper, maintenir et faire
            fonctionner vos laboratoires et structures médicales.
          </p>
        </div>
      </section>

      {/* SERVICE PRINCIPAL */}
      <section style={styles.mainSection}>
        <div style={styles.mainCard}>
          <div style={styles.mainContent}>
            <div style={styles.iconBox}>
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

            <button style={styles.button}>
              Demander un devis →
            </button>
          </div>

          <img
            src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=1000"
            alt="medical"
            style={styles.mainImage}
          />
        </div>
      </section>

      {/* AUTRES SERVICES */}
      <section style={styles.servicesSection}>
        <div style={styles.grid}>
          {services.map((service, index) => (
            <div key={index} style={styles.card}>
              <div style={styles.iconBox}>{service.icon}</div>

              <h2 style={styles.cardTitle}>
                {service.title}
              </h2>

              <p style={styles.description}>
                {service.description}
              </p>

              <div>
                {service.options.map((item, i) => (
                  <div key={i} style={styles.option}>
                    <FaCheckCircle
                      size={12}
                      color="#c30039"
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button style={styles.button}>
                Demander un devis →
              </button>
            </div>
          ))}
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
    fontSize: "20px",
    maxWidth: "700px",
    margin: "auto",
    lineHeight: "1.8",
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
    padding: "20px 20px 80px",
  },

  grid: {
    maxWidth: "1200px",
    margin: "auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(450px,1fr))",
    gap: "25px",
  },

  card: {
    background: "white",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0 3px 15px rgba(0,0,0,0.08)",
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
};

export default Services;