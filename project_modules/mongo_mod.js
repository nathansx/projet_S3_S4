var mongoose = require("mongoose");
var liensCollection = require("./models/liens").liens;
var panosCollection = require("./models/panoramas").panos;

// Ouvre la connexion à la bdd
module.exports.connectDB = function() {
    // lien de connexion à la bdd
    var mongoDB = "mongodb://127.0.0.1:8080/projet_S3_S4";
    mongoose.connect(mongoDB, {
        useNewUrlParser: true
    });

    //Get the default connection
    var db = mongoose.connection;

    //Bind connection to error event (to get notification of connection errors)
    db.on("error", console.error.bind(console, "MongoDB connection error:"));
};

// on récupère le dernier ID attribué et si le dossier est déja présent dans la bdd, on reprend son ID.
// Permet d'insérer un nouveau panorama {numPano  : ID, namePano : name}
// et un nouveau lien {numPuce : IDcapteur, numPano: IDpano}
module.exports.insertData = function(numPuce, namePano) {
    var lastID = 1;
    var verif = false;
    var numIfExist = 0
    panosCollection
        .find(function(err, docs) {
            if (docs.length != 0) {
                docs.forEach(lien => {
                    if (lien.namePano == namePano) {
                        verif = true
                        numIfExist = lien.numPano
                    }
                    if (lastID <= lien.numPano) {
                        lastID = lien.numPano + 1;
                    }
                })
                    
            }

            if (verif == true) {
                var newPano = new panosCollection({
                    numPano: numIfExist,
                    namePano: namePano
                });

                var newLien = new liensCollection({
                    numPuce: numPuce,
                    numPano: numIfExist
                });
            }
            else{
                var newPano = new panosCollection({
                    numPano: lastID,
                    namePano: namePano
                });

                var newLien = new liensCollection({
                    numPuce: numPuce,
                    numPano: lastID
                });
            }
            
            newLien.save(function(err) {
                if (err) return handleError(err);
                
            });
            newPano.save(function(err) {
                if (err) return handleError(err);
            });
        });
};

// Supprime l'objet dans la table liens
// dont le numPano correspond à celui du nom du dossier choisi
module.exports.removeLien = function(namePano){
    panosCollection.findOne({namePano: namePano}, function (err, pano) {
        liensCollection.deleteOne({numPano: pano.numPano}, function (err) {
            if (err) return handleError(err);
          })
     })
}

// Equivalent à un getFolderByID
// Permet de récuperer la liste des noms des dossiers 
// liés à un numéro de capteur donné
module.exports.foldersList = function(numPuce, callback) {
    var listNumPano = [];
    var listNamePano = [];

    liensCollection.find({ numPuce: numPuce }, function(err, liens){
        liens.forEach(lien=> {
            listNumPano.push(lien.numPano);
        })
        panosCollection.find({ numPano: { $in: listNumPano } }, function(err, panos) {
            panos.forEach(pano => {
                listNamePano.push(pano.namePano);
            })
            if(err) return callback(err, null)

            callback(null, listNamePano)
        })
    })
};