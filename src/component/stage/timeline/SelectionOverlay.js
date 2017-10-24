import React from 'react'
import PropTypes from 'prop-types'

const CORNER_RADIUS = 1

export default class SelectionOverlay extends React.Component {
	static propTypes = {
		selection: PropTypes.shape({
			selecting: PropTypes.bool.isRequired,
			x: PropTypes.number.isRequired,
			y: PropTypes.number.isRequired,
			width: PropTypes.number.isRequired,
			height: PropTypes.number.isRequired,
		}).isRequired,
	}

	render() {
		let selection = null

		if (this.props.selection.selecting) {
			let {
				x,
				y,
				width,
				height
			} = this.props.selection

			if (width < 0) {
				x = x + width
				width = -width
			}
			width = Math.max(width, 1)

			if (height < 0) {
				y = y + height
				height = -height
			}
			height = Math.max(height, 1)
			selection = (
				<rect x={x} y={y} width={width} height={height} rx={CORNER_RADIUS} ry={CORNER_RADIUS}/>
			)
		}

		return (
			<svg className="selection-overlay">
				{selection}
			</svg>
		)
	}
}
