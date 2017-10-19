import React from 'react'
import PropTypes from 'prop-types'

export default class VerticalScrollBar extends React.Component {
	static propTypes = {
		disabled: PropTypes.bool,
	}

	render() {
		return (
			<div className="vertical-scroll-bar">
				<div className="vertical-nub"/>
			</div>
		);
	}
};
