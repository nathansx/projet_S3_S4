// ----------------- Contruction du sensor modal -----------------

// Fonction qui complète le modale avec le nom du capteur et une croix pour le fermer
// Le nom sera utilisé pour faire le lien avec la bdd
// Utilisée lors du clic sur un capteur de la carte
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
// --- Depuis le bouton "Ajouter"

// au clic sur le bouton "Ajouter" de l'interface
// Fonction permettant d'aficher la liste des panoramas à ajouter (ceux qui sont non-liés)
function getPanoToAddList() {
    var myString = "<option value=''>Selectionnez un panorama</option>"
    $.get("/getFolders", function (panoList) {
        panoList.forEach(pano => {
            myString += "<option value='" + pano.numPano + "'>" + pano.namePano + "</option>"
        })
        $("#selectPanoToAdd").html(myString)
        $("#selectPanoToAdd").nextAll().remove()
    })
}

// au changement de valeur du pano sélectionné
// Fonction permettant d'afficher tout les capteurs disponibles (dans la bdd) ainsi qu'un bouton "sauvegarder"
// Uilisée pour ajouter un pano depuis le bouton "ajouter"
function getSensorListToAdd(numPano) {
    var myString = "<option value=''>Selectionnez un capteur</option>"
    var selectSensor = "<label for='selectSensorToAdd'>Selectionnez un capteur</label><select class='form-control' name='numSensor' id='selectSensorToAdd'></select>"
    if (numPano != '' && numPano != undefined) {
        $.get("/getSensors", function (sensorList) {
            sensorList.forEach(sensor => {
                myString += "<option value='" + sensor.numSensor + "'>" + sensor.nameSensor + "</option>"
            })
            if ($('#selectSensorToAdd').length == 0) {
                $("#selectPanoToAdd").after(selectSensor)
                $("#selectSensorToAdd").html(myString);
            }
        })
    } else {
        $("#selectPanoToAdd").nextAll().remove()
    }
};

//au clic sur le bouton "Ajouter" du modal
// Fonction permettant de réupérer les valeurs du capteur et du panorama choisi
// Ainsi que le nom du panorama dans le cas où il s'agit d'un panorama non enregistré dans la bdd
// Envoie des données au serveur pour sauvergarder le nouveau lien (et le panorama si nouveau)
// Utilisée pour ajouter depuis le bouton "ajouter"
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

// --- Depuis la carte

// au second clic sur le bouton "ajouter"
// vérifie qu'un pano soit bien selectionné
// envoie les données nécessaire à l'ajout d'un lien au serveur
// Utilisé au clic sur la carte
function addLinkWithMap(sensor) {
    if ($("#formToAdd")[0] != undefined) { // si le formulaire d'ajout existe
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
    } else {
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
                $("#selectPanoWithSensor").after(res.hideInput)
            })
        })
    }
}

// ----------------- MODIFIER UN LIEN -----------------
// --- Depuis le bouton "Modifier" 

// Au clic sur le bouton "Modifier" de l'interface
// Fonction permettant de récupérer tout les capteurs disponibles et de les ajouter au select passé en parametre
// Utilisée pour : - modifier depuis le bouton "modifier"
//                 - supprimer depuis le bouton "supprimer"
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

