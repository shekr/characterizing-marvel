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
var chordKey = function(d) { return d.id1 + d.id2 }

updatePieData(characterData, connectionsData);

/*** FILTER EXAMPLE IMPLEMENTATION ***/
$('#sorter').click(function() {
	sorting = 'gender';
	characterData.sort(sortGender)
	updatePieData(characterData, connectionsData);
	return false;
})

$('#color-coder').click(function() {
	colorCode = 'gender';
	svg.selectAll('#pieSliceBox path.slice')
		.transition()
		.duration(300)
		.style("fill", colCodeGender)
	return false;
})

$('#adder').click(function() {
	dataLength += 20;
	getData(dataLength);
	updatePieData(characterData, connectionsData)
})

$('#remover').click(function() {
	dataLength -= 10;
	characterData = characterData.slice(0,dataLength);
	console.log(characterData.length);
	updatePieData(characterData, connectionsData)
})

/*** END FILTER EXAMPLE IMPLEMENTATION ***/

function updatePieData(data, connections) {	
	
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
			switch (colorCode) {
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
		
	//only create paths for slices that exist in curr view
	var existingConnections = [];
	for (var j = 0; j < connections.length; j++) {
		var slice1 = svg.select('#sliceGroup-' + connections[j].id1);
		var slice2 = svg.select('#sliceGroup-' + connections[j].id2);
		if (slice1.size() + slice2.size() > 1) {
			existingConnections.push(connections[j]);
		}
	}	
	
	var chords = svg.select('#chordsBox').selectAll("path").data(existingConnections, chordKey)
	chords
		.enter()
		.append("path")
		.attr("class", function(d) {
			var classes = 'chord-'+ d.id1 + ' ' + 'chord-'+ d.id2;
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
		
	chords.exit().remove()
		
	/** SLICE EVENTS **/
	
	sliceParents.on('mouseover', function(d){
		//slice and label
		var nodeSelection = d3.select(this);
		var charID = nodeSelection.attr("id").replace('sliceGroup-', '');
		nodeSelection.classed('active', true);
		svg.select('#chordsBox').selectAll('.chord-' + charID).classed('active', true); //chords
		populateDetailCard(nodeSelection.datum().data);	
		d3.select('#vis-detail').classed('viewable', true);
	})
	
	sliceParents.on('mouseout', function(d){
		//slice and label
    	var nodeSelection = d3.select(this);
		nodeSelection.classed('active', false);
		var charID = nodeSelection.attr("id").replace('sliceGroup-', '');
		svg.select('#chordsBox').selectAll('.chord-' + charID).classed('active', false); //chords
		selectC = svg.select('#pieBox g.selected');
		if (selectC.size() > 0) {
			populateDetailCard(selectC.datum().data);
		} else {
			d3.select('#vis-detail').classed('viewable', false);
		}
	})
	
	sliceParents.on('click', function(d){
		var nodeSelection = d3.select(this);
		var selectedState = nodeSelection.classed('selected');
		var coreState = nodeSelection.classed('core');
		var charID = nodeSelection.attr("id").replace('sliceGroup-', '');
		
		//turn all selected off
		sliceParents.classed('selected', false);
		svg.select('#chordsBox').selectAll('path').classed('selected', false).classed('core-selected', false);
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
				svg.select('#chordsBox').selectAll('.core.chord-' + charID).classed('core-selected', true).each(function(nodeData) {
					var connectedCharID = nodeData.id1 == charID ? nodeData.id2 : nodeData.id1
					svg.select('#sliceGroup-' + connectedCharID).classed('selected-connection', true);
				}); //chords
				
			}
			else {
				//turn selected on	
				nodeSelection.classed('selected', true);
				svg.select('#chordsBox').selectAll('.chord-' + charID).classed('selected', true); //chords
			}
		}
	})

	
};
