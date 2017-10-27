import React from 'react'
import PropTypes from 'prop-types'
import model from '../../util/model'
import SequenceList from './sequence-list/SequenceList'
import Timeline from './timeline/Timeline'
import KeyframeHelper from './KeyframeHelper'

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
		}

		this.translation = {
			clientX: 0,
			clientY: 0,
		}

		this.timeScale = 1

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

					onScrollY={this.handleScrollY}
					scrollY={this.state.scrollY}

					onNewDriverSequence={this.handleNewDriverSequence}
					onDriverSequenceChange={this.handleDriverSequenceChange}
					onNewBasicSequence={this.handleNewBasicSequence}
					onBasicSequenceChange={this.handleBasicSequenceChange}
					onGoToTime={this.handleGoToTime}
				/>
				<Timeline
					stage={this.props.stage}
					scrollY={this.state.scrollY}
					selectedKeyframes={this.state.selectedKeyframes}
					currentTime={this.state.currentTime}
					startTime={this.state.startTime}
					endTime={this.state.endTime}

					onScrollY={this.handleScrollY}
					onCurrentTimeChange={this.handleCurrentTimeChange}
					onScaleChange={this.handleTimeScaleChange}
					onTimeWindowChange={this.handleTimeWindowChange}
					onUnselectKeyframes={this.handleUnselectKeyframes}
					onSelectKeyframes={this.handleSelectKeyframes}
					onSingleKeyframeMouseDown={this.handleSingleKeyframeMouseDown}
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


					<polygon id="arrow-left-button-shape" points="20,50 70,20 70,80"/>
					<polygon id="arrow-right-button-shape" points="20,20 20,80 70,50"/>
					<polygon id="keyframe-button-shape" points="50,20 80,50 50,80 20,50"/>

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

	handleSingleKeyframeMouseDown(e, newKeyframe) {
		let selectedKeyframes = Array.from(this.state.selectedKeyframes)
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
}
