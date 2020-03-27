$("#dialog").dialog({
    autoOpen: false,
    modal: true,
    width: 1200,
    show: true,
    position: {
        my: "top",
        at: "top"
    },
    close: function () {
        $("#choix").css("visibility", "visible")
    },
});

$("#admin").on("click", function () {
    $("#choix").css("visibility", "hidden");
    $("#dialog").dialog("open");
});

function openFullScreen() {
    // var elem = document.getElementById("tourDIV");
    var elem = $(document);
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari & Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen();
    }
}