import React from 'react'
import PropTypes from 'prop-types'

export default class GraphTimeline extends React.Component {
	static propTypes = {
		sequences: PropTypes.array.isRequired,
		paddingLeft: PropTypes.number.isRequired,
		paddingRight: PropTypes.number.isRequired,
		start: PropTypes.number.isRequired,
		end: PropTypes.number.isRequired,
		refWidth: PropTypes.number.isRequired,
	}

	render() {
		return (
			<div className="graph-timeline">
			</div>
		);
	}
};
