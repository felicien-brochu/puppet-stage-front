import React from 'react';
import PropTypes from 'prop-types'
import model from '../../util/model'
import SplitPane from 'react-split-pane'
import SequenceList from './SequenceList'
import Timeline from './Timeline'

export default class SequenceEditor extends React.Component {

	static propTypes = {
		stage: PropTypes.object.isRequired,
		puppet: PropTypes.object.isRequired,
		onStageChange: PropTypes.func.isRequired,
	}

	render() {
		return (
			<div className="sequence-editor">
				<SplitPane minSize={400}>
					<SequenceList
						sequences={this.props.stage.sequences}
						puppet={this.props.puppet}
						onNewDriverSequence={(sequence) => this.handleNewDriverSequence(sequence)}
						onDriverSequenceChange={(sequence) => this.handleDriverSequenceChange(sequence)}
					/>
					<Timeline/>
				</SplitPane>
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
		let index = model.indexOfDriverSequence(this.props.stage.sequences, sequence.id)
		stage.sequences[index] = sequence

		this.fireStageChange(stage)
	}

	fireStageChange(stage) {
		if (typeof this.props.onStageChange === 'function') {
			this.props.onStageChange(stage)
		}
	}
};
