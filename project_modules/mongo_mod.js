var mongoose = require("mongoose");
var panosCollection = require("./models/panoramas").panos;
var sensorsCollection = require("./models/capteurs").sensors;
var admin_functions = require('./admin_mod')

// Ouvre la connexion à la bdd
module.exports.connectDB = function () {
    // lien de connexion à la bdd
    var mongoDB = "mongodb://127.0.0.1:27017/projet_S3_S4";
    mongoose.connect(mongoDB, {useNewUrlParser: true});

    //Get the default connection
    var db = mongoose.connection;

    //Bind connection to error event (to get notification of connection errors)
    db.on("error", console.error.bind(console, "MongoDB connection error:"));
};

// Récupère tous les capteurs dans la base
// Utilise une callback afin de transmettre les données à l'interface sans soucis d'asynchronisme
module.exports.getAllSensor = function (callback) {
    var sensorList = []
    sensorsCollection.find(function (err, sensors) {
            sensors.forEach(sensors => {
                sensorList.push(sensors)
            })
        })
        // Trie les capteurs sur leur numéro
        .sort({numSensor: 1})
        .exec(function (err, sensors) {
            if (err) return callback(err, null)
            callback(null, sensors)
        })
}
// Récupère tous les panoramas à ajouter
// Ceux de la base qui n'ont pas de champ "sensor" (non-liés)
// Ceux du dossiers /Panoramata qui ne sont pas dans la base
// Utilise une callback afin de transmettre les données à l'interface sans soucis d'asynchronisme
module.exports.getAllPanoToAdd = function (callback) {
    // récupère tout les dossiers dans /Panoramadata
    var foldersList = admin_functions.allDirToAdd()
    var namePanoInBase = []
    var panoToAddList = [] 
    panosCollection.find()
        .exec(function (err, panos) {
            if (err) return handleError(err);
            panos.forEach(pano => {
                // Récupère tout les panos de la base
                namePanoInBase.push(pano.namePano)
                if (pano.sensor == undefined) {
                    // Si le pano n'est lié à aucun capteur
                    panoToAddList.push(pano)
                }
            });
            // Compare les tableaux des panos dans le dossiers et ceux dans la base
            foldersList.forEach(folderName => {
                // Si le pano n'est pas encore dans la base
                // On crée un objet pano pour l'ajouter à la liste des panos à ajouter
                if (namePanoInBase.indexOf(folderName) == -1) {
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

// Sauvegarde un nouveau lien
module.exports.saveNewLink = function (numSensor, numPano, namePano) {
    panosCollection.findOne({
        numPano: numPano
    }, function (err, pano) {
        sensorsCollection.findOne({
            numSensor: numSensor
        }, function (err, sensor) {
            // Si le pano n'est pas encore dans la base
            if (pano == null) {
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

// Supprime un lien
module.exports.deleteLink = function (numSensor, numPano) {
    panosCollection.findOne({
        numPano: numPano
    }, function (err, pano) {
        sensorsCollection.findOne({
            numSensor: numSensor
        }, function (err, sensors) {
            // Supprime le panos de la liste
            sensors.panos.splice(sensors.panos.indexOf(pano._id), 1)
            // Supprime le champ "sensor"
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

// Modifie un lien
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
                // Supprime le pano de la liste de l'ancien capteur
                sensorToChange.panos.splice(sensorToChange.panos.indexOf(pano._id), 1)
                // Modifie le champ "sensor" avec le nouveau capteur
                pano.sensor = sensorToAdd
                // Ajoute le pano dans la liste du nouveau capteur
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

// Recupère la liste des panoramas et le numéro de capteur au serveur grâce à une callback
module.exports.getPanoWithSensorName = function (nameSensor, callback) {
    sensorsCollection
        .findOne({
            nameSensor: nameSensor
        })
        .populate("panos") // récupère l'objet correspondant à l'objectID
        .exec(function (err, sensor) {
            if (err) return callback(err, null)
            if (sensor.panos == null) {
                callback(null, [], sensor.numSensor)
            } else {
                callback(null, sensor.panos, sensor.numSensor)
            }
        })
}

// Recupère la liste des panoramas et le numéro de capteur au serveur grâce à une callback
module.exports.getPanoBySensor = function (numSensor, callback) {
    sensorsCollection.findOne({
            numSensor: numSensor
        })
        .populate("panos")
        .exec(function (err, sensor) {
            if (err) return callback(err, null)
            if (sensor.panos == null) {
                callback(null, [])
            } else { 
                callback(null, sensor.panos)
            }
        })
}