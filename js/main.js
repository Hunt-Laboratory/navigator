const {neverland: $, render, html, useState} = window.neverland;

import Router from './components/Router.js';

fetch('../data/demo/democratic-primary-2016.json')
  .then(response => response.json())
  .then(result => {
	
	render(document.body, html`
		${Router(result)}
	`);

  });


