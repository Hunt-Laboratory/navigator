
const { html } = window.neverland;

function Option(option, selected) {
	return html`<option selected="${selected}">${option}</option>`;
}

function SortOptions(selectedOption) {
	
	const options = [
		'Katz centrality',
		'total # connections',
		'# supporting claims',
		'# attacking claims',
		'# similar claims'
	];

	return html`
		${options.map(option => Option(
			option,
			option == selectedOption
		))}
	`;
}

export default SortOptions;
