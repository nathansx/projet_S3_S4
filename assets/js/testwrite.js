	
const badges = ["122918211", "459823243"]; // Liste des badges
var numList = []; // Liste des numeros de panorama
var links = []; // Liste qui va contenir tous les liens
var readers = 0;//nombre de lecteur utiliser dans le fichier data.cvs
var data="" //la variable qui contiendra le nouveau contenu a ecrire dans le fichier data	
/*
  Récupère le contenu de la variable allText
  (qui correspond au fichier CSV) et va l'insérer dans la liste links
*/
function processData(allText) {
  var allTextLines = allText.split(/\r\n|\n/);
  readers = allTextLines[0].split(';');

  for (var lig = 1; lig < allTextLines.length; lig++) {
    var panosLigne = allTextLines[lig].split(';');
    links.push(new Map());
    for (var col = 0; col < readers.length; col++) {
      if (readers[col] == null) break;
      if (panosLigne[col] != null) {
        links[lig-1].set(readers[col].toString(), panosLigne[col].toString());
      }
	  if (panosLigne[col] != null) {
        links[lig-1].set(readers[col].toString(), ' ');
      }
    }
  }
}

function getNumList(data){
	var allTextLines = allText.split(/\r\n|\n/);
	for (var lig=0 ; lig<allTextLines.length; lig++){
		var lineSplit = allTextLines[lig].split(' ');
		numList.push(lineSplit[0].toString());		
	}
	
}


/*
	place les donnée du fichier numero_panorama_pour_csv dans numList[]
*/
function getNumPanorama(){
	var socket = io.connect('http://localhost:8080');
	var panorama;
	
	$.ajax({
		type: "GET",
		url: "../Panoramadata/fichiersDonnees/numero_panorama_pour_csv.csv", // CHANGER LE NOM DU DOSSIER SI BESOIN
		dataType: "text",
		success: function(numero_panorama_pour_csv) {getNumList(numero_panorama_pour_csv);}
	});
	
}

function logMapElements(value, key, map) {
	if(value === ' ')
	{
		data=data+";";
	}
	else{
	data = data+value+";";
	}
}

/*
creer un nouveau lien(relie un capteur et un panorama) et l'enregistre dans le fichier data.csv
*/	
function insert(){

	var numPano = document.getElementById("numPano").value.toString();
	if (numList.includes(numPano)==true)
	{
		return null;
	}

	var file = document.getElementById("file").value;
	var path = $(file).attr("src");
	var fs = require("fs-extra");
 
	// copy source folder to destination
	fs.copy(path, "../Panorama/Panoramadata/fichiersDonnees", function (err) {
		if (err){
			console.log('An error occured while copying the folder.');
			return console.error(err);
		}
		console.log('Copy completed!');
	});
	
	var numCapteur = document.getElementById("numCapteur").value;
	var socket = io.connect('http://localhost:8080');
	var panorama;

	// Fonction qui va attendre que la page soit entièrement chargée avant de lancer le script de la carte
	document.addEventListener("loadedplayer", function() {

		panorama = document.getElementById("krpanoSWFObject");

		// Récupération et traitement du fichier CSV
		$.ajax({
			type: "GET",
			url: "../Panoramadata/fichiersDonnees/data.csv", // CHANGER LE NOM DU DOSSIER SI BESOIN
			dataType: "text",
			success: function(data) {processData(data);}
		});
		

		
	}, false);


	var fs = require("fs");
	var index;
	var ligne=0
	var update=False
	while( ligne< links.length && update == false)
	{
		if(links[lig].get(numCapteur.toString())==" ")
		{
			links[lig].set(numCapteur.toString(),numPano);
			update = true;
		}
	}
	
	if (update == false)
	{
		var map = new map();
		for( var nb =0 ; num< readers; num++)
		{	
			map.set(nb,' ');
		}
		map.set(numCapteur.toString(),numPano);
		links.push(map);
	}
	
	
	for(num=0 ; num<readers ; num++)
	{
		data = data + num.toString()+";";
	}
	data = data.substring(0,data.length-1);
	
	for(ligne=0 ; ligne<links.length;ligne++)
	{
		data = data + "\n";
		links[ligne].forEach(indentData);
		data = data.substring(0,data.length-1);
	}
	
	fs.writeFile("../panorama/Panoramadata/fichiersDonnees/data.csv", data, (err) => {
	if (err) console.log(err);
	console.log("Successfully Written to File.");
	});
	
}
		
	

