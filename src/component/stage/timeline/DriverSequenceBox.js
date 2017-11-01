import React from 'react'
import PropTypes from 'prop-types'

export default class DriverSequenceBox extends React.Component {
	static propTypes = {
		sequence: PropTypes.object.isRequired,
		timeline: PropTypes.shape({
			paddingLeft: PropTypes.number.isRequired,
			paddingRight: PropTypes.number.isRequired,
			start: PropTypes.number.isRequired,
			end: PropTypes.number.isRequired,
			width: PropTypes.number.isRequired,
		}).isRequired,
		height: PropTypes.number.isRequired,
	}

	render() {
		const {
			timeline,
		} = this.props

		let seqStart = this.computeStart()
		let seqDuration = this.computeEnd() - seqStart

		let scale = timeline.getTimeScale()
		let x = timeline.paddingLeft + ((seqStart - timeline.start) * scale)
		let width = seqDuration * scale

		return (
			<div className="sequence-box timeline-driver-sequence-box">
				<svg className="sequence-box-box"
					ref={container => this.container = container}>
					<rect x={x} y={0} width={width} height={this.props.height-1}/>
				</svg>
			</div>
		)
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
}
