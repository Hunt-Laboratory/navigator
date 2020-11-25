const {neverland: $, render, html, useState} = window.neverland;

import Panel from './Panel.js';

const Navigator = $(function(corpus) {
  
  const [panels, setPanels] = useState(
  	[{
  		seedNodeId: corpus.nodes[0].nodeID,
  		type: 'root',
  		closeable: false,
  		pinned: 'left'
  	}]
  );
  
  const hasLeftPin = () =>
  	panels.some(d => d.pinned == 'left')
  		? 'has-left-pin'
  		: '';

  const hasRightPin = () =>
  	panels.some(d => d.pinned == 'right')
  		? 'has-right-pin'
  		: '';

  return html`
  	<div class="surveyor ${hasLeftPin()} ${hasRightPin()}">
  		${panels.map((p, i) =>
        Panel(
          corpus,
          p, // Panel 
          i, // Index overall
          i - panels.filter((d, j) => d.pinned && j < i).length, // Index excluding pinned panels
          panels.filter(d => !d.pinned).length, // Total # unpinned panels
          setPanels
        ))}
  	</div>

    <footer>
      <button>Corpus Switcher</button>
    </footer>`;
});

export default Navigator;