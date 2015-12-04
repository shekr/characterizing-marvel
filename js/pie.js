/* pie.js
* controls all visualization inside the pie chart
* uses helpful pointers from example: http://bl.ocks.org/dbuezas/9306799
*/

var svg = d3.select("#vis-pie");

var bounds = d3.select('#vis-pie').node().getBoundingClientRect();

var width = 950,
    height = 750,
	radius = Math.min(width, height) / 2;

var innerPieRadius = radius*.9;
var outerTextRadius = radius*1.05;
var innerArcLineRadius = radius*.8;

var imageHeight = 112;
var imageWidth = 75;

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

var pieKey = function(d){ return d.data.cid; };
var chordKey = function(d) {
	if (d.id1 == Math.min(d.id1, d.id2))
		return d.id1 +  '-' + d.id2
	else
		return d.id2 +  '-' + d.id1
}
var barKey = function(d) { return 'bar'+d.data.cid }

svg.select('#pieBox').classed(chartSettings.innerChart, true);
updateChart();

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
	updateChart();

})

$('#remover').click(function() {
	dataLength -= 10;
	characterData = characterData.slice(0,dataLength);
	updateChart();	
})

$('#mode-changer').click(function() {
	$('#pieBox').removeAttr("class");
	if (chartSettings.innerChart == 'bars') 
		chartSettings.innerChart = 'chords';	
	else {
		chartSettings.innerChart = 'bars';
		$('#pieSliceBox > g.core').attr("class", "selected");
		$('#pieSliceBox > g.selected-connection').removeAttr("class")
		if ($('#chordsBox > path.core-selected').size() > 0)
			$('#chordsBox > path.core-selected').attr("class", $('#chordsBox > path.core-selected').attr("class").replace('core-selected', 'selected'))
	}
	if (Object.keys(characterData[0]).indexOf("barchart") < 0 || connectionsData.length < 1) {
		getData();	
	} else {
		getData(dataLength);	
	}
	$('#pieBox').attr("class", chartSettings.innerChart);
	updateChart();	
})
/*** END FILTER EXAMPLE IMPLEMENTATION ***/

function updateChart() {
	updatePie(characterData)
	if (chartSettings.innerChart == 'bars')
		updateBars(characterData);
	else
		updateChords(connectionsData);	
}

