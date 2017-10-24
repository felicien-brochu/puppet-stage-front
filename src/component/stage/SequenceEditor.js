import React from 'react';
import PropTypes from 'prop-types'
import model from '../../util/model'
import units from '../../util/units'
import SequenceList from './sequence-list/SequenceList'
import Timeline from './timeline/Timeline'

export default class SequenceEditor extends React.Component {

	static propTypes = {
		stage: PropTypes.object.isRequired,
		puppet: PropTypes.object.isRequired,
		onStageChange: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.state = {
			scrollY: 0,
			selectedKeyframes: [],
		}

		this.translation = {
			clientX: 0,
			clientY: 0,
		}

		this.timeScale = 1

		this.handleScrollY = this.handleScrollY.bind(this)
		this.handleTimeScaleChange = this.handleTimeScaleChange.bind(this)
		this.handleUnselectKeyframes = this.handleUnselectKeyframes.bind(this)
		this.handleSelectKeyframes = this.handleSelectKeyframes.bind(this)
		this.handleSingleKeyframeMouseDown = this.handleSingleKeyframeMouseDown.bind(this)
		this.handleMouseUpWindow = this.handleMouseUpWindow.bind(this)
		this.handleTranslateKeyframes = this.handleTranslateKeyframes.bind(this)
		this.handleTranslateScaleKeyframes = this.handleTranslateScaleKeyframes.bind(this)
	}

