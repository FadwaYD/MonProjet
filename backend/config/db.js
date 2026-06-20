const mysql = require('mysql2');

const connexion = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'0000',
    database:'gestion_db'
});

connexion.connect((err)=>{
    if(err){
        console.log(err);
    }else{
        console.log("Connexion MySQL réussie");
    }
});

module.exports = connexion;