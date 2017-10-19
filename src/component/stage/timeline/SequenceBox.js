import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const BOX_HEIGHT = 24

export default class SequenceBox extends React.Component {
	static propTypes = {
		timeline: PropTypes.shape({
			paddingLeft: PropTypes.number.isRequired,
			paddingRight: PropTypes.number.isRequired,
			start: PropTypes.number.isRequired,
			end: PropTypes.number.isRequired,
			width: PropTypes.number.isRequired,
		}).isRequired,
		start: PropTypes.number.isRequired,
		end: PropTypes.number.isRequired,
		renderTag: PropTypes.oneOfType([
			PropTypes.node,
			PropTypes.func
		]),
		disabled: PropTypes.bool,
		attributes: PropTypes.object,
	}

	static defaultProps = {
		renderTag: "div",
		disabled: false,
		attributes: {},
	}

	render() {
		const {
			timeline,
			start,
			end,
			renderTag,
			attributes,
		} = this.props

		let refWidth = timeline.width - timeline.paddingLeft - timeline.paddingRight
		let scale = refWidth / (timeline.end - timeline.start)
		let marginLeft = timeline.paddingLeft + ((start - timeline.start) * scale)
		let width = (end - start) * scale

		let box = (
			<svg className="sequence-box-box">
				<rect x={marginLeft} y={0} width={width} height={BOX_HEIGHT}/>
			</svg>
		)

		const newAttrs = {
			...attributes,
			style: {},
			className: classNames("sequence-box", attributes.className),
		}
		return React.createElement(renderTag, newAttrs, box)
	}
};
