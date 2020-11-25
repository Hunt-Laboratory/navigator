const {neverland: $, render, html, useState} = window.neverland;

import Navigator from './Navigator.js';

const Router = $(function(corpus) {
	
	const [appStatus, setAppStatus] = useState({
		isLoggedIn: false,
		corpus: null,
		upload: []
	});
	
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
							status.upload.push({
								id: file.name,
								text: contents
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
					status.upload.push({
						id: file.name,
						text: contents
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

	function removeFile() {
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
	
	if (appStatus.corpus === null) {
		return html`
			<div class="switcher">
				<h1><i class="fal fa-map-signs"></i> Navigator</h1>

				<div class="two-columns">
					
					<div class="column">
						<h2>Explore sample corpora</h2>

						<p>Select one of the following pre-annotated corpora to quickly explore the interface. Because annotations already exist for these corpora, selecting them will only demonstrate the GUI component of the tool (not the deep learning component).</p>

						<div class="flow">

						<div class="sample">
							<strong>SWARM Reports</strong>
							Intelligence-style reports written by teams of student, public and organisational analysts as part of the 2020 Hunt Challenge and follow up exercises. Manually annotated in order to best demonstrate the potential of the UI.
						</div>

						<div class="sample">
							<strong>Persuasive Essays</strong>
							Short persuasive essays on the topic of ___, automatically annotated. These essays were part of the test set of the corpus on which the neural networks were trained, so were not seen during training, but are similar in style to documents that were.
						</div>

						</div>

						<h2>Upload your own corpus</h2>

						<p>To use your own corpus, upload one or more text files below. Navigator will attempt to extract the argumentative structure of the text, then take you to the GUI to explore the extracted argument graph.</p>

						<div id="dragdrop"
							class="filedrop"
							ondragover="${dragOverHandler}"
							ondragleave="${dragLeaveHandler}"
							ondrop="${dropHandler}"
							>
							<span class="msg-nofile">Drag and drop (or click to select) your text files.</span>
							<span class="msg-file"><span id="msg-file" class="filename"></span><button id="remove" class="remove-button" onclick="${removeFile}">Click to remove files &#215;</button></span>
							<input
								id="browse"
								type="file"
								class="filebrowse"
								onchange="${handleFileSelect}"
								multiple
								/>
						</div>

						<button id="api-button" class="api-button hide">
							<i class="fas fa-chart-network"></i>&nbsp;&nbsp;Extract argument map
						</button>

					</div>

					<div class="column">

						<h2>About</h2>
					
						<img src="img/screenshot-close.png" class="screenshot" />

						<p>Navigator is an experimental, prototype application designed to enhance an analyst's ability to quickly understand the contents of a large corpus of documents.</p>

						<p>It uses deep learning to extract a  graph of the argumentative structure of the corpus, where nodes correspond to propositions, and edges correspond to relations between propositions such as <em>support</em>, <em>conflict</em> or <em>semantically similar</em>.</p>

						<p>It then provides an accessible graphical user interface for navigating the multi-document argument map.</p>

						<hr />

						<p class="small">This tool was built by <a href="https://lukethorburn.com/">Luke Thorburn</a> at the <a href="http://huntlab.science.unimelb.edu.au/">Hunt Lab for Intelligence Research</a> at the University of Melbourne. The work was funded by the Commonwealth of Australia's Office of National Intelligence as part of the Artificial Intelligence for Decision Making Initiative.</p>
					</div>

				</div>
			</div>
		`;
	} else {
		return html`
			${Navigator(appStatus.corpus)}
		`;
	}
});

export default Router;