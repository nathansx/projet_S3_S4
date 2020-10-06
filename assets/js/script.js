// ----------------- Contruction du sensor modal -----------------

// Fonction qui complète le modale avec le nom du capteur et une croix pour le fermer
// Le nom sera utilisé pour faire le lien avec la bdd
// Ajoute la liste des panoramas lié au capteur dans le body du modal
function generateSensorModal(sensorName) {
    $("#titleSensorModal").html("<h5 class='modal-title' id='sensorModalLabel'>" + sensorName + "</h5>" +
        "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>" +
        "<span aria-hidden='true'>&times;</span></button>");
    var myString = "<h6 class='mb-1'>Liste des panoramas</h6><ul class='list-group'>"
    $.post("/getPanoWithSensorName", {
        nameSensor: sensorName
    }, function (reponse) {
        reponse.panoList.forEach(pano => {
            myString += "<li class='list-group-item'>" + pano.namePano + "</li>"
        });
        myString += "</ul>"
        $("#titleSensorModal").next().html(myString)
    })
}

// ----------------- AJOUTER UN LIEN -----------------
// ----- Depuis le bouton "Ajouter" de l'interface

// I- Affiche la liste des panoramas à ajouter (ceux qui sont non-liés)
function getPanoToAddList() {
    var myString = "<option value=''>Selectionnez un panorama</option>"
    $.get("/getFolders", function (panoList) {
        panoList.forEach(pano => {
            myString += "<option value='" + pano.numPano + "'>" + pano.namePano + "</option>"
        })
        $("#selectPanoToAdd").html(myString)
        $("#selectPanoToAdd").nextAll().remove() // raffraichi l'affichage du modal
    })
}

// II- Au changement de valeur du pano sélectionné
// Affiche tous les capteurs disponibles (dans la bdd)
function getSensorListToAdd(numPano) {
    var myString = "<option value=''>Selectionnez un capteur</option>"
    var selectSensor = "<label for='selectSensorToAdd'>Selectionnez un capteur</label><select class='form-control' name='numSensor' id='selectSensorToAdd'></select>"
    if (numPano != '' && numPano != undefined) { // si la sélection est un panorama (et non "Selectionnez un panorama")
        $.get("/getSensors", function (sensorList) {
            sensorList.forEach(sensor => {
                myString += "<option value='" + sensor.numSensor + "'>" + sensor.nameSensor + "</option>"
            })
            $("#selectPanoToAdd").after(selectSensor)
            $("#selectSensorToAdd").html(myString);
        })
    } else {
        $("#selectPanoToAdd").nextAll().remove()
    }
};

// III- Au clic sur "Sauvegarder"
// Envoie les données sélectionnées au serveur pour ajouter un nouveau lien
function generalAddLink() {
    var numSensor = $("#selectSensorToAdd").val()
    var numPano = $("#selectPanoToAdd").val()
    var namePano = $("#selectPanoToAdd option:selected").text()
    if (numSensor != '' && numPano != '') {
        $.post("/saveNewLink", {
            numSensor: numSensor,
            numPano: numPano,
            namePano: namePano
        })
        alert("Le lien a bien été enregistré !");
        $("#ajoutModal").modal("hide")
    } else {
        alert("N'oubliez pas de selectionner un panorama et un capteur")
    }
}

// ----- Depuis un badge de la carte

// Au clic sur "Ajouter" du Sensor modal
// Gère tout le procédé d'ajout
function addLinkWithMap(sensor) {
    // Premier clic
    // Création du formulaire
    if ($("#formToAdd")[0] == undefined) {
        var form = "<form id='formToAdd'><label for='selectPanoWithSensor'>Selectionnez un panorama pour l'ajouter</label>" +
            "<select class='form-control' name='numPano' id='selectPanoWithSensor'></select>"
        var myString = "<option value=''>Selectionnez un panorama</option>"
        $.get("/getFolders", function (panoList) {
            panoList.forEach(pano => {
                myString += "<option value='" + pano.numPano + "'>" + pano.namePano + "</option>"
            })
            $("#titleSensorModal").next().html(form)
            $("#selectPanoWithSensor").html(myString)
            $.post("/getPanoWithSensorName", {
                nameSensor: sensor
            }, function (res) {
                var hideInput = "<input id='numSensor' name='numSensor' type='hidden' value='" + res.numSensor + "'>"
                $("#selectPanoWithSensor").after(hideInput)
            })
        })
    }
    // Second clic
    // Envoie des données au serveur
    else {
        var numPano = $("#selectPanoWithSensor").val();
        var numSensor = $("#numSensor").val();
        var namePano = $("#selectPanoWithSensor option:selected").text()
        if (numSensor != '' && numPano != '') {
            $.post("/saveNewLink", {
                numSensor: numSensor,
                numPano: numPano,
                namePano: namePano
            })
            alert("Le lien a bien été enregistré !");
            $("#sensorModal").modal("hide")
        } else {
            alert("N'oubliez pas de selectionner un panorama")
        }
    }
}

