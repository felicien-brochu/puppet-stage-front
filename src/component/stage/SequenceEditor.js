import React from 'react'
import PropTypes from 'prop-types'
import model from '../../util/model'
import fetchAPI from '../../util/api'
import {
	entries
} from '../../util/utils'
import units from '../../util/units'
import KeyframeHelper from './KeyframeHelper'
import StageSettingsModal from './StageSettingsModal'
import SequenceList from './sequence-list/SequenceList'
import Timeline from './timeline/Timeline'

export default class SequenceEditor extends React.Component {

	static propTypes = {
		stage: PropTypes.object.isRequired,
		puppet: PropTypes.object.isRequired,
		currentTime: PropTypes.number.isRequired,
		playing: PropTypes.bool.isRequired,
		saveState: PropTypes.oneOf(['saved', 'saving', 'modified', 'traveled']).isRequired,
		audioBuffer: PropTypes.object,

		onStageChange: PropTypes.func.isRequired,
		onCurrentTimeChange: PropTypes.func.isRequired,
		onStartPlaying: PropTypes.func.isRequired,
		onStopPlaying: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.state = {
			scrollY: 0,
			startTime: 0,
			endTime: props.stage.duration,
			showGraph: false,

			selection: {
				active: 'none',
				keyframes: [],
				driverSequences: [],
				basicSequences: [],
			},

			showStageSettingsModal: false,
		}

		this.handleScrollY = this.handleScrollY.bind(this)
		this.handleNewDriverSequence = this.handleNewDriverSequence.bind(this)
		this.handleDriverSequenceChange = this.handleDriverSequenceChange.bind(this)
		this.handleDriverSequenceMove = this.handleDriverSequenceMove.bind(this)
		this.handleRemoveDriverSequence = this.handleRemoveDriverSequence.bind(this)
		this.handleNewBasicSequence = this.handleNewBasicSequence.bind(this)
		this.handleBasicSequenceChange = this.handleBasicSequenceChange.bind(this)
		this.handleBasicSequenceMove = this.handleBasicSequenceMove.bind(this)
		this.handleTimeScaleChange = this.handleTimeScaleChange.bind(this)
		this.handleValueScaleChange = this.handleValueScaleChange.bind(this)
		this.handleUnselectKeyframes = this.handleUnselectKeyframes.bind(this)
		this.handleSelectKeyframes = this.handleSelectKeyframes.bind(this)
		this.handleSingleKeyframeMouseDown = this.handleSingleKeyframeMouseDown.bind(this)
		this.handleTranslateKeyframesStop = this.handleTranslateKeyframesStop.bind(this)
		this.handleTranslateKeyframes = this.handleTranslateKeyframes.bind(this)
		this.handleTimeWindowChange = this.handleTimeWindowChange.bind(this)
		this.handleBasicSequenceTimeChange = this.handleBasicSequenceTimeChange.bind(this)
		this.handleOpenStageSettings = this.handleOpenStageSettings.bind(this)
		this.handleUpdateStageSettings = this.handleUpdateStageSettings.bind(this)
		this.handleCancelStageSettingsModal = this.handleCancelStageSettingsModal.bind(this)
		this.handleShowGraphChange = this.handleShowGraphChange.bind(this)
		this.handleSelectDriverSequence = this.handleSelectDriverSequence.bind(this)
		this.handleSelectBasicSequence = this.handleSelectBasicSequence.bind(this)
		this.handleUnselectAll = this.handleUnselectAll.bind(this)
		this.handleMuteChange = this.handleMuteChange.bind(this)

		this.handleCurrentTimeChange = this.handleCurrentTimeChange.bind(this)
		this.handleGoToTime = this.handleGoToTime.bind(this)
		this.handleGoToStart = this.handleGoToStart.bind(this)
		this.handleGoToEnd = this.handleGoToEnd.bind(this)
		this.handleGoToPrevFrame = this.handleGoToPrevFrame.bind(this)
		this.handleGoToNextFrame = this.handleGoToNextFrame.bind(this)
		this.handleGoToPrevSecond = this.handleGoToPrevSecond.bind(this)
		this.handleGoToNextSecond = this.handleGoToNextSecond.bind(this)

		this.handleCopy = this.handleCopy.bind(this)
		this.handlePaste = this.handlePaste.bind(this)
		this.handleDelete = this.handleDelete.bind(this)

		this.handleKeyBindings = this.handleKeyBindings.bind(this)


		this.translation = {}
		this.timeScale = 1
		this.valueScale = 1
		this.keyBindings = {
			ctrl: {
				ArrowLeft: this.handleGoToPrevSecond,
				ArrowRight: this.handleGoToNextSecond,
				c: this.handleCopy,
				v: this.handlePaste,
			},
			none: {
				Delete: this.handleDelete,
				Tab: this.handleToggleGraph,
				Home: this.handleGoToStart,
				End: this.handleGoToEnd,
				ArrowLeft: this.handleGoToPrevFrame,
				ArrowRight: this.handleGoToNextFrame,
			},
		}

		this.clipboard = {
			type: 'none',
			data: {},
		}
	}

