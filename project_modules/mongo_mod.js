var mongoose = require("mongoose");
var liensCollection = require("./models/liens").liens;
var panosCollection = require("./models/panoramas").panos;
var pucesCollection = require("./models/capteurs").puces;
var admin_functions = require('./admin_mod')

// Ouvre la connexion à la bdd
module.exports.connectDB = function () {
    // lien de connexion à la bdd
    var mongoDB = "mongodb://127.0.0.1:27017/projet_S3_S4";
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
// module.exports.insertData = function (numPuce, namePano) {
//     var lastID = 1;
//     var verif = false;
//     var numIfExist = 0
//     panosCollection
//         .find(function (err, docs) {
//             if (docs.length != 0) {
//                 docs.forEach(lien => {
//                     if (lien.namePano == namePano) {
//                         verif = true
//                         numIfExist = lien.numPano
//                     }
//                     if (lastID <= lien.numPano) {
//                         lastID = lien.numPano + 1;
//                     }
//                 })

//             }

//             if (verif == true) {
//                 var newPano = new panosCollection({
//                     numPano: numIfExist,
//                     namePano: namePano
//                 });

//                 var newLien = new liensCollection({
//                     numPuce: numPuce,
//                     numPano: numIfExist
//                 });
//             } else {
//                 var newPano = new panosCollection({
//                     numPano: lastID,
//                     namePano: namePano
//                 });

//                 var newLien = new liensCollection({
//                     numPuce: numPuce,
//                     numPano: lastID
//                 });
//             }

//             newLien.save(function (err) {
//                 if (err) return handleError(err);
//             });
//             newPano.save(function (err) {
//                 if (err) return handleError(err);
//             });
//         });
// };

// Supprime l'objet dans la table liens
// dont le numPano correspond à celui du nom du dossier choisi
// module.exports.removeLien = function (namePano) {
//     panosCollection.findOne({
//         namePano: namePano
//     }, function (err, pano) {
//         liensCollection.deleteOne({
//             numPano: pano.numPano
//         }, function (err) {
//             if (err) return handleError(err);
//         })
//     })
// }

// Equivalent à un getFolderByID
// Permet de récuperer la liste des noms des dossiers 
// liés à un numéro de capteur donné
// module.exports.foldersList = function (numPuce, callback) {
//     var listNumPano = [];
//     var listNamePano = [];

//     liensCollection.find({
//         numPuce: numPuce
//     }, function (err, liens) {
//         liens.forEach(lien => {
//             listNumPano.push(lien.numPano);
//         })
//         panosCollection.find({
//             numPano: {
//                 $in: listNumPano
//             }
//         }, function (err, panos) {
//             panos.forEach(pano => {
//                 listNamePano.push(pano.namePano);
//             })
//             if (err) return callback(err, null)
//             callback(null, listNamePano)
//         })
//     })
// };

// module.exports.getAllToDisplay = function (callback) {
//     var listNumPano = [];
//     var listNamePano = [];

//     liensCollection.find(function (err, liens) {
//         liens.forEach(lien => {
//             listNumPano.push(lien.numPano);
//         })
//         panosCollection.find({
//             numPano: {
//                 $in: listNumPano
//             }
//         }, function (err, panos) {
//             panos.forEach(pano => {
//                 listNamePano.push(pano.namePano);
//             })
//             if (err) return callback(err, null)
//             callback(null, listNamePano)
//         })
//     })
// };

// Récupère dans la base tout les capteurs
module.exports.getAllPuce = function (callback) {
    var puceList = []
    pucesCollection.find(function (err, puces) {
        puces.forEach(puce => {
            puceList.push(puce)
        })
        if (err) return callback(err, null)
        callback(null, puceList)
    })
}
// Récupère tout les panoramas à ajouter
// Compare les dossiers présents dans la base (mais qui ne sont pas liés)
// Avec les dossiers de panoramas récupèrer grace à la fonction allDirToAdd
// Si le panorama n'est pas encore enregistré, on crée un nouvel objet panosCollection
// qu'on ajoute à la liste des panoramas à ajouter.
// Utilise un callback afin de transmettre les données à l'interface sans soucis d'asynchronisme
module.exports.getAllPano = function (callback) {
    var foldersList = admin_functions.allDirToAdd()
    var namePanoInBase = []
    var panoToAddList = []
    var panoAdded = []
    var lastID = 1
    panosCollection.find(function (err, panos) {

        pucesCollection.find().populate('panos').exec(function (err, puces) {
            puces.forEach(puce => {
                puce.panos.forEach(pano => {
                    panoAdded.push(pano.numPano)
                })
            })
            panos.forEach(pano => {
                if (lastID <= pano.numPano) {
                    lastID = pano.numPano + 1
                }
                namePanoInBase.push(pano.namePano)
                if (panoAdded.indexOf(pano.numPano) == -1) {
                    panoToAddList.push(pano)
                }
            })
            foldersList.forEach(namePano => {
                if (namePanoInBase.indexOf(namePano) == -1) {
                    var newPano = new panosCollection({
                        numPano: lastID,
                        namePano: namePano
                    })
                    panoToAddList.push(newPano)
                }
            })

            if (err) return callback(err, null)
            callback(null, panoToAddList)
        })
    })
}

// Cherche le capteur et le panorama correspondants aux paramètres recus
// Si le panorama n'existe pas, on le crée, on l'ajoute au capteur
// on ajoute le capteur au panorama et on enregistre le capteur et le panorama dans la base
// (équivalent à un update pour le capteur)
// Sinon, on ajoute simplement le panorama à la liste des panoramas du capteur,
// le capteur dans le champ 'puce' du panorama et on les enregistre (= update)
module.exports.saveNewLink = function (numPuce, numPano, namePano) {
    panosCollection.findOne({
        numPano: numPano
    }, function (err, pano) {
        pucesCollection.findOne({ numPuce: numPuce}, function (err, puce) {
            if (pano == null) {
                var newPano = new panosCollection({
                    namePano: namePano,
                    numPano: numPano
                })
                puce.panos.push(newPano)
                newPano.puce = puce
                newPano.save(function (err) {
                    if (err) return handleError(err);
                })
                puce.save(function (err) {
                    if (err) return handleError(err);
                })
            } else {
                puce.panos.push(pano)
                pano.puce = puce

                pano.save(function (err) {
                    if (err) return handleError(err);
                })
                puce.save(function (err) {
                    if (err) return handleError(err);
                })
            }

        })
    })
}
// Supprime le champ "puce" du panorama et le panorama du tableau de panoramas du capteur
module.exports.deleteLink = function (numPuce, numPano) {
    panosCollection.findOne({
        numPano: numPano
    }, function (err, pano) {
        pucesCollection.findOne({
            numPuce: numPuce
        }, function (err, puce) {
            puce.panos.splice(puce.panos.indexOf(pano._id), 1)
            pano.puce = undefined
            puce.save(function (err) {
                if (err) return handleError(err);
            })
            pano.save(function (err) {
                if (err) return handleError(err);
            })
        })
    })
}
// Recois en paramètre le numéro du nouveau capteur, du capteur actuel et du panorama
// supprime le panorama du tableau de l'ancien capteur,
// ajoute le panorama au tableau du nouveau capteur
// modifie le capteur(champ 'puce') du panorama
// enregistre les trois documents (= update)
module.exports.changeLink = function (numPuce, numPano, numPuceToDelete) {
    panosCollection.findOne({
        numPano: numPano
    }, function (err, pano) {
        pucesCollection.findOne({
            numPuce: numPuce
        }, function (err, puceToAdd) {
            pucesCollection.findOne({
                numPuce: numPuceToDelete
            }, function (err, puceToChange) {
                puceToChange.panos.splice(puceToChange.panos.indexOf(pano._id), 1)
                pano.puce = puceToAdd
                puceToAdd.panos.push(pano)
                puceToChange.save(function (err) {
                    if (err) return handleError(err);
                })
                pano.save(function (err) {
                    if (err) return handleError(err);
                })
                puceToAdd.save(function (err) {
                    if (err) return handleError(err);
                })
            })
        })
    })
}
// Renvoie les panoramas (tableau d'objets json) du capteur dont le nom est passé en paramètre
// Récupère le capteur selectionné,
// récupère les différents élement correspond aux IDs contenus dans le tableau panos
// envoie la liste des panoramas et le numéro de capteur au serveur grâce à une callback
module.exports.getPanoPerPuceName = function (namePuce, callback) {
    pucesCollection
        .findOne({
            namePuce: namePuce
        })
        .populate("panos")
        .exec(function (err, puce) {
            if (err) return callback(err, null)
            callback(null, puce.panos, puce.numPuce)
        })
}
// Renvoie les panoramas (tableau d'objets json) du capteur dont le numéro est passé en paramètre
// Récupère le capteur selectionné,
// récupère les différents élement correspond aux IDs contenus dans le tableau panos
// envoie la liste des panoramas et le numéro de capteur au serveur grâce à une callback
module.exports.getPanoPerPuceNum = function (numPuce, callback) {
    pucesCollection
        .findOne({
            numPuce: numPuce
        })
        .populate("panos")
        .exec(function (err, puce) {
            if (err) return callback(err, null)
            callback(null, puce.panos)
        })
}