const config = input.config({
    title: 'Cartography',
    description: 'A script that allows you to visualize your records on a map',
    items: [
        input.config.text('url', {
            label: 'URL of the basemap.html file',
        }),
        input.config.select('curPos', {
            label: 'Current location',
            description: 'Would you like to display your current location on the map ?',
            options: [
                {label: 'Static (only once)', value: 'static'},
		{label: 'Track (updates automatically)', value: 'track'},
                {label: 'No', value: 'no'}
            ]
        }),
        input.config.table('table', {
            label: 'Table',
            description: 'Table containing the records you want to visualize'
        }),
		input.config.view('view', {
            label: 'View',
            description: 'The view containing the records',
            parentTable: 'table',
        }),
        input.config.field('lat', {
            label: 'Latitude',
			description : 'The latitude field (number type)',
            parentTable: 'table',
        }),
        input.config.field('lon', {
            label: 'Longitude',
			description : 'The longitude field (number type)',
            parentTable: 'table',
        }),
        input.config.field('title', {
            label: 'Title',
            description: "The field containing the title of each marker's popup",
            parentTable: 'table',
        }),
        input.config.select('group', {
            label: 'Grouping',
            description: 'Would you like to group your records by the title field ?',
            options: [
                {label: 'Yes', value: 'yes'},
                {label: 'No', value: 'no'}
            ]
        }),
        input.config.text('popupContent', {
            label: 'Popup content',
            description: "The text to display in the popup for each record (for a first use, write anything, we will configure it during first script run)",
        }),
    ]
});

const mapURL = config.url;
const table = config.table;
const curPos = config.curPos;
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
            output.markdown("**⚠ Error while getting the "+arrStr[i]+" field**");
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
	output.markdown("**⚠ the latitude field and/or the longitude field are not of _number_ type! Please modify them or choose other number type fields**");
}
else {
	var fields=[];
	if(!getFieldsFromPopupContent()) {
		fields=[];
		output.markdown("Let's choose the fields to display on the map...");
		var addMoreField = "Yes";
		while(addMoreField=="Yes") {
			let field = await input.fieldAsync("Choose a field you want to display", table);
			fields.push(field);
			let moreField = await input.buttonsAsync("Would you like to display another field on the map?", ['Yes', 'No']);
			addMoreField = moreField;
		}
		output.markdown("**List of the fields to display on the map :**")
		for (let i=0;i<fields.length;i++) {
			output.markdown("_{"+fields[i].name+"}_")
		}
		const contentStr = await input.textAsync("Popup content to display for each record (you can use the fields' names between curly brackets)");
		output.markdown("**Don't forget to copy/paste this text in the _Text to display in the popup for each record_ input in the script settings** (⚙ icon in the top right corner):");
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
	output.markdown("[Clic on this link to see the map]("+mapURL+"?t="+mapTitle+"?p="+curPos+"?mrks="+markersStr+")");
    let displayMarkers = await input.buttonsAsync("Would you like to display the markers' data?", ['Yes', 'No']);
    if (displayMarkers == 'Yes') {
        output.markdown("**List of the markers on the map**:");
	    output.table(markers);
    }
    output.markdown("_Script completed successfully_");
}
