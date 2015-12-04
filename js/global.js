/* main.js
* creates globally accessible data objects
* from which to drive other components
*/

/* GLOBAL VARS */
var dataLength = 10;

var characterData = [];
var connectionsData = [];
var filterData = [];

var colorCode = 'neutral';
var sorting = 'alphabetical';

getData();

/* SORT AND COLOR-CODE FUNCS */
function sortAlpha(a,b) {  
	if (a.name > b.name)
		return -1;
	else if (a.name < b.name)
		return 1;
	else
		return 0;
}

function sortGender(a, b) {
	if (a.gender > b.gender)
		return -1;	
	else if (a.gender == b.gender)
		return 0;
	else
		return 1;
}

function colCodeGender(d) {
	if(d.data.gender == 'M')
		return '#d72829';
	else
		return '#4f649d';
}

function getData() {
	characterData = marvelCharacters.slice(0,dataLength);
	switch (sorting) {
		case 'alphabetical':
			characterData.sort(sortAlpha)
		 	break;
		case 'gender':
			characterData.sort(sortGender);
		break;
	}
	getConnectionsData(0);
	filterData = getFilterData();
	
}

function getConnectionsData(startIndex) {
	//create some random connection data
	var connectionTypes = ["family", "standard", "romantic"];
	if (startIndex >= 0) {
		for (var i = startIndex; i < dataLength; i++) {
			for (var j = 0; j <	dataLength; j++) {
				var valR = Math.floor(Math.random()*dataLength);
				if (valR % 200 == 0) {
					var charConnections = {};
					charConnections.id1 = characterData[i].cid;
					var indexR = Math.floor(Math.random()*dataLength);
					while (indexR == i) {
						indexR = Math.floor(Math.random()*dataLength);
					}
					charConnections.id2 = characterData[indexR].cid;
					var indexConn = Math.floor(Math.random()*connectionTypes.length);
					charConnections.type = connectionTypes[indexConn];
					connectionsData.push(charConnections);	
				}
			}
		}
	}
}

function getFilterData() {
	/* RUTA/ROBIN THIS IS FOR YOU */	
	console.log("Getting updated list of available control options")
	return controlOptions;
}


