// Fonction permettant d'aficher la liste des panoramas à ajouter (ceux qui sont non-liés)
// Uilisée pour ajouter un pano depuis le bouton "ajouter"
function getPanoList() {
    var selectPano = "<label for='selectToAdd'>Selectionnez le panorama</label>" +
        "<select class='form-control' id='selectPano' onchange='getPuceList(this.value)'></select>"
    $("#addLinkForm").children().html(selectPano)
    $.get("/getFolders", function (data) {
        $("#selectPano").html(data)
    })
}

// Fonction permettant d'afficher tout les capteurs disponibles (dans la bdd) ainsi qu'un bouton "sauvegarder"
// Uilisée pour ajouter un pano depuis le bouton "ajouter"
function getPuceList() {
    var selectPuce = "<label for='selectPuce'>Selectionnez un capteur</label><select class='form-control' name='numPuce' id='selectPuce'></select>"
    var saveButton = "<button type='button' id='saveLien' class='btn btn-primary' onclick='generalAddLink()'>Sauvegarder</button>"
    $.get("/getPuces", function (data) {
        if ($('#selectPuce').length == 0) {
            $("#selectPano").after(selectPuce)
            $("#selectPuce").html(data);
            $("#closeB").after(saveButton)
        }
    })
};

// Fonction permettant de récupérer tout les capteurs disponibles et de les ajouter au select passé en parametre
// Utilisée pour : - modifier depuis le bouton "modifier"
//                 - supprimer depuis le bouton "supprimer"
//                 - 
function getAllPuceList(selector) {
    $.get("/getPuces", function (list) {
        $(selector).html(list)
    })
}

// Fonction permettant de réupérer les valeurs du capteur et du panorama choisi
// Ainsi que le nom du panorama dans le cas où il s'agit d'un panorama non enregistré dans la bdd
// Envoie des données au serveur pour sauvergarder le nouveau lien (et le panorama si nouveau)
// Utilisée pour ajouter depuis le bouton "ajouter"
function generalAddLink() {
    var numPuce = $("#selectPuce").val()
    var numPano = $("#selectPano").val()
    var namePano = $("#selectPano option:selected").text()
    if (numPuce != '' && numPano != '') {
        $.post("/saveNewLink", {
            numPuce: numPuce,
            numPano: numPano,
            namePano: namePano
        })
        alert("Le lien a bien été enregistré !");
        $("#ajoutModal").modal("hide")
    } else {
        alert("N'oubliez pas de selectionner un panorama et un capteur")
    }
}

// Fonction qui complète le modale avec le nom du capteur et une croix pour le fermer
// Le nom sera utilisé pour faire le lien avec la bdd
// Utilisée lors du clic sur un capteur de la carte
function generateSensorModal(sensorName) {
    $("#titleSensorModal").html("<h5 class='modal-title' id='sensorModalLabel'>" + sensorName + "</h5>" +
        "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>" +
        "<span aria-hidden='true'>&times;</span></button>");
    $("#titleSensorModal").next().html("")
}

// Fonction appelée lors d'un changement de valeur du select de capteur
// Ajoute le select avec la liste des panoramas liés au capteur choisi (avec son numéro)
// Ajoute le select avec la liste des capteurs pour sélectionner le nouveau capteur
// Uilisée pour modifier avec le bouton "modifier"
function getPanoListByPuceToChange(numPuce) {
    var selectPano = "<label for='selectPanoToChange'>Selectionnez le panorama à modifier</label><select class='form-control' name='numPano' id='selectPanoToChange'></select>"
    var selectNewPuce = "<label for='selectNewPuce'>Selectionnez le nouveau capteur</label><select class='form-control' name='numPuceToAdd' id='selectNewPuce'></select>"
    $.post("/getPanoWithPuceNum", {
        numPuce: numPuce
    }, function (panoList) {
        if ($("#selectPanoToChange").html() == undefined) {
            getAllPuceList("#selectNewPuce")
            $("#selectPuceToChange").after(selectPano)
            $("#selectPanoToChange").after(selectNewPuce)
        }
        $("#selectPanoToChange").html(panoList)
    })
}

