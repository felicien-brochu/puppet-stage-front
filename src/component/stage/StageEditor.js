import React from 'react'
import SplitPane from 'react-split-pane'
import Alert from 'react-s-alert'
import {
	Loader
} from 'react-loaders'
import SequenceEditor from './SequenceEditor'
import StageHistory from './StageHistory'
import fetchAPI from '../../util/api'
import {
	entries
} from '../../util/utils'

export default class StageEditor extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			puppet: null,
			stage: null,
		}

		this.handleStageChange = this.handleStageChange.bind(this)
		this.handleSaveStateChange = this.handleSaveStateChange.bind(this)
		this.handleGlobalKeyDown = this.handleGlobalKeyDown.bind(this)
		this.handleGlobalWheel = this.handleGlobalWheel.bind(this)

		this.stageID = props.match.params.id
		this.history = new StageHistory(this.stageID, this.handleSaveStateChange)
		this.keyBindings = {
			ctrl: {
				z: this.handleHistoryPrevious,
				y: this.handleHistoryNext,
				s: this.handleSave,
			}
		}
	}

	componentWillMount() {
		this.initHistory()
		this.initGlobalEvents()
	}

	componentWillUnmount() {
		this.removeGlobalEvents()
	}

	initGlobalEvents() {
		window.addEventListener('keydown', this.handleGlobalKeyDown)
		window.addEventListener('wheel', this.handleGlobalWheel)
	}

	removeGlobalEvents() {
		window.removeEventListener('keydown', this.handleGlobalKeyDown)
		window.removeEventListener('wheel', this.handleGlobalWheel)
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
						saveState={this.state.saveState}
						onStageChange={this.handleStageChange}
					/>
					{/* </SplitPane> */}

					<Alert stack={true} timeout={3000} />
				</div>
			)
		} else {
			return (
				<div className="stage-editor">
					<Loader type="line-scale"/>
					<Alert stack={true} timeout={3000} />
				</div>
			)
		}
	}

	initHistory() {
		this.history.init()
			.then(() => {
				this.handleStageRetrieved(this.history.getActiveRevision())
			})
	}

	handleStageChange(stage, save = true) {
		if (save) {
			this.history.push(stage)
		}

		this.setState({
			stage: stage,
			saveState: this.history.getSaveState(),
		})
	}


	handleStageRetrieved(stage) {
		this.fetchPuppet(stage.puppetID)
		this.handleStageChange(stage, false)
	}

	fetchPuppet(id) {
		fetchAPI(`/puppet/${id}`, {}, this.handlePuppetRetrieved.bind(this), null, `Error retrieving puppet ''${id}'':`)
	}

	handlePuppetRetrieved(puppet) {
		this.setState({
			puppet: puppet,
		})
	}

	handleGlobalWheel(e) {
		e.preventDefault()
	}

	handleGlobalKeyDown(e) {
		if (e.target.tagName === 'BODY') {
			this.handleKeyBindings(e)

			if (e.key === 'Alt' || e.key === 'Backspace') {
				e.preventDefault()
			}
		}
	}

	handleKeyBindings(e) {
		if (e.ctrlKey) {
			for (let [key, handler] of entries()(this.keyBindings.ctrl))
				if (e.key === key) {
					handler.bind(this)(e)
					e.stopPropagation()
					e.preventDefault()
					break
				}
		}
	}

	handleHistoryPrevious() {
		let stage = this.history.previous()
		if (stage) {
			this.setState({
				stage: stage,
			})
		}
	}

	handleHistoryNext() {
		let stage = this.history.next()
		if (stage) {
			this.setState({
				stage: stage,
			})
		}
	}

	handleSave() {
		this.history.save()
	}

	handleSaveStateChange(saveState) {
		if (saveState !== this.state.saveState) {
			this.setState({
				saveState: saveState,
			})
		}
	}
}
