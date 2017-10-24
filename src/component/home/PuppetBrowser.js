import React from 'react'
import PropTypes from 'prop-types'
import {
	Redirect
} from 'react-router-dom'

import TextCreator from '../base/TextCreator'
import List from '../base/List'

import fetchAPI from '../../util/api'
import alert from '../../util/alert'

export default class PuppetBrowser extends React.Component {

	static propTypes = {
		onSelect: PropTypes.func,
	}

	constructor(props) {
		super(props)

		this.state = {
			puppets: [],
			selectedPuppet: null,
			redirectTo: null,
		}

		this.handleCreatePuppet = this.handleCreatePuppet.bind(this)
	}

	componentWillMount() {
		this.fetchPuppets()
	}

	render() {
		if (this.state.redirectTo) {
			return <Redirect push to={this.state.redirectTo}/>
		}

		return (
			<div className="browser">
				<h3>Puppets</h3>
				<TextCreator onCreate={this.handleCreatePuppet}/>
				<List
					list={this.state.puppets}
					itemKeyKey="id"
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
			</div>
		)
	}

	handleCreatePuppet(name) {
		console.log("Create puppet: " + name)
		fetchAPI("/puppet", {
			method: 'PUT',
			body: JSON.stringify({
				name: name,
				boards: {}
			}),
		}, this.handleCreatePuppetSuccess.bind(this), null, "Error creating puppet:")
	}

	handleCreatePuppetSuccess(puppet) {
		console.log("Puppet Created")
		console.log(puppet)
		alert.successAlert("Puppet successfully created: " + JSON.stringify(puppet))

		let puppets = Array.from(this.state.puppets)
		puppets.push(puppet)
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
		})
	}

	handleSelect(puppet) {
		if (typeof this.props.onSelect === 'function') {
			this.props.onSelect(puppet)
		}

		this.setState({
			selectedPuppet: puppet
		})
	}

	handleEditClick() {
		if (this.state.selectedPuppet) {
			this.setState({
				redirectTo: "/puppet/" + this.state.selectedPuppet.id
			})
		}
	}

	handleRemoveClick() {
		let puppet = this.state.selectedPuppet
		if (puppet) {
			let confirmed = window.confirm("Do you really want to delete \"" + puppet.name + "\" puppet ?")
			if (confirmed) {
				this.handleRemovePuppet(puppet)
			}
		}
	}

	handleRemovePuppet(puppet) {
		console.log("Remove puppet: " + puppet.name)
		fetchAPI("/puppet/" + puppet.id, {
				method: 'DELETE',
			}, this.handleRemovePuppetSuccess.bind(this),
			null,
			"Error deleting puppet:")
	}

	handleRemovePuppetSuccess(puppet) {
		console.log("Puppet Deleted")
		console.log(puppet)
		alert.successAlert("Puppet successfully deleted")

		let puppets = this.state.puppets.filter((p) => {
			return p.id !== puppet.id
		})
		this.setState({
			puppets: puppets
		})
	}

	handleDuplicateClick() {
		let puppet = this.state.selectedPuppet
		if (puppet) {
			console.log("Duplicate puppet: " + puppet.name)
			let name = puppet.name + "1"
			this.handleCreatePuppet(name)
		}
	}
}
