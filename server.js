/*
  Ce fichier est le serveur qui va lier la page web envoyée au navigateur
  et les données transmises par la carte Arduino
*/
"use strict";

// Constante à modifier selon le port série où est branchée la carte Arduino
const ArduinoSerial = "COM1";
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
    var myString = "<option value=''>Selectionnez un panorama</option>"
    mongo_functions.getAllPano(function (err, panoList) {
        panoList.forEach(pano => {
            myString += "<option value='" + pano.numPano + "'>" + pano.namePano + "</option>"
        })
        res.send(myString)
    })
})
// Permet de créer et d'envoyer à l'interface une liste d'elements <option> contenant les différents capteurs
app.get("/getPuces", function (req, res) {
    var myString = "<option value=''>Selectionnez un capteur</option>"
    mongo_functions.getAllPuce(function (err, puceList) {
        puceList.forEach(puce => {
            myString += "<option value='" + puce.numPuce + "'>" + puce.namePuce + "</option>"
        })
        res.send(myString)
    })
})
// Récupère les données envoyées depuis l'interface afin de créer un nouveau lien à l'aide de la fonction saveNewLink (cf /project_modules/mongo_mod.js)
app.post("/saveNewLink", function (req, res) {
    var numPuce = req.body.numPuce
    var numPano = req.body.numPano
    var namePano = req.body.namePano
    mongo_functions.saveNewLink(numPuce, numPano, namePano)
})
// Appelle la fonction deleteLink du module mongo_mod.js avec en paramètres les données envoyées par l'interface
app.post("/deleteLink", function (req, res) {
    mongo_functions.deleteLink(req.body.numPuce, req.body.numPano)

})
// Reçoit un nom de capteur qui permet de récuperer les panoramas liés à celui-ci
app.post("/getPanoWithPuceName", function (req, res) {
    var namePuce = req.body.namePuce
    var myString = "<option value=''>Selectionnez un panorama</option>"
    mongo_functions.getPanoPerPuceName(namePuce, function (err, panosList, numPuce) {
        panosList.forEach(pano => {
            myString += "<option value='" + pano.numPano + "'>" + pano.namePano + "</option>"
        })
        var hideInput = "<input id='numPuce' name='numPuce' type='hidden' value='" + numPuce + "'>"
        res.send({
            myString: myString,
            hideInput: hideInput
        })
    })
})
// Reçoit en requête un numéro de capteur et un numéro de panorama permettant de créer un nouveau lien
app.post("/changeLink", function (req, res) {
    var numPuce = req.body.numPuce
    var numPano = req.body.numPano
    var numPuceToDelete = req.body.numPuceToDelete
    mongo_functions.changeLink(numPuce, numPano, numPuceToDelete)
})
// Reçoit un numéro de capteur qui permet de renvoyer une liste d'élements <option> 
// contenant les panoramas liés à celui-ci
app.post("/getPanoWithPuceNum", function (req, res) {
    var numPuce = req.body.numPuce
    var myString = "<option value=''>Selectionnez un panorama</option>"
    mongo_functions.getPanoPerPuceNum(numPuce, function (err, panosList) {
        panosList.forEach(pano => {
            myString += "<option value='" + pano.numPano + "'>" + pano.namePano + "</option>"
        })
        res.send(myString)
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
        var buffer = port.read(5);
        if (buffer != null) {
            console.log("Lecteur : ", buffer[0]);
            console.log("Data : ", buffer.slice(1).join(" "));
            lecteur = buffer[0];
            console.log("emission");
            io.sockets.emit("message", lecteur);
        }
    });
});