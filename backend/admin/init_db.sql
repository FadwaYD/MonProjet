-- Créer la base de données
CREATE DATABASE IF NOT EXISTS gestion_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestion_db;

-- Table des clients / utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nomLabo VARCHAR(150),
    telephone VARCHAR(20),
    gmail VARCHAR(255) UNIQUE NOT NULL,
    codeICE VARCHAR(50),
    motDePasse VARCHAR(255) NOT NULL,
    statut TINYINT(1) NOT NULL DEFAULT 0
    -- statut : 0 = Inactif | 1 = Nouveau | 2 = VIP
);



-- Table produits
CREATE TABLE IF NOT EXISTS produits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,
    designation VARCHAR(255) NOT NULL,
    marque VARCHAR(100) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    date_peremption DATE DEFAULT NULL,
    statut ENUM('Réactif', 'Consommable', 'Matériel') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT INTO users (nom, prenom, nomLabo, telephone, gmail, codeICE, motDePasse, statut) VALUES
('Alaoui',   'Karim',   'Clinilab Sarl',           '0661234567', 'contact@clinilab.ma',       'ICE-001', 'hashed_pw', 2),
('Bennani',  'Sara',    'LabTech Maroc',            '0662345678', 'achats@labtech.ma',          'ICE-002', 'hashed_pw', 2),
('Chraibi',  'Youssef', 'BioMed Diagnostics',       '0663456789', 'info@biomed-dx.ma',          'ICE-003', 'hashed_pw', 1),
('Daoudi',   'Fatima',  'Clinique Al Amal',         '0664567890', 'direction@alamal-clinique.ma','ICE-004', 'hashed_pw', 2),
('El Fassi', 'Ahmed',   'Institut Pasteur Casa',    '0665678901', 'logistique@pasteur-casa.ma', 'ICE-005', 'hashed_pw', 1),
('Fassi',    'Nadia',   'Pharma Plus Distribution', '0666789012', 'commandes@pharmaplus.ma',    'ICE-006', 'hashed_pw', 0);

-- Données de démonstration
INSERT INTO produits (reference, designation, marque, stock, date_peremption, statut) VALUES
('P-1042', 'Réactif R-204 Buffer pH 7',           'BioMerieux',  8,   '2025-12-31', 'Réactif'),
('P-1043', 'Bécher borosilicaté 500ml',            'Duran',       64,  NULL,         'Consommable'),
('P-1044', 'Centrifugeuse de table CF-300',        'Eppendorf',   3,   NULL,         'Matériel'),
('P-1045', 'Acide chlorhydrique 37% 1L',           'Sigma',       0,   '2026-06-30', 'Réactif'),
('P-1046', 'Lit médicalisé électrique',            'Stryker',     5,   NULL,         'Matériel'),
('P-1047', 'Kit réactifs immuno 50 tests',         'Abbott',      12,  '2025-09-15', 'Réactif'),
('P-1048', 'Pipette graduée 10ml lot de 10',       'Hirschmann',  41,  NULL,         'Consommable'),
('P-1049', 'Concentrateur oxygène portable',       'Invacare',    2,   NULL,         'Matériel');
-- Données de démonstration