	componentWillMount() {
		this.initGlobalEvents()
	}

	componentWillUnmount() {
		this.removeGlobalEvents()
	}

	initGlobalEvents() {
		window.addEventListener('keydown', this.handleKeyBindings)
	}

	removeGlobalEvents() {
		window.removeEventListener('keydown', this.handleKeyBindings)
	}

	render() {
		return (
			<div className="sequence-editor">
				{this.renderSVGDefs()}

				<SequenceList
					stage={this.props.stage}
					puppet={this.props.puppet}
					playing={this.props.playing}
					saveState={this.props.saveState}
					currentTime={this.props.currentTime}
					scrollY={this.state.scrollY}
					showGraph={this.state.showGraph}
					selectedDriverSequences={this.state.selection.driverSequences}
					selectedBasicSequences={this.state.selection.basicSequences}

					onOpenStageSettings={this.handleOpenStageSettings}
					onStartPlaying={this.props.onStartPlaying}
					onStopPlaying={this.props.onStopPlaying}
					onScrollY={this.handleScrollY}
					onNewDriverSequence={this.handleNewDriverSequence}
					onDriverSequenceChange={this.handleDriverSequenceChange}
					onDriverSequenceMove={this.handleDriverSequenceMove}
					onRemoveDriverSequence={this.handleRemoveDriverSequence}
					onNewBasicSequence={this.handleNewBasicSequence}
					onBasicSequenceChange={this.handleBasicSequenceChange}
					onBasicSequenceMove={this.handleBasicSequenceMove}
					onGoToTime={this.handleGoToTime}
					onShowGraphChange={this.handleShowGraphChange}
					onSelectDriverSequence={this.handleSelectDriverSequence}
					onSelectBasicSequence={this.handleSelectBasicSequence}
					onUnselectAll={this.handleUnselectAll}
					onMuteChange={this.handleMuteChange}
				/>
				<Timeline
					stage={this.props.stage}
					scrollY={this.state.scrollY}
					selectedKeyframes={this.state.selection.keyframes}
					currentTime={this.props.currentTime}
					startTime={this.state.startTime}
					endTime={this.state.endTime}
					showGraph={this.state.showGraph}
					audioBuffer={this.props.audioBuffer}

					onScrollY={this.handleScrollY}
					onCurrentTimeChange={this.handleCurrentTimeChange}
					onTimeScaleChange={this.handleTimeScaleChange}
					onValueScaleChange={this.handleValueScaleChange}
					onTimeWindowChange={this.handleTimeWindowChange}
					onUnselectKeyframes={this.handleUnselectKeyframes}
					onSelectKeyframes={this.handleSelectKeyframes}
					onSingleKeyframeMouseDown={this.handleSingleKeyframeMouseDown}
					onBasicSequenceTimeChange={this.handleBasicSequenceTimeChange}
					onBasicSequenceChange={this.handleBasicSequenceChange}
				/>

				{this.renderModals()}
			</div>
		)
	}

	renderModals() {
		let modals = []

		modals.push(
			<StageSettingsModal
				key="StageSettingsModal"
				stage={this.props.stage}
				isOpen={this.state.showStageSettingsModal}
				onConfirm={this.handleUpdateStageSettings}
				onCancel={this.handleCancelStageSettingsModal}/>
		)

		return modals
	}

