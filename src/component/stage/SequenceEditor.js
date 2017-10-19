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

	render() {
		return (
			<div className="sequence-editor">
				<SequenceList
					sequences={this.props.stage.sequences}
					puppet={this.props.puppet}
					onNewDriverSequence={(sequence) => this.handleNewDriverSequence(sequence)}
					onDriverSequenceChange={(sequence) => this.handleDriverSequenceChange(sequence)}
					onNewBasicSequence={(sequence, driverSequence) => this.handleNewBasicSequence(sequence, driverSequence)}
					onBasicSequenceChange={(sequence, driverSequence) => this.handleBasicSequenceChange(sequence, driverSequence)}
				/>
				<Timeline
					stage={this.props.stage}
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
};
