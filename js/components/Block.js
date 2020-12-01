
const { html } = window.neverland;

function Block(block, corpus, index, setPanels, fetchBlocksByRelation) {
	
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

	function fetchNodeText(nodeId) {
		let text = corpus.nodes.filter(d => d.nodeID == nodeId)[0].text;
		return text;
	}

	return html`
	<div class="block">
		<div class="content">
			<p>${fetchNodeText(block.nodeID)}</p>
		</div>
		<div class="controls">
			<div>
				<button class="link-button bn-source"
						onclick="${() => addPanel('source', block.nodeID)}">
					<i class="fas fa-file-search"></i>
					${block.file}
				</button>
			</div>

			<div>
				<button class="link-button bn-support"
						onclick="${() => addPanel('support', block.nodeID)}">
					<i class="far fa-check"></i>
					${block.n_is_supported_by}
				</button>
				<button class="link-button bn-attack"
						onclick="${() => addPanel('attack', block.nodeID)}">
					<i class="far fa-times"></i>
					${block.n_is_attacked_by}
				</button>
				<button class="link-button bn-equivalence"
						onclick="${() => addPanel('equivalence', block.nodeID)}">
					<i class="far fa-tilde"></i>
					${block.n_semantically_similar}
				</button>
			</div>
		</div>
	</div>`;
}

export default Block;
