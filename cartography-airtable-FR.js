/*
  title: Cartography,
  description: Un script qui vous permet de visualiser vos coordonnées GPS à l'aide de marqueurs sur une carte,
  Author: Benjamin Hatton
*/
const config = input.config({
    title: 'Cartographie',
    description: "Un script qui vous permet de visualiser vos coordonnées GPS à l'aide de marqueurs sur une carte",
    items: [
        input.config.text('url', {
            label: 'URL du fichier basemap.html',
            description: 'Vous pouvez utiliser https://basteks.github.io/cartography/basemap.html pour vos tests', 
        }),
        input.config.select('curPos', {
            label: 'Position actuelle',
            description: 'Souhaitez-vous afficher votre position actuelle sur la carte ?',
            options: [
                {label: 'Statique (une seule position)', value: 'static'},
		{label: 'Dynamique (suit votre position)', value: 'track'},
                {label: 'Non', value: 'no'}
            ]
        }),
        input.config.table('table', {
            label: 'Table',
            description: 'La table dans laquelle se trouvent les données à cartographier'
        }),
		input.config.view('view', {
            label: 'Vue',
            description: 'La vue contenant les données',
            parentTable: 'table',
        }),
        input.config.field('lat', {
            label: 'Latitude',
			description : 'Le champ contenant la latitude (de type nombre)',
            parentTable: 'table',
        }),
        input.config.field('lon', {
            label: 'Longitude',
			description : 'Le champ contenant la longitude (de type nombre)',
            parentTable: 'table',
        }),
        input.config.field('title', {
            label: 'Titre',
			description: 'Le champ représentant le titre du popup de chaque marker',
            parentTable: 'table',
        }),
        input.config.select('group', {
            label: 'Regroupement',
            description: 'Souhaitez-vous regrouper vos données selon ce champ de titre ?',
            options: [
                {label: 'Oui', value: 'yes'},
                {label: 'Non', value: 'no'}
            ]
        }),
        input.config.text('popupContent', {
            label: 'Contenu du popup',
			description: "Texte à afficher pour chaque entrée (pour une première utilisation écrivez n'importe quoi)",
        }),
    ]
});

const mapURL = config.url;
const curPos = config.curPos;
const table = config.table;
const view = config.view;
const lat = config.lat;
const lon = config.lon;
const title = config.title;
const group = config.group;
var popupContent = config.popupContent;
const mapTitle = encodeURI(base.name+': '+table.name);

function getFieldsFromPopupContent() {
    var tmpStr  = popupContent.split('{');
    var arrStr=[];
    for(var i=0; i<tmpStr.length; i++) {
    	if (tmpStr[i].indexOf('}')>-1) {
        	arrStr.push(tmpStr[i].split('}')[0]);
        }
    }
    for(var i=0; i<arrStr.length; i++) {
        try {
            let field = table.getField(arrStr[i]);
            fields.push(field);
        }
        catch {
            output.markdown("**⚠ Problème de récupération du champ "+arrStr[i]+"**");
        }
    }
    if(fields.length==arrStr.length && fields.length>0) {
        return true;
    }
    else {
        return false;
    }
}

function replaceWithFieldNames(record, template) {
    var tmpStr  = template.split('{');
    var arrStr=[];
    for(var i=0; i<tmpStr.length; i++) {
    	if (tmpStr[i].indexOf('}')>-1) {
        	arrStr.push(tmpStr[i].split('}')[0]);
        }
    }
    let str = template;
    for(var i=0; i<arrStr.length; i++) {
        str = str.replace('{'+arrStr[i]+'}',record.getCellValueAsString(arrStr[i]).trim());
    }
    return str;
}

function find(mtitle) {
    var res = -1;
    for (let i=0;i<markers.length;i++) {
        let marker = markers[i];
        if (marker['title'] == mtitle) {
            res = markers.indexOf(marker);
            break;
        }
    }
    return res;
};

if (lat.type != 'number' || lon.type != 'number') {
	output.markdown("**⚠ Le champ de latitude et/ou celui de longitude ne sont pas de type _nombre_! Modifiez-le(s) svp ou choisissez d'autres champs de type nombre**");
}
else {
	var fields=[];
	if(!getFieldsFromPopupContent()) {
		fields=[];
		output.markdown("Reprenons le choix des données à afficher sur la carte...");
		var addMoreField = "Oui";
		while(addMoreField=="Oui") {
			let field = await input.fieldAsync("Choisissez un champ", table);
			fields.push(field);
			let moreField = await input.buttonsAsync("Voulez-vous afficher les données d'un autre champ?", ['Oui', 'Non']);
			addMoreField = moreField;
		}
		output.markdown("**Liste des champs à afficher sur la carte :**")
		for (let i=0;i<fields.length;i++) {
			output.markdown("_{"+fields[i].name+"}_")
		}
		const contentStr = await input.textAsync('Texte à afficher pour chaque saisie (utilisez les noms des champs entre accolades)');
		output.markdown("**Pensez à recopier le texte suivant dans le champ _Texte à afficher pour chaque entrée_ des paramètres du script** (icône re roue dentée en haut à gauche):");
		output.text(contentStr);
		popupContent = contentStr;
	}

	var queryFields = fields;
	queryFields.push(title);
	queryFields.push(lat);
	queryFields.push(lon);
	let queryResult = await view.selectRecordsAsync({fields: queryFields});

	var markers=[];

	for (let record of queryResult.records) {
		let dataStr = replaceWithFieldNames(record,popupContent);
		if (group=="yes") {
			if (record.getCellValueAsString(title.name)!=""){
				if (find(record.getCellValueAsString(title.name))>=0) {
					markers[find(record.getCellValueAsString(title.name))].content.push(dataStr);
				}
				else {
					markers.push({"title": record.getCellValueAsString(title.name), "lat" : record.getCellValue(lat.name), "lon" : record.getCellValue(lon.name),"content" : [dataStr]})
				}
			}
		}
		else {
			markers.push({"title": record.getCellValueAsString(title.name), "lat" : record.getCellValue(lat.name), "lon" : record.getCellValue(lon.name),"content" : [dataStr]})
		}
	}
	var markersStr='';
	for (let i=0;i<markers.length; i++) {
		let marker = markers[i];
		if (markersStr!='') { markersStr+=';'}
		var listeData="";
		for (let j=0;j<marker.content.length;j++) {
			if (listeData!='') { listeData+=',';}
			listeData += marker.content[j];
		}
		markersStr+= encodeURI(marker["title"]+','+marker["lat"]+","+marker["lon"]+","+listeData)
	}
	output.markdown("[Cliquez sur ce lien pour accéder à la carte]("+mapURL+"?t="+mapTitle+"?p="+curPos+"?mrks="+markersStr+")");
	let displayMarkers = await input.buttonsAsync("Souhaitez-vous afficher les données des markers ?", ['Oui', 'Non']);
    if (displayMarkers == 'Oui') {
        output.markdown("**Liste des markers présents sur la carte**:");
	    output.table(markers);
    }
    output.markdown("_Script terminé avec succès_");
}
