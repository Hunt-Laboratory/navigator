
const { html } = window.neverland;

function Block(block, corpus, setPanels, fetchBlocksByRelation) {
	
	function addPanel(type, seedNodeId) {
		setPanels(prevPanels => prevPanels.concat({
	  		seedNodeId: seedNodeId,
	  		type: type,
	  		closeable: true,
	  		pinned: false
	  	}))

		// Scroll to end.
	  	let surveyor = document.querySelector('.surveyor');
	  	surveyor.scrollLeft = surveyor.scrollWidth;
	}

	function fetchNodeText(nodeId) {
		return corpus.nodes.filter(d => d.nodeID == nodeId)[0].text;
	}

	return html`
	<div class="block">
		<div class="content">
			<p>${fetchNodeText(block.nodeID)}</p>
		</div>
		<div class="controls">
			<button class="link-button bn-support"
					onclick="${() => addPanel('support', block.nodeID)}">
				<i class="far fa-check"></i>
				${fetchBlocksByRelation(block.nodeID, 'support').length}
			</button>
			<button class="link-button bn-attack"
					onclick="${() => addPanel('attack', block.nodeID)}">
				<i class="far fa-times"></i>
				${fetchBlocksByRelation(block.nodeID, 'attack').length}
			</button>
			<button class="link-button bn-equivalence"
					onclick="${() => addPanel('equivalence', block.nodeID)}">
				<i class="far fa-tilde"></i>
				${fetchBlocksByRelation(block.nodeID, 'equivalence').length}
			</button>
		</div>
	</div>`;
}

export default Block;
