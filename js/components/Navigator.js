const {neverland: $, render, html, useState, useEffect} = window.neverland;

import Panel from './Panel.js';

const Navigator = $(function(corpus, setAppStatus) {
  
  const [panels, setPanels] = useState(
  	[{
  		seedNodeId: corpus.nodes[0].nodeID,
  		type: 'root',
  		closeable: false,
  		pinned: 'left',
      new: false,
      nResults: 5,
      sortBy: 'Katz centrality'
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

  function returnToSwitcher() {
    setAppStatus(prevStatus => {
      let status = {...prevStatus};
      status.corpus = null;
      return status;
    })
  }

  useEffect(() => {
    setTimeout(() => {
      let newPanel = document.querySelector('.new');
      if (newPanel !== null) {
        newPanel.classList.remove('no-transition');
        newPanel.classList.remove('new');
        // Scroll into view.
        let windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
            newPanelRight = newPanel.getBoundingClientRect().right,
            nStackedRight = Number([...newPanel.classList].filter(d => d.slice(-4) == "last")[0].split('-')[1]),
            nStackedLeft = Number([...newPanel.classList].filter(d => d.split('-')[0] == "panel" && d.split('-').length == 2)[0].split('-')[1]),
            navigator = document.querySelector('.navigator'),
            hasRightPin = Number(navigator.classList.contains('has-right-pin'));

        let effectiveWindowRightEdge = windowWidth - (nStackedRight * 4) - (hasRightPin * 504);
        let newPanelScrollPosition = nStackedLeft * 504;
        
        if (newPanelRight > effectiveWindowRightEdge) {
          navigator.scrollLeft = navigator.scrollLeft + (newPanelRight - effectiveWindowRightEdge);
        } else if (navigator.scrollLeft > newPanelScrollPosition) {
          navigator.scrollLeft = newPanelScrollPosition;
        }
        
        setTimeout(() => {
          newPanel.classList.add('no-transition');
        }, 500);
      }
    }, 5);

    }
  )

  return html`
  	<div class="navigator ${hasLeftPin()} ${hasRightPin()}">
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
    
    <nav id="bottom-nav-bar">
      <div>
        <button onclick="${returnToSwitcher}">Return to homepage</button>
      </div>
      <div>
        <span>${panels.length} panel${panels.length > 1 ? 's' : ''} open</span>
      </div>
    </nav>
    `;
});

export default Navigator;