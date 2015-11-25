/* main.js
* creates globally accessible data objects
* from which to drive other components
*/

var dataLength = 300;

var characterData = [];
var connectionsData = [];
var filterData = [];

getData();

function getData() {
	characterData = marvelCharacters.slice(0,dataLength);
	connectionsData = getConnectionsData();
	filterData = getFilterData();
	
}

function getConnectionsData() {
	//create some random connection data
	var connectionsRandom = [];
	var connectionTypes = ["family", "standard", "romantic"];
	for (var i = 0; i < dataLength; i++) {
		for (var j = 0; j <	dataLength; j++) {
			var valR = Math.floor(Math.random()*dataLength);
			if (valR % 200 == 0) {
				var charConnections = {};
				charConnections.id1 = characterData[i].cid;
				var indexR = Math.floor(Math.random()*dataLength);
				charConnections.id2 = characterData[indexR].cid;
				var indexConn = Math.floor(Math.random()*connectionTypes.length);
				charConnections.type = connectionTypes[indexConn];
				connectionsRandom.push(charConnections);	
			}
		}
	}
	return connectionsRandom;	
}

function getFilterData() {
	/* RUTA/ROBIN THIS IS FOR YOU */	
}