// ----------------- MODIFIER UN LIEN -----------------
// ----- Depuis le bouton "Modifier" de l'interface

// I- Permet de récupérer tout les capteurs disponibles et de les ajouter au <select> passé en parametre
// Utilisée pour : - modifier depuis le bouton "modifier" de l'interface
//                 - supprimer depuis le bouton "supprimer" de l'interface
function getSensorList(selector) {
    var myString = "<option value=''>Selectionnez un capteur</option>"
    $.get("/getSensors", function (sensorList) {
        sensorList.forEach(sensor => {
            myString += "<option value='" + sensor.numSensor + "'>" + sensor.nameSensor + "</option>"
        })
        $(selector).html(myString)
        $(selector).nextAll().remove()
    })
}

// II- Au changement de valeur du capteur sélectionné
// Ajoute le <select> avec la liste des panoramas liés au capteur choisi
// Ajoute le <select> avec la liste des capteurs pour sélectionner le nouveau capteur
function getPanoListToChange(numSensor) {
    var selectPanoToChange = "<label for='selectPanoToChange'>Selectionnez le panorama à modifier</label><select class='form-control' name='numPano' id='selectPanoToChange'></select>"
    var selectNewSensor = "<label for='selectNewSensor'>Selectionnez le nouveau capteur</label><select class='form-control' name='numSensorToAdd' id='selectNewSensor'></select>"
    var myString = "<option value=''>Selectionnez un panorama</option>"
    if (numSensor != '' && numSensor != undefined) {
        $.post("/getPanoBySensor", {
            numSensor: numSensor
        }, function (panoList) {
            if (panoList.length > 0) {
                panoList.forEach(pano => {
                    myString += "<option value='" + pano.numPano + "'>" + pano.namePano + "</option>"
                })
                if ($("#selectPanoToChange").html() == undefined) {
                    getSensorList("#selectNewSensor")
                    $("#selectSensorToChange").after(selectPanoToChange)
                    $("#selectPanoToChange").after(selectNewSensor)
                }
                $("#selectPanoToChange").html(myString)
            } else {
                $("#selectSensorToChange").nextAll().remove()
                $("#selectSensorToChange").after("<div class='alert alert-danger' role='alert'>" +
                    "Il n'y a aucun panorama lié à ce capteur !" +
                    "</div>")
            }
        })
    } else {
        $("#selectSensorToChange").nextAll().remove()
    }
}

// III- Au clic sur le bouton "Modifier" du modal
// Envoie les données nécessaire à la modification d'un lien
function globalChangeLink() {
    var numSensor = $("#selectSensorToChange").val()
    var numPano = $("#selectPanoToChange").val()
    var newNumSensor = $("#selectNewSensor").val()
    if (numSensor != '' && numSensor != undefined && numPano != '' && numPano != undefined) {
        $.post("/changeLink", {
            numSensor: newNumSensor,
            numPano: numPano,
            numSensorToDelete: numSensor
        })
        alert("Le lien a bien été modifié !");
        $("#modifierModal").modal("hide")
    } else {
        alert("N'oubliez pas de selectionner un panorama ET un capteur")
    }
}

// ----- Depuis un badge la carte

// Au clic sur "Modifier" du Sensor modal
// Gère tout le procédé de modification
function changeLinkWithMap(sensorName) {
    // I- premier clic
    // Création du formulaire
    if ($("#formToChange")[0] == undefined) {
        var form = "<form id='formToChange'><label for='selectPanoWithSensor'>Selectionnez un panorama et le nouveau capteur</label>" +
            "<select class='form-control' name='numPano' id='selectPanoWithSensor'></select>" +
            "<select class='form-control' name='numSensor' id='selectSensor'></select>"
        var myString = "<option value=''>Selectionnez un panorama</option>"
        var optionSensorList = "<option value=''>Sélectionnez un nouveau capteur</option>"
        $.post("/getPanoWithSensorName", {
            nameSensor: sensorName
        }, function (reponse) {
            if (reponse.panoList.length != 0) {
                var hideInput = "<input id='numSensor' name='numSensor' type='hidden' value='" + reponse.numSensor + "'>"
                reponse.panoList.forEach(pano => {
                    myString += "<option value='" + pano.numPano + "'>" + pano.namePano + "</option>"
                })
                $("#titleSensorModal").next().html(form)
                $("#selectPanoWithSensor").html(myString)
                $("#selectPanoWithSensor").after(hideInput)
                $.get("/getSensors", function (sensorList) {
                    sensorList.forEach(sensor => {
                        optionSensorList += "<option value='" + sensor.numSensor + "'>" + sensor.nameSensor + "</option>"
                    })
                    $("#selectSensor").html(optionSensorList)
                })
            } else {
                $("#titleSensorModal").next().html("<div class='alert alert-danger' role='alert'>" +
                    "Il n'y a aucun panorama lié à ce capteur !" +
                    "</div>")
            }
        })
    }
    // II- Deuxième clic
    // Envoie des données au serveur
    else {
        var numPano = $("#selectPanoWithSensor").val();
        var numSensor = $("#selectSensor").val();
        var numSensorToDelete = $("#numSensor").val();
        if (numSensor != '' && numPano != '') {
            $.post("/changeLink", {
                numSensor: numSensor,
                numPano: numPano,
                numSensorToDelete: numSensorToDelete
            })
            alert("Le lien a bien été modifié !");
            $("#sensorModal").modal("hide")
        } else {
            alert("N'oubliez pas de selectionner un panorama ET un capteur")
        }
    }
}

