import React from 'react'
import SplitPane from 'react-split-pane'
import Alert from 'react-s-alert'
import {
	Loader
} from 'react-loaders'
import SequenceEditor from './SequenceEditor'
import fetchAPI from '../../util/api'

export default class StageEditor extends React.Component {

	constructor() {
		super();

		this.state = {
			puppet: null,
			stage: null,
		}
	}
	componentWillMount() {
		this.fetchStage();
	}

	render() {
		if (this.state.puppet && this.state.stage) {
			return (
				<div className="stage-editor">
					<SplitPane split="horizontal" primary="second" defaultSize="80vh" minSize={100}>
						<div className="top-panel"/>
						<SequenceEditor
							stage={this.state.stage}
							puppet={this.state.puppet}
							onStageChange={(stage) => this.handleStageChange(stage)}
						/>
					</SplitPane>

					<Alert stack={true} timeout={3000} />
				</div>
			);
		} else {
			return (
				<div className="stage-editor">
					<Loader type="line-scale"/>
					<Alert stack={true} timeout={3000} />
				</div>
			);
		}
	}

	handleStageChange(stage) {
		console.log("StageEditor handleStageChange")
		this.setState({
			stage: stage,
		})
	}

	fetchStage() {
		let id = this.props.match.params.id;
		fetchAPI(
			"/stage/" + id, {},
			this.handleStageRetrieved.bind(this),
			null,
			"Error retrieving stage:"
		)
	}

	handleStageRetrieved(stage) {
		this.fetchPuppet(stage.puppetID)
		this.setState({
			stage: stage,
		})
	}

	fetchPuppet(id) {
		fetchAPI(`/puppet/${id}`, {}, this.handlePuppetRetrieved.bind(this), null, `Error retrieving puppet ''${id}'':`)
	}

	handlePuppetRetrieved(puppet) {
		this.setState({
			puppet: puppet,
		});
	}
};
