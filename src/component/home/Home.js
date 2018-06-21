import React from 'react'
import Alert from 'react-s-alert'
import {
	Helmet
} from 'react-helmet'
import alert from '../../util/alert'
import fetchAPI from '../../util/api'
import TemplateStageFactory from './TemplateStageFactory'
import PuppetBrowser from './PuppetBrowser'
import StageBrowser from './StageBrowser'
import StageBatchCreateModal from './modal/StageBatchCreateModal'


export default class Home extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			selectedPuppet: null,
			stages: [],
			modals: {
				stageBatchCreateModal: {
					show: false,
				},
			},
		}

		this.handleCreateStage = this.handleCreateStage.bind(this)
		this.handleBatchCreateStage = this.handleBatchCreateStage.bind(this)
		this.handleStageBatchCreateConfirm = this.handleStageBatchCreateConfirm.bind(this)
		this.handleStageBatchCreateSuccess = this.handleStageBatchCreateSuccess.bind(this)
		this.handleStageBatchCreateCancel = this.handleStageBatchCreateCancel.bind(this)
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
				<Helmet>
					<meta charSet="utf-8" />
					<title>Puppet Stage</title>
				</Helmet>

				<StageBrowser
					stages={this.state.stages}
					onCreate={this.handleCreateStage}
					onBatchCreate={this.handleBatchCreateStage}
					onDelete={this.handleDeleteStage}
				/>
				<PuppetBrowser
					onSelect={this.handlePuppetSelect}
				/>

				<Alert stack={true} timeout={3000} />

				{this.renderModals()}
			</div>
		)
	}

	renderModals() {
		let modals = []
		if (this.state.modals.stageBatchCreateModal.show) {
			modals.push(
				<StageBatchCreateModal
					key="stageBatchCreateModal"
					isOpen={this.state.modals.stageBatchCreateModal.show}
					onConfirm={this.handleStageBatchCreateConfirm}
					onCancel={this.handleStageBatchCreateCancel}
			/>
			)
		}
		return (
			<div>

				{modals}

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

	handleBatchCreateStage(name) {
		if (!this.state.selectedPuppet) {
			alert.warningAlert("Select a puppet before creating a stage")
			return
		}

		this.setState({
			modals: {
				stageBatchCreateModal: {
					show: true,
				},
			}
		})
	}

	handleStageBatchCreateConfirm(prefix, wavFiles, lipSyncFiles, headTrackingFiles) {
		const stageFactory = new TemplateStageFactory()
		stageFactory.createTemplateStages(prefix, wavFiles, lipSyncFiles, headTrackingFiles, this.state.selectedPuppet, this.handleStageBatchCreateSuccess)
		this.setState({
			modals: {
				stageBatchCreateModal: {
					show: false,
				},
			}
		})
	}

	handleStageBatchCreateSuccess(stages) {
		this.setState({
			stages: [...this.state.stages, ...stages],
		})
	}

	handleStageBatchCreateCancel() {
		this.setState({
			modals: {
				stageBatchCreateModal: {
					show: false,
				},
			}
		})
	}

	handleCreateStageSuccess(stage) {
		console.log("Stage Created")
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