
const { html, useState } = window.neverland;

import Block from './Block.js';

function Panel(
	corpus,
	panel,
	index,
	unpinnedIndex,
	nUnpinnedPanels,
	setPanels) {

	// console.log(panel);

	const { nodes, edges } = corpus;

	const inferenceSchemes = [
			'Modus Ponens',
			'Argument from Example',
			'Argument from Expert Opinion',
			'Perception',
			'Default Inference',
			'Agreeing',
			'Asserting',
			'Arguing'
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
			'RhetoricalQuestioning'
		],
		rephraseSchemes = [
			'Specialisation',
			'Generalisation',
			'Instantiation',
			'Default Rephrase',
			'Restating'
		];

	function fetchBlocksByRelation(seedNodeId, type) {
		let incomingEdges,
			originNodeIDs,
			originNodes,
			schemeRelationIDs,
			schemeNodeIDs,
			schemeNodes,
			schemes;

		switch(type) {
			case 'support':
				schemes = inferenceSchemes;
				break;
			case 'attack':
				schemes = conflictSchemes;
				break;
			case 'equivalence':
				schemes = rephraseSchemes;
				break;
			default:
				schemes = [];
		}

		incomingEdges = edges.filter(d => d.toID == seedNodeId),
		
		originNodeIDs = incomingEdges.map(d => d.fromID);
		
		originNodes = nodes.filter(
			d => originNodeIDs.includes(d.nodeID));
		
		schemeRelationIDs = originNodes.filter(
			d => schemes.includes(d.scheme)
			).map(d => d.nodeID);
		
		incomingEdges = edges.filter(d => schemeRelationIDs.includes(d.toID));
		
		schemeNodeIDs = incomingEdges.map(d => d.fromID);

		schemeNodes = nodes.filter(
			d => schemeNodeIDs.includes(d.nodeID) && ['I','L'].includes(d.type));

		return schemeNodes.map(function(d) {
			return {
				nodeID: d.nodeID
			}
		});
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
			default:
				blocks = [];
		}

		return blocks;

	}


	const [blocks, setBlocks] = useState( fetchBlocks(panel) );

	let rel = '';
	switch(panel.type) {
		case 'support':
			rel = 'Supporting claims';
			break;
		case 'attack':
			rel = 'Attacking claims';
			break;
		case 'equivalence':
			rel = 'Similar claims';
			break;
		default:
			rel = '';
	}

	function removePanel(index) {
		return () => setPanels(prevPanels => {
			let panels = [...prevPanels];
			panels.splice(index, 1);
			return panels;
		});

	}

	function pinPanel(index, side) {
		return () => {
			setPanels(prevPanels => {
				let panels = [...prevPanels];
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
		console.log(nodeId);
		return corpus.nodes.filter(d => d.nodeID == nodeId)[0].text;
	}

	return html`
	<div class="panel p-${panel.type} ${panel.pinned ? `pinned-${panel.pinned}` : 'unpinned'} ${panelPositionClasses(panel.pinned, unpinnedIndex, nUnpinnedPanels)}">
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
		<div class="panel-blocks">
			${panel.type != 'root' ? html`<div class="block">
				<div class="seed">
					<p>${fetchNodeText(panel.seedNodeId)}</p>
				</div>
			</div>` : null}
			<div class="block">
				<div class="descriptor ${panel.type}">
					${rel}
				</div>
			</div>
			${blocks.map(bl => Block(bl, corpus, setPanels, fetchBlocksByRelation))}
		</div>
	</div>`;
}

export default Panel;
