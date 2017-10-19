import React from 'react'
import PropTypes from 'prop-types'

export default class TimeCursor extends React.Component {
	static propTypes = {
		currentTime: PropTypes.number.isRequired,
	}

	render() {
		return (
			<div className="time-cursor">
			</div>
		);
	}
};
