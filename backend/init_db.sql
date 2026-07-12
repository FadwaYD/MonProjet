-- =====================================
-- Création de la base de données
-- =====================================
DROP DATABASE IF EXISTS gestion_laboratoire;
CREATE DATABASE gestion_laboratoire;
USE gestion_laboratoire;

-- =====================================
-- Table utilisateurs
-- =====================================
CREATE TABLE utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ice VARCHAR(50) UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nomLabo VARCHAR(150),
    ville VARCHAR(100),
    email VARCHAR(150) NOT NULL UNIQUE,
    telephone VARCHAR(20),
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('Admin','Client') NOT NULL,
    message TEXT,
    statut TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- Table produits
-- =====================================
CREATE TABLE produits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    marque VARCHAR(150) NOT NULL,
    reference VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    prix DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image VARCHAR(255),
    statut ENUM('Réactif','Consommable','Matériel') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- Table commandes
-- =====================================
CREATE TABLE commandes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    statut ENUM('En attente','Confirmée','Annulée') DEFAULT 'En attente',

    CONSTRAINT fk_commande_utilisateur
        FOREIGN KEY (utilisateur_id)
        REFERENCES utilisateurs(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =====================================
-- Table details_commande
-- =====================================
CREATE TABLE details_commande (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commande_id INT NOT NULL,
    produit_id INT NOT NULL,
    quantite INT NOT NULL,
    prix DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_detail_commande
        FOREIGN KEY (commande_id)
        REFERENCES commandes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_detail_produit
        FOREIGN KEY (produit_id)
        REFERENCES produits(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =====================================
-- Données utilisateurs
-- =====================================
INSERT INTO utilisateurs
(ice, nom, prenom, nomLabo, ville, email, telephone, mot_de_passe, role, message, statut)
VALUES

('ICE001234567', 'Admin', 'System', NULL, 'Casablanca',
'admin@gl.ma', '0600000001', 'admin123',
'Admin', 'Administrateur principal', 1),

('ICE002345678', 'Benali', 'Ahmed', 'Laboratoire Atlas', 'Casablanca',
'atlas@lab.ma', '0611111111', 'atlas123',
'Client', 'Demande de partenariat', 1),

('ICE003456789', 'El Idrissi', 'Sara', 'Laboratoire BioTech', 'Rabat',
'biotech@lab.ma', '0622222222', 'bio123',
'Client', 'Commande de réactifs', 1),

('ICE004567890', 'Amrani', 'Youssef', NULL, 'Marrakech',
'youssef@gmail.com', '0633333333', 'client123',
'Client', 'Besoin de matériel', 1),

('ICE005678901', 'Karimi', 'Nadia', NULL, 'Fès',
'nadia@gmail.com', '0644444444', 'client456',
'Client', 'Demande de devis', 0);

-- =====================================
-- Données produits
-- =====================================
INSERT INTO produits
(nom, marque, reference, description, prix, stock, image, statut)
VALUES

('Tube à essai 10 ml',
'Deltalab',
'REF001',
'Tube en verre de 10 ml',
15.00,
500,
'tube.jpg',
'Matériel'),

('Micropipette 1000 µL',
'Eppendorf',
'REF002',
'Micropipette réglable',
1200.00,
20,
'micropipette.jpg',
'Matériel'),

('Réactif PCR',
'Thermo Fisher',
'REF003',
'Réactif pour PCR',
450.00,
100,
'reactif_pcr.jpg',
'Réactif'),

('Alcool Isopropylique',
'Sigma',
'REF004',
'Consommable de laboratoire',
80.00,
200,
'alcool.jpg',
'Consommable'),

('Gants Latex',
'Ansell',
'REF005',
'Boîte de 100 gants',
45.00,
150,
'gants.jpg',
'Consommable');

-- =====================================
-- Données commandes
-- =====================================
INSERT INTO commandes
(utilisateur_id, date_commande, total, statut)
VALUES

(2, '2026-06-25 10:30:00', 1740.00, 'Confirmée'),

(3, '2026-06-26 15:20:00', 900.00, 'En attente'),

(4, '2026-06-27 09:45:00', 285.00, 'Confirmée');

-- =====================================
-- Données détails des commandes
-- =====================================
INSERT INTO details_commande
(commande_id, produit_id, quantite, prix)
VALUES

-- Commande 1
(1, 2, 1, 1200.00),
(1, 3, 1, 450.00),
(1, 1, 6, 15.00),

-- Commande 2
(2, 3, 2, 450.00),

-- Commande 3
(3, 4, 3, 80.00),
(3, 5, 1, 45.00);

ALTER TABLE details_commande
ADD COLUMN remise DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER prix

CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  sujet VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  statut ENUM('Nouveau', 'Traité') DEFAULT 'Nouveau',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);