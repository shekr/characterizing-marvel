/* pie.js
* controls all visualization inside the pie chart
* uses helpful pointers from example: http://bl.ocks.org/dbuezas/9306799
*/

var svg = d3.select("#vis-pie")
	.append("svg");

svg.append("g")
	.attr("class", "pieSliceBox");
svg.append("g")
	.attr("class", "chordsBox");

var bounds = d3.select('#vis-pie').node().getBoundingClientRect();

var width = 750,
    height = 750,
	radius = Math.min(width, height) / 2;

var innerPieRadius = radius*.9;
var outerTextRadius = radius*1.07;
var innerArcLineRadius = radius*.8;

var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) {
		return 1;
	});	

var arc = d3.svg.arc()
	.outerRadius(radius)
	.innerRadius(innerPieRadius);

var textArc = d3.svg.arc()
	.innerRadius(radius)
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
	
svg.attr("transform", "translate(" + (bounds.width - width)/2 + "," + (bounds.height-height)/ 2 + ")");
svg.select('g.chordsBox').attr("transform", "translate(" + radius + ", " + radius + ")");

var pieKey = function(d){ return d.data.cid; };

updatePieData(characterData, connectionsData);

function updatePieData(data, connections) {
	
	/** PIE SLICES **/
	var sliceParents = svg.select('g.pieSliceBox').selectAll("g")
		.data(pie(data), pieKey)
		.enter()
		.append("g")
		.attr("transform", "translate(" + radius + ", " + radius + ")")
		.attr("id", function(d) {
			console.log(d);
			return "sliceGroup-" + d.data.cid;
		});

	sliceParents.append("path")
		.attr('d', arc)
		.attr("class", "slice");

	/** SLICE EVENTS **/
	var slices = svg.select('g.pieSliceBox').selectAll('g');
	
	slices.on('mouseover', function(d){
		//slice and label
		var nodeSelection = d3.select(this);
		var charID = nodeSelection.attr("id").replace('sliceGroup-', '');
		nodeSelection.classed('active', true);
		svg.select('g.chordsBox').selectAll('.chord-' + charID).classed('active', true); //chords		
	})
	
	slices.on('mouseout', function(d){
		//slice and label
    	var nodeSelection = d3.select(this);
		nodeSelection.classed('active', false);
		var charID = nodeSelection.attr("id").replace('sliceGroup-', '');
		svg.select('g.chordsBox').selectAll('.chord-' + charID).classed('active', false); //chords

	})
	
	slices.on('click', function(d){
		var nodeSelection = d3.select(this);
		var selectedState = nodeSelection.classed('selected');
		var coreState = nodeSelection.classed('core');
		var charID = nodeSelection.attr("id").replace('sliceGroup-', '');
		
		//turn all selected off
		slices.classed('selected', false);
		svg.select('.chordsBox').selectAll('path').classed('selected', false).classed('core-selected', false);
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
				svg.select('g.chordsBox').selectAll('.core.chord-' + charID).classed('core-selected', true).each(function(nodeData) {
					var connectedCharID = nodeData.id1 == charID ? nodeData.id2 : nodeData.id1
					svg.select('#sliceGroup-' + connectedCharID).classed('selected-connection', true);
				}); //chords
				
			}
			else {
				//turn selected on	
				nodeSelection.classed('selected', true);
				svg.select('g.chordsBox').selectAll('.chord-' + charID).classed('selected', true); //chords
			}
		}
	})

	/** TEXT LABELS **/
	var labelBoxes = sliceParents.append('g').classed('label-box', true);
	labelBoxes.append("text")
		.attr("transform", function(d) {
			return "translate(" + textArc.centroid(d) + ")";
		})
		.attr("text-anchor", function(d, i) {
			if (i < dataLength/2)
				return "start";	
			else
			 return "end"; 
		})
		.text(function(d) {
			return d.data.name;
		});

	labelBoxes.append("polyline")
	.attr("points", function(d) {
		return [outsideArc.centroid(d), textArc.centroid(d)];		
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
		
	var chords = svg.select('g.chordsBox').selectAll("path")
		.data(existingConnections)
		.enter()
		.append("path")
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
		.attr("class", function(d) {
			var classes = 'chord-'+ d.id1 + ' ' + 'chord-'+ d.id2;
			if (d.type != "standard")
				classes += ' core';
			return classes;
		})
	
};
