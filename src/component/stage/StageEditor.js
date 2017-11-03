import React from 'react'
import SplitPane from 'react-split-pane'
import Alert from 'react-s-alert'
import {
	Loader
} from 'react-loaders'
import fetchAPI from '../../util/api'
import {
	entries
} from '../../util/utils'
import StageHistory from './StageHistory'
import Player from './Player'
import SequenceEditor from './SequenceEditor'

export default class StageEditor extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			puppet: null,
			stage: null,
			currentTime: 0,
			playing: false,
		}

		this.handleStageChange = this.handleStageChange.bind(this)
		this.handleCurrentTimeChange = this.handleCurrentTimeChange.bind(this)
		this.handleCurrentPlayTimeChange = this.handleCurrentPlayTimeChange.bind(this)
		this.handlePlayStart = this.handlePlayStart.bind(this)
		this.handlePlayStop = this.handlePlayStop.bind(this)
		this.handleSaveStateChange = this.handleSaveStateChange.bind(this)
		this.handleGlobalKeyDown = this.handleGlobalKeyDown.bind(this)
		this.handleGlobalWheel = this.handleGlobalWheel.bind(this)
		this.handleStartStopPlayer = this.handleStartStopPlayer.bind(this)

		this.stageID = props.match.params.id
		this.history = new StageHistory(this.stageID, this.handleSaveStateChange)
		this.keyBindings = {
			none: {
				' ': this.handleStartStopPlayer,
			},
			ctrl: {
				z: this.handleHistoryPrevious,
				y: this.handleHistoryNext,
				s: this.handleSave,
			},
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
						currentTime={this.state.currentTime}
						playing={this.state.playing}
						saveState={this.state.saveState}
						onStageChange={this.handleStageChange}
						onCurrentTimeChange={this.handleCurrentTimeChange}
						onStartPlaying={this.handleStartStopPlayer}
						onStopPlaying={this.handleStartStopPlayer}
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

		if (this.player) {
			this.player.preview(stage, this.state.currentTime)
		}

		this.setState({
			stage: stage,
			saveState: this.history.getSaveState(),
		})
	}

	handleCurrentTimeChange(currentTime) {
		if (this.player) {
			if (this.state.playing) {
				this.player.stop()
			}
			this.player.preview(this.state.stage, currentTime)
		}

		this.setState({
			currentTime: currentTime,
		})
	}

	handleCurrentPlayTimeChange(time) {
		this.setState({
			currentTime: time,
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
		this.player = new Player(puppet.id, this.handleCurrentPlayTimeChange, this.handlePlayStart, this.handlePlayStop)

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
			for (let [key, handler] of entries()(this.keyBindings.ctrl)) {
				if (e.key === key) {
					handler.bind(this)(e)
					e.stopPropagation()
					e.preventDefault()
					break
				}
			}
		} else {
			for (let [key, handler] of entries()(this.keyBindings.none))
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

	handleStartStopPlayer() {
		if (this.player) {
			if (!this.player.started) {
				this.player.play(this.state.stage, this.state.currentTime)
			} else {
				this.player.stop()
			}
		}
	}

	handlePlayStop() {
		if (this.state.playing) {
			this.setState({
				playing: false,
			})
		}
	}

	handlePlayStart() {
		if (!this.state.playing) {
			this.setState({
				playing: true,
			})
		}
	}
}
