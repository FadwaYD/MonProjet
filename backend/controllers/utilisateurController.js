const Utilisateur =
require('../models/utilisateurModel');

exports.liste = (req,res)=>{

    Utilisateur.getAll((err,result)=>{

        if(err){
            return res.status(500)
            .json(err);
        }

        res.json(result);
    });

};