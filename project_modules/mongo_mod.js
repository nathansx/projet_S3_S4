var mongoose = require("mongoose");
var liensCollection = require("./models/liens").liens;
var panosCollection = require("./models/panoramas").panos;
var sensorsCollection = require("./models/capteurs").sensors;
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

// Récupère dans la base tout les capteurs
module.exports.getAllSensor = function (callback) {
    var sensorList = []
    sensorsCollection.find(function (err, sensors) {
            sensors.forEach(sensors => {
                sensorList.push(sensors)
            })

        })
        .sort({
            numSensor: 1
        })
        .exec(function (err, sensors) {
            if (err) return callback(err, null)
            callback(null, sensors)
        })

}
// Récupère tout les panoramas à ajouter
// Compare le tableau des noms des panoramas ne possédant pas de champ 'sensors'
// Avec celui des noms de dossiers de panoramas récupèrés grace à la fonction allDirToAdd
// Si le nom de dossier n'est pas indéxé dans le tableau des panoramas déjà liés,
// on crée un nouvel objet panosCollection
// qu'on ajoute à la liste des panoramas à ajouter.
// Utilise un callback afin de transmettre les données à l'interface sans soucis d'asynchronisme
module.exports.getAllPano = function (callback) {
    var foldersList = admin_functions.allDirToAdd()
    var namePanoInBase = []
    var panoToAddList = []
    panosCollection.find() // récupère tout les panos de la base
        .populate("sensors")
        .exec(function (err, panos) {
            if (err) return handleError(err);
            panos.forEach(pano => {
                namePanoInBase.push(pano.namePano)

                if (pano.sensor == undefined) { // Si le pano n'est pas lié
                    panoToAddList.push(pano)
                }
            });
            foldersList.forEach(folderName => {
                if (namePanoInBase.indexOf(folderName) == -1) { // si le pano n'est pas dans la base
                    var newPano = new panosCollection({
                        numPano: folderName.split('_')[folderName.split('_').length - 1],
                        namePano: folderName
                    })
                    panoToAddList.push(newPano)
                }
            })

            if (err) return callback(err, null)
            callback(null, panoToAddList)
        })
}

// Cherche le capteur et le panorama correspondants aux paramètres recus
// Si le panorama n'existe pas, on le crée, on l'ajoute au capteur
// on ajoute le capteur au panorama et on enregistre le capteur et le panorama dans la base
// (équivalent à un update pour le capteur)
// Sinon, on ajoute simplement le panorama à la liste des panoramas du capteur,
// le capteur dans le champ 'sensor' du panorama et on les enregistre (= update)
module.exports.saveNewLink = function (numSensor, numPano, namePano) {
    panosCollection.findOne({
        numPano: numPano
    }, function (err, pano) {
        sensorsCollection.findOne({
            numSensor: numSensor
        }, function (err, sensor) {
            if (pano == null) { //si le pano n'est pas encore dans la base
                var newPano = new panosCollection({
                    namePano: namePano,
                    numPano: namePano.split('_')[namePano.split('_').length - 1]
                })

                sensor.panos.push(newPano)
                newPano.sensor = sensor
                newPano.save(function (err) {
                    if (err) return handleError(err);
                })
                sensor.save(function (err) {
                    if (err) return handleError(err);
                })
            } else {
                sensor.panos.push(pano)
                pano.sensor = sensor

                pano.save(function (err) {
                    if (err) return handleError(err);
                })
                sensor.save(function (err) {
                    if (err) return handleError(err);
                })
            }
        })
    })
}
// Supprime le champ "sensor" du panorama et le panorama du tableau de panoramas du capteur
module.exports.deleteLink = function (numSensor, numPano) {
    panosCollection.findOne({
        numPano: numPano
    }, function (err, pano) {
        sensorsCollection.findOne({
            numSensor: numSensor
        }, function (err, sensors) {
            sensors.panos.splice(sensors.panos.indexOf(pano._id), 1)
            pano.sensor = undefined
            sensors.save(function (err) {
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
// modifie le capteur(champ 'sensor') du panorama
// enregistre les trois documents (= update)
module.exports.changeLink = function (numSensor, numPano, numSensorToDelete) {
    panosCollection.findOne({
        numPano: numPano
    }, function (err, pano) {
        sensorsCollection.findOne({
            numSensor: numSensor
        }, function (err, sensorToAdd) {
            sensorsCollection.findOne({
                numSensor: numSensorToDelete
            }, function (err, sensorToChange) {
                sensorToChange.panos.splice(sensorToChange.panos.indexOf(pano._id), 1)
                pano.sensor = sensorToAdd
                sensorToAdd.panos.push(pano)
                sensorToChange.save(function (err) {
                    if (err) return handleError(err);
                })
                pano.save(function (err) {
                    if (err) return handleError(err);
                })
                sensorToAdd.save(function (err) {
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
module.exports.getPanoWithSensorName = function (nameSensor, callback) {
    sensorsCollection
        .findOne({
            nameSensor: nameSensor
        })
        .populate("panos")
        .exec(function (err, sensor) {
            if (err) return callback(err, null)
            if (sensor.panos == null) {
                callback(null, [], sensor.numSensor)
            } else {
                callback(null, sensor.panos, sensor.numSensor)
            }
        })
}
// Renvoie les panoramas (tableau d'objets json) du capteur dont le numéro est passé en paramètre
// Récupère le capteur selectionné,
// récupère les différents élement correspond aux IDs contenus dans le tableau panos
// envoie la liste des panoramas et le numéro de capteur au serveur grâce à une callback
module.exports.getPanoWithSensorNum = function (numSensor, callback) {
    sensorsCollection
        .findOne({
            numSensor: numSensor
        })
        .populate("panos")
        .exec(function (err, sensor) {
            if (err) return callback(err, null)
            callback(null, sensor.panos)
        })
}

module.exports.getPanoBySensor = function (numSensor, callback) {
    sensorsCollection.find({
            numSensor: numSensor
        })
        .populate('panos')
        .exec(function (err, sensor) {
            callback(null, sensor.panos)
        })
}