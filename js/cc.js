$(document).ready(function() {

	$('#ex1').slider({
		formatter: function(value) {
			return 'Current value: ' + value;
		}
	});

});
var p_edge = 4; // Every edge has x% chance of being present
var numberOfNodes = 20;
var blues = [];
var reds = [];
var greens = [];
data = generateRandomeGraph(numberOfNodes, p_edge);

var nodes = new vis.DataSet(data[0]);
var edges = new vis.DataSet(data[1]);

// create a network
var container = getById('mynetwork');
var data = {
	nodes: nodes,
	edges: edges
};
var options = {
	configure: true
};
var globalDelay = 0;
var network = new vis.Network(container, data, options);

function pickNodes(s, epsilon, numberOfNodes) {

	var chosenNodes = [];
	var limit = parseInt(1 / (epsilon * epsilon));
	getById("current_step").innerHTML = " Selecting 1/e^2 random nodes (" + limit + ").";
	for (var i = 0; i < limit; i++) {
		setTimeout(function() {
			var alreadyPicked = true;
			while (alreadyPicked == true) {
				var randomIndex = Math.floor(Math.random() * numberOfNodes);
				if (chosenNodes.indexOf(randomIndex) == -1) {
					chosenNodes.push(randomIndex);
					alreadyPicked = false;
					getById("chosen_nodes").innerHTML += (" " + randomIndex)
					colorNodeN(randomIndex, "red");
					reds.push(randomIndex);
				}
			}
		}, globalDelay);
		globalDelay += 500;
	}
	return chosenNodes;
}

function find() {
	// Reset current status
	getById("chosen_nodes").innerHTML = "";
	resetNodeColors();

	var epsilon = parseFloat($(".tooltip-inner").text());

	var nodes = data.nodes._data;
	var edges = data.edges._data;
	var components = [];

	var maxBFS = Math.round(2 / epsilon);

	var limit = parseInt(1 / (epsilon * epsilon));
	var globalDiscovered = [];
	chosenNodes = pickNodes(nodes, epsilon, numberOfNodes);

	setTimeout(
		function() {
			for (i = 0; i < chosenNodes.length; i++) {
				var currentNode = chosenNodes[i];
				bfs(components, currentNode, edges, epsilon, globalDiscovered, i * maxBFS * 1000);
			}
		}, globalDelay);

	setTimeout(
		function() {

			var sum = 0.0;
			for (var i = 0; i < components.length; i++) {
				if (components[i] != 0) {
					sum += (1 / components[i]);
				}
			}
			// Set number of CC
			getById("current_step").innerHTML = " Calculated number of CC";
			getById("number_CC").innerHTML = numberOfNodes * (1 / components.length) * sum;
		}, globalDelay + parseInt(1 / (epsilon * epsilon)) * maxBFS * 1000 + 1000);
}

function bfs(components, currentNode, edges, epsilon, globalDiscovered, delay) {
	var childrenToExplore = Math.round(2 / epsilon);
	var newNodes = 0;
	var children = [];
	var discovered = []
	children.push(currentNode);
	console.log(new Date().toUTCString() + " BFS for ", currentNode);
	setTimeout(
		function() {
			getById("current_step").innerHTML = " Running BFS starting from " + currentNode + ". Up to " + childrenToExplore + " nodes.";
			getById("current_node").innerHTML = currentNode;
			colorNodeN(currentNode, "#3DFF2E");
			forOne = 1000;
			getById("current_node_BFS").innerHTML = "";
			var helpI = 0
			discovered.push(currentNode);
			for (var i = 0; i < childrenToExplore; i++) {
				console.log(new Date().toUTCString() + " I'm at node ", currentNode);
				setTimeout(
					function() {
						currentNode = children.shift();

						if (typeof currentNode != "undefined") {
							getById("current_node_BFS").innerHTML += " " + currentNode;

							if (globalDiscovered.indexOf(currentNode) == -1) {
								globalDiscovered.push(currentNode);
								getById("global_nodes").innerHTML += " " + currentNode;
								greens.push(currentNode);
								colorNodeN(currentNode, "#3DFF2E");
								newNodes += 1;
							}
							colorNodeNBorder(currentNode, "black");

							currentNodeChildren = getChildren(currentNode, edges);
							for (var k = 0; k < currentNodeChildren.length; k++) {
								var child = currentNodeChildren[k];
								console.log(new Date().toUTCString() + " Children " + child + " of " + currentNode);
								if (discovered.indexOf(child) == -1) {
									console.log(new Date().toUTCString() + " Discoverying child " + child + ", because discovered list is" + discovered);
									discovered.push(child);
									children.push(currentNodeChildren[k]);
								}
							}
						}

						if (helpI == childrenToExplore - 1) {
							var nEstimate = Math.min(newNodes, childrenToExplore)
							components.push(nEstimate);
							redoColors();
						}
						helpI++;
					}, i * forOne);
			}
		}, delay);
	console.log("");
}

function getChildren(currentNode, edges) {

	var children = [];
	for (edgeId in edges) {

		var edge = edges[edgeId];
		if (edge.from == currentNode) {
			children.push(edge.to);
		} else if (edge.to == currentNode) {
			children.push(edge.from);
		}
	}

	return children;
}

function generateRandomeGraph(n, p_edge) {
	var nodes = [];
	var edges = [];
	for (i = 0; i <= n; i++) {
		blues.push(i);
		nodes.push({
			id: i,
			label: i
		});
	}
	var i = 0;
	nodes.forEach(function(node) {
		for (i = node.id + 1; i < n; i++) {
			r = Math.random() * 100;
			if (r < p_edge) {
				edges.push({
					from: node.id,
					to: i
				});
			}
		}
	});
	return [nodes, edges];
}

function getById(id) {
	return document.getElementById(id);
}

function colorNodeN(n, color) {
	nodes.update([{
		id: n,
		color: {
			background: color,
			border: '#2B7CE9'
		},
		borderWidth: 1,
	}]);
}

function resetNodeColors() {
	for (i = 0; i < numberOfNodes; i++) {
		nodes.update([{
			id: i,
			color: {
				background: "#97c2fc",
				border: '#2B7CE9'
			},
			borderWidth: 1,
		}]);
	}
}

function colorNodeNBorder(n, color) {
	nodes.update([{
		id: n,
		color: {
			border: color,
		},
		borderWidth: 3
	}]);
}

function redoColors() {
	blues.forEach(function(el) {
		colorNodeN(el, "#97c2fc")
	});
	reds.forEach(function(el) {
		colorNodeN(el, "red")
	});
	greens.forEach(function(el) {
		colorNodeN(el, "#3DFF2E")
	});
}
