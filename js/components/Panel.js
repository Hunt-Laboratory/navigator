
const { neverland: $, html, useState, useEffect } = window.neverland;

import Block from './Block.js';
import SortOptions from './SortOptions.js';

const Panel = $((
	corpus,
	panel,
	index,
	unpinnedIndex,
	nUnpinnedPanels,
	setPanels) => {

	const { nodes, edges } = corpus;

	const inferenceSchemes = [
			'Modus Ponens',
			'Argument from Example',
			'Argument from Expert Opinion',
			'Perception',
			'Default Inference',
			'Agreeing',
			'Asserting',
			'Arguing',
			'72'
		],
		conflictSchemes = [
			'Conflict from Bias',
			'Conflict from Propositional Negation',
			'Contradiction',
			'Contrariness',
			'Default Conflict',
			'PureChallenging',
			'AssertiveChallenging',
			'RhetoricalChallenging',
			'Disagreeing',
			'PureQuestioning',
			'AssertiveQuestioning',
			'RhetoricalQuestioning',
			'71'
		],
		rephraseSchemes = [
			'Specialisation',
			'Generalisation',
			'Instantiation',
			'Default Rephrase',
			'Restating',
			'144'
		];

	// function fetchBlocksByRelation(seedNodeId, type) {
	// 	let incomingEdges,
	// 		originNodeIDs,
	// 		originNodes,
	// 		schemeRelationIDs,
	// 		schemeNodeIDs,
	// 		schemeNodes,
	// 		schemes;

	// 	switch(type) {
	// 		case 'support':
	// 			schemes = inferenceSchemes;
	// 			break;
	// 		case 'attack':
	// 			schemes = conflictSchemes;
	// 			break;
	// 		case 'equivalence':
	// 			schemes = rephraseSchemes;
	// 			break;
	// 		default:
	// 			schemes = [];
	// 	}

	// 	incomingEdges = edges.filter(d => d.toID == seedNodeId),
		
	// 	originNodeIDs = incomingEdges.map(d => d.fromID);
		
	// 	originNodes = nodes.filter(
	// 		d => originNodeIDs.includes(d.nodeID));
		
	// 	schemeRelationIDs = originNodes.filter(
	// 		d => schemes.includes(d.scheme)
	// 		).map(d => d.nodeID);
		
	// 	incomingEdges = edges.filter(d => schemeRelationIDs.includes(d.toID));
		
	// 	schemeNodeIDs = incomingEdges.map(d => d.fromID);

	// 	schemeNodes = nodes.filter(
	// 		d => schemeNodeIDs.includes(d.nodeID) && ['I','L'].includes(d.type));

	// 	return schemeNodes.map(function(d) {
	// 		return {
	// 			nodeID: d.nodeID,
	// 			file: d.file
	// 		}
	// 	});
	// }

	function fetchBlocksByRelation(seedNodeId, type) {
		let incomingEdges,
			originNodeIDs,
			originNodes;

		// switch(type) {
		// 	case 'support':
		// 		edgeType = 'supports';
		// 		break;
		// 	case 'attack':
		// 		edgeType = 'attacks';
		// 		break;
		// 	case 'equivalence':
		// 		edgeType = 'similar';
		// 		break;
		// 	default:
		// 		edgeType = '';
		// }

		incomingEdges = edges[type].filter(d => d.to == seedNodeId),
		
		originNodeIDs = incomingEdges.map(d => d.from);
		
		originNodes = nodes.filter(
			d => originNodeIDs.includes(d.nodeID));
		
		return originNodes.map(function(d) {
			return {
				nodeID: d.nodeID,
				file: d.file
			}
		});
	}

	function fetchBlocksBySource(filename) {
		console.log(filename);
		return nodes.filter(d => d.file == filename).map(function(d) {
			return {
				nodeID: d.nodeID,
				file: d.file
			}
		})
	}

	function fetchBlocks(panel) {

		let blocks = [];
		switch(panel.type) {
			case 'root':
				blocks = nodes.filter(d => d.type == 'I');
				break;
			case 'support':
				blocks = fetchBlocksByRelation(panel.seedNodeId, panel.type);
				break;
			case 'attack':
				blocks = fetchBlocksByRelation(panel.seedNodeId, panel.type);
				break;
			case 'equivalence':
				blocks = fetchBlocksByRelation(panel.seedNodeId, panel.type);
				break;
			// case 'source':
			// 	blocks = fetchBlocksBySource(fetchNodeFile(panel.seedNodeId));
			// 	break; (TOO RESOURCE INTENSIVE)
			default:
				blocks = [];
		}

		blocks.forEach(bl => {

			bl.n_is_supported_by = fetchBlocksByRelation(bl.nodeID, 'support').length;
			bl.n_is_attacked_by = fetchBlocksByRelation(bl.nodeID, 'attack').length;
			bl.n_semantically_similar = fetchBlocksByRelation(bl.nodeID, 'equivalence').length;
			bl.n_incoming = bl.n_is_supported_by + bl.n_is_attacked_by + bl.n_semantically_similar;

		})

		let sortMetrics = {
			'Katz centrality': 'katz',
			'total # connections': 'n_incoming',
			'# supporting claims': 'n_is_supported_by',
			'# attacking claims': 'n_is_attacked_by',
			'# similar claims': 'n_semantically_similar'
		}

		let sortMetric = sortMetrics[panel.sortBy];

		blocks.sort((a, b) => {
			if (a[sortMetric] < b[sortMetric]) {
				return 1;
			} else {
				return -1;
			}
		})

		if (panel.type == 'root') {
			blocks = blocks.slice(0,panel.nResults);
		}

		return blocks;

	}


	const [blocks, setBlocks] = useState( [] );

	useEffect(
		() => {
			setBlocks(fetchBlocks(panel));
		},
		[panel.seedNodeId, panel.type, panel.nResults, panel.sortBy],
	);

	function addPanel(type, seedNodeId) {

		let temp = document.getElementById('temp');
		if (temp !== null) {
			temp.remove();
		}

		setPanels(prevPanels => {
			let panels = [...prevPanels];
			panels.forEach(function(p) {
				p.new = false;
			})
			panels.splice(index+1, 0, {
				seedNodeId: seedNodeId,
				type: type,
				closeable: true,
				pinned: false,
				new: true,
				nResults: 50,
				sortBy: 'total # connections'
			})
			return panels;
		})

	}

	useEffect(
		() => {
			if (panel.type == 'source') {
				// Identify span that was clicked on.
				let rootSpan = document.querySelector(`.source-${panel.seedNodeId} #node${panel.seedNodeId.split('-')[1]}`);
				
				// Style it.
				rootSpan.classList.add('root');

				// Scroll to it.
				let doc = document.querySelector(`.source-${panel.seedNodeId}`);
				doc.scrollTop = rootSpan.offsetTop - doc.getBoundingClientRect().top - 50;

				// Add block links.
				let spans = document.querySelectorAll(`.source-${panel.seedNodeId} .highlighted`);
				for (let span of spans) {
					span.addEventListener("click", function(ev) {
						
						let temp = document.getElementById('temp');
						if (temp !== null) {
							temp.remove();
						}
						let prevSpan = document.querySelector('.highlighted.active');
						if (prevSpan !== null) {
							prevSpan.classList.remove('active');
						}

						span.classList.add('active');
						
						let docID = [...ev.target.parentNode.classList].filter(d => d.split('-').length == 3)[0].split('-')[1],
							nodeID = `${docID}-${ev.target.id.substring(4)}`;

						span.insertAdjacentHTML('afterend', 
							`<div id="temp">
								<button id="temp-support" class="inline-link-button bn-support">
									<i class="far fa-check"></i>
									${fetchBlocksByRelation(nodeID, 'support').length}
								</button>
								<button id="temp-attack" class="inline-link-button bn-attack">
									<i class="far fa-times"></i>
									${fetchBlocksByRelation(nodeID, 'attack').length}
								</button>
								<button id="temp-equivalence" class="inline-link-button bn-equivalence">
									<i class="far fa-tilde"></i>
									${fetchBlocksByRelation(nodeID, 'equivalence').length}
								</button>
							</div>`);
						
						document.getElementById('temp-support').addEventListener("click", function() {
							addPanel('support', nodeID);
						})
						document.getElementById('temp-attack').addEventListener("click", function() {
							addPanel('attack', nodeID);
						})
						document.getElementById('temp-equivalence').addEventListener("click", function() {
							addPanel('equivalence', nodeID);
						})
					
					});
				}
			}
		}
	);

	let rel = '';
	switch(panel.type) {
		case 'root':
			rel = 'Starting points';
			break;
		case 'support':
			rel = 'Supporting claims';
			break;
		case 'attack':
			rel = 'Attacking claims';
			break;
		case 'equivalence':
			rel = 'Similar claims';
			break;
		case 'source':
			rel = html`Source document: <span>${corpus.nodes.filter(d => d.nodeID == panel.seedNodeId)[0].file}</span>`;
			break;
		default:
			rel = '';
	}

	function removePanel(index) {
		return () => {
			if ((!panel.pinned
					&& nUnpinnedPanels - unpinnedIndex - 1 == 0
					&& !document.querySelector('.navigator').classList.contains('has-right-pin')
					&& nUnpinnedPanels > 1) 
				|| (!panel.pinned
					&& nUnpinnedPanels - unpinnedIndex - 1 == 0
					&& document.querySelector('.navigator').classList.contains('has-right-pin')
					&& !document.querySelector('.navigator').classList.contains('has-left-pin')
					&& nUnpinnedPanels == 2)) {
				let panels = document.querySelectorAll(`.no-transition`);
				for (let p of panels) {
					p.classList.remove('no-transition');
				}
				document.querySelector(`.panel-0-last`).classList.add('send-to-back');
				document.querySelector(`.panel-1-last`).classList.add('transitioning');
				setTimeout(() => {
					setPanels(prevPanels => {
						let panels = [...prevPanels];
						panels.forEach(function(p) {
							p.new = false;
						})
						panels.splice(index, 1);
						return panels;
					});
				}, 500);
			} else if (!panel.pinned && nUnpinnedPanels > 1) {
				let panels = document.querySelectorAll(`.no-transition`);
				for (let p of panels) {
					p.classList.remove('no-transition');
				}
				document.querySelector(`.panel-${unpinnedIndex}`).classList.add('transitioning');
				setTimeout(() => {
					setPanels(prevPanels => {
						let panels = [...prevPanels];
						panels.forEach(function(p) {
							p.new = false;
						})
						panels.splice(index, 1);
						return panels;
					});
				}, 500);
			} else {
				setPanels(prevPanels => {
					let panels = [...prevPanels];
					panels.forEach(function(p) {
						p.new = false;
					})
					panels.splice(index, 1);
					return panels;
				});
			}
		}
	}

	function pinPanel(index, side) {
		return () => {
			setPanels(prevPanels => {
				let panels = [...prevPanels];
				panels.forEach(function(p) {
					p.new = false;
				})
				panels.map(function(p) {
					if (p.pinned == side) {
						p.pinned = false;
					}
					return p;
				})
				panels[index].pinned = side;
				return panels;
			});
		}
	}

	function unpinPanel(side) {
		return () => {
			setPanels(prevPanels => {
				let panels = [...prevPanels];
				panels.forEach(function(p) {
					p.new = false;
				})
				panels.map(function(p) {
					if (p.pinned == side) {
						p.pinned = false;
					}
					return p;
				})
				return panels;
			});
		}
	}

	function panelPositionClasses(pinned, unpinnedIndex, nUnpinnedPanels) {
		
		if (panel.pinned) {
			return '';
		} else {
			return `panel-${unpinnedIndex} panel-${nUnpinnedPanels - unpinnedIndex - 1}-last`;
		}
	}

	function fetchNodeText(nodeId) {
		return corpus.nodes.filter(d => d.nodeID == nodeId)[0].text;
	}	

	function fetchNodeFile(nodeId) {
		return nodes.filter(d => d.nodeID == nodeId)[0].file;
	}

	function fetchNodeDocument(nodeId) {
		let filename = corpus.nodes.filter(d => d.nodeID == nodeId)[0].file;
		return {html: corpus.docs[filename]};
	}

	function updateResultLength() {
		let temp = document.getElementById('temp');
		if (temp !== null) {
			temp.remove();
		}

		setPanels(prevPanels => {
			let panels = [...prevPanels];
			panels.forEach(function(p) {
				p.new = false;
			})
			panels[index].nResults = document.getElementById('top-n').value;
			return panels;
		})
	}

	function updateSortOrder() {
		let temp = document.getElementById('temp');
		if (temp !== null) {
			temp.remove();
		}

		setPanels(prevPanels => {
			let panels = [...prevPanels];
			panels.forEach(function(p) {
				p.new = false;
			})
			panels[index].sortBy = document.getElementById(`sort-${index}`).value;
			return panels;
		})
	}

	return html`
	<div class="panel no-transition p-${panel.type} ${panel.pinned ? `pinned-${panel.pinned}` : 'unpinned'} ${panelPositionClasses(panel.pinned, unpinnedIndex, nUnpinnedPanels)} ${panel.new ? 'new' : ''}">
		<header>
			${panel.closeable ?
				html`<button onclick=${removePanel(index)}>
					<i class="fal fa-times"></i>
				</button>` : null}
			${panel.pinned ?
				html`<button onclick=${unpinPanel(panel.pinned)}>
					<span class="fa-layers fa-fw">
						<i class="fal fa-sm fa-thumbtack" data-fa-transform="rotate-45"></i>
						<i class="fas fa-ban" data-fa-transform="shrink-8 right-8 down-6"></i>
					</span>
				</button>` : null}
			${panel.pinned != 'left' ?
				html`<button onclick=${pinPanel(index, 'left')}>
					<span class="fa-layers fa-fw">
						<i class="fal fa-sm fa-thumbtack" data-fa-transform="rotate-45"></i>
						<i class="fas fa-arrow-left" data-fa-transform="shrink-8 right-8 down-6"></i>
					</span>
				</button>` : null}
			${panel.pinned != 'right' ?
				html`<button onclick=${pinPanel(index, 'right')}>
					<span class="fa-layers fa-fw">
						<i class="fal fa-sm fa-thumbtack" data-fa-transform="rotate-45"></i>
						<i class="fas fa-arrow-right" data-fa-transform="shrink-8 right-8 down-6"></i>
					</span>
				</button>` : null}
		</header>
		<div class="panel-seed-block">
			${!['root', 'source'].includes(panel.type) ? html`<div class="block">
				<div class="seed">
					<p>${fetchNodeText(panel.seedNodeId)}</p>
				</div>
			</div>` : null}
			<div class="block">
				<div class="descriptor ${panel.type}">
					${rel}
					${panel.type != 'source'
						? html`<div class="sort">
							${panel.type == 'root'
								? html`Top <input id="top-n" class="top-n" type="number" value="${panel.nResults}" onchange="${updateResultLength}"/>`
								: `Sort`} by 
							<select id="sort-${index}" class="sort-metric" onchange="${updateSortOrder}">
								${SortOptions(panel.sortBy)}
							</select>
						</div>`
						: ''}
				</div>
			</div>
		</div>
		<div class="${panel.type == 'source' ? `panel-source source-${panel.seedNodeId}` : 'panel-blocks'}">
			${panel.type == 'source'
				? fetchNodeDocument(panel.seedNodeId)
				: blocks.map(bl => Block(bl, corpus, index, setPanels, fetchBlocksByRelation))}
		</div>
	</div>`;
})

export default Panel;
