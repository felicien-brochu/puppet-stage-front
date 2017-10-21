import React from 'react'
import PropTypes from 'prop-types'
import SequenceBox from './SequenceBox'

const DRIVER_SEQUENCE_BOX_HEIGHT = 23
const BASIC_SEQUENCE_BOX_HEIGHT = 26

export default class TimelineDriverSequence extends React.Component {
	static propTypes = {
		sequence: PropTypes.object.isRequired,
		timeline: PropTypes.shape({
			paddingLeft: PropTypes.number.isRequired,
			paddingRight: PropTypes.number.isRequired,
			start: PropTypes.number.isRequired,
			end: PropTypes.number.isRequired,
			width: PropTypes.number.isRequired,
		}).isRequired,
	}

	render() {
		return (
			<li
				className="timeline-driver-sequence"
				key={this.props.sequence.id}
			>
				<SequenceBox
					attributes={{
						className: 'timeline-driver-sequence-box'
					}}
					timeline={this.props.timeline}
					start={this.computeStart()}
					end={this.computeEnd()}
					height={DRIVER_SEQUENCE_BOX_HEIGHT}
					renderTag="div"
					disabled
				/>
				{this.renderBasicSequences()}
			</li>
		);
	}

	renderBasicSequences() {
		if (this.props.sequence.expanded && this.props.sequence.sequences && this.props.sequence.sequences.length > 0) {
			return (
				<ul className="timeline-basic-sequence-list">
					{this.props.sequence.sequences.map(this.renderBasicSequence.bind(this))}
				</ul>
			)
		} else {
			return null
		}
	}

	computeStart() {
		let min = Number.MAX_SAFE_INTEGER
		for (let sequence of this.props.sequence.sequences) {
			if (sequence.start < min) {
				min = sequence.start
			}
		}
		if (min === Number.MAX_SAFE_INTEGER) {
			min = 0
		}
		return min
	}

	computeEnd() {
		let max = 0
		for (let sequence of this.props.sequence.sequences) {
			if (sequence.start + sequence.duration > max) {
				max = sequence.start + sequence.duration
			}
		}
		return max
	}

	renderBasicSequence(basicSequence) {
		return (
			<SequenceBox
				key={basicSequence.id}
				attributes={{
					className: 'timeline-basic-sequence'
				}}
				timeline={this.props.timeline}
				start={basicSequence.start}
				end={basicSequence.start + basicSequence.duration}
				height={BASIC_SEQUENCE_BOX_HEIGHT}
				renderTag="li"
			/>
		)
	}
};
