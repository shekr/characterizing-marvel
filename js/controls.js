/* controls.js
* Modifies data in visualization based on selected filter, color coding and sorting  
* Modifies available control options based on previously selected options
*/
/* trigger the following on click
	Send selected control options
	request updated data (if filter)
	push to vis
	sort data (if data)
	push to vis
	assign colors (if color coding)
	push to vis
	pin selected control option
	request updated control options
	add li for each type
	add sub li for each option
	NB: multiple control options get added on selection of one
	Filter, sorting doesn't work
	API call TBD
	Color code to be placed next to selected ctrl option
	implement search
	filterOptions.["Attr"].[index].gender = "Female"
	filterOptions =
	{
				"Affiliation": 	["avengers","something else"],

					"Gender": 	[
									{
										gender: "Female",
										number: 56;
										
									},
									{
										gender: "Male",
										number: 56;
										
									}
								],

				"Nationality": [
									{
										nationality: "American",
										number: 56;
									},
									{
										nationality: "Japanese",
										number: 56;
									}
								],
	"Year of Introduction":    [
									{
										intro_year: 1995,
										number: 2
									},
									{
										intro_year: 1939,
										number: 2
									}
								]
	"Appearances": 	[	{
							appearances: 4
						},
						{
							appearances: 100
						}
					]
	}



*/
$( document ).ready(function() {

$('.radClick').click(function(){
	//console.log("click")
	$(this).children('input').prop('checked', true);
})

	$(document).on('change' , ':radio' , function()
	{
		var option = $(this).next("label").text();
		console.log(option);
		switch(option){
			case "Gender":
					console.log("sorting");
					chartSettings.sorting = 'gender';
					characterData.sort(sortGender)
					if($("#sortDesc").hasClass("active"))
					{
						characterData.reverse();
					}
					updateChart();
					break;
			case "Year of Introduction":
					console.log("sorting");
					chartSettings.sorting = 'intro_year';
					characterData.sort(sortYear)
					console.log(characterData);
					updateChart();
					break;			
			case "Nationality":
					console.log("sorting");			
					chartSettings.sorting = 'nationality';
					characterData.sort(sortNation)
					updateChart();
					break;			
			case "Number of Appearances":
					console.log("sorting");			
					chartSettings.sorting = 'appearances';
					characterData.sort(sortAppear)
					updateChart();
					break;
			default:
			break;
		}
	});
		
	$(document).on('change' , '.checkbox' , function()
	{
		var pinType;
		var ref = $(":checked")
		//console.log(ref);
		$('#filterPin').empty();
		$('#colorPin').empty();
		$('#sortPin').empty();
		$.each(ref,function(index, value){

			if($(ref[index]).hasClass("color"))
			{
				pinType = "color";
			}
			else if
				($(ref[index]).hasClass("filter"))
			{
				pinType = "filter";
			}
			else if($(ref[index]).hasClass("sort"))
			{
				pinType = "sort";
			}
			if($(ref[index]).hasClass("Affiliation"))
			{
				/* post to api*/
				console.log(value.name);
				console.log(pinType);
				pinOption(value.name,pinType);
				$.post( "https://marvelinfovis.herokuapp.com/api/filter/affiliation/", { "name": value.name})
				.done(function(data) {
					parseData(data.length,data);
					//updateChart();


				});
			}
			if($(ref[index]).hasClass("Nationality"))
			{
					/* post to api*/
				console.log(value.name);
				pinOption(value.name,pinType);
				$.post( "https://marvelinfovis.herokuapp.com/api/filter/nationality/", { "name": value.name})
				.done(function(data) 
				{
					parseData(data.length,data);
					updateChart();

				});
			}
			if($(ref[index]).hasClass("Year of Introduction"))
			{
				/* post to api*/
				console.log(value.name);
				pinOption(value.name,pinType);
				$.post( "https://marvelinfovis.herokuapp.com/api/filter/year_introduced/", { year: value.name})
				.done(function(data) {
					parseData(data.length,data);
					//updateChart();


				});
			}
			if($(ref[index]).hasClass("Gender"))
			{
				/* post to api*/
				console.log(value.name);
				pinOption(value.name,pinType);
				$.post( "https://marvelinfovis.herokuapp.com/api/filter/gender/", { gender: value.name})
				.done(function(data) {
					console.log(data.length);
					parseData(data.length,data);
					chartSettings.colorCode = 'gender';
					svg.selectAll('#pieSliceBox path.slice')
					.transition()
					.duration(300)
					.style("fill", colCodeGender)
					//updateChart();
				});
			}
			if($(ref[index]).hasClass("Number of Appearances"))
			{
				

				/* post to api
				console.log(value.name)
				$.post( "https://marvelinfovis.herokuapp.com/api/filter/appearances/", { "name": value.name})
				.done(function(data) {
					console.log(data);
				});*/
			}
		});
	});
});


