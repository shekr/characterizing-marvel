/* pie.js
* controls all visualization inside the pie chart
* uses helpful pointers from example: http://bl.ocks.org/dbuezas/9306799
*/

/* PIE VARS */
var svg = d3.select("#vis-pie");

var bounds = d3.select('#vis-pie').node().getBoundingClientRect();

var width = 950,
    height = 750,
	radius = Math.min(width, height) / 2;

var innerPieRadius = radius*.9;
var outerTextRadius = radius*1.05;
var innerArcLineRadius = radius*.8;

var imageHeight = 60;
var imageWidth = 60;

var pie = d3.layout.pie()
	.value(function(d) {
		return 1;
	});	

var arc = d3.svg.arc()
	.outerRadius(radius)
	.innerRadius(innerPieRadius);

var textArc = d3.svg.arc()
	.innerRadius(outerTextRadius)
	.outerRadius(outerTextRadius);
	
var outsideArc = d3.svg.arc()
	.outerRadius(radius)
	.innerRadius(radius);
	
var insideArc = d3.svg.arc()
	.outerRadius(innerPieRadius)
	.innerRadius(innerPieRadius);
	
var insideArcLineArc = d3.svg.arc()
	.outerRadius(innerArcLineRadius)
	.innerRadius(innerArcLineRadius);
	
var arcLine = d3.svg.line()
    .x(function(d) { return d[0] })
    .y(function(d) { return d[1]; })
    .interpolate("bundle")
	.tension(.7);
	
svg.attr("x", (bounds.width - width)/2).attr("y", (bounds.height-height)/2)
svg.select("g#pieBox").attr("transform", "translate(" + bounds.width/2 + "," + bounds.height/ 2 + ")");

/* KEY FUNCS */
var pieKey = function(d){ return d.data.character_id; };
var chordKey = function(d, i) {
	if (d.cid1 == Math.min(d.cid1, d.cid2))
		return d.cid1 +  '-' + d.cid2
	else
		return d.cid2 +  '-' + d.cid1
}
var barKey = function(d) { return 'bar'+d.data.character_id }

svg.select('#pieBox').classed(chartSettings.innerChart, true);

/*** FILTER EXAMPLE IMPLEMENTATION ***/
$('#sorter').click(function() {
	chartSettings.sorting = 'gender';
	characterData.sort(sortGender)
	updateChart();
})

$('#color-coder').click(function() {
	chartSettings.colorCode = 'gender';
	svg.selectAll('#pieSliceBox path.slice')
		.transition()
		.duration(300)
		.style("fill", colCodeGender)
	return false;
})

$('#adder').click(function() {
	dataLength += 20;
	getData(dataLength);
})

$('#remover').click(function() {
	dataLength -= 10;
	characterData = characterData.slice(0,dataLength);
	updateChart();
})

