/*
  Ce fichier a deux fonctions :
    - Récupérer les liens lecteur-panorama
    - Utiliser ces liens quand la fonction correspondante est appelée
*/
const badges = ["10110321943"]; // Liste des badges

var links = []; // Liste qui va contenir tous les liens

/*
  Récupère le contenu de la variable allText
  (qui correspond au fichier CSV) et va l'insérer dans la liste links
*/
function processData(allText) {
  var allTextLines = allText.split(/\r\n|\n/);
  var readers = allTextLines[0].split(';');

  for (var lig = 1; lig < allTextLines.length; lig++) {
    var panosLigne = allTextLines[lig].split(';');
    links.push(new Map());
    for (var col = 0; col < readers.length; col++) {
      if (readers[col] == null) break;
      if (panosLigne[col] != null) {
        links[lig-1].set(readers[col].toString(), panosLigne[col].toString());
      }
    }
  }
  console.log(links)
}

/*
  Appelle une fontion intégrée au lecteur de Panotour qui a
  pour but de changer le panorama affiché.
*/
function callPano(numPano){
	// var data = JSON.parse(msg);
	//var lecteur = data.lecteur;
	// var lecteur = data;
	// console.log(data);
    /*
	for (var b = 0; b < badges.length;  b++) {
	console.log(badges[b]);
	if(badges[b] === data.badge){
		
		if(!(links[b].get(lecteur.toString()) === "")){
	  		var call = "loadscene(pano"+ links[b].get(lecteur.toString()) +")";
	  	}
	}
	}
	*/
	// console.log(links[data].get(lecteur.toString()));
    var call = "loadscene(pano"+numPano+")";
	// console.log(call);
	panorama.call(call);
}