function updateFilterOptions() 
{
	
	//console.log(filterData);
	/*Clear previous values

	$('filterList').empty();
	$('colorList').empty();
	$('sortList').empty();

	/*Request Options from API*/
	
	
	/*Redraw control options depending on filter, sort or color code 
	by appending collapsibe li elements for each category and sub-category in the filterData object*/


	$('#filterList').empty();
	$('#colorList').empty();
	$('#sortList').empty();
  	$.each(filterData, function( key, val ) {
  		
  		
  		//console.log(key);
  		switch (key) 
  		{
			case "Gender":
			case "Nationality":
					key_id = key.replace(/\s+/g, '');
					$('#sortList').append("<li class=\"list-group-item panel-title\"><input type=\"radio\" name=\"sortradio\"><label>"+key+"</label></li>");
			    	$('#filterList').append("<li><a data-toggle=\"collapse\" data-parent=\"#filterList\" href=\"#filter" + key_id + "\">" + key + "</a><div id=\"filter" + key_id + "\" class=\"panel-collapse collapse\"><div class=\"panel-body\"><ul id=\"filterList" + key_id + "\" class=\"nav fixed-panel\">");
			    	$('#colorList').append("<li><a data-toggle=\"collapse\" data-parent=\"#colorList\" href=\"#color" + key_id + "\">" + key + "</a><div id=\"color" + key_id + "\" class=\"panel-collapse collapse\"><div class=\"panel-body\"><ul id=\"colorList" + key_id + "\" class=\"nav fixed-panel\"></ul>");

				  	$.each(val, function( index, value )
				  	{

				  		$.each(value, function ( prop, propVal){
				  			//console.log(prop);
				  		
				  			if(prop == "gender" || prop == "nationality" || prop == "Number of Appearances")
				  			{
				  				if($.isNumeric(propVal))
					    		{
					    			propVal = propVal.toString();
					    			console.log(propVal);
					    		}
				  				//$('#sortList'+ key_id).append("<li><div class=\"radio\"> <label> <input type=\"radio\" name = \"sortopt\" class = \"sort " + key_id + " \"id =\""+ propVal +"\">" + propVal + "</label></div></li>");
					    		$('#filterList'+ key_id).append("<li><div class=\"checkbox\"> <label> <input type=\"checkbox\"  class = \"filter " + key_id + " \"name =\""+ propVal +"\">" + propVal + "</label></div></li>");
					    		$('#colorList'+ key_id).append("<li><div class=\"checkbox\"> <label> <input type=\"checkbox\" class = \"color " + key_id + " \"name =\""+ propVal +"\">" + propVal + "</label></div></li>");
				  			}
				  		})
					    
					});
					break;
			case "Year of Introduction":
			case "Consommation":
					key_id = key.replace(/\s+/g, '');
					$('#sortList').append("<li class=\"list-group-item panel-title\"><input type=\"radio\" name=\"sortradio\"><label>"+key+"</label></li>");
			    	$('#filterList').append("<li><a data-toggle=\"collapse\" data-parent=\"#filterList\" href=\"#filter" + key_id + "\">" + key + "</a><div id=\"filter" + key_id + "\" class=\"panel-collapse collapse\"><div class=\"panel-body\"><ul id=\"filterList" + key_id + "\" class=\"nav fixed-panel\"></ul>");
					$.each(val, function( index, value )
					{
						$.each(value, function ( prop, propVal){
							if(prop == "intro_year" || prop == "consommation")
					    	{
					    		if($.isNumeric(propVal))
					    		{
					    			propVal = propVal.toString();
					    			//console.log(propVal);
					    		}
					    		else if(key =="Year of Introduction")
					    		//$('#sortList'+ key_id).append("<li><div class=\"radio\"> <label> <input type=\"radio\" name = \"sortopt\" class = \"sort " + key_id + " \"id =\"" + propVal +"\">" + propVal + "</label></div></li>");
					    		$('#filterList'+ key_id).append("<li><div class=\"checkbox\"> <label> <input type=\"checkbox\" class = \"filter " + key_id + " \"name =\""+ propVal +"\">" + propVal + "</label></div></li>");
							}
						});
					});	
					break;
			case "Affiliation":
					$('#filterList').append("<li><a data-toggle=\"collapse\" data-parent=\"#filterList\" href=\"#filter" + key + "\">" + key + "</a><div id=\"filter" + key + "\" class=\"panel-collapse collapse\"><div class=\"panel-body\"><ul id=\"filterList" + key + "\" class=\"nav fixed-panel\"></ul>");
					$.each(val, function( index, value )
					{
						/*$.each(value, function ( prop, propVal){
							if(prop == "affiliation")*/
							$('#filterList'+ key).append("<li><div class=\"checkbox\"> <label> <input type=\"checkbox\" class =\"filter " + key + "\" name=\"" + value +"\" >" + value + "</label></div></li>");
					
						/*})*/

					});	
					break;
			case "Number of Appearances":
					key_id = key.replace(/\s+/g, '');
					$('#sortList').append("<li class=\"list-group-item panel-title\"><input type=\"radio\" name=\"sortradio\"><label>"+key+"</label></li>");
			    	$('#filterList').append("<li><a data-toggle=\"collapse\" data-parent=\"#filterList\" href=\"#filter" + key_id + "\">" + key + "</a><div id=\"filter" + key_id + "\" class=\"panel-collapse collapse\"><div class=\"panel-body\"><ul id=\"filterList" + key_id + "\" class=\"nav fixed-panel\"></ul>");
			    	$('#colorList').append("<li><a data-toggle=\"collapse\" data-parent=\"#colorList\" href=\"#color" + key_id + "\">" + key + "</a><div id=\"color" + key_id + "\" class=\"panel-collapse collapse\"><div class=\"panel-body\"><ul id=\"colorList" + key_id + "\" class=\"nav fixed-panel\"></ul>");

				  	$.each(val, function( index, value )
				  	{

				  		$.each(value, function ( prop, propVal){
				  			//console.log(prop);
				  		
				  			if(prop == "gender" || prop == "nationality" || prop == "Number of Appearances")
				  			{
				  				if($.isNumeric(propVal))
					    		{
					    			propVal = propVal.toString();
					    			console.log(propVal);
					    		}
				  				//$('#sortList'+ key_id).append("<li><div class=\"radio\"> <label> <input type=\"radio\" name = \"sortopt\" class = \"sort " + key_id + " \"id =\""+ propVal +"\">" + propVal + "</label></div></li>");
					    		$('#filterList'+ key_id).append("<li><div class=\"checkbox\"> <label> <input type=\"checkbox\"  class = \"filter " + key_id + " \"name =\""+ propVal +"\">" + propVal + "</label></div></li>");
					    		//$('#colorList'+ key_id).append("<li><div class=\"checkbox\"> <label> <input type=\"checkbox\" class = \"color " + key_id + " \"name =\""+ propVal +"\">" + propVal + "</label></div></li>");
				  			}
				  		})
					    
					});
					break;
			default:
					alert('Error');
		}


	})
}

