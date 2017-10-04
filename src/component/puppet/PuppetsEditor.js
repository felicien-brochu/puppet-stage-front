import React from 'react';
import Alert from 'react-s-alert'

import PuppetCreator from './PuppetCreator';
import List from '../base/List';

import fetchAPI from '../util/api'

export default class PuppetsEditor extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			puppets: []
		}
	}

	componentWillMount() {
		this.fetchPuppets();
	}

	render() {
		return (
			<div className="puppets-editor">
				<PuppetCreator onCreatePuppet={this.handleCreatePuppet}/>
				<List list={this.state.puppets} itemKeyKey="name" itemValueKey="name"/>

				<button type="button">Edit</button>
				<button type="button">Remove</button>
				<button type="button">Duplicate</button>
				<Alert stack={true} timeout={3000} />
			</div>
		);
	}

	handleCreatePuppet(name) {
		console.log("Create puppet: " + name);
		Alert.success("Test message success!", {
			position: 'top-right',
			effect: 'stackslide'
		});
	}

	fetchPuppets() {
		fetchAPI("/puppets", {}, this.handlePuppetsRetrieved.bind(this), null, "Error retrieving puppets:")
	}

	handlePuppetsRetrieved(puppets) {
		this.setState({
			puppets: puppets
		});
	}
}