function updatePie(data) {	
	
	/** PIE SLICES **/	
	var sliceParents = svg.select('#pieSliceBox').selectAll("g").data(pie(data), pieKey);
	
	sliceParents
		.enter()
		.append("g")
		.attr("id", function(d) {
			return "sliceGroup-" + d.data.cid;
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
	var labelBoxes = sliceParents
	.append('g')
	.classed('label-box', true)
	
	labelBoxes
	.transition()
	.duration(600)
	.attr("transform", function(d) {
		return "translate(" + textArc.centroid(d) + ")";
	})
	
	labelBoxes.append("clipPath")
		.attr("id", function(d) {
			return "secondary-clip" + d.data.cid;
		})
		.append("circle")
		.attr("r", 30)
		.attr("cx", imageWidth/2)
		.attr("cy", imageHeight/3)
	
	labelBoxes.append("image")
	.attr("xlink:href", function(d) {
		return "img/" + d.data.image;
	})
	.attr("height", imageHeight)
	.attr("width", imageWidth)
	.attr("transform", function(d, i) {
		var vertTransform = 0;
		var horizTransform = 0;
		if (i > dataLength/2)
			horizTransform = -imageWidth;
		if (i < dataLength/4 || i > (dataLength/2 + dataLength/4)) 
			vertTransform = -(imageHeight/2 + 25);
		return "translate(" + horizTransform + "," + vertTransform +")";
	})
	.attr("clip-path", function(d) {
		return "url(#secondary-clip" + d.data.cid + ")"
	})
	
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
	
	sliceParents.on('click', defaultSliceGroupClickHandler)	
};

function defaultSliceGroupClickHandler (d) {
		var charID = d.data.cid;
		var sliceParents = d3.selectAll('#pieSliceBox > g');
		var nodeSelection = svg.select('#sliceGroup-'+charID);
		var selectedState = nodeSelection.classed('selected');
		
		//turn all selected off
		sliceParents.classed('selected', false);
		nodeSelection.classed('selected', !selectedState);
}

function updateChords(connections) {
	//only create paths for slices that exist in curr view
	/*var existingConnections = [];
	for (var j = 0; j < connections.length; j++) {
		var slice1 = svg.select('#sliceGroup-' + connections[j].id1);
		var slice2 = svg.select('#sliceGroup-' + connections[j].id2);
		if (slice1.size() + slice2.size() > 1) {
			existingConnections.push(connections[j]);
		}
	}*/	
	
	var chords = svg.select('#chordsBox').selectAll("path").data(connections, chordKey)
	chords.exit().remove()
	console.log(chords.enter().size())
	chords
		.enter()
		.append("path")
		.attr("class", function(d) {
			console.log('should be enter only');
			var classes = 'chord-'+ Math.min(d.id1, d.id2) + ' ' + 'chord-'+ Math.max(d.id1, d.id2);
			if (d.type != "standard")
				classes += ' core';
			return classes;
		})
		.classed('selected', function(d) {
			if (svg.select('#sliceGroup-' + d.id1 + '.selected').size() > 0 || svg.select('#sliceGroup-' + d.id2+'.selected').size() > 0)
				return true;
			else
				return false;
		})
		
	chords
		.transition()
		.duration(600)
		.attr("d", function(d) {
			//console.log(svg.select('g.chordsBox path.chord-' + d.id1 + '.chord-' + d.id2).size());
			var startSliceData = svg.select('#sliceGroup-' + d.id1).datum();
			var endSliceData = svg.select('#sliceGroup-'  + d.id2).datum();
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
			if (svg.select('#sliceGroup-' + d.id1 + '.selected').size() > 0 || svg.select('#sliceGroup-' + d.id2+'.selected').size() > 0)
				return true;
			else
				return false;
		})
		
	
	
	/** EVENTS **/
	var sliceParents = svg.selectAll('g#pieSliceBox > g');
	
	//swap click handler on PIE slices for one with 3 states
	sliceParents.on('click', function(d){
		var nodeSelection = d3.select(this);
		var selectedState = nodeSelection.classed('selected');
		var coreState = nodeSelection.classed('core');
		var charID = nodeSelection.attr("id").replace('sliceGroup-', '');
		
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
				nodeSelection.classed('core', true);
				nodeSelection.classed('selected', true);
				svg.select('#chordsBox').selectAll('.core.chord-' + charID).each(function(nodeData) {
					var connectedCharID = nodeData.id1 == charID ? nodeData.id2 : nodeData.id1
					svg.select('#sliceGroup-' + connectedCharID).classed('selected-connection', true);
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
		var charID = d3.select(this).attr("id").replace('sliceGroup-', '');
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

function updateBars(data) {
	var barScale= d3.scale.linear( )
		.domain(d3.extent(data, function(d) { return d.barchart[chartSettings.barchart] } ))
		.range([1, 0.5])
	
	var bars = svg.select('#barsBox').selectAll('path').data(pie(data), pieKey)
	
	bars
		.enter()
		.append("path")
		.attr("class", "barSlice")
		.attr("id", function(d) {
			return "bar-" + d.data.cid;
		})
	
	bars
		.transition()
		.duration(600)
		.attr('d', function(d) {
			var dynamicArc = d3.svg.arc()
				.innerRadius(innerPieRadius*barScale(d.data.barchart[chartSettings.barchart]))
				.outerRadius(innerPieRadius);
			return dynamicArc(d);
		})
		
		
	bars.exit().remove();
	
	/*** EVENTS ***/
	
	/* Bar Events */
	bars.on('mouseover', function(d) {
		d3.select(this).classed("active", true);
		svg.select('#sliceGroup-'+d.data.cid).classed('active', true);
	})
	
	bars.on('mouseout', function(d) {
		d3.select(this).classed("active", false);
		svg.select('#sliceGroup-'+d.data.cid).classed('active', false);
	})
	
	bars.on('click', function(d) {
		defaultSliceGroupClickHandler(d);
		sliceParentsBarClickHandler(d);
	})
	
	/* Pie Events */
	var sliceParents = svg.selectAll('g#pieSliceBox > g');
	
	sliceParents.on('mouseover.bars', function(d) {
		svg.select('#bar-'+d.data.cid).classed('active', true);
	})
	
	sliceParents.on('mouseout.bars', function(d) {
		svg.select('#bar-'+d.data.cid).classed('active', false);
	})
	
	sliceParents.on('click.bars', sliceParentsBarClickHandler);	
}

function sliceParentsBarClickHandler(d) {
	var charID = d.data.cid;
	var selectedStateNow = svg.select('#sliceGroup-'+charID).classed('selected');
	svg.selectAll('#barsBox path.barSlice').classed('selected', false);
	svg.select('#bar-'+charID).classed('selected', selectedStateNow);
	
}