function parseData(len , data){
	dataLength = len;
	var start = len || 0;
	console.log(data);
	characterData = data.slice(0,dataLength);
		//console.log(characterData)
		if (chartSettings.innerChart == 'chords') {
			getConnectionsData(start);
		} else {
			getBarData(start);
		}
		switch (chartSettings.sorting) {
			case 'alphabetical':
				characterData.sort(sortAlpha)
				break;
			case 'gender':
				characterData.sort(sortGender);
			break;
		}
}

function addFilter(ref){

		var listType = $(ref).parent("li").parents("ul").attr("id");
		console.log(listType);
		//selectedFilters[filterIndex] = listType;
		selectedFilters = $(ref).children("label").text();
		console.log(selectedFilters);
}
function removeFilter(ref){
		var listType = $(ref).parent("li").parents("ul").attr("id");
		console.log(listType);
		//selectedFilters[filterIndex] = listType;
		$.each(selectedFilter, function(key, val){
			if (val == $(ref).children("label").text() )
			{
				delete selectedFilter.key;
			}
		});
		console.log(selectedFilters);

}

function pinOption(name,type)
{
	console.log(name);
	console.log(type);
	console.log('#'+type+'pin');
	$('#'+type+'Pin').append(name+"<br>");
}
/* Change inactive icon and set ascending/descending sort order*/
$('#sortAsc').click(function() {
	sortBy = 'asc';
	$(this).addClass('active');
	$('#sortDesc').removeClass('active');
	characterData.reverse();
	updateChart();
	return false;
})

$('#sortDesc').click(function() {
	sortBy = 'desc';
	$(this).addClass('active');
	$('#sortAsc').removeClass('active');
	characterData.reverse();
	updateChart();
	return false;
})

$('#modechange').click(function() {
	$('#pieBox').removeAttr("class");
	if (chartSettings.innerChart == 'bars') { 
		//switch to chords
		chartSettings.innerChart = 'chords';
		$(this).text("Connections Mode");
	}
	else { //switch to bars
		$(this).text(" Bars Mode");
		chartSettings.innerChart = 'bars';
		$('#pieSliceBox > g.core').attr("class", "selected");
		$('#pieSliceBox > g.selected-connection').removeAttr("class")
		if ($('#chordsBox > path.core-selected').size() > 0)
			$('#chordsBox > path.core-selected').attr("class", $('#chordsBox > path.core-selected').attr("class").replace('core-selected', 'selected'))
	}
	if (Object.keys(characterData[0]).indexOf("barchart") < 0 || connectionsData.length < 1) { //only generate random data for new data
		getData();	
	} else {
		getData(dataLength);	
	}
})


$(function() {

    $( "#tags" ).autocomplete({
      source: availableTags
    });
  });