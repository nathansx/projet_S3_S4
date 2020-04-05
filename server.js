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
var mongo_functions = require("./project_modules/mongo_mod")
var connection = require("./project_modules/mongo_mod").connectDB;
var insertLien = require("./project_modules/mongo_mod").insertData;
var dropLien = require("./project_modules/mongo_mod").removeLien;
var foldersList = require("./project_modules/mongo_mod").foldersList;
var allToDisplay = require("./project_modules/mongo_mod").getAllToDisplay
var allPuce = require("./project_modules/mongo_mod").getAllPuce
var allPano = require("./project_modules/mongo_mod").getAllPano
var saveLink = require("./project_modules/mongo_mod").saveNewLink


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
app.get("/", function (req, res) {
    res.render("admin");
});
app.get("/menu", function (req, res) {

    res.render("index");
});
app.get("/visite", function (req, res) {
    res.render("visite");
});



app.get("/adminMenu", function (req, res) {
    res.render("admin");
});
app.get("/getFolders", function (req, res) {
    var myString = "<option value=''>Selectionnez un panorama</option>"
    allPano(function (err, panoList) {
        panoList.forEach(pano => {
            myString += "<option value='" + pano.numPano + "'>" + pano.namePano + "</option>"
        })
        res.send(myString)
    })
})
app.get("/getPuces", function (req, res) {
    var myString = "<option value=''>Selectionnez un capteur</option>"
    allPuce(function (err, puceList) {
        puceList.forEach(puce => {
            myString += "<option value='" + puce.numPuce + "'>" + puce.namePuce + "</option>"
        })
        res.send(myString)
    })
})
app.post("/saveNewLink", function (req, res) {
    var numPuce = req.body.numPuce
    var numPano = req.body.numPano


    saveLink(numPuce, numPano)
})
app.post("/deleteLink", function (req, res) {
    mongo_functions.deleteLink(req.body.numPuce, req.body.numPano)

})
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
app.post("/changeLink", function (req, res) {
    var numPuce = req.body.numPuce
    var numPano = req.body.numPano
    var numPuceToDelete = req.body.numPuceToDelete
    mongo_functions.changeLink(numPuce, numPano, numPuceToDelete)
})
app.post("/getPanoWithPuceNum", function (req, res) {
    var numPuce = req.body.numPuce
    var myString = "<option value=''>Selectionnez un panorama</option>"
    mongo_functions.getPanoPerPuceNum(numPuce, function(err, panosList){
        panosList.forEach(pano => {
            myString += "<option value='" + pano.numPano + "'>" + pano.namePano + "</option>"
        })
        res.send(myString)
    })
})

app.get("/ajout", function (req, res) {
    var allDirToAdd = admin_function.allDirToAdd();
    // res.send(allDirToAdd)
    res.render("ajout", {
        folders: allDirToAdd
    });
});

app.post("/ajout", function (req, res) {
    var folderName = req.body.newFolder;
    var puce = req.body.puce;
    var allDirToAdd = admin_function.allDirToAdd();
    if (folderName != "" || puce != "") {
        admin_function.changeDirectoryToActif(folderName);
        insertLien(puce, folderName);
    }
    res.render("ajout", {
        folders: allDirToAdd
    });
});

var numPuce = ""
app.post("/pce", function (req, res) {

    numPuce = req.body.numPuce
    foldersList(numPuce, function (err, foldersList) {
        var myString
        foldersList.forEach(folderName => {
            myString += "<option value='" + folderName + "'>" + folderName + "</option>"
        });
        res.send(myString);
        // res.render("suppr", {folders: data}, function(err, html) {
        //     res.redirect("/suppr");
        // });
    })
})

app.get("/suppr", function (req, res) {
    // foldersList(numPuce, function (err, data) {
    res.render("suppr") //, {folders: data});
    // })
});

app.post("/suppr", function (req, res) {
    var folderName = req.body.folderToDelete;

    admin_function.changeDirectoryToDelete(folderName);
    dropLien(folderName)

    foldersList(numPuce, function (err, data) {
        res.render("suppr", {
            folders: data
        });
    })
});


// Démarrage du serveur
connection();
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