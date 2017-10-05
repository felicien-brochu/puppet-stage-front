import React from 'react';

import List from './base/List';
import TextCreator from './base/TextCreator';

import fetchAPI from './util/api';

export default class PuppetEditor extends React.Component {

	constructor() {
		super();

		this.state = {
			puppet: null,
		}

		this.handleCreate = this.handleCreate.bind(this);
	}

	componentWillMount() {
		this.fetchPuppet();
	}

	render() {
		return (
			<div className="puppet-editor">
				<h3>{this.getName()} puppet</h3>
				<TextCreator onCreate={this.handleCreate}/>
				<List
					list={[]}
					itemKeyKey="id"
					itemValueKey="name"
					selectedItem={null}
					onSelect={(p) => this.handleSelect(p)}
				/>
			</div>
		);
	}

	getName() {
		let name = "";
		if (this.state.puppet) {
			name = this.state.puppet.name;
		}
		return name;
	}

	fetchPuppet() {
		let id = this.props.match.params.id;
		fetchAPI("/puppet/" + id, {}, this.handlePuppetRetrieved.bind(this), null, "Error retrieving puppet:")
	}

	handlePuppetRetrieved(puppet) {
		this.setState({
			puppet: puppet
		})
	}

	handleCreate(name) {

	}
};
