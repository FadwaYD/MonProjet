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

-- Données de démonstration
INSERT INTO users (nom, prenom, nomLabo, telephone, gmail, codeICE, motDePasse, statut) VALUES
('Alaoui',   'Karim',   'Clinilab Sarl',           '0661234567', 'contact@clinilab.ma',       'ICE-001', 'hashed_pw', 2),
('Bennani',  'Sara',    'LabTech Maroc',            '0662345678', 'achats@labtech.ma',          'ICE-002', 'hashed_pw', 2),
('Chraibi',  'Youssef', 'BioMed Diagnostics',       '0663456789', 'info@biomed-dx.ma',          'ICE-003', 'hashed_pw', 1),
('Daoudi',   'Fatima',  'Clinique Al Amal',         '0664567890', 'direction@alamal-clinique.ma','ICE-004', 'hashed_pw', 2),
('El Fassi', 'Ahmed',   'Institut Pasteur Casa',    '0665678901', 'logistique@pasteur-casa.ma', 'ICE-005', 'hashed_pw', 1),
('Fassi',    'Nadia',   'Pharma Plus Distribution', '0666789012', 'commandes@pharmaplus.ma',    'ICE-006', 'hashed_pw', 0);
