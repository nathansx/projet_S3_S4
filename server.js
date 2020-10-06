/*
  Ce fichier est le serveur qui va lier la page web envoyée au navigateur
  et les données transmises par la carte Arduino
*/
"use strict";

// Constante à modifier selon le port série où est branchée la carte Arduino
const ArduinoSerial = "COM3";
const DossierData = "/Panoramadata";

// Récupération des modules nécessaires
var express = require("express");
var app = express();
var SerialPort = require("serialport");
var http = require("http");
var server = http.createServer(app);
var bodyParser = require("body-parser");
var io = require("socket.io").listen(server);
var ejs = require("ejs");
// récupération de module pour communiquer avec la bdd
var mongo_functions = require("./project_modules/mongo_mod")


// Mise en place de l'application Express, qui va afficher la page web
app.use(DossierData, express.static(process.cwd() + DossierData));
app.use(express.static(process.cwd() + "/assets"));
app.use(bodyParser.urlencoded({extended: false}));
app.set("view engine", "ejs");

// --------------- ROUTAGE DU SERVEUR ---------------
// --- Routes principales
// page d'accueil/administration
app.get("/", function (req, res) {
    res.render("admin");
});
app.get("/menu", function (req, res) {
    res.render("admin");
});
// vue gérée par Panotour
app.get("/visite", function (req, res) {
    res.render("visite");
});

// --- Routes secondaires
// Permettent l'échange de données client-serveur

// renvoie la liste des dossiers à ajouter
app.get("/getFolders", function (req, res) {
    mongo_functions.getAllPanoToAdd(function (err, panoList) {
        res.send(panoList)
    })
})

// renvoie la liste des capteurs
app.get("/getSensors", function (req, res) {
    mongo_functions.getAllSensor(function (err, sensorList) {
        res.send(sensorList)
    })
})
// Sauvegarde un nouveau lien capteur/pano
app.post("/saveNewLink", function (req, res) {
    mongo_functions.saveNewLink(req.body.numSensor, req.body.numPano, req.body.namePano)
})
// Supprime un lien
app.post("/deleteLink", function (req, res) {
    mongo_functions.deleteLink(req.body.numSensor, req.body.numPano)

})
// route utilisée lorsque le num du capteur n'est pas accessible
// renvoie la liste des panos liés au capteur ainsi que son numéro
app.post("/getPanoWithSensorName", function (req, res) {
    mongo_functions.getPanoWithSensorName(req.body.nameSensor, function (err, panosList, numSensor) {
        res.send({panoList: panosList,numSensor: numSensor})
    })
})
// Modifie un lien lien
app.post("/changeLink", function (req, res) {
    mongo_functions.changeLink(req.body.numSensor, req.body.numPano, req.body.numSensorToDelete)
})
// renvoie la liste des panos liés au capteur
app.post("/getPanoBySensor", function (req, res) {
    mongo_functions.getPanoBySensor(req.body.numSensor, function (err, panosList) {
        res.send(panosList)
    })
})

// Démarrage du serveur et ouvre la connexion à la bdd
server.listen(process.env.PORT || 8080);
mongo_functions.connectDB();

// --------------- GESTION DES DETECTIONS ---------------
var lecteur = 0;

// Initialisation du port série, afin de récupérer les données de l'Arduino
var port = new SerialPort(ArduinoSerial, {
    BaudRate: 9600,
    Parser: new SerialPort.parsers.Readline("\n"),
    autoOpen: false
});

port.open(function (err) {
    if (err) {
        return console.log("Error opening port: ", err.message);
    }
});

/*
  Ecoute permanente des données transmises par la carte Arduino.
  Chaque donnée reçue est transmise au client (page HTML) qui contrôle le lecteur de panoramas
*/
port.on("open", function () {
    console.log("open");
    port.on("readable", function () {

        var buffer = port.read();
        if (buffer != null) {
            console.log("Lecteur : ", buffer[0] - 47);
            console.log("Data : ", buffer.slice(1).join(" "));
            lecteur = buffer[0] - 47;
            console.log(lecteur);
            io.sockets.emit("message", lecteur);
            port.read();
            port.read();
            port.read();
            port.read();
            port.read();
            port.read();

        }
    });
});