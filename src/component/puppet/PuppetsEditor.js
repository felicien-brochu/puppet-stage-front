import React from 'react';
import Alert from 'react-s-alert'
import {
	Redirect
} from 'react-router-dom'

import PuppetCreator from './PuppetCreator';
import List from '../base/List';

import fetchAPI from '../util/api'
import alert from '../util/alert'

export default class PuppetsEditor extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			puppets: [],
			selectedPuppet: null,
			redirectTo: null,
		}

		this.handleCreatePuppet = this.handleCreatePuppet.bind(this)
	}

	componentWillMount() {
		this.fetchPuppets();
	}

	render() {
		if (this.state.redirectTo) {
			return <Redirect push to={this.state.redirectTo}/>;
		}

		return (
			<div className="puppets-editor">
				<h3>Puppets</h3>
				<PuppetCreator onCreatePuppet={this.handleCreatePuppet}/>
				<List
					list={this.state.puppets}
					itemKeyKey="name"
					itemValueKey="name"
					selectedItem={this.state.selectedPuppet}
					onSelect={(p) => this.handleSelect(p)}
				/>

				<button
					type="button"
					onClick={() => this.handleEditClick()}
					disabled={this.state.selectedPuppet ? false : true}>
					Edit
				</button>
				<button
					type="button"
					onClick={() => this.handleRemoveClick()}
					disabled={this.state.selectedPuppet ? false : true}>
					Remove
				</button>
				<button
					type="button"
					onClick={() => this.handleDuplicateClick()}
					disabled={this.state.selectedPuppet ? false : true}>
					Duplicate
				</button>

				<Alert stack={true} timeout={3000} />
			</div>
		);
	}

	handleCreatePuppet(name) {
		console.log("Create puppet: " + name);
		fetchAPI("/puppet/" + name, {
			method: 'PUT',
			body: JSON.stringify({
				name: name,
				boards: []
			}),
		}, this.handleCreatePuppetSuccess.bind(this), null, "Error creating puppet:")
	}

	handleCreatePuppetSuccess(puppet) {
		console.log("Puppet Created");
		console.log(puppet);
		alert.successAlert("Puppet successfully created: " + JSON.stringify(puppet));

		let puppets = this.state.puppets.slice(0);
		puppets.push(puppet);
		this.setState({
			puppets: puppets
		})
	}

	fetchPuppets() {
		fetchAPI("/puppets", {}, this.handlePuppetsRetrieved.bind(this), null, "Error retrieving puppets:")
	}

	handlePuppetsRetrieved(puppets) {
		this.setState({
			puppets: puppets
		});
	}

	handleSelect(puppet) {
		this.setState({
			selectedPuppet: puppet
		})
	}

	handleEditClick() {
		if (this.state.selectedPuppet) {
			this.setState({
				redirectTo: "/puppet/" + this.state.selectedPuppet.name
			})
		}
	}

	handleRemoveClick() {
		let puppet = this.state.selectedPuppet;
		if (puppet) {
			alert.warningAlert("Do you really want to delete \"" + puppet.name + "\" puppet ?<br /><button onClick=\"handleRemovePuppet('" + puppet.name + "')\">OK</button>", {
				html: true,
				timeout: 'none'
			})
		}
	}

	handleRemovePuppet(name) {
		console.log("Remove puppet: " + name);
		fetchAPI("/puppet/" + name, {
			method: 'DELETE',
		}, this.handleRemovePuppetSuccess.bind(this), null, "Error deleting puppet:")
	}

	handleRemovePuppetSuccess(puppet) {
		console.log("Puppet Deleted");
		console.log(puppet);
		alert.successAlert("Puppet successfully deleted");

		let puppets = this.state.puppets.filter((p) => {
			return p.name !== puppet.name;
		});
		this.setState({
			puppets: puppets
		})
	}

	handleDuplicateClick() {
		let puppet = this.state.selectedPuppet;
		if (puppet) {
			console.log("Duplicate puppet: " + puppet.name);
			let name = puppet.name + "1";
			this.handleCreatePuppet(name);
		}
	}
}
