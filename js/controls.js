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
*/
$( document ).ready(function() {
  console.log( 'ready!' );

  /* Request and set defaults*/

  $('#sort :checkbox').on('change', function () {
	    /* Sort data on vis*/
	    /* Update data on vis */
	    /* Send selected control options */
	    /* Request list of control options */
	    getData();
	    /* Update list of control options */
	    updateCtrl(filterData, "sort");

	});

	$('#filter :checkbox').on('change', function () {
	    /* Send selected control options */
	    /* Request list of control options and filtered data*/
	    /* Update data on vis */
	    /* Update list of control options */

	});

	$('#colorcode :checkbox').on('change', function () {
	    /* Set colors of data on vis*/
	    /* Send selected control options */
	    /* Request list of control options */
	    /* Update list of control options */

	});

});

function updateCtrl(data, type) {
	console.log("update Control options");
	if(type == "sort"){
		/* Add li element of checkbox type for each data allowed */
		/* for id sortGender */

		var gender = controlOptions.gender.subcategories;

		for(i=0; i< gender.length; i++)
		{
			console.log(gender[i].subcategory);
			$('#sortGenderlist').append("<li class \"checkbox\"><label><input type=\"checkbox\" value=\"\"> " + gender[i].subcategory + "</label></li>");

		}
		
			
	}


}