// Fonction qui permet d'afficher un select avec tout les panoramas liés au capteur séléctionné
// grâce au numéro du capteur
// Utilisée pour supprimer avec le bouton "supprimer"
function getPanoListByPuceToDelete(numPuce) {
    var selectPano = "<label for='selectPanoToDelete'>Selectionnez le panorama à supprimer</label><select class='form-control' name='numPano' id='selectPanoToDelete'></select>"
    $.post("/getPanoWithPuceNum", {
        numPuce: numPuce
    }, function (panoList) {
        if ($("#selectPanoToDelete").html() == undefined) {
            $("#selectPuceToDelete").after(selectPano)
        }
        $("#selectPanoToDelete").html(panoList)
    })
}

$(document).ready(function () {
    // au premier clic sur le bouton "supprimer"
    // affiche un select avec la liste des panoramas liés au capteur sélectionné
    // grâce au nom du capteur récupéré
    // ajoute un input hidden avec le numéro du capteur en value
    // Utilisée au clic sur la carte
    $(".deleteLink").click(function () {

        var namePuce = this.parentElement.parentElement.firstElementChild.firstElementChild.innerHTML;
        var form = "<form id='formToDelete'><label for='selectPanoPerPuce'>Selectionnez un panorama pour le supprimer</label>" +
            "<select class='form-control' name='numPano' id='selectPanoPerPuce'></select>"
        $.post("/getPanoWithPuceName", {
            namePuce: namePuce
        }, function (panosListOptions) {
            $("#titleSensorModal").next().html(form)
            $("#selectPanoPerPuce").html(panosListOptions.myString)
            $("#selectPanoPerPuce").after(panosListOptions.hideInput)

        })
    })

    // au second clic sur le bouton "supprimer"
    // vérifie qu'un pano soit bien selectionné
    // envoie les données nécessaire à la suppression d'un lien au serveur
    // Utilisé au clic sur la carte
    $("#deleteLink").click(function () {
        if ($("#formToDelete")[0] != undefined) {
            // console.log($("#formToDelete")[0]);
            // console.log($("#formToDelete").innerHTML);
            var numPano = $("#selectPanoPerPuce").val();
            var numPuce = $("#numPuce").val();
            if (numPuce != '' && numPano != '') {
                $.post("/deleteLink", {
                    numPuce: numPuce,
                    numPano: numPano
                })
                alert("Le lien a bien été supprimé !");
                $("#sensorModal").modal("hide")
            } else {
                alert("N'oubliez pas de selectionner un panorama")
            }
        }

    })

    // au premier clic sur le bouton "modifier"
    // affiche un select avec la liste des panoramas liés au capteur sélectionné
    // grâce au nom du capteur récupéré
    // ajoute un input hidden avec le numéro du capteur en value
    // Utilisée au clic sur la carte
    $(".changeLink").click(function () {
        var namePuce = this.parentElement.parentElement.firstElementChild.firstElementChild.innerHTML;
        var form = "<form id='formToChange'><label for='selectPanoPerPuce'>Selectionnez un panorama et le nouveau capteur</label>" +
            "<select class='form-control' name='numPano' id='selectPanoPerPuce'></select>" +
            "<select class='form-control' name='numPuce' id='selectPuce'></select>"
        $.post("/getPanoWithPuceName", {
            namePuce: namePuce
        }, function (panosListOptions) {
            $("#titleSensorModal").next().html(form)
            $("#selectPanoPerPuce").html(panosListOptions.myString)
            $("#selectPanoPerPuce").after(panosListOptions.hideInput)
            $.get("/getPuces", function (puceList) {
                $("#selectPuce").html(puceList)

            })
        })
    })

    // au second clic sur le bouton "modifier"
    // vérifie qu'un pano et un capteur soit bien selectionné
    // envoie les données nécessaire à la modification d'un lien au serveur
    // Utilisé au clic sur la carte
    $("#changeLink").click(function () {
        if ($("#formToChange")[0] != undefined) {
            var numPano = $("#selectPanoPerPuce").val();
            var numPuce = $("#selectPuce").val();
            var numPuceToDelete = $("#numPuce").val();
            if (numPuce != '' && numPano != '') {
                $.post("/changeLink", {
                    numPuce: numPuce,
                    numPano: numPano,
                    numPuceToDelete: numPuceToDelete
                })
                alert("Le lien a bien été modifié !");
                $("#sensorModal").modal("hide")
            } else {
                alert("N'oubliez pas de selectionner un panorama ET un capteur")
            }
        }
    })

    // au premier clic sur le bouton "ajouter"
    // affiche un select avec la liste des panoramas à ajouter
    // ajoute un input hidden avec le numéro du capteur en value
    // Utilisée au clic sur la carte
    $(".addLink").click(function () {
        var namePuce = this.parentElement.parentElement.firstElementChild.firstElementChild.innerHTML;
        var form = "<form id='formToAdd'><label for='selectPanoPerPuce'>Selectionnez un panorama pour l'ajouter</label>" +
            "<select class='form-control' name='numPano' id='selectPanoPerPuce'></select>"
        $.get("/getFolders", function (res) {
            $("#titleSensorModal").next().html(form)
            $("#selectPanoPerPuce").html(res)
            $.post("/getPanoWithPuceName", {
                namePuce: namePuce
            }, function (res) {
                $("#selectPanoPerPuce").after(res.hideInput)

            })
        })
    })

    // au second clic sur le bouton "ajouter"
    // vérifie qu'un pano soit bien selectionné
    // envoie les données nécessaire à l'ajout d'un lien au serveur
    // Utilisé au clic sur la carte
    $("#addLink").click(function () {
        if ($("#formToAdd")[0] != undefined) {
            var numPano = $("#selectPanoPerPuce").val();
            var numPuce = $("#numPuce").val();
            var namePano = $("#selectPanoPerPuce option:selected").text()
            if (numPuce != '' && numPano != '') {
                $.post("/saveNewLink", {
                    numPuce: numPuce,
                    numPano: numPano,
                    namePano: namePano
                })
                alert("Le lien a bien été enregistré !");
                $("#sensorModal").modal("hide")
            } else {
                alert("N'oubliez pas de selectionner un panorama et un capteur")
            }
        }
    })

    // Envoie les données nécessaire à la modification d'un lien
    // Utilisé au clic sur le bouton "modifier"
    $("#globalChangeLink").click(function () {
        var numPuce = $("#selectPuceToChange").val()
        var numPano = $("#selectPanoToChange").val()
        var newNumPuce = $("#selectNewPuce").val()
        if (numPuce != '' && numPano != '') {
            $.post("/changeLink", {
                numPuce: newNumPuce,
                numPano: numPano,
                numPuceToDelete: numPuce
            })
            alert("Le lien a bien été modifié !");
            $("#modifierModal").modal("hide")
        } else {
            alert("N'oubliez pas de selectionner un panorama ET un capteur")
        }
    })

    // Envoie les données nécessaire à la suppression d'un lien
    // Utilisé au clic sur le bouton "supprimer"
    $("#globalDeleteLink").click(function () {
        var numPuce = $("#selectPuceToDelete").val()
        var numPano = $("#selectPanoToDelete").val()
        if (numPuce != '' && numPano != '') {
            $.post("/deleteLink", {
                numPuce: numPuce,
                numPano: numPano
            })
            alert("Le lien a bien été supprimé !");
            $("#supprimerModal").modal("hide")
        } else {
            alert("N'oubliez pas de selectionner un panorama ET un capteur")
        }
    })
})