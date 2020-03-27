/*
  Ce fichier est le serveur qui va lier la page web envoyée au navigateur
  et les données transmises par la carte Arduino
*/
'use strict';

// Constante à modifier selon le port série où est branchée la carte Arduino
const ArduinoSerial = "COM1"
const DossierData = "/Panoramadata"

// Récupération des modules nécessaires
var express = require('express');
var app = express();
var SerialPort = require("serialport");
var http = require('http');
var server = http.createServer(app);
var bodyParser = require('body-parser')
var io = require('socket.io').listen(server);
var ejs = require('ejs');
var admin_function = require('./project_modules/admin_mod')

// Mise en place de l'application Express, qui va afficher la page web
// '/Geodiversite4data' A CHANGER SI LE NOM DU DOSSIER CHANGE
app.use(DossierData, express.static(process.cwd() + DossierData));
app.use(express.static(process.cwd() + '/assets'))
app.use(bodyParser.urlencoded({
  extended: false
}))
app.set('view engine', 'ejs');

// Récupération du fichier html
app.get('/', function (req, res) {
  res.render('index');
});
app.get('/menu', function (req, res) {
  res.render('index');
});
app.get('/visite', function (req, res) {
  res.render('visite');
});
app.get('/adminMenu', function (req, res) {
  res.render('adminMenu');
});

app.get('/ajout', function (req, res) {
  var e = admin_function.panoListAndLastId()  
  res.render('ajout', {
    folders : e.dossiersARenommer
  });  
});

app.post('/ajout', function (req, res) {
  var nouvelleDonnees = []
  var e = admin_function.panoListAndLastId()
  nouvelleDonnees.push(req.body)
  var newFolderName = nouvelleDonnees[0].newFolder
  var num_puce = nouvelleDonnees[0].puce
  // console.log(newFolderName);
  console.log(e.biggestId + 1);
  // console.log(req.body);
  
  var IDToAdd = e.biggestId + 1
  admin_function.renameFolder(newFolderName, IDToAdd)
  admin_function.addPano(num_puce, IDToAdd)
  res.render('ajout', {
    folders : e.dossiersARenommer
  }, function (err, html) { // fonction callback pour rafraichir le select
    res.redirect('/adminMenu')
  })
})

app.get('/suppr', function (req, res) {
  var e = admin_function.getAllDirectories()
  res.render('suppr', {
    foldersName : e.nameAllDir,
    foldersFullName : e.allDir
  });
});

app.post('/suppr', function(req, res){
  var e = admin_function.getAllDirectories()
  var dirToDelete = req.body.folderToDelete
  // console.log(dirToDelete);
  
  admin_function.deletePano(dirToDelete)
  res.render('suppr', {
    foldersName : e.nameAllDir,
    foldersFullName : e.allDir
  }, function (err, html) { // fonction callback pour rafraichir le select
    res.redirect('/suppr')
  })
})
// Démarrage du serveur
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
    return console.log('Error opening port: ', err.message);
  }
});

/*
  Ecoute permanente des données transmises par la carte Arduino.
  Chaque donnée reçue est transmise au client (page HTML) qui contrôle le lecteur de panoramas
*/
port.on("open", function () {
  console.log('open');
  port.on('readable', function () {

    var buffer = port.read(5);
    if (buffer != null) {
      console.log('Lecteur : ', buffer[0]);
      console.log('Data : ', buffer.slice(1).join(' '));
      lecteur = buffer[0];
      console.log("emission");
      io.sockets.emit('message', lecteur);

    }

  });
});