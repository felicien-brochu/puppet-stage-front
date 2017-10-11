import React from 'react';
import Alert from 'react-s-alert'
import {
	Redirect
} from 'react-router-dom'

import TextCreator from '../base/TextCreator';
import List from '../base/List';

import fetchAPI from '../../util/api'
import alert from '../../util/alert'

export default class StageBrowser extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			stages: [],
			selectedStage: null,
			redirectTo: null,
		}

		this.handleCreateStage = this.handleCreateStage.bind(this)
	}

	componentWillMount() {
		this.fetchStages();
	}

	render() {
		if (this.state.redirectTo) {
			return <Redirect push to={this.state.redirectTo}/>;
		}

		return (
			<div className="browser">
				<h3>Stages</h3>
				<TextCreator onCreate={this.handleCreateStage}/>
				<List
					list={this.state.stages}
					itemKeyKey="id"
					itemValueKey="name"
					selectedItem={this.state.selectedStage}
					onSelect={(p) => this.handleSelect(p)}
				/>

				<button
					type="button"
					onClick={() => this.handleEditClick()}
					disabled={this.state.selectedStage ? false : true}>
					Edit
				</button>
				<button
					type="button"
					onClick={() => this.handleRemoveClick()}
					disabled={this.state.selectedStage ? false : true}>
					Remove
				</button>
				<button
					type="button"
					onClick={() => this.handleDuplicateClick()}
					disabled={this.state.selectedStage ? false : true}>
					Duplicate
				</button>

				<Alert stack={true} timeout={3000} />
			</div>
		);
	}

	handleCreateStage(name) {
		console.log("Create stage: " + name);
		fetchAPI("/stage", {
			method: 'PUT',
			body: JSON.stringify({
				name: name,
				boards: {}
			}),
		}, this.handleCreateStageSuccess.bind(this), null, "Error creating stage:")
	}

	handleCreateStageSuccess(stage) {
		console.log("Stage Created");
		console.log(stage);
		alert.successAlert("Stage successfully created: " + JSON.stringify(stage));

		let stages = this.state.stages.slice(0);
		stages.push(stage);
		this.setState({
			stages: stages
		})
	}

	fetchStages() {
		fetchAPI("/stages", {}, this.handleStagesRetrieved.bind(this), null, "Error retrieving stages:")
	}

	handleStagesRetrieved(stages) {
		this.setState({
			stages: stages
		});
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
		let stage = this.state.selectedStage;
		if (stage) {
			let confirmed = window.confirm("Do you really want to delete \"" + stage.name + "\" stage ?");
			if (confirmed) {
				this.handleRemoveStage(stage);
			}
		}
	}

	handleRemoveStage(stage) {
		console.log("Remove stage: " + stage.name);
		fetchAPI("/stage/" + stage.id, {
			method: 'DELETE',
		}, this.handleRemoveStageSuccess.bind(this), null, "Error deleting stage:")
	}

	handleRemoveStageSuccess(stage) {
		console.log("Stage Deleted");
		console.log(stage);
		alert.successAlert("Stage successfully deleted");

		let stages = this.state.stages.filter((p) => {
			return p.id !== stage.id;
		});
		this.setState({
			stages: stages
		})
	}

	handleDuplicateClick() {
		let stage = this.state.selectedStage;
		if (stage) {
			console.log("Duplicate stage: " + stage.name);
			let name = stage.name + "1";
			this.handleCreateStage(name);
		}
	}
}