$('#mode-changer').click(function() {
	$('#pieBox').removeAttr("class");
	if (chartSettings.innerChart == 'bars') { 
		//switch to chords
		chartSettings.innerChart = 'chords';
	}
	else { //switch to bars
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
/*** END FILTER EXAMPLE IMPLEMENTATION ***/

/* INIT DATA CALL*/
getData();
	
	
/* VIS UPDATE FUNCS */
function updateChart() {
	updatePie(characterData)
	if (chartSettings.innerChart == 'bars')
		updateBars(characterData);
	else {
			getConnectionsFakeData(0); //DELETE ME WHEN STANDARD CONNECTIONS DONE
		updateChords(connectionsData);
	}
}

/******** PIE ***********
************************/
function updatePie(data) {
	
	svg.select('#pieBox').attr("class", chartSettings.innerChart);
	
	/** PIE SLICES **/	
	var sliceParents = svg.select('#pieSliceBox').selectAll("g").data(pie(data), pieKey);
	
	sliceParents
		.enter()
		.append("g")
		.attr("id", function(d) {
			return "sliceGroup-" + d.data.character_id;
		})
		.append("path")	
		.attr("class", "slice")
		.style("fill", function(d) {
			switch (chartSettings.colorCode) {
				case 'neutral': 
					return '#666';
					break;
				case 'gender':
					return colCodeGender(d)
					break;	
			}
		});
		
	sliceParents.sort();	
	sliceParents.select('path.slice')
		.transition()
		.duration(600)
		.attr('d', arc);
		
	sliceParents.exit().remove()
	
	/** TEXT LABELS **/
	/* GROUP */
	var labelBoxes = sliceParents
	.append('g')
	.classed('label-box', true)
	
	labelBoxes
	.transition()
	.duration(600)
	.attr("transform", function(d) {
		return "translate(" + textArc.centroid(d) + ")";
	})
	
	/* CLIPPING PATH */
	labelBoxes.append("clipPath")
		.attr("id", function(d) {
			return "secondary-clip" + d.data.character_id;
		})
		.append("circle")
		.attr("r", imageHeight/2)
		.attr("cx", imageWidth/2)
		.attr("cy", imageHeight/2)
	
	/* IMAGE */
	labelBoxes.append("image")
	.attr("xlink:href", function(d) {
		return generateImageLink(d.data.image, "standard_medium")
	})
	.attr("height", imageHeight)
	.attr("width", imageWidth)
	.attr("transform", function(d, i) {
		var vertTransform = 0;
		var horizTransform = 0;
		if (i > dataLength/2)
			horizTransform = -imageWidth;
		if (i < dataLength/4 || i > (dataLength/2 + dataLength/4)) 
			vertTransform = -(imageHeight+10);
		else
			vertTransform = 10;
		return "translate(" + horizTransform + "," + vertTransform +")";
	})
	.attr("clip-path", function(d) {
		return "url(#secondary-clip" + d.data.character_id + ")"
	})
	
	//detail pane images prefetch
	labelBoxes.append("image")
		.attr("xlink:href", function(d) {
			return generateImageLink(d.data.image, "portrait_medium")
		})
		.attr("class", "detail-pane");
	
	/* NAME TEXT */
	labelBoxes.append("text")
		.attr("text-anchor", function(d, i) {
			if (i < dataLength/2)
				return "start";	
			else
			 return "end"; 
		})
		.text(function(d) {
			return d.data.name;
		})
		.classed("name", true)
		
	/* NAME ALONE TEXT */
	sliceParents.append("text")
		.attr("text-anchor", function(d, i) {
			if (i < dataLength/2)
				return "start";	
			else
			 return "end"; 
		})
		.text(function(d) {
			return d.data.name
		})
		.attr("transform", function(d, i) {
			var transformAngle = (180/3.14) * d.startAngle-90;
			if (i >= dataLength/2) 
				transformAngle = transformAngle-180;
			//console.log(transformAngle)
			return "translate("+textArc.centroid(d)+ ")rotate(" + transformAngle + ")"; 
		})
		.attr("class", "name-only")
	
		
	/** SLICE EVENTS **/	
	sliceParents.on('mouseover', function(d){
		//slice and label
		var nodeSelection = d3.select(this);
		var charID = nodeSelection.attr("id").replace('sliceGroup-', '');
		nodeSelection.classed('active', true);
		populateDetailCard(nodeSelection.datum().data);	
		d3.select('#vis-detail').classed('viewable', true);
	})
	
	sliceParents.on('mouseout', function(d){
		//slice and label
    	var nodeSelection = d3.select(this);
		nodeSelection.classed('active', false);
		var charID = nodeSelection.attr("id").replace('sliceGroup-', '');
		selectC = svg.select('#pieBox g.selected');
		if (selectC.size() > 0) {
			populateDetailCard(selectC.datum().data);
		} else {
			d3.select('#vis-detail').classed('viewable', false);
		}
	})
	
	sliceParents.on('click', function(d) {
		var charID = d.data.character_id;
		var sliceParents = d3.selectAll('#pieSliceBox > g');
		var nodeSelection = svg.select('#sliceGroup-'+charID);
		var selectedState = nodeSelection.classed('selected');
		
		//turn all selected off
		if (chartSettings.innerChart != 'bars')
			sliceParents.classed('selected', false);
		nodeSelection.classed('selected', !selectedState);
	})	
	
	svg.select("polyline#startLine").remove();

	d3.select("svg")
		.append('polyline')
		.attr("id", "startLine")
		.attr('points', function() {
			return (width/2) + "," + (height/2) + " " + (width/2)+ ",0";
		})
		.attr("stroke", "#000")
		.attr("stroke-width", "1px")
};

/******** CHORDS ***********
************************/

function updateChords(connections) {
	//only create paths for slices that exist in curr view
	var positionalConnections = [];
	var charIndices = characterData.map(function(x) {return x.character_id; });
	for (var j = 0; j < connections.length; j++) {
		//add in index of their slices so that when either moves, triggers update in data
		connections[j].sIndex1 = charIndices.indexOf(connections[j].cid1)
		connections[j].sIndex2 = charIndices.indexOf(connections[j].cid2)
		positionalConnections.push(connections[j]);
	}
	
	/* CREAT CHORDS */
	var chords = svg.select('#chordsBox').selectAll("path").data(positionalConnections, chordKey)
	chords.exit().remove()

	chords
		.enter()
		.append("path")
		.attr("class", function(d) {
			var classes = 'chord-'+ Math.min(d.cid1, d.cid2) + ' ' + 'chord-'+ Math.max(d.cid1, d.cid2);
			if (d.type != "standard")
				classes += ' core';
			return classes;
		})
		
	chords
		.transition()
		.duration(600)
		.attr("d", function(d) {
			var startSliceData = svg.select('#sliceGroup-' + d.cid1).datum();
			var endSliceData = svg.select('#sliceGroup-'  + d.cid2).datum();
			var midPoint = [];
			var startPoint = insideArc.centroid(startSliceData);
			var startBuffer = insideArcLineArc.centroid(startSliceData);
			var endBuffer = insideArcLineArc.centroid(endSliceData);
			var endPoint = insideArc.centroid(endSliceData);
			midPoint[0] = (endBuffer[0] + startBuffer[0])/2;
			midPoint[1] = (endBuffer[1] + startBuffer[1])/2;	
			return arcLine([startPoint, startBuffer, midPoint, endBuffer, endPoint]);			
		})
		
	chords
		.classed('selected', function(d) {
			if (svg.select('#sliceGroup-' + d.cid1 + '.selected').size() > 0 || svg.select('#sliceGroup-' + d.cid2+'.selected').size() > 0)
				return true;
			else
				return false;
		})		
	
	
	/** CHORD EVENTS **/
	var sliceParents = svg.selectAll('g#pieSliceBox > g');
	
	//swap click handler on PIE slices for one with 3 states
	sliceParents.on('click', function(d){
		var nodeSelection = d3.select(this);
		var selectedState = nodeSelection.classed('selected');
		var coreState = nodeSelection.classed('core');
		var charID = d.data.character_id;
		
		//turn all selected off
		sliceParents.classed('selected', false);
		svg.selectAll('g.selected-connection').classed('selected-connection', false);
		if (coreState) {
			//turn all selection off
			nodeSelection.classed('core', false);
		}
		else {
			if (selectedState) {
				//turn core on
				var cDetail = relationshipData[0]; //TODO: replace with API call
				nodeSelection.classed('core', true);
				nodeSelection.classed('selected', true);
				svg.select('#chordsBox').selectAll('.core.chord-' + charID).each(function(nodeData) {
					//add class to slices
					var connectedCharID = nodeData.cid1 == charID ? nodeData.cid2 : nodeData.cid1
					var connSelect = svg.select('#sliceGroup-' + connectedCharID)
					connSelect.classed('selected-connection', true);
					
					//add instances numbers
					var nameLabel = connSelect.select('.label-box text.name')
					connSelect.select('.label-box').append('text')
						.attr("text-anchor", function(d, i) {
							return nameLabel.attr("text-anchor") 
						})
						.text(function(d) {
							return nodeData.instances;
						})
						.attr("y", function(d) {
							return nameLabel.attr("y") + 10;
						})
						.classed("instances", true)
						
					//add rollover detail
					connSelect.select('g.label-box').on('mouseover', function(b) {
						populateRelationshipCard(nodeSelection.datum().data, connSelect.datum().data, cDetail)
						$('#vis-detail #relationship-detail').addClass("active");						
					})
					
					d3.select(this).on('mouseover', function(d) {
						populateRelationshipCard(nodeSelection.datum().data, connSelect.datum().data, cDetail)
						$('#vis-detail #relationship-detail').addClass("active");						
					})
						
				}); //chords
				
			}
			else {
				//turn selected on	
				nodeSelection.classed('selected', true);
			}
		}
	})	
	
	sliceParents.on('mouseover.chord', function(d){
		//chords
		var charID = d.data.character_id;
		if (!d3.select(this).classed("selected-connection"))
			$('#vis-detail #relationship-detail').removeClass('active');
		svg.select('#chordsBox').selectAll('.chord-' + charID).classed('active', true);
	})
	
	sliceParents.on('mouseout.chord', function(d){
 		//chords
		var charID = d3.select(this).attr("id").replace('sliceGroup-', '');
		svg.select('#chordsBox').selectAll('.chord-' + charID).classed('active', false);
	})
	
	sliceParents.on('click.chord', function(d){
		//detection is diff bc slice has already changed classes
		var nodeSelection = d3.select(this);
		var selectedStateNow = nodeSelection.classed('selected');
		var coreStateNow = nodeSelection.classed('core');
		var charID = nodeSelection.attr("id").replace('sliceGroup-', '');
		
		//turn all selected off
		svg.select('#chordsBox').selectAll('path').classed('selected', false).classed('core-selected', false)
		if (coreStateNow && selectedStateNow) //turn core on
			svg.select('#chordsBox').selectAll('.core.chord-' + charID).classed('core-selected', true);			
		if (!coreStateNow && selectedStateNow) //turn selected on	
			svg.select('#chordsBox').selectAll('.chord-' + charID).classed('selected', true);

	})	
}

/******** BARS ***********
************************/

var barRefs = [.875, .75, .625, .5];
function updateBars(data) {
	var barRange = d3.extent(data, function(d) { return d.barchart[chartSettings.barchart] } )
	var barScale= d3.scale.linear()
		.domain(barRange)
		.range([1, 0.5])
	
	/* REFERENCE LINES */
	var bTicks = barScale.ticks(5);
	if (bTicks[0] == 0)
		bTicks.shift();
	
	var refCircles = svg.select('#barsBox').selectAll("circle.refLine").data(bTicks)
	refCircles
		.enter()
		.append("circle")
		.attr("class", "refLine")
		
	refCircles
		.attr("r", function(d) {
			return innerPieRadius*barScale(d);	
		})
		
	refCircles.exit().remove()
	
	/* BARS */	
	var bars = svg.select('#barsBox').selectAll('g').data(pie(data), pieKey)
	
	bars
		.enter()
		.append("g")
		.attr("id", function(d) {
			return "bar-" + d.data.character_id;
		})
		.append("path")
		.attr("class", "barSlice")		

	bars.select("path.barSlice")
		.transition()
		.duration(600)
		.attr('d', function(d) {
			var dynamicArc = d3.svg.arc()
				.innerRadius(innerPieRadius*barScale(d.data.barchart[chartSettings.barchart]))
				.outerRadius(innerPieRadius);
			return dynamicArc(d);
		})		
	
	/* BAR LABELS */		
	bars
		.append("text")
		.attr("class", "bar-label")
		
	bars.select("text.bar-label")
		.transition()
		.duration(600)
		.attr("text-anchor", function(d, i) {
			if (i < dataLength/2)
				return "start";	
			else
			 return "end"; 
		})
		.text(function(d) {
			return d.data.barchart[chartSettings.barchart];
		})
		.attr("transform", function(d, i) {
			var transformAngle = (180/3.14) * d.startAngle-90;
			if (i >= dataLength/2) 
				transformAngle = transformAngle-180;
			
			var dynamicArcBound = innerPieRadius*barScale(d.data.barchart[chartSettings.barchart]) - 20;			
			var dynamicArc = d3.svg.arc()
				.innerRadius(dynamicArcBound)
				.outerRadius(dynamicArcBound);
				
			return "translate("+dynamicArc.centroid(d)+ ")rotate(" + transformAngle + ")"; 
		})
	
	bars.exit().remove();
	
	/*REFERENCE TICKS*/	
	var refNums = svg.select('#barsBox').selectAll("text.ref").data(bTicks)
	
	refNums
		.enter()
		.append("text")
		.attr("class", "ref")
	
	refNums
		.text(function(d) { return d })
		.attr("y", function(d) {
			return -(barScale(d)*innerPieRadius);
		})
	
	refNums.exit().remove()
	
	/*** EVENTS ***/
	
	/* Bar Events */
	bars.on('mouseover', function(d) {
		d3.select(this).classed("active", true);
		svg.select('#sliceGroup-'+d.data.character_id).classed('active', true);
		populateDetailCard(d.data);
		d3.select('#vis-detail').classed('viewable', true)
	})
	
	bars.on('mouseout', function(d) {
		d3.select(this).classed("active", false);
		svg.select('#sliceGroup-'+d.data.character_id).classed('active', false);
		selectC = svg.select('#pieBox g.selected');
		if (selectC.size() > 0) {
			populateDetailCard(selectC.datum().data);
		} else {
			d3.select('#vis-detail').classed('viewable', false);
		}
	})
	
	bars.on('click', function(d) {
		var charID = d.data.character_id;
		var selectedStateNow = d3.select(this).classed("selected")
		d3.select(this).classed("selected", !selectedStateNow);
		svg.select('#sliceGroup-'+charID).classed("selected", !selectedStateNow)
	})
	
	/* Pie Events */
	var sliceParents = svg.selectAll('g#pieSliceBox > g');
	
	sliceParents.on('mouseover.bars', function(d) {
		svg.select('#bar-'+d.data.character_id).classed('active', true);
	})
	
	sliceParents.on('mouseout.bars', function(d) {
		svg.select('#bar-'+d.data.character_id).classed('active', false);
	})
	
	sliceParents.on('click.bars', function(d) {
		var charID = d.data.character_id;
		var selectedStateAfter = d3.select(this).classed('selected');
		d3.select(this).classed('selected', selectedStateAfter)
		svg.select('#bar-'+d.data.character_id).classed('selected', selectedStateAfter);	
	});	
}