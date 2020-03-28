const fs = require('fs')
const fsE = require('fs-extra')
const csv = require('csv-parser') // https://stackabuse.com/reading-and-writing-csv-files-with-node-js/
const createCsvWriter = require('csv-writer').createObjectCsvWriter
const exec = require('child_process').exec
const execFile = require('child_process')

// ------------------------ PARTIE AJOUTE PANORAMA ------------------------ //

var tableLiens
var erreurFichierCSV

//   console.log(tableLiens[0]['puce2']);

// Fonction qui lis le fichier CSV (1 ligne => 1 tableau)
function readCSVFile(callback1, callback2, num_puce, num_pano) {
    var lectureFichierCSV = fs.createReadStream('./Panoramadata/fichiersDonnees/outt.csv') // lis les données du fichier
    lectureFichierCSV.on('open', () => {
        lectureFichierCSV.pipe(csv())
            .on('data', (row) => {
                tableLiens.push(row) // ajoute chaque ligne du fichier lu au tableau
            })
            .on('end', () => {
                console.log('lecture finie');
                erreurFichierCSV = false
                callback1(callback2, num_puce, num_pano)
            })
    })
    lectureFichierCSV.on('error', (err) => {
        console.log("fichier inexistant");
        erreurFichierCSV = true
        callback2(num_puce, num_pano)
    })
}

// Fonction qui supprime le fichier pour éviter la duplication des données existantes
function deleteCSVFile(callback, num_puce, num_pano) {
    fs.stat('./Panoramadata/fichiersDonnees/outt.csv', function (err) {
        if (!err) {
            fs.unlink('./Panoramadata/fichiersDonnees/outt.csv', (err) => {
                if (err) throw err;
                console.log('data file was deleted');
                callback(num_puce, num_pano)
            });
        } else if (err.code === 'ENOENT') {
            console.log('file or directory does not exist');
            callback(num_puce, num_pano)
        }
    })
}
// Fonction qui recrée le fichier data, avec les bons entêtes (1ère ligne = n° capteur)
function writeNewCSVFile(num_puce, num_pano) {
    const csvWriter = createCsvWriter({
        path: './Panoramadata/fichiersDonnees/outt.csv', // le nouveau fichier (mettre le même nom que le fichier de base pour le remplacer)
        // permet d'identifier correctement chaques capteurs
        header: [{
                id: 'puce1',
                title: 'puce1'
            }, {
                id: 'puce2',
                title: 'puce2'
            }, {
                id: 'puce3',
                title: 'puce3'
            }, {
                id: 'puce4',
                title: 'puce4'
            },
            {
                id: 'puce5',
                title: 'puce5'
            }, {
                id: 'puce6',
                title: 'puce6'
            }, {
                id: 'puce7',
                title: 'puce7'
            }, {
                id: 'puce8',
                title: 'puce8'
            },
            {
                id: 'puce9',
                title: 'puce9'
            }, {
                id: 'puce10',
                title: 'puce10'
            }, {
                id: 'puce11',
                title: 'puce11'
            }, {
                id: 'puce12',
                title: 'puce12'
            },
            {
                id: 'puce13',
                title: 'puce13'
            }, {
                id: 'puce14',
                title: 'puce14'
            }, {
                id: 'puce15',
                title: 'puce15'
            }, {
                id: 'puce16',
                title: 'puce16'
            },
        ]
    });


    //Si le fichier n'existe pas, on initialise le tableau des liens
    if (erreurFichierCSV == true) {
        tableLiens = [{
            'puce1': '0',
            'puce2': '0',
            'puce3': '0',
            'puce4': '0',
            'puce5': '0',
            'puce6': '0',
            'puce7': '0',
            'puce8': '0',
            'puce9': '0',
            'puce10': '0',
            'puce11': '0',
            'puce12': '0',
            'puce13': '0',
            'puce14': '0',
            'puce15': '0',
            'puce16': '0'
        }]
    }

    var tailleTableLiens = tableLiens.length

    // si la place est libre, on enregistre le num_pano dans le dernier tableau, sinon on en crée un nouveau
    switch (tableLiens[tailleTableLiens - 1][num_puce]) {
        case "0":
            tableLiens[tailleTableLiens - 1][num_puce] = num_pano
            break
        case undefined:
        case "":
            switch (tableLiens[tailleTableLiens - 2][num_puce]) {
                case "0":
                    tableLiens[tailleTableLiens - 2][num_puce] = num_pano
                    break
                case undefined:
                case "":
                    switch (tableLiens[tailleTableLiens - 3][num_puce]) {
                        case "0":
                            tableLiens[tailleTableLiens - 3][num_puce] = num_pano
                            break
                        case undefined:
                        case "":
                            switch (tableLiens[tailleTableLiens - 4][num_puce]) {
                                case "0":
                                    tableLiens[tailleTableLiens - 4][num_puce] = num_pano
                                    break
                                case undefined:
                                case "":
                                    switch (tableLiens[tailleTableLiens - 5][num_puce]) {
                                        case "0":
                                            tableLiens[tailleTableLiens - 5][num_puce] = num_pano
                                            break
                                        case undefined:
                                        case "":
                                            switch (tableLiens[tailleTableLiens - 6][num_puce]) {
                                                case "0":
                                                case undefined:
                                                case "":
                                                    tableLiens[tailleTableLiens - 6][num_puce] = num_pano
                                                    break
                                                default:
                                                    tableLiens[tailleTableLiens - 5][num_puce] = num_pano
                                                    break
                                            }
                                            break
                                        default:
                                            tableLiens[tailleTableLiens - 4][num_puce] = num_pano
                                            break
                                    }
                                    break
                                default:
                                    tableLiens[tailleTableLiens - 3][num_puce] = num_pano
                                    break
                            }
                            break
                        default:
                            tableLiens[tailleTableLiens - 2][num_puce] = num_pano
                            break
                    }
                    break
                default:
                    tableLiens[tailleTableLiens - 1][num_puce] = num_pano
                    break
            }
            break

        default:
            console.log("emplacement pas dispo");
            // console.log(d);
            tableLiens.push({}) //Ajout de nouvelles données au tableau
            tableLiens[tailleTableLiens][num_puce] = num_pano
            break
    }
    // console.log(num_puce);
    // console.log(num_pano);

    csvWriter.writeRecords(tableLiens).then(() => console.log('The CSV file was written successfully')) // écriture dans le fichier
    // console.dir(d)
}

