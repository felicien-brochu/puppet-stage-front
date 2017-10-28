import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import DriverSequenceBox from './DriverSequenceBox'
import BasicSequenceBox from './BasicSequenceBox'
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
				<DriverSequenceBox
					sequence={this.props.sequence}
					
					timeline={this.props.timeline}
					height={DRIVER_SEQUENCE_BOX_HEIGHT}
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
					<BasicSequenceBox
						key={basicSequence.id}
						ref={sequence => this.basicSequenceViews[i] = sequence}

						sequence={basicSequence}
						selectedKeyframes={this.props.selectedKeyframes}
						selectingKeyframes={this.props.selectingKeyframes}

						timeline={this.props.timeline}
						height={BASIC_SEQUENCE_BOX_HEIGHT}

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
