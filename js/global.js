/* main.js
* creates globally accessible data objects
* from which to drive other components
*/

/* GLOBAL VARS */
var dataLength = 200;

var characterData = [];
var connectionsData = [];
var filterData = [];

var chartSettings = {}
chartSettings.innerChart = 'chords';
chartSettings.barchart = 'appearances';
chartSettings.colorCode = 'neutral';
chartSettings.sorting = 'alphabetical';

/* SORT AND COLOR-CODE FUNCS */
function sortAlpha(a,b) {  
	if (a.name > b.name)
		return 1;
	else if (a.name < b.name)
		return -1;
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
	if(d.data.gender == 'Male')
		return '#d72829';
	else if (d.data.gender == 'Female')
		return '#4f649d';
}

/* OTHER UTILITY FUNCS*/
function generateImageLink(origLink, newType) {
	var extension = origLink.match(/\.[a-zA-Z]{3,4}$/)[0];
	var mainLink = origLink.replace(extension, '');
	return mainLink + "/" + newType + extension;
}

/**GET DATA  - NOW USING REAL END POINT**/
function getData(start) {
	start = start || 0;
	$.ajax( { url: "js/data-static.js", dataType: "json" } /*https://marvelinfovis.herokuapp.com/api/filter/gender/", { gender: "male"}*/)
	.done(function(data) {
		//console.log(data)
		characterData = data.slice(0,dataLength);
		//console.log(characterData)
		if (chartSettings.innerChart == 'chords') {
			getConnectionsData();
		} else {
			getBarData(start);
		}
		filterData = getFilterData();
		/***ANY UPDATES TO THE UI DEPENDENT ON DATA MUST BE CALLED HERE**/
		
		//updateChart();
		
	})	
}

function innerChartDataDoneCallback() {
	console.log("CHORDS DATA DONE!*************************************")
	switch (chartSettings.sorting) {
		case 'alphabetical':
			characterData.sort(sortAlpha)
			break;
		case 'gender':
			characterData.sort(sortGender);
		break;
	}	
	updateChart();	
}

function getConnectionsData() {
	connectionsData = [];
	var charIndices = characterData.map(function(x) {return x.character_id; });
	console.log(charIndices)
	var returnCount = 0;
	for (var i = 0; i < dataLength; i++) {
		var currChar = characterData[i];
		$.post( "https://marvelinfovis.herokuapp.com/api/connections/", { character_id: currChar.character_id})
			.done(function(data) {
				returnCount++
				for (var j = 0; j < data.length; j++) {
					//only add exisiting connections
					if (charIndices.indexOf(data[j].cid2) > -1) {
						data[j].cid1 = parseInt(data[j].cid1)
						data[j].cid2 = parseInt(data[j].cid2)
						connectionsData.push(data[j]);	
					}
				}
				if (returnCount == dataLength-1)
					innerChartDataDoneCallback()
			})		
	}
}

/** FAKE DATA GENERATORS **/
function getConnectionsFakeData(startIndex) {
	//create some random connection data
	var connectionTypes = ["family", "standard", "romantic"];
	if (startIndex >= 0) {
		for (var i = startIndex; i < dataLength; i++) {
			for (var j = 0; j <	dataLength; j++) {
				var valR = Math.floor(Math.random()*dataLength);
				if (valR % 200 == 0) {
					var charConnections = {};
					charConnections.cid1 = characterData[i].character_id;
					var indexR = Math.floor(Math.random()*dataLength);
					while (indexR == i) {
						indexR = Math.floor(Math.random()*dataLength);
					}
					charConnections.cid2 = characterData[indexR].character_id;
					var indexConn = Math.floor(Math.random()*connectionTypes.length);
					charConnections.type = "standard" //connectionTypes[indexConn];
					charConnections.instances = Math.ceil(Math.random()*500);
					connectionsData.push(charConnections);	
				}
			}
		}
	}
}

function getBarData(startIndex) {
	//create some random barchart data and append to charData
	for (var i = startIndex; i < dataLength; i++) {
	var currChar = characterData[i];
	currChar.barchart = {};
	currChar.barchart.appearances = Math.floor(Math.random()*10000);
	currChar.barchart.aliases = Math.floor(Math.random()*10)
	currChar.barchart.connections = Math.floor(Math.random()*500);
	currChar.barchart.affilations = Math.floor(Math.random() * 20);
	currChar.barchart.powers = Math.floor(Math.random()*10);
	characterData[i] = currChar;
}
	
}

function getFilterData() {
	/* RUTA/ROBIN THIS IS FOR YOU */	
	console.log("Getting updated list of available control options")
	return controlOptions;
}


