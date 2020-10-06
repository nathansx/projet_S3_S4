const fs = require("fs");

// Récupère la liste des dossiers à ajouter présents dans le dossier /Panoramadata
module.exports.allDirToAdd = function () {
    const myPath = __dirname + "/../Panoramadata/";
    var dossiersPermanents = ['fichiersDonnees', 'graphics', 'lib', 'sounds', 'spots']
    var toutLesDossiers = [];
    const isDirectory = source => fs.lstatSync(myPath + source).isDirectory();
    const getDirectories = source => fs.readdirSync(source).filter(isDirectory);
    getDirectories(myPath).forEach(folder => {
        if (dossiersPermanents.indexOf(folder) == -1) {
            toutLesDossiers.push(folder);
        }
    })
    return toutLesDossiers;
};