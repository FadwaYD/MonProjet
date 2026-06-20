const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Importation des routes
const utilisateurRoutes = require('./routes/utilisateurRoutes');

// Utilisation des routes
app.use('/api', utilisateurRoutes);

app.get('/', (req, res) => {
    res.send('Serveur Node.js fonctionne');
});

app.listen(5000, () => {
    console.log('Serveur démarré sur port 5000');
});