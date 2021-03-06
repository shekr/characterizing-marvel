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
	/* SEARCH AUTOCOMPLETE */
	$( "#search" ).autocomplete({
		minLength: 0,
		source: autoSuggestData,
		autoFocus: true,
		select: function( event, ui ) {
			$("#search").val( ui.item.label );
			if (chartSettings.innerChart == 'bars') {
				svg.select("#bar-"+ui.item.value).each(barClick)
			} else if (chartSettings.innerChart == 'chords') {
				svg.select("#sliceGroup-"+ui.item.value).each(sliceClick).each(chordClick)
			}
			return false;
		}
	})
	
	$("#searchClear").click(function(){
    	$("#search").val('');
	});
	
	/* CLEAR ALL SELECTIONS */
	$('#clearer').click(function() {
		svg.selectAll('#pieSliceBox > g, #chordsBox path, #barsBox > g').classed('selected', false).classed('core-selected', false).classed('selected-connection', false).classed('selected-connection-core', false);
		svg.selectAll('#pieSliceBox > g.core').classed('core', false);
		$('#vis-detail').removeClass("viewable");
	})
	
	/* CONNECTIONS SLIDER */
	$( "#slider" ).slider({
		change: function(event, ui) { 
        	chordsThreshold(ui.value) 
    	} 	
	});
	
	
	/* Sorting radio button workaround */ 
	$('.radClick').click(function(){
		//console.log("click")
		$(this).children('input').prop('checked', true);
	})

	/* Sorting implementation */
	$(document).on('change' , '#sortList :radio' , function()
	{
		var option = $(this).next("label").text();
		//console.log(option);
		pinOption(option,"sort");
		switch(option){
			case "Gender":
					chartSettings.sorting = 'gender';
					characterData.sort(sortGender)
					if($("#sortDesc").hasClass("active"))
					{
						characterData.reverse();
					}
					updateChart();
					break;
			case "Year of Introduction":
					chartSettings.sorting = 'intro_year';
					characterData.sort(sortYear)
					console.log(characterData);
					updateChart();
					break;			
			case "Nationality":		
					chartSettings.sorting = 'nationality';
					characterData.sort(sortNation)
					updateChart();
					break;			
			case "Number of Appearances":		
					chartSettings.sorting = 'appearances';
					characterData.sort(sortAppear)
					updateChart();
					break;
			default:
			break;
		}
	});

	$(document).on('change' , '#colorList :radio' , function()
	{
		var option = $(this).next("label").text();
		//console.log(option);
		pinOption(option,"color");
		switch(option){
			case "Gender":
					chartSettings.colorCode = 'gender';
					svg.selectAll('#pieSliceBox path.slice')
						.transition()
						.duration(300)
						.style("fill", colCodeGender)
					break;	
			case "Nationality":		
					chartSettings.colorCode = 'nationality';
					svg.selectAll('#pieSliceBox path.slice')
						.transition()
						.duration(300)
						.style("fill", colCodeNation)
					break;			
			case "Number of Appearances":		
					chartSettings.colorCode = 'appearances';
					svg.selectAll('#pieSliceBox path.slice')
						.transition()
						.duration(300)
						.style("fill", colCodeAppear)
					break;
			case "Year of Introduction":		
					chartSettings.colorCode = 'year';
					svg.selectAll('#pieSliceBox path.slice')
						.transition()
						.duration(300)
						.style("fill", colCodeYear)
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
				if($(ref[index]).hasClass("Gender"))
				{
					
					//pinOption("Gender",pinType);
					chartSettings.colorCode = 'gender';
					svg.selectAll('#pieSliceBox path.slice')
					.transition()
					.duration(300)
					.style("fill", colCodeGender)


				}
				if($(ref[index]).hasClass("Number of Appearances"))
				{
					
					pinOption("Number of Appearances",pinType);
					
				}
			}
			else if($(ref[index]).hasClass("filter"))
			{
					pinType = "filter";
					if($(ref[index]).hasClass("Affiliation"))
				{
					/* post to api*/
					console.log(value.name);
					console.log(pinType);
					pinOption(value.name,pinType);
					$.post( "https://marvelinfovis.herokuapp.com/api/filter/affiliation/", { "name": value.name})
					.done(function(data) {
						parseData(data.length,data);
						updateChart();


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
						updateChart();


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
						updateChart();
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
			    	$('#colorList').append("<li class=\"list-group-item panel-title\"><input type=\"radio\" name=\"colorradio\"><label>"+key+"</label></li>");

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
			case "Year of Introduction":
			case "Consommation":
					key_id = key.replace(/\s+/g, '');
					$('#sortList').append("<li class=\"list-group-item panel-title\"><input type=\"radio\" name=\"sortradio\"><label>"+key+"</label></li>");
			    	$('#filterList').append("<li><a data-toggle=\"collapse\" data-parent=\"#filterList\" href=\"#filter" + key_id + "\">" + key + "</a><div id=\"filter" + key_id + "\" class=\"panel-collapse collapse\"><div class=\"panel-body\"><ul id=\"filterList" + key_id + "\" class=\"nav fixed-panel\"></ul>");
					$('#colorList').append("<li class=\"list-group-item panel-title\"><input type=\"radio\" name=\"colorradio\"><label>"+key+"</label></li>");
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
			    	$('#colorList').append("<li class=\"list-group-item panel-title\"><input type=\"radio\" name=\"colorradio\"><label>"+key+"</label></li>");

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
			//getBarData(start);
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
	if( type == "sort")
	{
		$('#'+type+'Pin').text("");
		$('#'+type+'Pin').append(name+"<br>");
	}else if (type == "color"){
		$('#'+type+'Pin').text("");
		$('#'+type+'Pin').append(name+"<br>");

	}else{
		$('#'+type+'Pin').append(name+"<br>");
	}

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
		$(this).text(" Switch to Bars");
		$('#sliderBox').show();
	}
	else { //switch to bars
		chartSettings.innerChart = 'bars';
		$(this).text(" Switch to Relationships");
		$('#sliderBox').hide()
		//get rid of chord event listeners on slices
		svg.selectAll('#pieSliceBox > g').on('mouseover.chord', null).on('mouseout.chord', null);
		//change all slices that are core to selected, ones that are selected-connection or selected-connection-core off
		$('#pieSliceBox > g.core').attr("class", "selected");
		$('#pieSliceBox > g.selected-connection').removeAttr("class")
	}
	//getData(); no longer needed bc updating all data on first getdata
	innerChartDataDoneCallback();
})

function findPropName(data, prop, name){
	var propArr=[];
	$.each(data[prop], function(index,val){
		//console.log(name);
		propArr[index]= val[name];
		//console.log(propArr[index]);
	})
	return propArr;
}
function findRange(data,prop){
	//r1 = d3.max(data);
	//r2 = d3.min(data);
	//console.log(prop);
	var range = d3.extent(data)
	var scale= d3.scale.linear()
		.domain(range)
	//	.range([r2, r1])
	//console.log(r1);
	//console.log(r2);
	//console.log(scale.ticks(10));
	return scale.ticks(12);
}

function calcRange(data, prop, name){
	var arr = findPropName(data,prop,name);
	var ticks = findRange(arr,name);
	//console.log(arr);
	//console.log(ticks);
	return ticks;
}
$(function() {

    $( "#tags" ).autocomplete({
      source: availableTags
    });
  });