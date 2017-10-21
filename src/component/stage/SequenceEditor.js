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
		}
	}

	render() {
		return (
			<div className="sequence-editor">
				<svg className="svg-defs">
					<defs>
						<filter id="noise-effect" filterUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
							<feTurbulence type="fractalNoise" result="noisy" baseFrequency="0.9"/>
							<feColorMatrix type="saturate" values="0"/>
							<feBlend in="SourceGraphic" in2="noisy" mode="multiply"/>
						</filter>
						<polygon id="expand-button-shape" points="28,26 50,78 72,26"/>
						<polygon id="time-cursor-shape" points="-7,12 8,12 8,21 2,30 1,30 1,21 4,21 4,20 -3,20 -3,21 0,21 0,30 -1,30 -7,21"/>
					</defs>
				</svg>
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

					onScrollY={(deltaY) => this.handleScrollY(deltaY)}
					scrollY={this.state.scrollY}
				/>
			</div>
		);
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
};
