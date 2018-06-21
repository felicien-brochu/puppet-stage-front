import React from 'react'
import PropTypes from 'prop-types'
import {
	Redirect
} from 'react-router-dom'

import TextCreator from '../base/TextCreator'
import List from '../base/List'

import fetchAPI from '../../util/api'
import alert from '../../util/alert'

export default class StageBrowser extends React.Component {
	static propTypes = {
		onCreate: PropTypes.func,
		onDelete: PropTypes.func,
		onBatchCreate: PropTypes.func,
	}

	constructor(props) {
		super(props)

		this.state = {
			selectedStage: null,
			redirectTo: null,
		}

		this.handleCreateStage = this.handleCreateStage.bind(this)
		this.handleSelect = this.handleSelect.bind(this)
		this.handleEditClick = this.handleEditClick.bind(this)
		this.handleRemoveClick = this.handleRemoveClick.bind(this)
		this.handleDuplicateClick = this.handleDuplicateClick.bind(this)
		this.handleRemoveStageSuccess = this.handleRemoveStageSuccess.bind(this)
	}

	render() {
		if (this.state.redirectTo) {
			return <Redirect push to={this.state.redirectTo}/>
		}

		return (
			<div className="browser">
				<h3>Stages</h3>
				<TextCreator onCreate={this.handleCreateStage}/>
				<List
					list={this.props.stages}
					itemKeyKey="id"
					itemValueKey="name"
					selectedItem={this.state.selectedStage}
					onSelect={this.handleSelect}
				/>

				<button
					type="button"
					onClick={this.handleEditClick}
					disabled={this.state.selectedStage ? false : true}>
					Edit
				</button>
				<button
					type="button"
					onClick={this.handleRemoveClick}
					disabled={this.state.selectedStage ? false : true}>
					Remove
				</button>
				<button
					type="button"
					onClick={this.handleDuplicateClick}
					disabled={this.state.selectedStage ? false : true}>
					Duplicate
				</button>
				<button
					type="button"
					onClick={this.props.onBatchCreate}>
					Batch Create
				</button>
			</div>
		)
	}

	handleCreateStage(name) {
		if (typeof this.props.onCreate === 'function') {
			this.props.onCreate(name)
		}
	}

	handleSelect(stage) {
		this.setState({
			selectedStage: stage
		})
	}

	handleEditClick() {
		if (this.state.selectedStage) {
			this.setState({
				redirectTo: "/stage/" + this.state.selectedStage.id
			})
		}
	}

	handleRemoveClick() {
		let stage = this.state.selectedStage
		if (stage) {
			let confirmed = window.confirm("Do you really want to delete \"" + stage.name + "\" stage ?")
			if (confirmed) {
				this.handleRemoveStage(stage)
			}
		}
	}

	handleRemoveStage(stage) {
		console.log("Remove stage: " + stage.name)
		fetchAPI("/stage/" + stage.id, {
			method: 'DELETE',
		}, this.handleRemoveStageSuccess, null, "Error deleting stage:")
	}

	handleRemoveStageSuccess(stage) {
		console.log("Stage Deleted")
		alert.successAlert("Stage successfully deleted")

		if (typeof this.props.onDelete === 'function') {
			this.props.onDelete(stage)
		}
	}

	handleDuplicateClick() {
		let stage = this.state.selectedStage
		if (stage) {
			console.log("Duplicate stage: " + stage.name)
			let name = stage.name + "1"
			this.handleCreateStage(name)
		}
	}
}