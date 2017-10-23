import React from 'react';
import PropTypes from 'prop-types'
import model from '../../util/model'
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

		this.handleUnselectKeyframes = this.handleUnselectKeyframes.bind(this)
		this.handleSelectKeyframes = this.handleSelectKeyframes.bind(this)
		this.handleSelectSingleKeyframe = this.handleSelectSingleKeyframe.bind(this)
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

					onScrollY={(deltaY) => this.handleScrollY(deltaY)}
					onUnselectKeyframes={this.handleUnselectKeyframes}
					onSelectKeyframes={this.handleSelectKeyframes}
					onSelectSingleKeyframe={this.handleSelectSingleKeyframe}
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
							<polygon className="keyframe-start-diamond" points="4,-4 -4,-4 -4,4"/>
						</g>
					</g>
					<g id="keyframe-end-shape">
						<rect x="-5.65" y="-20" width="11.3" height="40" opacity="0"/>
						<g  transform="rotate(-45)">
							<rect x="-4" y="-4" width="8" height="8"/>
							<polygon className="keyframe-end-diamond" points="4,-4 4,4 -4,4"/>
						</g>
					</g>

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

	handleUnselectKeyframes() {
		console.log("unselect");
		this.setState({
			selectedKeyframes: [],
		})
	}

	handleSelectKeyframes(keyframes) {
		let selectedKeyframes = this.state.selectedKeyframes.slice()

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

	handleSelectSingleKeyframe(newKeyframe, addOrSubstract) {
		let selectedKeyframes = []

		if (addOrSubstract) {
			selectedKeyframes = this.state.selectedKeyframes.slice()
			let copyIndex = -1

			for (let i = 0; i < selectedKeyframes.length; i++) {
				let keyframe = selectedKeyframes[i]
				if (keyframe.sequenceID === newKeyframe.sequenceID && keyframe.keyframe === newKeyframe.keyframe) {
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
			selectedKeyframes.push(newKeyframe)
		}

		this.setState({
			selectedKeyframes: selectedKeyframes,
		})
	}
};