	renderSVGDefs() {
		return (
			<svg className="svg-defs">
				<defs>
					<filter id="noise-effect" filterUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
						<feTurbulence type="fractalNoise" result="noisy" baseFrequency="0.9"/>
						<feColorMatrix type="saturate" values="0"/>
						<feBlend in="SourceGraphic" in2="noisy" mode="multiply"/>
					</filter>

					<filter id="desaturate-effect" filterUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
						<feColorMatrix type="saturate" values="0.5"/>
						<feComponentTransfer>
							<feFuncR type="linear" slope="0.1" intercept="0.00"/>
							<feFuncG type="linear" slope="0.1" intercept="0.00"/>
							<feFuncB type="linear" slope="0.1" intercept="0.00"/>
						</feComponentTransfer>
					</filter>

					<filter id="highlight-effect" filterUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
						<feFlood x="-10" y="-10" width="20" height="20" floodColor="#2D8CEB" floodOpacity="0.5" result="blue-flood1"/>
						<feFlood x="-10" y="-10" width="20" height="20" floodColor="#2D8CEB" floodOpacity="1" result="blue-flood2"/>
						<feBlend in2="SourceGraphic" in="blue-flood2" mode="darken" result="darkened"/>
						<feBlend in="darkened" in2="blue-flood1" mode="screen"/>

						{/*Contrast*/}
						<feComponentTransfer result="contrasted">
							<feFuncR type="linear" slope="1.3" intercept="-0.15"/>
							<feFuncG type="linear" slope="1.3" intercept="-0.15"/>
							<feFuncB type="linear" slope="1.3" intercept="-0.15"/>
						</feComponentTransfer>

						<feComposite in="contrasted" in2="SourceGraphic" operator="in" result="blue-flood-cut1" />
					</filter>

					<polygon id="expand-button-shape" points="28,26 50,78 72,26"/>

					<polygon id="time-cursor-shape" points="-7,12 8,12 8,21 2,30 1,30 1,21 4,21 4,20 -3,20 -3,21 0,21 0,30 -1,30 -7,21"/>

					<g id="keyframe-shape">
						<rect x="-5.65" y="-20" width="11.3" height="40" opacity="0"/>
						<rect transform="rotate(-45)" x="-4" y="-4" width="8" height="8"/>
					</g>

					<g id="keyframe-start-shape">
						<rect x="-5.65" y="-20" width="11.3" height="40" opacity="0"/>
						<g  transform="rotate(-45)">
							<rect x="-4" y="-4" width="8" height="8"/>
							<polygon className="keyframe-start-diamond" points="3.4,-3.4 -3.4,-3.4 -3.4,3.4"/>
						</g>
					</g>
					<g id="keyframe-end-shape">
						<rect x="-5.65" y="-20" width="11.3" height="40" opacity="0"/>
						<g  transform="rotate(-45)">
							<rect x="-4" y="-4" width="8" height="8"/>
							<polygon className="keyframe-end-diamond" points="3.4,-3.4 3.4,3.4 -3.4,3.4"/>
						</g>
					</g>

					<rect id="handle-shape" x="0" y="0" width="16" height="20"/>

					<polygon id="arrow-left-button-shape" points="20,50 70,20 70,80"/>
					<polygon id="arrow-right-button-shape" points="20,20 20,80 70,50"/>
					<polygon id="keyframe-button-shape" points="50,20 80,50 50,80 20,50"/>


					<path id="eye-shape"
						d="M50,24.6c-18.1,0-33.9,10.2-41.9,25.1c8,15,23.7,25.1,41.9,25.1s33.9-10.2,41.9-25.1
						C83.9,34.8,68.1,24.6,50,24.6z M50,63c-7.4,0-13.3-6-13.3-13.3c0-7.4,6-13.3,13.3-13.3
						s13.3,6,13.3,13.3C63.3,57.1,57.4,63,50,63z"
					/>

					<circle id="point-shape" cx="50" cy="50" r="25"/>

					<path id="graph-shape" d="M12,75c0,0,10.3-32.1,25.8-30.4c15.5,1.7,17.9,11.7,31.5,8.6S88,25,88,25" style={{
							strokeWidth: "10px",
							fill: "none",
					}}/>

					<g id="sound-shape">
						<polygon points="9.95 38.15 9.95 64.74 32.11 64.74 51.31 82.47 51.31 18.95 32.11 38.15 9.95 38.15"/>
						<path d="M59.17,33.41V66.53a18.32,18.32,0,0,0,0-33.12Z"/>
						<path d="M59.17,73.4v8.87a33.24,33.24,0,0,0,0-64.6v8.87a24.71,24.71,0,0,1,0,46.87Z"/>
					</g>


					<g id="graph-button-shape" className="stroke-only">
						<rect x="20" y="28" width="64" height="50"/>
						<path d="M30,40c31,0,16,28,46,28"/>
						<line x1="11" y1="40" x2="19" y2="40"/>
						<line x1="11" y1="56" x2="19" y2="56"/>
						<line x1="11" y1="72" x2="19" y2="72"/>
						<line x1="23" y1="30" x2="23" y2="20"/>
						<line x1="56" y1="30" x2="56" y2="20"/>
						<line x1="40" y1="30" x2="40" y2="16"/>
						<line x1="74" y1="30" x2="74" y2="16"/>
					</g>



					<polygon id="play-button-shape" points="18,10 18,65 23,65 82,37.5 23,10 "/>

					<rect id="stop-button-shape" x="22.5" y="10" width="55" height="55"/>

					<g id="prev-frame-button-shape" transform="translate(92, 75) rotate(-180)">
						<polygon points="27.5 65 86.5 37.5 27.5 10 27.5 65"/>
						<rect x="0" y="12" width="14" height="51"/>
					</g>


					<g id="next-frame-button-shape" transform="translate(8, 0)">
						<polygon points="27.5 65 86.5 37.5 27.5 10 27.5 65"/>
						<rect x="0" y="12" width="14" height="51"/>
					</g>

					<g id="first-frame-button-shape" transform="translate(100 75) rotate(-180)">
						<polygon points="16 65 75 37.5 16 10 16 65"/>
						<rect x="75" y="10" width="12" height="55"/>
					</g>

					<g id="last-frame-button-shape">
						<polygon points="16 65 75 37.5 16 10 16 65"/>
						<rect x="75" y="10" width="12" height="55"/>
					</g>
				</defs>
			</svg>
		)
	}