// ----------------- SUPPRIMER UN LIEN -----------------
// ----- Depuis le bouton "Supprimer" de l'interface

// I- Déclenchement de la fonction getSensorList('#selectSensorToDelete')

// II- Au chanegement de valeur du capteur sélectionné
// Permet d'afficher un <select> avec tout les panoramas liés au capteur séléctionné
function getPanoListToDelete(numSensor) {
    var selectPanoToDelete = "<label for='selectPanoToDelete'>Selectionnez le panorama à supprimer</label><select class='form-control' name='numPano' id='selectPanoToDelete'></select>"
    var myString = "<option value=''>Selectionnez un panorama</option>"
    if (numSensor != '' && numSensor != undefined) {
        $.post("/getPanoBySensor", {
            numSensor: numSensor
        }, function (panosList) {
            if (panosList.length > 0) {
                panosList.forEach(pano => {
                    myString += "<option value='" + pano.numPano + "'>" + pano.namePano + "</option>"
                })
                if ($("#selectPanoToDelete").html() == undefined) {
                    $("#selectSensorToDelete").nextAll().remove()
                    $("#selectSensorToDelete").after(selectPanoToDelete)
                }
                $("#selectPanoToDelete").html(myString)
            } else {
                $("#selectSensorToDelete").nextAll().remove()
                $("#selectSensorToDelete").after("<div class='alert alert-danger' role='alert'>" +
                    "Il n'y a aucun panorama lié à ce capteur !" +
                    "</div>")
            }
        })
    } else {
        $("#selectSensorToDelete").nextAll().remove()
    }
}

// III- Au clic sur le bouton "Supprimer" du modal
// Envoie les données nécessaire à la suppression d'un lien
function globalDeleteLink() {
    var numSensor = $("#selectSensorToDelete").val()
    var numPano = $("#selectPanoToDelete").val()
    if (numSensor != '' && numSensor != undefined && numPano != '' && numPano != undefined) {
        $.post("/deleteLink", {
            numSensor: numSensor,
            numPano: numPano
        })
        alert("Le lien a bien été supprimé !");
        $("#supprimerModal").modal("hide")
    } else {
        alert("N'oubliez pas de selectionner un panorama ET un capteur")
    }
}

// ----- Depuis un badge de la carte

// Au clic sur "Supprimer" du Sensor modal
// Gère tout le procédé de suppression
function deleteLinkWithMap(sensorName) {
    if ($("#formToDelete")[0] == undefined) {
        // I- Premier clic
        // Création du formulaire
        var form = "<form id='formToDelete'><label for='selectPanoWithSensor'>Selectionnez un panorama pour le supprimer</label>" +
            "<select class='form-control' name='numPano' id='selectPanoWithSensor'></select>"
        var myString = "<option value=''>Selectionnez un panorama</option>"
        $.post("/getPanoWithSensorName", {
            nameSensor: sensorName
        }, function (reponse) {
            if (reponse.panoList.length != 0) {
                var hideInput = "<input id='numSensor' name='numSensor' type='hidden' value='" + reponse.numSensor + "'>"
                reponse.panoList.forEach(pano => {
                    myString += "<option value='" + pano.numPano + "'>" + pano.namePano + "</option>"
                })
                $("#titleSensorModal").next().html(form)
                $("#selectPanoWithSensor").html(myString)
                $("#selectPanoWithSensor").after(hideInput)
            } else {
                $("#titleSensorModal").next().html("<div class='alert alert-danger' role='alert'>" +
                    "Il n'y a aucun panorama lié à ce capteur !" +
                    "</div>")
            }
        })
    }
    // II- Second clic
    // Envoie des données au serveur
    else {
        var numPano = $("#selectPanoWithSensor").val();
        var numSensor = $("#numSensor").val();
        if (numSensor != '' && numPano != '') {
            $.post("/deleteLink", {
                numSensor: numSensor,
                numPano: numPano
            })
            alert("Le lien a bien été supprimé !");
            $("#sensorModal").modal("hide")
        } else {
            alert("N'oubliez pas de selectionner un panorama")
        }
    }
}