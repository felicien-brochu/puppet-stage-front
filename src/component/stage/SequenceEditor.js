import React from 'react'
import PropTypes from 'prop-types'
import model from '../../util/model'
import {
	entries
} from '../../util/utils'
import KeyframeHelper from './KeyframeHelper'
import SequenceList from './sequence-list/SequenceList'
import Timeline from './timeline/Timeline'

export default class SequenceEditor extends React.Component {

	static propTypes = {
		stage: PropTypes.object.isRequired,
		puppet: PropTypes.object.isRequired,
		saveState: PropTypes.oneOf(['saved', 'saving', 'modified', 'traveled']).isRequired,
		onStageChange: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.state = {
			scrollY: 0,
			selectedKeyframes: [],
			currentTime: 0,
			startTime: 0,
			endTime: props.stage.duration,
			showGraph: false,
		}

		this.handleScrollY = this.handleScrollY.bind(this)
		this.handleNewDriverSequence = this.handleNewDriverSequence.bind(this)
		this.handleDriverSequenceChange = this.handleDriverSequenceChange.bind(this)
		this.handleNewBasicSequence = this.handleNewBasicSequence.bind(this)
		this.handleBasicSequenceChange = this.handleBasicSequenceChange.bind(this)
		this.handleTimeScaleChange = this.handleTimeScaleChange.bind(this)
		this.handleUnselectKeyframes = this.handleUnselectKeyframes.bind(this)
		this.handleSelectKeyframes = this.handleSelectKeyframes.bind(this)
		this.handleSingleKeyframeMouseDown = this.handleSingleKeyframeMouseDown.bind(this)
		this.handleTranslateKeyframesStop = this.handleTranslateKeyframesStop.bind(this)
		this.handleTranslateKeyframes = this.handleTranslateKeyframes.bind(this)
		this.handleCurrentTimeChange = this.handleCurrentTimeChange.bind(this)
		this.handleTimeWindowChange = this.handleTimeWindowChange.bind(this)
		this.handleGoToTime = this.handleGoToTime.bind(this)
		this.handleBasicSequenceTimeChange = this.handleBasicSequenceTimeChange.bind(this)
		this.handleDeleteSelectedKeyframes = this.handleDeleteSelectedKeyframes.bind(this)
		this.handleKeyBindings = this.handleKeyBindings.bind(this)
		this.handleShowGraphChange = this.handleShowGraphChange.bind(this)


		this.translation = {}
		this.timeScale = 1
		this.keyBindings = {
			Delete: this.handleDeleteSelectedKeyframes,
			Tab: this.handleToggleGraph,
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
					saveState={this.props.saveState}
					currentTime={this.state.currentTime}
					scrollY={this.state.scrollY}
					showGraph={this.state.showGraph}

					onScrollY={this.handleScrollY}
					onNewDriverSequence={this.handleNewDriverSequence}
					onDriverSequenceChange={this.handleDriverSequenceChange}
					onNewBasicSequence={this.handleNewBasicSequence}
					onBasicSequenceChange={this.handleBasicSequenceChange}
					onGoToTime={this.handleGoToTime}
					onShowGraphChange={this.handleShowGraphChange}
				/>
				<Timeline
					stage={this.props.stage}
					scrollY={this.state.scrollY}
					selectedKeyframes={this.state.selectedKeyframes}
					currentTime={this.state.currentTime}
					startTime={this.state.startTime}
					endTime={this.state.endTime}
					showGraph={this.state.showGraph}

					onScrollY={this.handleScrollY}
					onCurrentTimeChange={this.handleCurrentTimeChange}
					onScaleChange={this.handleTimeScaleChange}
					onTimeWindowChange={this.handleTimeWindowChange}
					onUnselectKeyframes={this.handleUnselectKeyframes}
					onSelectKeyframes={this.handleSelectKeyframes}
					onSingleKeyframeMouseDown={this.handleSingleKeyframeMouseDown}
					onBasicSequenceTimeChange={this.handleBasicSequenceTimeChange}
				/>
			</div>
		)
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


					<path id="eye-shape" d="M9,50c22.8,29.3,59.2,29.3,82,0C72.8,20.7,27.2,20.7,9,50z M50,65c-8.3,0-15-6.7-15-15s6.7-15,15-15
					s15,6.7,15,15S58.3,65,50,65z"/>

					<circle id="point-shape" cx="50" cy="50" r="25"/>

					<path id="graph-shape" d="M12,75c0,0,10.3-32.1,25.8-30.4c15.5,1.7,17.9,11.7,31.5,8.6S88,25,88,25" style={{
							strokeWidth: "10px",
							fill: "none",
					}}/>
					

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

	handleKeyBindings(e) {
		if (e.target.tagName === 'BODY') {
			for (let [key, handler] of entries()(this.keyBindings)) {
				if (e.key === key) {
					handler.bind(this)(e)
					e.stopPropagation()
					e.preventDefault()
					break
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
		this.setState({
			currentTime: time,
		})
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

	handleUnselectKeyframes() {
		this.setState({
			selectedKeyframes: [],
		})
	}

	handleSelectKeyframes(keyframes) {
		let selectedKeyframes = KeyframeHelper.mergeSelectedKeyframes(this.state.selectedKeyframes, keyframes)

		this.setState({
			selectedKeyframes: selectedKeyframes,
		})
	}

	handleDeleteSelectedKeyframes() {
		let stage = JSON.parse(JSON.stringify(this.props.stage))
		let indexesMap = new Map()
		for (let keyframe of this.state.selectedKeyframes) {
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

		this.setState({
			selectedKeyframes: [],
		})
		this.fireStageChange(stage)
	}

	handleSingleKeyframeMouseDown(e, newKeyframe) {
		let selectedKeyframes = JSON.parse(JSON.stringify(this.state.selectedKeyframes))
		let translateCallback

		if (e.shiftKey || e.ctrlKey) {
			selectedKeyframes = KeyframeHelper.mergeSelectedKeyframes(this.state.selectedKeyframes, [newKeyframe])
		} else {
			if (!KeyframeHelper.containsKeyframe(this.state.selectedKeyframes, newKeyframe)) {
				selectedKeyframes = [newKeyframe]
			}

			e.persist()
			translateCallback = () => {
				this.handleTranslateKeyframesStart(newKeyframe, e)
			}
		}

		this.setState({
			selectedKeyframes: selectedKeyframes,
		}, translateCallback)
	}

	handleTranslateKeyframesStart(targetKeyframe, e) {
		if (this.state.selectedKeyframes.length > 0) {
			this.translation = KeyframeHelper.constructTranslationObject(this.props.stage, this.state.selectedKeyframes, targetKeyframe, e.altKey, e.clientX, e.clientY)

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
		let hasChanged = KeyframeHelper.applyTranslation(stage, selectedKeyframes, this.translation, e.clientX, this.timeScale)

		if (hasChanged) {
			this.setState({
				selectedKeyframes: selectedKeyframes,
			})

			this.fireStageChange(stage, false)
		}
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
				currentTime: t,
			})
		} else {
			this.setState({
				currentTime: t,
			})
		}
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
}
