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
var mongo_functions = require("./project_modules/mongo_mod") // permet d'utiliser les fonctions du module


// Mise en place de l'application Express, qui va afficher la page web
// '/Geodiversite4data' A CHANGER SI LE NOM DU DOSSIER CHANGE
app.use(DossierData, express.static(process.cwd() + DossierData));
app.use(express.static(process.cwd() + "/assets"));
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.set("view engine", "ejs");

// Routes principales
app.get("/", function (req, res) {
    res.render("admin"); // ex: permet d'afficher la vue admin.ejs
});
app.get("/menu", function (req, res) {
    res.render("admin");
});
app.get("/visite", function (req, res) {
    res.render("visite");
});

// Routes secondaires
// Permettent l'échange de données client-serveur

//Permet de créer et d'envoyer à linterface une liste d'elements <option> contenant les panoramas à ajouter
app.get("/getFolders", function (req, res) {
    mongo_functions.getAllPano(function (err, panoList) {
        res.send(panoList)
    })
})
// Permet de créer et d'envoyer à l'interface une liste d'elements <option> contenant les différents capteurs
app.get("/getSensors", function (req, res) {
    mongo_functions.getAllSensor(function (err, sensorList) {
        res.send(sensorList)
    })
})
// Récupère les données envoyées depuis l'interface afin de créer un nouveau lien à l'aide de la fonction saveNewLink (cf /project_modules/mongo_mod.js)
app.post("/saveNewLink", function (req, res) {
    mongo_functions.saveNewLink(req.body.numSensor, req.body.numPano, req.body.namePano)
})
// Appelle la fonction deleteLink du module mongo_mod.js avec en paramètres les données envoyées par l'interface
app.post("/deleteLink", function (req, res) {
    mongo_functions.deleteLink(req.body.numSensor, req.body.numPano)

})
// Reçoit un nom de capteur qui permet de récuperer les panoramas liés à celui-ci
app.post("/getPanoWithSensorName", function (req, res) {
    var nameSensor = req.body.nameSensor
    mongo_functions.getPanoWithSensorName(nameSensor, function (err, panosList, numSensor) {
        var hideInput = "<input id='numSensor' name='numSensor' type='hidden' value='" + numSensor + "'>"
        res.send({
            panoList: panosList,
            hideInput: hideInput
        })
    })
})
// Reçoit en requête un numéro de capteur et un numéro de panorama permettant de créer un nouveau lien
app.post("/changeLink", function (req, res) {
    var numSensor = req.body.numSensor
    var numPano = req.body.numPano
    var numSensorToDelete = req.body.numSensorToDelete
    mongo_functions.changeLink(numSensor, numPano, numSensorToDelete)
})
// Reçoit un numéro de capteur qui permet de renvoyer une liste d'élements <option> 
// contenant les panoramas liés à celui-ci
app.post("/getPanoWithSensorNum", function (req, res) {
    var numSensor = req.body.numSensor
    mongo_functions.getPanoWithSensorNum(numSensor, function (err, panosList) {
        res.send(panosList)
    })
})
app.post("/getLinks", function (req, res) {
    var numSensor = req.body.numSensor
    mongo_functions.getPanoBySensor(numSensor, function (err, panos) {
        res.send(panos)
    })
})

// Démarrage du serveur et ouvre la connexion à la bdd
mongo_functions.connectDB();
server.listen(process.env.PORT || 8080);

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