// Au changement de valeur du capteur sélectionné
// Fonction appelée lors d'un changement de valeur du select de capteur
// Ajoute le select avec la liste des panoramas liés au capteur choisi (avec son numéro)
// Ajoute le select avec la liste des capteurs pour sélectionner le nouveau capteur
// Uilisée pour modifier avec le bouton "modifier"
function getPanoListToChange(numSensor) {
    var selectPanoToChange = "<label for='selectPanoToChange'>Selectionnez le panorama à modifier</label><select class='form-control' name='numPano' id='selectPanoToChange'></select>"
    var selectNewSensor = "<label for='selectNewSensor'>Selectionnez le nouveau capteur</label><select class='form-control' name='numSensorToAdd' id='selectNewSensor'></select>"
    var myString = "<option value=''>Selectionnez un panorama</option>"
    if (numSensor != '' && numSensor != undefined) {
        $.post("/getPanoWithSensorNum", {
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

// Au clic sur le bouton "Modifier" du modal
// Envoie les données nécessaire à la modification d'un lien
// Utilisé au clic sur le bouton "modifier"
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

// --- Depuis la carte

// au second clic sur le bouton "modifier"
// vérifie qu'un pano et un capteur soit bien selectionné
// envoie les données nécessaire à la modification d'un lien au serveur
// Utilisé au clic sur la carte
function changeLinkWithMap(sensorName) {
    if ($("#formToChange")[0] != undefined) { // si le formulaire de modification existe
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
    } else {
        var form = "<form id='formToChange'><label for='selectPanoWithSensor'>Selectionnez un panorama et le nouveau capteur</label>" +
            "<select class='form-control' name='numPano' id='selectPanoWithSensor'></select>" +
            "<select class='form-control' name='numSensor' id='selectSensor'></select>"
        var myString = "<option value=''>Selectionnez un panorama</option>"
        var optionSensorList = "<option value=''>Sélectionnez un nouveau capteur</option>"
        $.post("/getPanoWithSensorName", {
            nameSensor: sensorName
        }, function (reponse) {
            if (reponse.panoList.length != 0) {
                reponse.panoList.forEach(pano => {
                    myString += "<option value='" + pano.numPano + "'>" + pano.namePano + "</option>"
                })
                $("#titleSensorModal").next().html(form)
                $("#selectPanoWithSensor").html(myString)
                $("#selectPanoWithSensor").after(reponse.hideInput)
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
}

// ----------------- SUPPRIMER UN LIEN -----------------
// --- Depuis le bouton "Supprimer" 

// Au clic sur le bouton "Supprimer" de l'interface
// Déclenchement de la fonction getSensorList('#selectSensorToDelete')

//au chanegement de valeur du capteur sélectionné
// Fonction qui permet d'afficher un select avec tout les panoramas liés au capteur séléctionné
// grâce au numéro du capteur
function getPanoListToDelete(numSensor) {
    var selectPanoToDelete = "<label for='selectPanoToDelete'>Selectionnez le panorama à supprimer</label><select class='form-control' name='numPano' id='selectPanoToDelete'></select>"
    var myString = "<option value=''>Selectionnez un panorama</option>"
    if (numSensor != '' && numSensor != undefined) {
        $.post("/getPanoWithSensorNum", {
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

// Au clic sur le bouton "Supprimer" du modal
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

// --- Depuis la carte

// au second clic sur le bouton "supprimer"
// vérifie qu'un pano soit bien selectionné
// envoie les données nécessaire à la suppression d'un lien au serveur
// Utilisé au clic sur la carte
function deleteLinkWithMap(sensorName) {
    if ($("#formToDelete")[0] != undefined) { // Si le formulaire de suppression existe
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
    } else {
        var form = "<form id='formToDelete'><label for='selectPanoWithSensor'>Selectionnez un panorama pour le supprimer</label>" +
            "<select class='form-control' name='numPano' id='selectPanoWithSensor'></select>"
        var myString = "<option value=''>Selectionnez un panorama</option>"
        $.post("/getPanoWithSensorName", {
            nameSensor: sensorName
        }, function (reponse) {
            if (reponse.panoList.length != 0) {
                reponse.panoList.forEach(pano => {
                    myString += "<option value='" + pano.numPano + "'>" + pano.namePano + "</option>"
                })
                $("#titleSensorModal").next().html(form)
                $("#selectPanoWithSensor").html(myString)
                $("#selectPanoWithSensor").after(reponse.hideInput)
            } else {
                $("#titleSensorModal").next().html("<div class='alert alert-danger' role='alert'>" +
                    "Il n'y a aucun panorama lié à ce capteur !" +
                    "</div>")
            }
        })
    }
}