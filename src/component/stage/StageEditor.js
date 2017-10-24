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
					{/* <SplitPane split="horizontal" primary="second" defaultSize="80vh" minSize={100}>
					<div className="top-panel"/> */}
					<SequenceEditor
						stage={this.state.stage}
						puppet={this.state.puppet}
						onStageChange={(stage) => this.handleStageChange(stage)}
					/>
					{/* </SplitPane> */}

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
		// console.log(JSON.stringify(stage));
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
		stage = {
			"id": "0d980668-9d9c-4a38-a42a-5d7b8aa2bfaf",
			"name": "Stage",
			"puppetID": "57c2e5a1-0e11-4946-ae60-93822bb7fd8a",
			"sequences": [{
				"sequences": [{
					"start": 0,
					"duration": 10000000000,
					"keyframes": [{
						p: {
							t: 1e9,
							v: 256.00
						},
						c1: {
							t: 1e9,
							v: 256.00,
						},
						c2: {
							t: 1e9,
							v: 256.00,
						},
					}, {
						p: {
							t: 2e9,
							v: 350.00,
						},
						c1: {
							t: 2e9,
							v: 350.00,
						},
						c2: {
							t: 2e9,
							v: 350.00,
						},
					}, {
						p: {
							t: 2.6e9,
							v: 127.50,
						},
						c1: {
							t: 2.6e9,
							v: 127.50,
						},
						c2: {
							t: 2.6e9,
							v: 127.50,
						},
					}, {
						p: {
							t: 3e9,
							v: 200.00,
						},
						c1: {
							t: 3e9,
							v: 200.00,
						},
						c2: {
							t: 3e9,
							v: 200.00,
						},
					}, {
						p: {
							t: 5e9,
							v: 312.20,
						},
						c1: {
							t: 5e9,
							v: 312.20,
						},
						c2: {
							t: 5e9,
							v: 312.20,
						},
					}, ],
					"slave": false,
					"name": "Main",
					"id": "c92548d6-a21f-4d96-a45e-d6490fefd440"
				}],
				"expanded": true,
				"servoID": "24c10b67-8d48-4608-9fb9-8764449fa90d",
				"name": "Left Eyebrow",
				"id": "3ad92a5e-714b-41db-83ae-434690a521b2"
			}, {
				"sequences": [{
					"start": 0,
					"duration": 10000000000,
					"keyframes": [],
					"slave": false,
					"name": "Main",
					"id": "68c1b469-d92a-4a50-9427-eccb3dd67edb"
				}, {
					"start": 0,
					"duration": 10000000000,
					"keyframes": [{
						p: {
							t: 3e9,
							v: 200.00,
						},
						c1: {
							t: 3e9,
							v: 200.00,
						},
						c2: {
							t: 3e9,
							v: 200.00,
						},
					}, ],
					"slave": false,
					"name": "Accent",
					"id": "fc402112-cb69-46c6-9823-a9fbf17f6ff2"
				}],
				"expanded": true,
				"servoID": "9ac6936a-cd7d-4fd0-9a99-8d2f2159497d",
				"name": "Mouth",
				"id": "212c0507-9e52-43f1-9491-62c49dfb89fb"
			}],
			"duration": 60000000000,
			"history": []
		}
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
