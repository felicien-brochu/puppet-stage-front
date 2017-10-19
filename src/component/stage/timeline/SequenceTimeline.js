import React from 'react'
import PropTypes from 'prop-types'
import TimelineDriverSequence from './TimelineDriverSequence'

export default class SequenceTimeline extends React.Component {
	static propTypes = {
		sequences: PropTypes.array.isRequired,
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
			<ul className="sequence-timeline" style={this.props.style}>
				{this.props.sequences.map(this.renderDriverSequence.bind(this))}
			</ul>
		)
	}

	renderDriverSequence(driverSequence) {
		return (
			<TimelineDriverSequence
				key={driverSequence.id}
				sequence={driverSequence}
				timeline={this.props.timeline}
			/>
		)
	}
};
