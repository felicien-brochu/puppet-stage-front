import React from 'react'
import PropTypes from 'prop-types'

export default class TimeCursor extends React.Component {
	static propTypes = {
		currentTime: PropTypes.number.isRequired,
	}

	render() {
		let {
			paddingLeft,
			start,
			height,
			getTimeScale
		} = this.props.timeline
		let x = paddingLeft + (this.props.currentTime - start) * getTimeScale()

		return (
			<svg className="time-cursor">
				<use x={x - 0.5} className="time-cursor-slider" href="#time-cursor-shape"/>
				<rect x={x - 0.5} y={30} width="1" height={height}/>
			</svg>
		)
	}
}
