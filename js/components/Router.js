const {neverland: $, render, html, useState} = window.neverland;

import Navigator from './Navigator.js';

const Router = $(function(appStatus, setAppStatus) {

	function toCorpus() {
		return () => {

			fetch(`data/demo/SWARM-corporate-espionage.json`)
			// fetch(`data/demo/api-test.json`)
				.then(response => response.json())
				.then(corpus => {

					// // Compute Katz centrality.
				
					// // 1 - Construct adjacency matrix.
					// let newNodes = corpus.nodes,
					// 	newEdges = corpus.edges.support.concat(corpus.edges.attack);
					// let nNodes = newNodes.length,
					// 	rowTemplate = new Array(nNodes).fill(0),
					// 	alpha = 0.5,
					// 	I = [],
					// 	A = [],
					// 	ones = [];
					// for (let k = 0; k < nNodes; k++) {
					// 	A.push([...rowTemplate]);
					// 	let identityRow = [...rowTemplate];
					// 	identityRow[k] = 1;
					// 	I.push(identityRow);
					// 	ones.push([1]);
					// }
					// let nodeIDs = newNodes.map(nd => nd.nodeID);
					// for (let e of newEdges) {
					// 	let i = nodeIDs.indexOf(e.from),
					// 		j = nodeIDs.indexOf(e.to);
					// 	A[i][j] += 1;
					// }

					// let katz;

					// katz = math.transpose(math.multiply(math.subtract(math.inv(math.subtract(I, math.multiply(alpha, math.transpose(A)))), I), ones))[0];

					// corpus.nodes.forEach(function(n, i) {
					// 	n.katz = katz[i];
					// })

					// // Export.

					// function downloadObjectAsJson(exportObj, exportName){
					// 	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
					// 	var downloadAnchorNode = document.createElement('a');
					// 	downloadAnchorNode.setAttribute("href",     dataStr);
					// 	downloadAnchorNode.setAttribute("download", exportName + ".json");
					// 	document.body.appendChild(downloadAnchorNode); // required for firefox
					// 	downloadAnchorNode.click();
					// 	downloadAnchorNode.remove();
					// }

					// downloadObjectAsJson(corpus, 'katz-export')

					setAppStatus(prevAppStatus => {
						let status = {...prevAppStatus};
						status.corpus = corpus;
						return status;
					})
				})
		}
	}

	function toCorpusFromScratch() {
		return () => {
			let nodes = [],
				edges = [],
				docs = {};

			let files = [
				'Corporate Espionage - aoraki00311.json',
				'Corporate Espionage - joondalup00311.json',
				'Corporate Espionage - kakadu00219.json',
				'Corporate Espionage - kosciuszko00219.json',
				'Corporate Espionage - labclass3a.json',
				'Corporate Espionage - labclass3b.json',
				'Corporate Espionage - labclass7a.json',
				'Corporate Espionage - labclass7b.json',
				'Corporate Espionage - murramang00311.json'
			];

			let fileLabels = [
				'aoraki00311',
				'joondalup00311',
				'kakadu00219',
				'kosciuszko00219',
				'labclass3a',
				'labclass3b',
				'labclass7a',
				'labclass7b',
				'murramang00311'
			];

			let promises = [];

			files.forEach((filename, index) => {
				promises.push(
					fetch(`data/demo/${filename}`)
						.then(response => response.json())
						.then(doc => {

							// Slightly refactor JSON to match expected format.
							doc.nodes = doc.nodes.map(d => {
								return {
									"nodeID": `${index}-${d.id}`,
									"fileID": index,
									"file": fileLabels[index],
									"text": d.text,
									"type": d.type,
									"scheme": d.scheme,
									"katz": 1
								}
							})
							doc.edges = doc.edges.map(d => {
								return {
									"toID": `${index}-${d.to.id}`,
									"fromID": `${index}-${d.from.id}`
								}
							})

							nodes = nodes.concat(doc.nodes);
							edges = edges.concat(doc.edges);
							docs[fileLabels[index]] = doc.analysis.txt;
						})
				)
			})

			Promise.all(promises).then(() => {
				
				// Simplify edge format.
				let newEdges = [],
					newNodes = [];

				function getEdge(node, type) {

					let fromID = edges.filter(e => e.toID == node.nodeID)[0].fromID,
						toID   = edges.filter(e => e.fromID == node.nodeID)[0].toID;

					return {
						"from": fromID,
						"to": toID,
						"type": type
					};
				}

				nodes.forEach(function(nd) {
					if (nd.scheme == "72") { // Default Inference
						newEdges.push(getEdge(nd, 'supports'));
					} else if (nd.scheme == '71') { // Default Conflict
						newEdges.push(getEdge(nd, 'attacks'));
					} else if (nd.scheme == '144') { // Default Rephrase
						newEdges.push(getEdge(nd, 'similar'));
					} else {
						newNodes.push(nd);
					}
				})

				// Compute Katz centrality.
				
				// 1 - Construct adjacency matrix.
				let nNodes = nodes.length,
					rowTemplate = new Array(nNodes).fill(0),
					alpha = 0.5,
					I = [],
					A = [],
					ones = [];
				for (let k = 0; k < nNodes; k++) {
					A.push([...rowTemplate]);
					let identityRow = [...rowTemplate];
					identityRow[k] = 1;
					I.push(identityRow);
					ones.push([1]);
				}
				let nodeIDs = newNodes.map(nd => nd.nodeID);
				for (let e of newEdges) {
					let i = nodeIDs.indexOf(e.from),
						j = nodeIDs.indexOf(e.to);
					A[i][j] += 1;
				}

				let katz;

				katz = math.transpose(math.multiply(math.subtract(math.inv(math.subtract(I, math.multiply(alpha, math.transpose(A)))), I), ones))[0];

				newNodes.forEach(function(n, i) {
					n.katz = katz[i];
				})

				// Export.

				function downloadObjectAsJson(exportObj, exportName){
					var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
					var downloadAnchorNode = document.createElement('a');
					downloadAnchorNode.setAttribute("href",     dataStr);
					downloadAnchorNode.setAttribute("download", exportName + ".json");
					document.body.appendChild(downloadAnchorNode); // required for firefox
					downloadAnchorNode.click();
					downloadAnchorNode.remove();
				}

				let corpus = {
					"nodes": newNodes,
					"edges": {
						"support": newEdges.filter(e => e.type == "supports"),
						"attack": newEdges.filter(e => e.type == "attacks"),
						"equivalence": newEdges.filter(e => e.type == "similar")
					},
					"docs": docs
				};

				// downloadObjectAsJson(corpus, 'SWARM-corporate-espionage');

				
				setAppStatus(prevAppStatus => {
					let status = {...prevAppStatus};
					status.corpus = corpus;
					return status;
				})
			})		
		}
	}
	
	function dropHandler(ev) {
		// Prevent default behavior (Prevent file from being opened)
		ev.preventDefault();

		if (ev.dataTransfer.items) {

			// Use DataTransferItemList interface to access the file(s)
			let nItems = ev.dataTransfer.items.length;
			for (var i = 0; i < nItems; i++) {
				
				let reader = new FileReader();
				
				// If dropped items aren't files, reject them
				if (ev.dataTransfer.items[i].kind === 'file') {
					var file = ev.dataTransfer.items[i].getAsFile();
					// console.log('... file[' + i + '].name = ' + file.name);
					reader.onload = function(e) {
						var contents = e.target.result;
						
						setAppStatus(prevAppStatus => {
							let status = {...prevAppStatus};
							let max_idx = Math.max(-1, ...status.payload.docs.map(d => d.idx));
							status.payload.docs.push({
								text: contents,
								src: file.name.replace('.txt',''),
								idx: max_idx + 1
							});
							return status;
						})

						// Update styling.
						var id = 'dragdrop';
						document.getElementById(id).classList.add('selected');
						document.getElementById('msg-file').innerHTML = `${nItems} files selected`;
					}

					reader.readAsText(file)
				}
			}
		} else {
			// Use DataTransfer interface to access the file(s)
			for (var i = 0; i < ev.dataTransfer.files.length; i++) {
				console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
			}
		}

		// Change styling:
		var id = 'dragdrop';
		document.getElementById(id).classList.remove('active');
		document.getElementById("api-button").classList.remove('hide');
	}

	function dragOverHandler(ev) {
		// Prevent default behavior.
		ev.preventDefault();
		
		// Change styling:
		var id = 'dragdrop';
		document.getElementById(id).classList.add('active');

	}

	function dragLeaveHandler(ev) {
		// Prevent default behavior.
		ev.preventDefault();
		
			// Change styling:
		var id = 'dragdrop';
		document.getElementById(id).classList.remove('active');

	}

	function handleFileSelect(ev) {
		var files = ev.target.files; // FileList object

		let nItems = files.length;
		for (var i = 0; i < nItems; i++) {
			
			let reader = new FileReader();
			let file = files[i];

			reader.onload = function(e) {
				var contents = e.target.result;
				
				setAppStatus(prevAppStatus => {
					let status = {...prevAppStatus};
					let max_idx = Math.max(-1, ...status.payload.docs.map(d => d.idx));
					status.payload.docs.push({
						text: contents,
						src: file.name.replace('.txt',''),
						idx: max_idx + 1
					});
					return status;
				})

				// Update styling.
				var id = 'dragdrop';
				document.getElementById(id).classList.add('selected');
				document.getElementById('msg-file').innerHTML = `${nItems} files selected`;
			}

			reader.readAsText(file)
		}

		document.getElementById("api-button").classList.remove('hide');
	}

	async function postData(url = '', data = {}) {

		try {

			const response = await fetch(url, {
				method: 'POST',
				mode: 'cors',
				cache: 'no-cache',
				headers: {
				  'Content-Type': 'application/json'
				},
				redirect: 'follow',
				referrerPolicy: 'no-referrer',
				body: JSON.stringify(data)
			});
			return response.json();

		} catch (e) {

			document.getElementById("api-loading").classList.add('hide');
			document.getElementById("api-error").classList.remove('hide');
			document.getElementById("api-retry-button").classList.remove('hide');

			return null;
		}
	}


	function analyseTexts(ev) {
		document.getElementById("api-button").classList.add('hide');
		document.getElementById("dragdrop").classList.add('hide');
		document.getElementById("api-loading").classList.remove('hide');

		console.log('PAYLOAD')
		console.log(appStatus.payload);

		postData('https://bwnb0y36gc.execute-api.ap-southeast-2.amazonaws.com/dev/argument-navigator',
				appStatus.payload)
			.then(data => {
				
				console.log('RESPONSE')
				console.log(data);

				if (data !== null) {
					setAppStatus(prevAppStatus => {
						let status = {...prevAppStatus};
						status.corpus = data;
						return status;
					})
				}

			});

	}

	function removeFile() {
		console.log('REMOVING FILES');

		setAppStatus(prevAppStatus => {
			let status = {...prevAppStatus};
			status.upload = [];
			return status;
		})
		document.getElementById('browse').value = null;
		var id = 'dragdrop';
		document.getElementById(id).classList.remove('selected');
		document.getElementById("api-button").classList.add('hide');
	}
	
	function retry(ev) {
		document.getElementById("api-error").classList.add('hide');
		document.getElementById("api-retry-button").classList.add('hide');
		document.getElementById("dragdrop").classList.remove('hide');
		removeFile();
	}

	if (appStatus.corpus === null) {
		return html`
			<div class="switcher">
				<h1><i class="fal fa-map-signs"></i> Navigator</h1>

				<div class="two-columns">
					
					<div class="column">
						<h2>Explore a sample corpus</h2>

						<p>Select the following pre-annotated corpus to quickly explore the interface. Because annotations already exist for this corpus, selecting it will only demonstrate the GUI component of the tool (not the deep learning component).</p>

						<div class="flow">

						<div class="sample" onclick="${toCorpus()}">
							<strong>SWARM Reports</strong>
							Intelligence-style reports written by teams of student, public and organisational analysts in response to the 'Corporate Espionage' problem posed during the 2020 Hunt Challenge and follow-up exercises. Manually annotated in order to best demonstrate the potential of the UI.
						</div>

						</div>

						<h2>Upload your own corpus<!-- <em>(coming soon!)</em>--></h2>

						<p>To use your own corpus, upload one or more text files below. Navigator will attempt to extract the argumentative structure of the text, then take you to the GUI to explore the extracted argument graph.</p>

						<div id="dragdrop"
							class="filedrop"
							ondragover="${dragOverHandler}"
							ondragleave="${dragLeaveHandler}"
							ondrop="${dropHandler}"
							>
							<span class="msg-nofile">Drag and drop your text files (or click to select).</span>
							<span class="msg-file"><span id="msg-file" class="filename"></span><button id="remove" class="remove-button" onclick="${removeFile}">Click to remove files &#215;</button></span>
							<input
								id="browse"
								type="file"
								class="filebrowse"
								onchange="${handleFileSelect}"
								multiple
								/>
						</div>

						<button id="api-button" class="api-button hide" onclick="${analyseTexts}">
							<i class="fas fa-chart-network"></i>&nbsp;&nbsp;Extract argument map<!-- <em>(coming soon!)--></em>
						</button>

						<div id="api-loading" class="filedrop loading hide">
							<i class="fas fa-cog fa-spin"></i>&nbsp;&nbsp;The documents are being analysed. May take a minute or two.
						</div>

						<div id="api-error" class="filedrop error hide">
							<i class="fas fa-bug"></i>&nbsp;&nbsp;There was an error with the model API, sorry!<br />Your texts must be an edge case we didn't anticipate.
						</div>

						<button id="api-retry-button" class="api-button hide" onclick="${retry}">
							<i class="fas fa-long-arrow-left"></i>&nbsp;&nbsp;Try other documents</em>
						</button>

					</div>

					<div class="column">

						<h2>About</h2>
					
						<img src="img/screenshot-close.png" class="screenshot" />

						<p>Navigator is an experimental, prototype application designed to enhance an analyst's ability to quickly understand the contents of a large corpus of documents.</p>

						<p>It uses deep learning to extract a  graph of the argumentative structure of the corpus, where nodes correspond to propositions, and edges correspond to relations between propositions such as <em>support</em>, <em>attack</em> or <em>semantically similar</em>.</p>

						<p>It then provides an accessible graphical user interface for navigating the multi-document argument map.</p>

						<hr />

						<p class="small">This tool was built by <a href="https://lukethorburn.com/">Luke Thorburn</a> from the <a href="http://huntlab.science.unimelb.edu.au/">Hunt Lab for Intelligence Research</a> at the University of Melbourne, with support from the <a href="https://arg-tech.org/">Centre for Argument Technology</a> at the University of Dundee. The work was funded by the Commonwealth of Australia's Office of National Intelligence as part of the Artificial Intelligence for Decision Making Initiative.</p>
					</div>

				</div>
			</div>
		`;
	} else {
		return html`
			${Navigator(appStatus.corpus, setAppStatus)}
		`;
	}
});

export default Router;