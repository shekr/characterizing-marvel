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

*/
$( document ).ready(function() {
  console.log( 'ready!' );
  updateCtrl();

  $("#filterPane :checkbox").change(function(){
	/* Send selected control options */
	console.log("filter");
    /* Request list of control options and filtered data*/

    /* Update list of control options */
    updateCtrl();

    /* Update data on vis*/
    if($(this).attr("checked"))
    {
	    dataLength += 20;
		getData(dataLength);
		updatePieData(characterData, connectionsData)
    }
    else
    {
    	dataLength -= 10;
		characterData = characterData.slice(0,dataLength);
		console.log(characterData.length);
		updatePieData(characterData, connectionsData)
       
    }
	});

	$("#sortPane:checkbox").change(function(){
	    /* Send selected control options */
	    console.log("sort");
	    /* Request list of control options*/

	    /* Update list of control options*/
	    updateCtrl();

	    /* Sort data on vis*/
	    /* Update data on vis 
	    if($(this).attr("checked"))
	    {
	       var sel = $(this).next("label").text(); 
	       console.log("sort "+ sel);
	    }
	    else
	    {
	        var unsel = $(this).innerHTML; 
	        console.log("unsort "+ unsel);
	    }*/
	    sorting = 'gender';
		characterData.sort(sortGender)
		updatePieData(characterData, connectionsData);
	});

	$("#colorPane :checkbox").change(function(){
		
	    /* Send selected control options */
	    console.log("color");
	    /* Request list of control options */

	    /* Update list of control options */
	    updateCtrl();

	    /* Set colors of data on vis


	    if($(this).attr("checked"))
	    {
	       var sel = $(this).next("label").text(); 
	       console.log("color "+ sel);
	    }
	    else
	    {
	        var unsel = $(this).next("label").text(); 
	        console.log("uncolor "+ unsel);
	    }*/

	    colorCode = 'gender';
		svg.selectAll('#pieSliceBox path.slice')
		.transition()
		.duration(300)
		.style("fill", colCodeGender)
	});
 
});



function updateCtrl() 
{
	console.log("update Control options");

	/*Clear previous values*/

	$('filterList').empty();
	$('colorList').empty();
	$('sortList').empty();

	/*Request Options from API*/

	getFilterData();

	/*Redraw control options depending on filter, sort or color code 
	by appending collapsibe li elements for each category and sub-category in the controlOptions object*/

  	$.each(controlOptions, function( key, val ) {
  		/*console.log(key);*/
		if(key == "Gender" || key == "Nationality" || key == "Number of Appearances")
	    {
	    	$('#sortList').append("<li><a data-toggle=\"collapse\" data-parent=\"#sortPane\" href=\"#sort" + key + "\">" + key + "</a><div id=\"sort" + key + "\" class=\"panel-collapse collapse\"><div class=\"panel-body\"><ul id=\"sortList" + key + "\" class=\"nav\"></ul>");
	    	$('#filterList').append("<li><a data-toggle=\"collapse\" data-parent=\"#filterPane\" href=\"#filter" + key + "\">" + key + "</a><div id=\"filter" + key + "\" class=\"panel-collapse collapse\"><div class=\"panel-body\"><ul id=\"filterList" + key + "\" class=\"nav\"></ul>");
	    	$('#colorList').append("<li><a data-toggle=\"collapse\" data-parent=\"#colorPane\" href=\"#color" + key + "\">" + key + "</a><div id=\"color" + key + "\" class=\"panel-collapse collapse\"><div class=\"panel-body\"><ul id=\"colorList" + key + "\" class=\"nav\"></ul>");

		  	$.each(val.subcategories, function( index, value )
		  	{
			    /*console.log(value.subcategory);*/
			    $('#sortList'+ key).append("<li><div class=\"radio\"> <label> <input type=\"radio\" name=\"optradio\">" + value.subcategory + "</label></div></li><li>");
			    $('#filterList'+ key).append("<li><div class=\"checkbox\"> <label> <input type=\"checkbox\">" + value.subcategory + "</label></div></li><li>");
			    $('#colorList'+ key).append("<li><div class=\"checkbox\"> <label> <input type=\"checkbox\">" + value.subcategory + "</label></div></li><li>");
			});	    	

		} else if(key == "Year of Introduction" || key == "Consommation" )
		{	
			$('#sortList').append("<li><a data-toggle=\"collapse\" data-parent=\"#sortPane\" href=\"#sort" + key + "\">" + key + "</a><div id=\"sort" + key + "\" class=\"panel-collapse collapse\"><div class=\"panel-body\"><ul id=\"sortList" + key + "\" class=\"nav\"></ul>");
	    	$('#filterList').append("<li><a data-toggle=\"collapse\" data-parent=\"#filterPane\" href=\"#filter" + key + "\">" + key + "</a><div id=\"filter" + key + "\" class=\"panel-collapse collapse\"><div class=\"panel-body\"><ul id=\"filterList" + key + "\" class=\"nav\"></ul>");
			$.each(val.subcategories, function( index, value )
			{
			    $('#sortList'+ key).append("<li><div class=\"radio\"> <label> <input type=\"radio\" name=\"optradio\">" + value.subcategory + "</label></div></li><li>");
			    $('#filterList'+ key).append("<li><div class=\"checkbox\"> <label> <input type=\"checkbox\">" + value.subcategory + "</label></div></li><li>");
			});	 			

		} else if(key == "Affiliation")
		{
			$('#filterList').append("<li><a data-toggle=\"collapse\" data-parent=\"#filterPane\" href=\"#filter" + key + "\">" + key + "</a><div id=\"filter" + key + "\" class=\"panel-collapse collapse\"><div class=\"panel-body\"><ul id=\"filterList" + key + "\" class=\"nav\"></ul>");
			$.each(val.subcategories, function( index, value )
			{
				$('#filterList'+ key).append("<li><div class=\"checkbox\"> <label> <input type=\"checkbox\">" + value.subcategory + "</label></div></li><li>");
			});	
		}	

	})
}


/* Change inactive icon and set ascending/descending sort order*/
$('#sortAsc').click(function() {
	sortBy = 'asc';
	$(this).addClass('inactive');
	$('#sortDesc').removeClass('inactive');
	return false;
})

$('#sortDesc').click(function() {
	sortBy = 'desc';
	$(this).addClass('inactive');
	$('#sortAsc').removeClass('inactive');
	return false;
})

