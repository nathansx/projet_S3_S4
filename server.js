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
var admin_function = require("./project_modules/admin_mod");
var liensCollection = require("./project_modules/models/liens").liens;
var panosCollection = require("./project_modules/models/panoramas").panos;
var connection = require("./project_modules/mongo_mod").connectDB;
var insertLien = require("./project_modules/mongo_mod").insertData;
var dropLien = require("./project_modules/mongo_mod").removeLien;
var foldersList = require("./project_modules/mongo_mod").foldersList;

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

// Récupération du fichier html
app.get("/", function(req, res) {
    res.render("index");
});
app.get("/menu", function(req, res) {
    res.render("index");
});
app.get("/visite", function(req, res) {
    res.render("visite");
});
app.get("/adminMenu", function(req, res) {
    res.render("adminMenu");
});

app.get("/ajout", function(req, res) {
    var allDirToAdd = admin_function.allDirToAdd();
    res.render("ajout", {
        folders: allDirToAdd
    });
});

app.post("/ajout", function(req, res) {
    var folderName = req.body.newFolder;
    var puce = req.body.puce;
    var allDirToAdd = admin_function.allDirToAdd();

    // admin_function.changeDirectoryToActif(folderName);
    insertLien(puce, folderName);

    res.render(
        "ajout",
        {
            folders: allDirToAdd
        },
        function(err, html) {
            res.redirect("/adminMenu");
        }
    );
});

var numPuce = ""
app.post("/pce", function (req, res) { 
    numPuce = req.body.numPuce
    foldersList(numPuce, function (err, data) {
        res.render("suppr", {folders: data}, function(err, html) {
            res.redirect("/suppr");
        });
     })
})

app.get("/suppr", function(req, res) {
    foldersList(numPuce, function (err, data) {
        res.render("suppr", {folders: data});
     })
});

app.post("/suppr", function(req, res) {
    var folderName = req.body.folderToDelete;

    // admin_function.changeDirectoryToDelete(folderName);
    // dropLien(folderName)

    foldersList(numPuce, function (err, data) {
        res.render("suppr", {folders: data});
     })
});

// Démarrage du serveur
connection();
server.listen(process.env.PORT || 8081);

var lecteur = 0;

// Initialisation du port série, afin de récupérer les données de l'Arduino
var port = new SerialPort(ArduinoSerial, {
    BaudRate: 9600,
    Parser: new SerialPort.parsers.Readline("\n"),
    autoOpen: false
});

port.open(function(err) {
    if (err) {
        return console.log("Error opening port: ", err.message);
    }
});

/*
  Ecoute permanente des données transmises par la carte Arduino.
  Chaque donnée reçue est transmise au client (page HTML) qui contrôle le lecteur de panoramas
*/
port.on("open", function() {
    console.log("open");
    port.on("readable", function() {
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
