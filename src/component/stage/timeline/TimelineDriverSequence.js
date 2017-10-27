import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import SequenceBox from './SequenceBox'
import colorClasses from '../colorclasses'

const DRIVER_SEQUENCE_BOX_HEIGHT = 20
const BASIC_SEQUENCE_BOX_HEIGHT = 21

export default class TimelineDriverSequence extends React.Component {
	static propTypes = {
		sequence: PropTypes.object.isRequired,
		color: PropTypes.number.isRequired,
		timeline: PropTypes.shape({
			paddingLeft: PropTypes.number.isRequired,
			paddingRight: PropTypes.number.isRequired,
			start: PropTypes.number.isRequired,
			end: PropTypes.number.isRequired,
			width: PropTypes.number.isRequired,
		}).isRequired,
		selectedKeyframes: PropTypes.array.isRequired,
		selectingKeyframes: PropTypes.array.isRequired,

		onKeyframeMouseDown: PropTypes.func.isRequired,
		onBasicSequenceTimeChange: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.basicSequenceViews = []

		this.getSelectingKeyframes = this.getSelectingKeyframes.bind(this)
	}

	render() {
		return (
			<li
				className={classNames("timeline-driver-sequence", colorClasses[this.props.color])}
				key={this.props.sequence.id}
			>
				<SequenceBox
					attributes={{
						className: 'timeline-driver-sequence-box'
					}}
					timeline={this.props.timeline}
					start={this.computeStart()}
					duration={this.computeEnd() - this.computeStart()}
					height={DRIVER_SEQUENCE_BOX_HEIGHT}
					renderTag="div"
					disabled
				/>
				{this.renderBasicSequences()}
			</li>
		)
	}

	renderBasicSequences() {
		if (this.props.sequence.expanded && this.props.sequence.sequences && this.props.sequence.sequences.length > 0) {
			let basicSequences = []
			for (let i = 0; i < this.props.sequence.sequences.length; i++) {
				let basicSequence = this.props.sequence.sequences[i]
				basicSequences.push(
					<SequenceBox
						key={basicSequence.id}
						ref={sequence => this.basicSequenceViews[i] = sequence}
						attributes={{
							className: 'timeline-basic-sequence'
						}}
						timeline={this.props.timeline}
						sequence={basicSequence}
						height={BASIC_SEQUENCE_BOX_HEIGHT}
						renderTag="li"
						selectedKeyframes={this.props.selectedKeyframes}
						selectingKeyframes={this.props.selectingKeyframes}

						onKeyframeMouseDown={this.props.onKeyframeMouseDown}
						onBasicSequenceTimeChange={this.props.onBasicSequenceTimeChange}
				/>
				)
			}
			return (
				<ul className="timeline-basic-sequence-list">
					{basicSequences}
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

	getSelectingKeyframes(selectionRect) {
		let keyframes = []
		if (this.props.sequence.expanded) {
			for (let i = 0; i < this.props.sequence.sequences.length; i++) {
				let basicSequence = this.basicSequenceViews[i]
				keyframes = keyframes.concat(basicSequence.getSelectingKeyframes(selectionRect))
			}
		}

		return keyframes
	}
}
