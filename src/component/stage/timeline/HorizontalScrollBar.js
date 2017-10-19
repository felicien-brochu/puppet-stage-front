import React from 'react'
import PropTypes from 'prop-types'

export default class HorizontalScrollBar extends React.Component {
	static propTypes = {
		disabled: PropTypes.bool,
	}

	render() {
		return (
			<div className="horizontal-scroll-bar">
				<div className="horizontal-nub"/>
			</div>
		);
	}
};
