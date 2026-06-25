export const MOCK = {
  stats: [
    { label: "Chiffre d'affaires", value: "284 500 MAD", change: "+12.4%", up: true, icon: "💰" },
    { label: "Commandes", value: "1 248", change: "+8.1%", up: true, icon: "📦" },
    { label: "Clients", value: "3 412", change: "+5.7%", up: true, icon: "👥" },
    { label: "Devis en attente", value: "34", change: "-2", up: false, icon: "📄" },
  ],

  products: [
    { id: 1, name: "Chaise de bureau ergonomique", cat: "Mobilier", stock: 42, price: "1 290 MAD", status: "actif" },
    { id: 2, name: "Bureau debout réglable", cat: "Mobilier", stock: 18, price: "3 450 MAD", status: "actif" },
    { id: 3, name: 'Écran 27" 4K', cat: "Électronique", stock: 7, price: "4 200 MAD", status: "faible" },
    { id: 4, name: "Câble USB-C 2m", cat: "Accessoires", stock: 215, price: "89 MAD", status: "actif" },
    { id: 5, name: "Webcam HD 1080p", cat: "Électronique", stock: 0, price: "650 MAD", status: "rupture" },
    { id: 6, name: "Clavier mécanique", cat: "Électronique", stock: 30, price: "890 MAD", status: "actif" },
    { id: 7, name: "Souris sans fil", cat: "Accessoires", stock: 55, price: "350 MAD", status: "actif" },
    { id: 8, name: "Support écran", cat: "Mobilier", stock: 3, price: "750 MAD", status: "faible" },
  ],

  categories: [
    { id: 1, name: "Mobilier", products: 24, active: true },
    { id: 2, name: "Électronique", products: 38, active: true },
    { id: 3, name: "Accessoires", products: 57, active: true },
    { id: 4, name: "Fournitures", products: 12, active: false },
    { id: 5, name: "Informatique", products: 19, active: true },
  ],

  quotes: [
    { id: "DEV-001", client: "SARL Al Baraka", date: "18/06/2026", amount: "23 400 MAD", status: "en attente" },
    { id: "DEV-002", client: "Groupe Horizon", date: "15/06/2026", amount: "8 700 MAD", status: "accepté" },
    { id: "DEV-003", client: "Tech Solutions", date: "12/06/2026", amount: "45 000 MAD", status: "refusé" },
    { id: "DEV-004", client: "Dar Zitoun SARL", date: "10/06/2026", amount: "12 300 MAD", status: "en attente" },
    { id: "DEV-005", client: "Konouz Import", date: "08/06/2026", amount: "6 800 MAD", status: "accepté" },
  ],

  orders: [
    { id: "CMD-2201", client: "Karim Benali", date: "21/06/2026", amount: "1 290 MAD", status: "livré", items: 2 },
    { id: "CMD-2200", client: "Sara El Fassi", date: "20/06/2026", amount: "4 250 MAD", status: "en cours", items: 3 },
    { id: "CMD-2199", client: "Omar Tazi", date: "19/06/2026", amount: "870 MAD", status: "en attente", items: 1 },
    { id: "CMD-2198", client: "Leila Chraibi", date: "18/06/2026", amount: "6 100 MAD", status: "livré", items: 5 },
    { id: "CMD-2197", client: "Hassan Moukrim", date: "17/06/2026", amount: "349 MAD", status: "annulé", items: 1 },
    { id: "CMD-2196", client: "Nadia Berrada", date: "16/06/2026", amount: "2 780 MAD", status: "en cours", items: 4 },
  ],

  customers: [
    { id: 1, name: "Karim Benali", email: "k.benali@email.ma", phone: "0661 234 567", orders: 12, total: "14 200 MAD", status: "actif", joined: "Jan 2025" },
    { id: 2, name: "Sara El Fassi", email: "s.elfassi@email.ma", phone: "0662 345 678", orders: 7, total: "9 800 MAD", status: "actif", joined: "Mar 2025" },
    { id: 3, name: "Omar Tazi", email: "o.tazi@email.ma", phone: "0663 456 789", orders: 3, total: "2 400 MAD", status: "actif", joined: "Mai 2025" },
    { id: 4, name: "Leila Chraibi", email: "l.chraibi@corp.ma", phone: "0664 567 890", orders: 21, total: "31 500 MAD", status: "vip", joined: "Fév 2024" },
    { id: 5, name: "Hassan Moukrim", email: "h.moukrim@email.ma", phone: "0665 678 901", orders: 1, total: "349 MAD", status: "inactif", joined: "Nov 2025" },
    { id: 6, name: "Nadia Berrada", email: "n.berrada@email.ma", phone: "0666 789 012", orders: 9, total: "11 200 MAD", status: "actif", joined: "Avr 2025" },
  ],

  messages: [
    { id: 1, from: "Karim Benali", email: "k.benali@email.ma", subject: "Question sur la livraison", body: "Bonjour, je voudrais savoir où en est ma commande CMD-2201. Merci.", time: "Il y a 2h", read: false },
    { id: 2, from: "Sara El Fassi", email: "s.elfassi@email.ma", subject: "Demande de facture", body: "Pouvez-vous m'envoyer la facture de ma dernière commande en PDF ?", time: "Il y a 5h", read: false },
    { id: 3, from: "Tech Solutions", email: "contact@techsol.ma", subject: "Devis pour 50 chaises", body: "Nous avons besoin d'un devis pour 50 chaises ergonomiques pour notre nouveau bureau.", time: "Hier", read: true },
    { id: 4, from: "Omar Tazi", email: "o.tazi@email.ma", subject: "Retour produit défectueux", body: "La webcam reçue ne fonctionne pas. Je souhaite un échange ou remboursement.", time: "Hier", read: true },
  ],

  validations: [
    { id: 1, name: "Mehdi Boussouf", email: "m.boussouf@startup.ma", company: "StartupBoost SARL", date: "20/06/2026", status: "en attente", type: "Entreprise" },
    { id: 2, name: "Fatima Zahra Alaoui", email: "fz.alaoui@import.ma", company: "Alaoui Import", date: "19/06/2026", status: "en attente", type: "Import/Export" },
    { id: 3, name: "Youssef Idrissi", email: "y.idrissi@btp.ma", company: "BTP Pro", date: "17/06/2026", status: "validé", type: "BTP" },
    { id: 4, name: "Amina Squalli", email: "a.squalli@retail.ma", company: "Squalli Retail", date: "14/06/2026", status: "rejeté", type: "Commerce" },
  ],

  chartData: [42, 65, 55, 80, 70, 90, 75, 85, 60, 95, 88, 100],
  chartMonths: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"],

  topProducts: [
    { name: "Chaise ergonomique", pct: 68 },
    { name: "Bureau debout", pct: 45 },
    { name: "Écran 4K", pct: 32 },
    { name: "Webcam HD", pct: 20 },
  ],

  categoryRevenue: [
    { name: "Mobilier", pct: 45 },
    { name: "Électronique", pct: 31 },
    { name: "Accessoires", pct: 18 },
    { name: "Fournitures", pct: 6 },
  ],
};