	handleNewDriverSequence(sequence) {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		stage.sequences.push(sequence)

		this.fireStageChange(stage)
	}

	handleDriverSequenceChange(sequence, save = true) {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		let index = model.indexOfID(this.props.stage.sequences, sequence.id)
		stage.sequences[index] = sequence

		this.fireStageChange(stage, save)
	}

	handleDriverSequenceMove(movedSequenceID, onSequenceID, relativeIndex) {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		let
			movedSequence,
			movedIndex,
			insertIndex

		for (let i = 0; i < stage.sequences.length; i++) {
			if (stage.sequences[i].id === movedSequenceID) {
				movedSequence = stage.sequences[i]
				movedIndex = i
				break
			}
		}

		for (let i = 0; i < stage.sequences.length; i++) {
			if (stage.sequences[i].id === onSequenceID) {
				insertIndex = i + relativeIndex
				if (insertIndex > movedIndex) {
					insertIndex -= 1
				}
				break
			}
		}

		if (insertIndex === movedIndex) {
			return
		}

		stage.sequences.splice(movedIndex, 1)
		stage.sequences.splice(insertIndex, 0, movedSequence)

		this.props.onStageChange(stage, true)
	}

	handleRemoveDriverSequence(sequence) {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		let index = model.indexOfID(this.props.stage.sequences, sequence.id)
		stage.sequences.splice(index, 1)

		this.fireStageChange(stage, true)
	}

	handleNewBasicSequence(sequence, selectedDriverSequence) {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		let driverSequence = model.itemOfID(stage.sequences, selectedDriverSequence.id)
		driverSequence.sequences.push(sequence)

		this.fireStageChange(stage)
	}

	handleBasicSequenceChange(sequence, selectedDriverSequence, save = true) {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		let driverSequence = model.itemOfID(stage.sequences, selectedDriverSequence.id)
		let index = model.indexOfID(driverSequence.sequences, sequence.id)
		driverSequence.sequences[index] = sequence

		this.fireStageChange(stage, save)
	}

	fireStageChange(stage, save = true) {
		if (typeof this.props.onStageChange === 'function') {
			this.props.onStageChange(stage, save)
		}
	}

