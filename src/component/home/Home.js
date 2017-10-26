import React from 'react'
import Alert from 'react-s-alert'
import alert from '../../util/alert'
import PuppetBrowser from './PuppetBrowser'
import StageBrowser from './StageBrowser'
import fetchAPI from '../../util/api'

export default class Home extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			selectedPuppet: null,
			stages: [],
		}

		this.handleCreateStage = this.handleCreateStage.bind(this)
		this.handleDeleteStage = this.handleDeleteStage.bind(this)
		this.handlePuppetSelect = this.handlePuppetSelect.bind(this)
		this.handleStagesRetrieved = this.handleStagesRetrieved.bind(this)
		this.handleCreateStageSuccess = this.handleCreateStageSuccess.bind(this)
	}

	componentWillMount() {
		this.fetchStages()
	}

	render() {
		return (
			<div className="home-container">
				<StageBrowser
					stages={this.state.stages}
					onCreate={this.handleCreateStage}
					onDelete={this.handleDeleteStage}
				/>
				<PuppetBrowser
					onSelect={this.handlePuppetSelect}
				/>

				<Alert stack={true} timeout={3000} />
			</div>
		)
	}

	fetchStages() {
		fetchAPI("/stages", {}, this.handleStagesRetrieved, null, "Error retrieving stages:")
	}

	handleStagesRetrieved(stages) {
		this.setState({
			stages: stages
		})
	}

	handleCreateStage(name) {
		if (!this.state.selectedPuppet) {
			alert.warningAlert("Select a puppet before creating a stage")
			return
		}
		console.log("Create stage: " + name)
		fetchAPI("/stage", {
			method: 'PUT',
			body: JSON.stringify({
				name: name,
				puppetID: this.state.selectedPuppet.id,
			}),
		}, this.handleCreateStageSuccess, null, "Error creating stage:")
	}

	handleCreateStageSuccess(stage) {
		console.log("Stage Created")
		console.log(stage)
		alert.successAlert("Stage successfully created: " + JSON.stringify(stage))

		let stages = Array.from(this.state.stages)
		stages.push(stage)
		this.setState({
			stages: stages
		})
	}

	handlePuppetSelect(puppet) {
		this.setState({
			selectedPuppet: puppet,
		})
	}

	handleDeleteStage(stage) {
		let stages = this.state.stages.filter((p) => {
			return p.id !== stage.id
		})
		this.setState({
			stages: stages
		})
	}
}
