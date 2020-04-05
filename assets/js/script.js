function getPanoList(selector) {
    $.get("/getFolders", function (data) {
        $(selector).html(data)
    })
}

function getPuceList(namePano) {
    var selectPuce = "<label for='selectPuce'>Selectionnez un capteur</label><select class='form-control' name='numPuce' id='selectPuce'></select>"
    var saveButton = "<button type='button' id='saveLien' class='btn btn-primary' onclick='generalAddLink()'>Sauvegarder</button>"
    if (namePano != '') {
        $.get("/getPuces", function (data) {
            if ($('#selectPuce').length == 0) {
                $("#selectPano").after(selectPuce)
                $("#selectPuce").html(data);
                $("#closeB").after(saveButton)
            }
        })
    }
};

function getAllPuceList(selector) {
    $.get("/getPuces", function (list) {
        $(selector).html(list)
    })
}
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

function generateSensorModule(sensorName) {
    $("#titleSensorModal").html("<h5 class='modal-title' id='sensorModalLabel'>" + sensorName + "</h5>" +
        "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>" +
        "<span aria-hidden='true'>&times;</span></button>");
    $("#titleSensorModal").next().html("")
}

function getPanoListByPuceToChange(numPuce) {
    var selectPano = "<label for='selectPanoToChange'>Selectionnez le panorama à modifier</label><select class='form-control' name='numPano' id='selectPanoToChange'></select>"
    var selectNewPuce = "<label for='selectNewPuce'>Selectionnez le nouveau capteur</label><select class='form-control' name='numPuceToAdd' id='selectNewPuce'></select>"
    $.post("/getPanoWithPuceNum", {numPuce: numPuce}, function (panoList) {
        if($("#selectPanoToChange").html() == undefined){
            getAllPuceList("#selectNewPuce")
            $("#selectPuceToChange").after(selectPano)
            $("#selectPanoToChange").after(selectNewPuce)
        }
        $("#selectPanoToChange").html(panoList)
    })
}

function getPanoListByPuceToDelete(numPuce) {
    var selectPano = "<label for='selectPanoToDelete'>Selectionnez le panorama à supprimer</label><select class='form-control' name='numPano' id='selectPanoToDelete'></select>"
    $.post("/getPanoWithPuceNum", {numPuce: numPuce}, function (panoList) {
        if($("#selectPanoToDelete").html() == undefined){
            $("#selectPuceToDelete").after(selectPano)
        }
        $("#selectPanoToDelete").html(panoList)
    })
}

$(document).ready(function () {
    $(".deleteLink").click(function () {
        var namePuce = this.parentElement.parentElement.firstElementChild.firstElementChild.innerHTML;
        var form = "<form><label for='selectPanoPerPuce'>Selectionnez un panorama pour l'ajouter</label>" +
            "<select class='form-control' name='numPano' id='selectPanoPerPuce'></select>" +
            "<button type='button' class='btn btn-danger' id='deleteLink'>Supprimer</button>"
        $.post("/getPanoWithPuceName", {
            namePuce: namePuce
        }, function (panosListOptions) {
            $("#titleSensorModal").next().html(form)
            $("#selectPanoPerPuce").html(panosListOptions.myString)
            $("#selectPanoPerPuce").after(panosListOptions.hideInput)
            $("#deleteLink").click(function () {
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
            })
        })
    })

    $(".changeLink").click(function () {
        var namePuce = this.parentElement.parentElement.firstElementChild.firstElementChild.innerHTML;
        var form = "<form><label for='selectPanoPerPuce'>Selectionnez un panorama</label>" +
            "<select class='form-control' name='numPano' id='selectPanoPerPuce'></select>" +
            "<select class='form-control' name='numPuce' id='selectPuce'></select>" +
            "<button type='button' class='btn btn-warning' id='changeLink'>Changer le lien</button>"
        $.post("/getPanoWithPuceName", {
            namePuce: namePuce
        }, function (panosListOptions) {
            $("#titleSensorModal").next().html(form)
            $("#selectPanoPerPuce").html(panosListOptions.myString)
            $("#selectPanoPerPuce").after(panosListOptions.hideInput)
            $.get("/getPuces", function (puceList) {
                $("#selectPuce").html(puceList)

                $("#changeLink").click(function () {
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
                })
            })
        })
    })

    $(".addLink").click(function () {
        var namePuce = this.parentElement.parentElement.firstElementChild.firstElementChild.innerHTML;
        var form = "<form><label for='selectPanoPerPuce'>Selectionnez un panorama pour l'ajouter</label>" +
            "<select class='form-control' name='numPano' id='selectPanoPerPuce'></select>" +
            "<button type='button' class='btn btn-success' id='addLink'>Ajouter</button>"
        $.get("/getFolders", function (res) {
            $("#titleSensorModal").next().html(form)
            $("#selectPanoPerPuce").html(res)
            $.post("/getPanoWithPuceName", {
                namePuce: namePuce
            }, function (res) {
                $("#selectPanoPerPuce").after(res.hideInput)

                $("#addLink").click(function () {
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
                })
            })
        })
    })

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