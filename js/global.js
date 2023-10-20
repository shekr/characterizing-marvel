/* main.js
* creates globally accessible data objects
* from which to drive other components
*/

/* GLOBAL VARS */
var dataLength = 250;

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
var colorOptions =['#377eb8','#e41a1c','#4daf4a','#984ea3','#ff7f00','#e7298a','#a6cee3','#b2df8a','#66c2a5','#8da0cb','#e78ac3','#a6d854'];
var appearRange =[];
var yearRange =[];
var autoSuggestData = [];
var chordThreshScale;

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
			//pinOption(color,d.data.gender);
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
			//pinOption(color,d.data.nationality);
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
				//pinOption(color,appearRange[index]);
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
				//pinOption(color,yearRange[index]);
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
function getData() {
	
	$.post( "https://marvelinfovis.herokuapp.com/api/filter/all/", { appearances_min: 50})
	.fail(function() {
    	console.log('failed to load, accessing local')
  	})
	.done(function(data) {
		//console.log(data)
		if (data.characters.length >= dataLength)
			characterData = data.characters.slice(0, dataLength);
		else
			characterData = data.characters
		dataLength = characterData.length;
		console.log(characterData)
		console.log('loading '+dataLength+' characters')
		/* CREATE THE DATA FOR SEARCH */
		autoSuggestData = [];
		for (var i = 0; i < dataLength; i++) {
			var searchItem = {}
			searchItem.label = characterData[i].name
			searchItem.value = characterData[i].character_id
			autoSuggestData[i] = searchItem;	
		}
		$( "#search" ).autocomplete( "option", "source", autoSuggestData );
		
		/*if (chartSettings.innerChart == 'chords') {
			getConnectionsData();
		} else {
			innerChartDataDoneCallback()	
		}*/
		//populate whole chart
		getConnectionsData();
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
	//only when chords created recalc threshold
	var chordsRange = d3.extent(connectionsData, function(d) { return d.instances  } )
	chordThreshScale = d3.scale.linear()
		.domain([0,100])
		.range(chordsRange)

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
			.fail(function() {
    			console.log('failed to load, accessing local')
  			})
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