	handleBasicSequenceMove(driverSequenceID, movedSequenceID, onSequenceID, relativeIndex) {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		let movedSequence
		let fromDriverSequence
		let movedIndex
		for (let driverSequence of stage.sequences) {
			for (let i = 0; i < driverSequence.sequences.length; i++) {
				if (driverSequence.sequences[i].id === movedSequenceID) {
					fromDriverSequence = driverSequence
					movedSequence = driverSequence.sequences[i]
					movedIndex = i
					break
				}
			}
		}

		let driverSequence = model.itemOfID(stage.sequences, driverSequenceID)
		let insertIndex
		if (!onSequenceID) {
			insertIndex = 0
		} else {
			for (let i = 0; i < driverSequence.sequences.length; i++) {
				if (driverSequence.sequences[i].id === onSequenceID) {
					insertIndex = i + relativeIndex
					break
				}
			}
		}

		if (fromDriverSequence.id === driverSequence.id) {
			if (insertIndex > movedIndex) {
				insertIndex -= 1
			}
			if (insertIndex === movedIndex) {
				return
			}
		}

		fromDriverSequence.sequences.splice(movedIndex, 1)
		driverSequence.sequences.splice(insertIndex, 0, movedSequence)
		this.props.onStageChange(stage, true)
	}

	handleKeyBindings(e) {
		if (e.target.tagName === 'BODY') {
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
				for (let [key, handler] of entries()(this.keyBindings.none)) {
					if (e.key === key) {
						handler.bind(this)(e)
						e.stopPropagation()
						e.preventDefault()
						break
					}
				}
			}
		}
	}

	handleScrollY(deltaY) {
		let scrollY = this.state.scrollY + deltaY
		this.setState({
			scrollY: scrollY,
		})
	}

	handleCurrentTimeChange(time) {
		this.props.onCurrentTimeChange(time)
	}

	handleTimeWindowChange(startTime, endTime) {
		this.setState({
			startTime: startTime,
			endTime: endTime,
		})
	}

	handleTimeScaleChange(timeScale) {
		this.timeScale = timeScale
	}

	handleValueScaleChange(valueScale) {
		this.valueScale = valueScale
	}

	handleUnselectKeyframes() {
		let selection = { ...this.state.selection,
			active: 'none',
			keyframes: [],
			basicSequences: [],
			driverSequences: [],
		}
		this.setState({
			selection: selection,
		})
	}

	handleSelectKeyframes(keyframes) {
		if (keyframes.length === 0) {
			this.handleUnselectKeyframes()
		} else {
			let selectedKeyframes = KeyframeHelper.mergeSelectedKeyframes(this.state.selection.keyframes, keyframes)
			let basicSequences = KeyframeHelper.getKeyframesSequenceIDs(selectedKeyframes)
			let selection = { ...this.state.selection,
				active: 'keyframes',
				keyframes: selectedKeyframes,
				basicSequences: basicSequences,
				driverSequences: [],
			}
			this.setState({
				selection: selection,
			})
		}
	}

	handleSingleKeyframeMouseDown(e, newKeyframe) {
		let selectedKeyframes = JSON.parse(JSON.stringify(this.state.selection.keyframes))
		let translateCallback

		if (e.shiftKey || e.ctrlKey) {
			selectedKeyframes = KeyframeHelper.mergeSelectedKeyframes(this.state.selection.keyframes, [newKeyframe])
		} else {
			if (!KeyframeHelper.containsKeyframe(this.state.selection.keyframes, newKeyframe)) {
				selectedKeyframes = [newKeyframe]
			}

			e.persist()
			translateCallback = () => {
				this.handleTranslateKeyframesStart(newKeyframe, e)
			}
		}

		let basicSequences = KeyframeHelper.getKeyframesSequenceIDs(selectedKeyframes)
		let selection = { ...this.state.selection,
			active: 'keyframes',
			keyframes: selectedKeyframes,
			basicSequences: basicSequences,
			driverSequences: [],
		}
		this.setState({
			selection: selection,
		}, translateCallback)
	}

	handleTranslateKeyframesStart(targetKeyframe, e) {
		if (this.state.selection.keyframes.length > 0) {
			this.translation = KeyframeHelper.constructTranslationObject(this.props.stage, this.state.selection.keyframes, targetKeyframe, e.altKey, e.clientX, e.clientY, this.state.showGraph)

			window.addEventListener('mouseup', this.handleTranslateKeyframesStop)
			window.addEventListener('mousemove', this.handleTranslateKeyframes)
		}
	}

	handleTranslateKeyframesStop() {
		window.removeEventListener('mouseup', this.handleTranslateKeyframesStop)
		window.removeEventListener('mousemove', this.handleTranslateKeyframes)
		window.removeEventListener('mousemove', this.handleTranslateScaleKeyframes)
		this.fireStageChange(this.props.stage, this.translation.hasChanged)
	}

	handleTranslateKeyframes(e) {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		let selectedKeyframes = []
		KeyframeHelper.applySmoothTranslation(stage, selectedKeyframes, this.translation, e.clientX, e.clientY, this.timeScale, this.valueScale)
			.then((result) => {
				if (result.hasChanged) {

					let selection = { ...this.state.selection,
						keyframes: result.selectedKeyframes,
					}
					this.setState({
						selection: selection,
					})

					this.fireStageChange(result.stage, false)
				}
			})
			.catch(() => {})
	}

	handleGoToTime(t) {
		if (t < this.state.startTime || t > this.state.endTime) {
			let timeWindow = this.state.endTime - this.state.startTime
			let startTime = t - timeWindow / 2
			if (startTime < 0) {
				startTime = 0
			}
			let endTime = startTime + timeWindow
			if (endTime > this.props.stage.duration) {
				endTime = this.props.stage.duration
				startTime = endTime - timeWindow
			}

			startTime = Math.round(startTime)
			endTime = Math.round(endTime)

			this.setState({
				startTime: startTime,
				endTime: endTime,
			})
		}
		this.props.onCurrentTimeChange(t)
	}

	handleBasicSequenceTimeChange(basicSequenceID, start, duration, confirmed) {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		let basicSequence = model.getBasicSequence(stage.sequences, basicSequenceID)
		basicSequence.start = start
		basicSequence.duration = duration
		this.fireStageChange(stage, confirmed)
	}

	handleShowGraphChange(showGraph) {
		this.setState({
			showGraph: showGraph,
		})
	}

	handleToggleGraph() {
		this.setState({
			showGraph: !this.state.showGraph,
		})
	}


	handleGoToStart(e) {
		if (this.props.currentTime > 0) {
			this.handleGoToTime(0)
		}
	}

	handleGoToEnd(e) {
		if (this.props.currentTime < this.props.stage.duration) {
			this.handleGoToTime(this.props.stage.duration)
		}
	}

	handleGoToPrevFrame(e) {
		if (this.props.currentTime > 0) {
			let t = Math.round((Math.round(this.props.currentTime / units.FRAME_TIME) - 1) * units.FRAME_TIME)
			this.handleGoToTime(t)
		}
	}

	handleGoToNextFrame(e) {
		if (this.props.currentTime < this.props.stage.duration) {
			let t = Math.round((Math.round(this.props.currentTime / units.FRAME_TIME) + 1) * units.FRAME_TIME)
			this.handleGoToTime(t)
		}
	}

	handleGoToPrevSecond(e) {
		if (this.props.currentTime > 0) {
			let t = Math.round(Math.round((this.props.currentTime - 1e9) / units.FRAME_TIME) * units.FRAME_TIME)
			t = Math.max(t, 0)
			this.handleGoToTime(t)
		}
	}

	handleGoToNextSecond(e) {
		if (this.props.currentTime < this.props.stage.duration) {
			let t = Math.round(Math.round((this.props.currentTime + 1e9) / units.FRAME_TIME) * units.FRAME_TIME)
			t = Math.min(t, this.props.stage.duration)
			this.handleGoToTime(t)
		}
	}

	handleSelectDriverSequence(sequenceID, add) {
		let driverSequences = this.state.selection.driverSequences

		if (add && !driverSequences.includes(sequenceID)) {
			driverSequences.push(sequenceID)
		} else {
			driverSequences = [sequenceID]
		}

		let selection = { ...this.state.selection,
			active: 'driverSequences',
			keyframes: [],
			basicSequences: [],
			driverSequences: driverSequences,
		}

		this.setState({
			selection: selection,
		})
	}

	handleSelectBasicSequence(sequenceID, add) {
		let basicSequences = this.state.selection.basicSequences

		if (add && !basicSequences.includes(sequenceID)) {
			basicSequences.push(sequenceID)
		} else {
			basicSequences = [sequenceID]
		}

		let keyframes = []

		for (let driverSequence of this.props.stage.sequences) {
			for (let basicSequence of driverSequence.sequences) {
				if (basicSequences.includes(basicSequence.id)) {
					for (let i = 0; i < basicSequence.keyframes.length; i++) {
						keyframes.push({
							sequenceID: basicSequence.id,
							index: i,
						})
					}
				}
			}
		}

		let selection = { ...this.state.selection,
			active: 'basicSequences',
			keyframes: keyframes,
			basicSequences: basicSequences,
			driverSequences: [],
		}

		this.setState({
			selection: selection,
		})
	}

	handleUnselectAll() {
		let selection = { ...this.state.selection,
			active: 'none',
			keyframes: [],
			basicSequences: [],
			driverSequences: [],
		}

		this.setState({
			selection: selection,
		})
	}

	handleCopy() {
		switch (this.state.selection.active) {
			case 'keyframes':
				this.copyKeyframes()
				break
			case 'driverSequences':
				this.copyDriverSequences()
				break
			case 'basicSequences':
				this.copyBasicSequences()
				break
			default:
		}
	}

	handlePaste() {
		switch (this.clipboard.type) {
			case 'keyframes':
				this.pasteKeyframes()
				break
			case 'driverSequences':
				this.pasteDriverSequences()
				break
			case 'basicSequences':
				this.pasteBasicSequences()
				break
			default:
		}
	}

	handleDelete() {
		switch (this.state.selection.active) {
			case 'keyframes':
				this.deleteKeyframes()
				break
			case 'driverSequences':
				this.deleteDriverSequences()
				break
			case 'basicSequences':
				this.deleteBasicSequences()
				break
			default:
		}
	}

	copyKeyframes() {
		this.clipboard = {
			type: 'keyframes',
			data: KeyframeHelper.collectKeyframes(this.props.stage.sequences, this.state.selection.keyframes)
		}
	}

	copyDriverSequences() {
		let driverSequences = []
		for (let sequence of this.props.stage.sequences) {
			if (this.state.selection.driverSequences.includes(sequence.id)) {
				driverSequences.push(JSON.parse(JSON.stringify(sequence)))
			}
		}
		this.clipboard = {
			type: 'driverSequences',
			data: driverSequences,
		}
	}

	copyBasicSequences() {
		let basicSequences = []
		for (let driverSequence of this.props.stage.sequences) {
			for (let sequence of driverSequence.sequences) {
				if (this.state.selection.basicSequences.includes(sequence.id)) {
					basicSequences.push(JSON.parse(JSON.stringify(sequence)))
				}
			}
		}
		this.clipboard = {
			type: 'basicSequences',
			data: basicSequences,
		}
	}

	pasteKeyframes() {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		let selectedKeyframes = []
		KeyframeHelper.pasteKeyframes(
			stage.sequences,
			this.state.selection.basicSequences,
			this.clipboard.data,
			this.props.currentTime,
			this.props.stage.duration,
			selectedKeyframes
		)

		let selection = {
			...this.state.selection,
			keyframes: selectedKeyframes,
		}
		this.setState({
			selection: selection,
		})

		this.props.onStageChange(stage, true)
	}

	pasteDriverSequences() {
		let clonePromises = []
		for (let driverSequence of this.clipboard.data) {
			clonePromises.push(model.cloneDriverSequence(driverSequence))
		}

		Promise.all(clonePromises)
			.then(sequences => {
				let stage = JSON.parse(JSON.stringify(this.props.stage))

				let max = -1
				stage.sequences.forEach((sequence, i) => {
					if (this.state.selection.driverSequences.includes(sequence.id)) {
						max = i
					}
				})
				let pasteIndex = stage.sequences.length
				if (max >= 0) {
					pasteIndex = max + 1
				}

				stage.sequences.splice(pasteIndex, 0, ...sequences)

				let selectedSequences = sequences.map(sequence => sequence.id)

				let selection = { ...this.state.selection,
					active: 'driverSequences',
					keyframes: [],
					basicSequences: [],
					driverSequences: selectedSequences,
				}

				this.setState({
					selection: selection,
				})

				this.props.onStageChange(stage, true)
			})
	}

	pasteBasicSequences() {
		let clonePromises = []
		for (let basicSequence of this.clipboard.data) {
			clonePromises.push(model.cloneBasicSequence(basicSequence))
		}

		Promise.all(clonePromises)
			.then(sequences => {
				let stage = JSON.parse(JSON.stringify(this.props.stage))

				let driverSequence, pasteIndex
				if (this.state.selection.active === 'driverSequences') {
					pasteIndex = 0
					for (let sequence of stage.sequences) {
						if (this.state.selection.driverSequences.includes(sequence.id)) {
							driverSequence = sequence
							break
						}
					}
				} else if (this.state.selection.active === 'basicSequences') {
					for (let driverSeq of stage.sequences) {

						for (let i = driverSeq.sequences.length - 1; i >= 0; i--) {
							if (this.state.selection.basicSequences.includes(driverSeq.sequences[i].id)) {
								driverSequence = driverSeq
								pasteIndex = i + 1
								break
							}
						}
					}
				} else {
					return
				}

				driverSequence.sequences.splice(pasteIndex, 0, ...sequences)

				let selectedSequences = sequences.map(sequence => sequence.id)

				let selection = { ...this.state.selection,
					active: 'basicSequences',
					keyframes: [],
					basicSequences: selectedSequences,
					driverSequences: [],
				}

				this.setState({
					selection: selection,
				})

				this.props.onStageChange(stage, true)
			})
	}

	deleteKeyframes() {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		let indexesMap = new Map()
		for (let keyframe of this.state.selection.keyframes) {
			let sequenceID = keyframe.sequenceID
			if (!indexesMap.has(sequenceID)) {
				indexesMap.set(sequenceID, [])
			}
			indexesMap.get(sequenceID).push(keyframe.index)
		}

		for (let [sequenceID, indexes] of indexesMap) {
			let basicSequence = model.getBasicSequence(stage.sequences, sequenceID)
			indexes.sort()
			let deletedCount = 0
			for (let index of indexes) {
				basicSequence.keyframes.splice(index - deletedCount, 1)
				deletedCount++
			}
		}
		let selection = { ...this.state.selection,
			active: 'none',
			keyframes: [],
			basicSequences: [],
			driverSequences: [],
		}
		this.setState({
			selection: selection,
		})
		this.fireStageChange(stage)
	}

	deleteDriverSequences() {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		for (let i = 0; i < stage.sequences.length; i++) {
			if (this.state.selection.driverSequences.includes(stage.sequences[i].id)) {
				stage.sequences.splice(i, 1)
				i--
			}
		}

		let selection = { ...this.state.selection,
			active: 'none',
			keyframes: [],
			basicSequences: [],
			driverSequences: [],
		}
		this.setState({
			selection: selection,
		})
		this.fireStageChange(stage, true)
	}

	deleteBasicSequences() {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		for (let sequence of stage.sequences) {
			for (let i = 0; i < sequence.sequences.length; i++) {
				if (this.state.selection.basicSequences.includes(sequence.sequences[i].id)) {
					sequence.sequences.splice(i, 1)
					i--
				}
			}
		}

		let selection = { ...this.state.selection,
			active: 'none',
			keyframes: [],
			basicSequences: [],
			driverSequences: [],
		}
		this.setState({
			selection: selection,
		})
		this.fireStageChange(stage, true)
	}

	handleOpenStageSettings() {
		this.setState({
			showStageSettingsModal: true,
		})
	}

	handleUpdateStageSettings(stage, audioFile) {
		new Promise((resolve, reject) => {
				if (audioFile) {
					const fileName = audioFile.name
					const reader = new FileReader();
					reader.addEventListener("loadend", () => {
						fetchAPI(
							`/audio/${stage.id}/${fileName}`, {
								method: 'PUT',
								body: reader.result,
							},
							resolve,
							reject,
							`Error uploading audio file "${audioFile.name}"`)
					})
					reader.readAsDataURL(audioFile);
					stage.audio.file = fileName

				} else {
					resolve()
				}
			})
			.then(() => {
				this.fireStageChange(stage, true)
			})
			.catch((error) => console.error(error))

		this.setState({
			showStageSettingsModal: false,
		})
	}

	handleCancelStageSettingsModal() {
		this.setState({
			showStageSettingsModal: false,
		})
	}

	handleMuteChange(mute) {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		stage.audio.mute = mute
		this.fireStageChange(stage, true)
	}
}
