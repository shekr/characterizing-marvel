/* main.js
* creates globally accessible data objects
* from which to drive other components
*/

/* GLOBAL VARS */
var dataLength = 200;

var characterData = [];
var connectionsData = [];
var filterData = {};
var chartSettings = {}
chartSettings.innerChart = 'chords';
chartSettings.barchart = 'appearances';
chartSettings.colorCode = 'neutral';
chartSettings.sorting = 'alphabetical';
var selectedFilters = [];
var availableTags = [];
var colorOptions =['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];
var appearRange =[];
var yearRange =[];
var autoSuggestData = [];

/* SORT AND COLOR-CODE FUNCS */
function sortAlpha(a,b) {  
	if (a.name > b.name)
		return 1;
	else if (a.name < b.name)
		return -1;
	else
		return 0;
}
function sortNation(a,b) {  
	if (a.nationality > b.nationality)
		return 1;
	else if (a.nationality < b.nationality)
		return -1;
	else
		return 0;
}
function sortAppear(a,b) {  

	if (a.appearances > b.appearances)
		return 1;
	else if (a.appearances < b.appearances)
		return -1;
	else
		return 0;
}
function sortYear(a,b) {  
	if(!$.isNumeric(a.intro_year))
	{
		a.intro_year="";
	}
	if(!$.isNumeric(b.intro_year))
	{
		b.intro_year="";
	}

	if (a.intro_year > b.intro_year)
		return 1;
	else if (a.intro_year < b.intro_year)
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
	var arr = findPropName(filterData, "Gender","gender");
	var color;
	$.each(arr, function(index, val){

					    		
		if(d.data.gender == val) 
		{
			color = colorOptions[index];
			pinOption(color,d.data.gender);
			/* change later to add color swatches */
		}
	})
	return color;

}

function colCodeNation(d) {
	var arr = findPropName(filterData, "Nationality","nationality");
	var color;
	$.each(arr, function(index, val){
		if(d.data.gender == val) 
		{
			color = colorOptions[index];
			pinOption(color,d.data.nationality);
			/* change later to add color swatches */
		}
	})
	return color;

}

function colCodeAppear(d) {
	//var arr = findPropName(filterData, "Appearances","a");
	var color;
	$.each(appearRange, function(index, val){
		if($.isNumeric(d.data.appearances))
		{
			if(d.data.appearances >= val && d.data.appearances < appearRange[index+1]) 
			{
				color = colorOptions[index];
				pinOption(color,appearRange[index]);
				/* change later to add color swatches */
			}
		}
		else{
			color = 'gray';
		}
	})
	return color;

}
function colCodeYear(d) {
	//var arr = findPropName(filterData, "Year of Introduction","intro_year");
	var color;
	$.each(yearRange, function(index, val){
		if($.isNumeric(d.data.intro_year))
		{
			if(d.data.intro_year >= val && d.data.intro_year < yearRange[index+1]) 
			{
				color = colorOptions[index];
				pinOption(color,yearRange[index]);
				/* change later to add color swatches */
			}
		}
		else{
			color = 'gray';
		}
	})
	return color;

}
/* OTHER UTILITY FUNCS*/
function generateImageLink(origLink, newType) {
	var extension = origLink.match(/\.[a-zA-Z]{3,4}$/)[0];
	var mainLink = origLink.replace(extension, '');
	return mainLink + "/" + newType + extension;
}

/**GET DATA **/
function getData(start) {
	start = start || 0;
	$.ajax( { url: "js/data-static.js", dataType: "json" } /*https://marvelinfovis.herokuapp.com/api/filter/gender/", { gender: "male"}*/)
	.done(function(data) {
		//console.log(data)
		characterData = data.slice(0,dataLength);
		/* CREATE THE DATA FOR SEARCH*/
		autoSuggestData = [];
		for (var i = 0; i < dataLength; i++) {
			var searchItem = {}
			searchItem.label = characterData[i].name
			searchItem.value = characterData[i].character_id
			autoSuggestData[i] = searchItem;	
		}
		$( "#search" ).autocomplete( "option", "source", autoSuggestData );
		
		if (chartSettings.innerChart == 'chords') {
			getConnectionsData();
		} else {
			innerChartDataDoneCallback()	
		}
		filterData = getFilterData();
		
	})	
}

function innerChartDataDoneCallback() {
	/***ANY UPDATES TO THE UI DEPENDENT ON DATA MUST BE CALLED HERE**/
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
	//console.log(charIndices)
	var returnCount = 0;
	for (var i = 0; i < dataLength; i++) {
		var currChar = characterData[i];
		$.post( "https://marvelinfovis.herokuapp.com/api/connections/", { character_id: currChar.character_id})
			.done(function(data) {
				returnCount++
				for (var j = 0; j < data.length; j++) {
					//only add existing connections
					if (charIndices.indexOf(parseInt(data[j].cid2)) > -1 && parseInt(data[j].cid1) != parseInt(data[j].cid2)) {
						if (data[j].type == "Family" || (data[j].type == "Standard" && data[j].instances > 1) ) {
							data[j].cid1 = parseInt(data[j].cid1)
							data[j].cid2 = parseInt(data[j].cid2)
							data[j].instances = data[j].instances == null ? 0 : data[j].instances
							connectionsData.push(data[j]);
						}
					}
				}
				if (returnCount == dataLength-1)
					innerChartDataDoneCallback()
			})		
	}
}

/** FAKE DATA GENERATORS 
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
					charConnections.instances = Math.ceil(Math.random()*50);
					connectionsData.push(charConnections);	
				}
			}
		}
	}
}**/

/*
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
	innerChartDataDoneCallback()
	
}*/

function getFilterData() {
	//console.log("Getting updated list of available control options. List of Nationalities	");
	$.get( "https://marvelinfovis.herokuapp.com/api/filter/gender/")
	.done(function(data) {
		
		filterData["Gender"] = data;

		$.get( "https://marvelinfovis.herokuapp.com/api/filter/year_introduced/")
		.done(function(data) {
			/*$.each(data,function(index,value){
				if(!$.isNumeric(value.intro_year)||value.intro_year == null)
				{
					console.log(value.intro_year);
					value.intro_year="";
				}
			})*/
			filterData["Year of Introduction"] = data;

			yearRange = calcRange(filterData,"Year of Introduction","intro_year");

			$.get( "https://marvelinfovis.herokuapp.com/api/filter/nationality/")
			.done(function(data) {
		
				filterData["Nationality"] = data;

				$.get( "https://marvelinfovis.herokuapp.com/api/filter/affiliation/")
				.done(function(data) {

					filterData["Affiliation"] = data;

					$.post("https://marvelinfovis.herokuapp.com/api/filter/appearances/", {startRange: "" , endRange: ""} )
					 .done(function(data) {
						/*$.each(data,function(index,value){
							if(!$.isNumeric(data.appearances)||data.appearances == null)
							{
								data.appearances="";
							}
						})*/					
						filterData["Number of Appearances"] = data;
						appearRange = calcRange(filterData,"Number of Appearances","appearances");
						updateFilterOptions();

					});
				});
			});			
		});
	});
	


	
	return filterData;
}