	render() {
		return (
			<div className="sequence-editor">
				{this.renderSVGDefs()}

				<SequenceList
					sequences={this.props.stage.sequences}
					puppet={this.props.puppet}

					onScrollY={(deltaY) => this.handleScrollY(deltaY)}
					scrollY={this.state.scrollY}

					onNewDriverSequence={(sequence) => this.handleNewDriverSequence(sequence)}
					onDriverSequenceChange={(sequence) => this.handleDriverSequenceChange(sequence)}
					onNewBasicSequence={(sequence, driverSequence) => this.handleNewBasicSequence(sequence, driverSequence)}
					onBasicSequenceChange={(sequence, driverSequence) => this.handleBasicSequenceChange(sequence, driverSequence)}
				/>
				<Timeline
					stage={this.props.stage}
					scrollY={this.state.scrollY}
					selectedKeyframes={this.state.selectedKeyframes}

					onScrollY={this.handleScrollY}
					onScaleChange={this.handleTimeScaleChange}
					onUnselectKeyframes={this.handleUnselectKeyframes}
					onSelectKeyframes={this.handleSelectKeyframes}
					onSingleKeyframeMouseDown={this.handleSingleKeyframeMouseDown}
				/>
			</div>
		);
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

				</defs>
			</svg>
		)
	}

	handleNewDriverSequence(sequence) {
		let stage = {
			...this.props.stage
		}
		stage.sequences.push(sequence)

		this.fireStageChange(stage)
	}

	handleDriverSequenceChange(sequence) {
		let stage = {
			...this.props.stage
		}
		let index = model.indexOfID(this.props.stage.sequences, sequence.id)
		stage.sequences[index] = sequence

		this.fireStageChange(stage)
	}

	handleNewBasicSequence(sequence, selectedDriverSequence) {
		let stage = {
			...this.props.stage
		}
		let driverSequence = model.itemOfID(stage.sequences, selectedDriverSequence.id)
		driverSequence.sequences.push(sequence)

		this.fireStageChange(stage)
	}

	handleBasicSequenceChange(sequence, selectedDriverSequence) {
		let stage = {
			...this.props.stage
		}
		let driverSequence = model.itemOfID(stage.sequences, selectedDriverSequence.id)
		let index = model.indexOfID(driverSequence.sequences, sequence.id)
		driverSequence.sequences[index] = sequence

		this.fireStageChange(stage)
	}

	fireStageChange(stage) {
		if (typeof this.props.onStageChange === 'function') {
			this.props.onStageChange(stage)
		}
	}

	handleScrollY(deltaY) {
		let scrollY = this.state.scrollY + deltaY
		this.setState({
			scrollY: scrollY,
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
		let selectedKeyframes = Array.from(this.state.selectedKeyframes)

		// Remove intersection
		for (let i = 0; i < selectedKeyframes.length; i++) {
			let keyframe = selectedKeyframes[i]
			for (let j = 0; j < keyframes.length; j++) {
				let newKeyframe = keyframes[j]
				if (keyframe.sequenceID === newKeyframe.sequenceID && keyframe.keyframe === newKeyframe.keyframe) {
					keyframes.splice(j, 1)
					selectedKeyframes.splice(i, 1)
					i--
					break
				}
			}
		}

		selectedKeyframes = selectedKeyframes.concat(keyframes)

		this.setState({
			selectedKeyframes: selectedKeyframes,
		})
	}

	handleSingleKeyframeMouseDown(e, newKeyframe) {
		let selectedKeyframes = Array.from(this.state.selectedKeyframes)
		let translateCallback

		if (e.shiftKey || e.ctrlKey) {
			let copyIndex = -1

			for (let i = 0; i < selectedKeyframes.length; i++) {
				let keyframe = selectedKeyframes[i]
				if (keyframe.sequenceID === newKeyframe.sequenceID && keyframe.index === newKeyframe.index) {
					copyIndex = i
					break
				}
			}
			if (copyIndex >= 0) {
				selectedKeyframes.splice(copyIndex, 1)
			} else {
				selectedKeyframes.push(newKeyframe)
			}
		} else {
			let found = false
			for (let i = 0; i < selectedKeyframes.length; i++) {
				let keyframe = selectedKeyframes[i]
				if (keyframe.sequenceID === newKeyframe.sequenceID && keyframe.index === newKeyframe.index) {
					found = true
					break
				}
			}
			if (!found) {
				selectedKeyframes = [newKeyframe]
			}

			e.persist()
			translateCallback = () => {
				this.handleTranslateKeyframeStart(newKeyframe, e)
			}
		}

		this.setState({
			selectedKeyframes: selectedKeyframes,
		}, translateCallback)
	}

	handleTranslateKeyframeStart(targetKeyframe, e) {
		if (this.state.selectedKeyframes.length > 0) {
			let
				initialKeyframes = this.collectSelectedKeyframes(),
				handler = this.handleTranslateKeyframes,
				refTime = 0,
				refDuration = 0

			window.addEventListener('mouseup', this.handleMouseUpWindow)


			// Enable Translate Scale if Alt key is down and if the target keyframe is
			// the first or the last of selection. Store the fix point of
			// time for the scale in var refTime.
			if (e.altKey) {
				let
					stageKeyframes = new Map(JSON.parse(JSON.stringify([...initialKeyframes]))),
					minT = Number.MAX_VALUE,
					maxT = 0,
					minKeyframe,
					maxKeyframe

				for (let keyframe of this.state.selectedKeyframes) {
					for (let [sequenceID, keyframes] of stageKeyframes) {
						for (let i = 0; i < keyframes.keyframes.length; i++) {
							if (keyframe.sequenceID === sequenceID && keyframe.index === i) {
								if (minT > keyframes.keyframes[i].p.t) {
									minT = keyframes.keyframes[i].p.t
									minKeyframe = {
										sequenceID: sequenceID,
										index: i,
									}
								}
								if (maxT < keyframes.keyframes[i].p.t) {
									maxT = keyframes.keyframes[i].p.t
									maxKeyframe = {
										sequenceID: sequenceID,
										index: i,
									}
								}
							}
						}
					}
				}
				if (minT !== maxT) {
					let isMin = targetKeyframe.sequenceID === minKeyframe.sequenceID && targetKeyframe.index === minKeyframe.index
					let isMax = targetKeyframe.sequenceID === maxKeyframe.sequenceID && targetKeyframe.index === maxKeyframe.index
					if (isMin || isMax) {
						handler = this.handleTranslateScaleKeyframes
					}
					if (isMin) {
						refTime = maxT
						refDuration = minT - maxT
					} else if (isMax) {
						refTime = minT
						refDuration = maxT - minT
					}
				}
			}
			this.translation = {
				initialSelectedKeyframes: JSON.parse(JSON.stringify(this.state.selectedKeyframes)),
				initialKeyframes: initialKeyframes,
				clientX: e.clientX,
				clientY: e.clientY,
				refTime: refTime,
				refDuration: refDuration,
			}

			window.addEventListener('mousemove', handler)
		}
	}

	handleMouseUpWindow() {
		window.removeEventListener('mouseup', this.handleMouseUpWindow)
		window.removeEventListener('mousemove', this.handleTranslateKeyframes)
		window.removeEventListener('mousemove', this.handleTranslateScaleKeyframes)
	}

	handleTranslateKeyframes(e) {
		let {
			initialKeyframes,
			clientX,
		} = this.translation

		let deltaT = (e.clientX - clientX) * (1 / this.timeScale)
		deltaT = Math.round(deltaT / units.FRAME_TIME) * units.FRAME_TIME

		if (deltaT !== 0) {
			let stageKeyframes = new Map(JSON.parse(JSON.stringify([...initialKeyframes])))
			let stage = JSON.parse(JSON.stringify(this.props.stage))
			let selectedKeyframes = []

			for (let [sequenceID, keyframes] of stageKeyframes) {
				SequenceEditor.translateKeyframes(keyframes, deltaT)
				SequenceEditor.sortKeyframes(keyframes)
				SequenceEditor.removeDoubleKeyframes(keyframes)

				let sequence = model.getBasicSequence(stage, sequenceID)
				sequence.keyframes = keyframes.keyframes

				// Update selected keyframes
				keyframes.selected.forEach((selected, index) => {
					if (selected) {
						selectedKeyframes.push({
							sequenceID: sequenceID,
							index: index,
						})
					}
				})
			}

			this.setState({
				selectedKeyframes: selectedKeyframes,
			})

			this.fireStageChange(stage)
		}
	}

	handleTranslateScaleKeyframes(e) {
		let {
			initialKeyframes,
			clientX,
			refTime,
			refDuration,
		} = this.translation

		let deltaT = (e.clientX - clientX) * (1 / this.timeScale)
		deltaT = Math.round(deltaT / units.FRAME_TIME) * units.FRAME_TIME

		if (deltaT !== 0) {
			let stage = JSON.parse(JSON.stringify(this.props.stage))
			let stageKeyframes = new Map(JSON.parse(JSON.stringify([...initialKeyframes])))
			let selectedKeyframes = []
			for (let [sequenceID, keyframes] of stageKeyframes) {
				let scaleFactor = (refDuration + deltaT) / refDuration
				SequenceEditor.scaleKeyframes(keyframes, scaleFactor, refTime)
				SequenceEditor.sortKeyframes(keyframes)
				SequenceEditor.removeDoubleKeyframes(keyframes)

				let sequence = model.getBasicSequence(stage, sequenceID)
				sequence.keyframes = keyframes.keyframes

				// Update selected keyframes
				keyframes.selected.forEach((selected, index) => {
					if (selected) {
						selectedKeyframes.push({
							sequenceID: sequenceID,
							index: index,
						})
					}
				})
			}
			this.setState({
				selectedKeyframes: selectedKeyframes,
			})

			this.fireStageChange(stage)
		}
	}
	static translateKeyframes(keyframes, deltaT) {
		for (let i = 0; i < keyframes.selected.length; i++) {
			if (keyframes.selected[i]) {
				keyframes.keyframes[i].p.t += deltaT
				keyframes.keyframes[i].p.t = Math.round(keyframes.keyframes[i].p.t / units.FRAME_TIME) * units.FRAME_TIME
				keyframes.keyframes[i].c1.t += deltaT
				keyframes.keyframes[i].c1.t = Math.round(keyframes.keyframes[i].c1.t / units.FRAME_TIME) * units.FRAME_TIME
				keyframes.keyframes[i].c2.t += deltaT
				keyframes.keyframes[i].c2.t = Math.round(keyframes.keyframes[i].c2.t / units.FRAME_TIME) * units.FRAME_TIME
			}
		}
	}

	static scaleKeyframes(keyframes, scaleFactor, refTime) {
		for (let i = 0; i < keyframes.selected.length; i++) {
			if (keyframes.selected[i]) {
				keyframes.keyframes[i].p.t = refTime + scaleFactor * (keyframes.keyframes[i].p.t - refTime)
				keyframes.keyframes[i].p.t = Math.round(keyframes.keyframes[i].p.t / units.FRAME_TIME) * units.FRAME_TIME
				keyframes.keyframes[i].c1.t = refTime + scaleFactor * (keyframes.keyframes[i].c1.t - refTime)
				keyframes.keyframes[i].c1.t = Math.round(keyframes.keyframes[i].c1.t / units.FRAME_TIME) * units.FRAME_TIME
				keyframes.keyframes[i].c2.t = refTime + scaleFactor * (keyframes.keyframes[i].c2.t - refTime)
				keyframes.keyframes[i].c2.t = Math.round(keyframes.keyframes[i].c2.t / units.FRAME_TIME) * units.FRAME_TIME
			}
		}
	}

	static sortKeyframes(keyframes) {
		let changed
		do {
			changed = false
			for (let i = 0; i < keyframes.keyframes.length - 1; i++) {
				let keyframe1 = keyframes.keyframes[i]
				let keyframe2 = keyframes.keyframes[i + 1]
				if (keyframe1.p.t > keyframe2.p.t) {
					keyframes.keyframes.splice(i, 2, keyframe2, keyframe1)
					keyframes.selected.splice(i, 2, keyframes.selected[i + 1], keyframes.selected[i])
					changed = true
				}
			}
		} while (changed)
	}

	static removeDoubleKeyframes(keyframes) {
		for (let i = 0; i < keyframes.keyframes.length - 1; i++) {
			if (keyframes.keyframes[i].p.t === keyframes.keyframes[i + 1].p.t) {
				if (keyframes.selected[i]) {
					keyframes.keyframes.splice(i + 1, 1)
					keyframes.selected.splice(i + 1, 1)
					i--
				} else {
					keyframes.keyframes.splice(i, 1)
					keyframes.selected.splice(i, 1)
				}
			}
		}
	}

	collectSelectedKeyframes() {
		let keyframes = new Map()
		for (let keyframe of this.state.selectedKeyframes) {
			let sequence = model.getBasicSequence(this.props.stage, keyframe.sequenceID)
			if (!keyframes.has(keyframe.sequenceID)) {
				keyframes.set(keyframe.sequenceID, {
					keyframes: JSON.parse(JSON.stringify(sequence.keyframes)),
					selected: new Array(sequence.keyframes.length).fill(false),
				})
			}

			keyframes.get(keyframe.sequenceID).selected[keyframe.index] = true
		}
		return keyframes
	}
}