var AllDirectories = function () {
    const myPath = __dirname + '/../Panoramadata/'
    var toutLesDossiers = []
    // Récupère tout les sous dossiers
    const isDirectory = (source) => fs.lstatSync(myPath + source).isDirectory()
    const getDirectories = source => fs.readdirSync(source).filter(isDirectory)
    toutLesDossiers.push(getDirectories(myPath))
    return toutLesDossiers
}


// fonction exportée, utilisée lors du get sur la page. Permet d'avoir les données dispo depuis le serveru et de remplir le select
// fonction qui permet de récuperer la liste des dossiers de Panoramadata,
// trier les panoramas déja enregistrés,
// sauver les dossiers importants,
// récupèrer l'ID de panorama le plus grand pour attribuer ID+1 au nouveau dossier
module.exports.panoListAndLastId = function () {
    // Les 5 dossiers permanents
    var dossiersPermanents = ['fichiersDonnees', 'graphics', 'lib', 'sounds', 'spots']
    var toutLesDossiers = AllDirectories()
    var dossiersSansID = []
    var dossiersARenommer = []
    var biggestId = 0



    //Récupère le plus grand ID et tout les dossiers sans ID (dossiers importants + nouveaux dossiers)
    for (var i = 0; i < toutLesDossiers[0].length; i++) {
        var folderNameSplit = toutLesDossiers[0][i].split('_')
        var idFolder = folderNameSplit[folderNameSplit.length - 1]
        var idParse = parseInt(idFolder, 10)
        //Si le dossier a deja un id
        if (!isNaN(idParse)) {
            if (idParse > biggestId) {
                biggestId = idParse
            }
        } else {
            dossiersSansID.push(toutLesDossiers[0][i])
        }
    }

    // trie les nouveaux dossiers des dossiers importants
    dossiersSansID.forEach(function (element) {
        // console.log(dossiersPermanents.indexOf(element));
        if (dossiersPermanents.indexOf(element) == -1) {
            dossiersARenommer.push(element);
        }
    });
    // console.log(toutLesDossiers);
    // console.log(dossiersPermanents);
    return {
        dossiersARenommer,
        biggestId
    }
    // console.log(toutLesDossiers[0]) //toutLesDossiers[0][0])
}

module.exports.renameFolder = function (dossierarenommer, lastid) {
    fs.rename('./Panoramadata/' + dossierarenommer, './Panoramadata/' + dossierarenommer + '_' + lastid, (err) => {
        if (err) throw err;
        console.log('Rename complete!');
    })
}

// fonction exportée, utilisée lors du post sur la page, donc au clic sur le bouton
module.exports.addPano = function (num_puce, num_pano) {
    tableLiens = []
    readCSVFile(deleteCSVFile, writeNewCSVFile, num_puce, num_pano)
}
// ------------------------ PARTIE SUPPRIME PANORAMA ------------------------ //

var allDirectoriesForDelete = function () {
    var toutLesDossiers = AllDirectories()
    var dossiersASuppr = []


    //Récupère le plus grand ID et tout les dossiers sans ID (dossiers importants + nouveaux dossiers)
    for (var i = 0; i < toutLesDossiers[0].length; i++) {
        var folderNameSplit = toutLesDossiers[0][i].split('_')
        var idFolder = folderNameSplit[folderNameSplit.length - 1]
        var idParse = parseInt(idFolder, 10)
        var name = ""
        //Si le dossier a deja un id
        if (!isNaN(idParse)) {
            for (var j = 0; j < folderNameSplit.length - 1; j++) {
                name += folderNameSplit[j] + " "
            }
            dossiersASuppr.push(toutLesDossiers[0][i])
        }

    }
    // console.log(dossiersASuppr);

    // console.log(dossiersPermanents);
    return dossiersASuppr
}

module.exports.deletePano = function (name) {
    var allDir = allDirectoriesForDelete();
    var id = name.split('_')[name.split('_').length - 1]
    for (var dir of allDir) {
        if (dir == name) {
            // console.log(__dirname+"/../Panoramadata/"+name);
            console.log(id);

            // fsE.remove(__dirname + "/../Panoramadata/"+name,err=>{
            //     console.error(err);
            // })

        }
    }
}

module.exports.getAllDirectories = function () {
    var allDir = allDirectoriesForDelete()
    var nameAllDir = []
    for (var dir of allDir) {
        var dir_split = dir.split('_')
        var name = ""
        for (var j = 0; j < dir_split.length - 1; j++) {
            name += dir_split[j] + " "
        }
        nameAllDir.push(name)
    }
    return {
        nameAllDir,
        allDir
    }
}