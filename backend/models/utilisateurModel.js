const db = require('../config/db');

const getAll = (callback)=>{
    db.query(
        "SELECT * FROM utilisateur",
        callback
    );
};

module.exports = {
    getAll
};