const fs = require("fs");
const fs_extra = require("fs-extra");

// récupère la liste des dossiers à ajouter
// présents dans le dossier "panoramaToAdd"
module.exports.allDirToAdd = function() {
    const myPath = __dirname + "/../Panoramadata/panoramaToAdd/";
    var toutLesDossiers = [];
    // Récupère tout les sous dossiers
    const isDirectory = source => fs.lstatSync(myPath + source).isDirectory();
    const getDirectories = source => fs.readdirSync(source).filter(isDirectory);
    toutLesDossiers.push(getDirectories(myPath));
    return toutLesDossiers[0];
};

// récupère la liste des dossiers à supprimer
// présents dans le dossier "panoramaActif"
module.exports.allDirToDelete = function() {
    const myPath = __dirname + "/../Panoramadata/panoramaActif/";
    var toutLesDossiers = [];
    // Récupère tout les sous dossiers
    const isDirectory = source => fs.lstatSync(myPath + source).isDirectory();
    const getDirectories = source => fs.readdirSync(source).filter(isDirectory);
    toutLesDossiers.push(getDirectories(myPath));
    return toutLesDossiers[0];
};

// Déplace (copie et supprime) le dossier choisi
// vers dans le dossier des panoramas actifs
module.exports.changeDirectoryToActif = function(namePano) {
    var newPanoFolder =
        __dirname + "/../Panoramadata/panoramaToAdd/" + namePano + "/";
    var activPanoFolder =
        __dirname + "/../Panoramadata/panoramaActif/" + namePano + "/";

    fs_extra
        .copy(newPanoFolder, activPanoFolder)
        .then(() => console.log("copy success!"))
        .then(() =>
            fs_extra.remove(newPanoFolder, err => {
                if (err) return console.error(err);

                console.log("remove success!"); // I just deleted my entire HOME directory.
            })
        )
        .catch(err => console.error(err));
};

// Déplace (copie et supprime) le dossier choisi
// vers le dossier des panoramas supprimés (corbeille)
module.exports.changeDirectoryToDelete = function(namePano) {
    var panoFolderToDelete =
        __dirname + "/../Panoramadata/panoramaActif/" + namePano + "/";
    var folderToDelete =
        __dirname + "/../Panoramadata/panoramaToDelete/" + namePano + "/";

    fs_extra
        .copy(panoFolderToDelete, folderToDelete)
        .then(() => console.log("copy success!"))
        .then(() =>
            fs_extra.remove(panoFolderToDelete, err => {
                if (err) return console.error(err);

                console.log("remove success!"); // I just deleted my entire HOME directory.
            })
        )
        .catch(err => console.error(err));
};
