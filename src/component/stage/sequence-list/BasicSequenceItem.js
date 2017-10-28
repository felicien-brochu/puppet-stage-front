import React from 'react'
import PropTypes from 'prop-types'
import {
	ContextMenuTrigger
} from 'react-contextmenu'
import KeyframeHelper from '../KeyframeHelper'
import NumberInput from '../../base/NumberInput'
import KeyframeNavigator from './KeyframeNavigator'


export default class BasicSequenceItem extends React.Component {

	static propTypes = {
		sequence: PropTypes.object.isRequired,
		currentTime: PropTypes.number.isRequired,

		onGoToKeyframe: PropTypes.func.isRequired,
		onBasicSequenceChange: PropTypes.func.isRequired,
	}
	constructor(props) {
		super(props)

		this.currentTimeKeyframe = KeyframeHelper.getCurrentTimeKeyframe(props.currentTime, props.sequence)
		this.prevKeyframes = KeyframeHelper.getPrevKeyframes(props.currentTime, props.sequence)
		this.nextKeyframes = KeyframeHelper.getNextKeyframes(props.currentTime, props.sequence)

		this.handleGoToPrevKeyframe = this.handleGoToPrevKeyframe.bind(this)
		this.handleGoToNextKeyframe = this.handleGoToNextKeyframe.bind(this)
		this.handleRemoveKeyframe = this.handleRemoveKeyframe.bind(this)
		this.handleCreateDefaultKeyframe = this.handleCreateDefaultKeyframe.bind(this)
	}

	componentWillReceiveProps(nextProps) {
		this.currentTimeKeyframe = KeyframeHelper.getCurrentTimeKeyframe(nextProps.currentTime, nextProps.sequence)
		this.prevKeyframes = KeyframeHelper.getPrevKeyframes(nextProps.currentTime, nextProps.sequence)
		this.nextKeyframes = KeyframeHelper.getNextKeyframes(nextProps.currentTime, nextProps.sequence)
	}

	render() {
		return (

			<ContextMenuTrigger
				attributes={{
					className: "basic-sequence-list-item"
				}}
				id="basic-sequence-context-menu"
				collect={() => {
					return {
						sequence: this.props.sequence
					}
				}}
				renderTag="li"
			>
				<KeyframeNavigator
					currentTimeKeyframe={this.currentTimeKeyframe}
					prevKeyframes={this.prevKeyframes}
					nextKeyframes={this.nextKeyframes}

					onGoToPrevKeyframe={this.handleGoToPrevKeyframe}
					onGoToNextKeyframe={this.handleGoToNextKeyframe}
					onRemoveKeyframe={this.handleRemoveKeyframe}
					onCreateKeyframe={this.handleCreateDefaultKeyframe}/>

				<span className="sequence-label">
					{this.props.sequence.name}
				</span>

				<NumberInput/>
			</ContextMenuTrigger>
		)
	}

	handleGoToPrevKeyframe() {
		this.props.onGoToKeyframe(this.prevKeyframes[this.prevKeyframes.length - 1])
	}

	handleGoToNextKeyframe() {
		this.props.onGoToKeyframe(this.nextKeyframes[0])
	}

	handleRemoveKeyframe() {
		let sequence = JSON.parse(JSON.stringify(this.props.sequence))
		sequence.keyframes.splice(this.currentTimeKeyframe.index, 1)
		this.props.onBasicSequenceChange(sequence)
	}

	handleCreateDefaultKeyframe() {
		let sequence = JSON.parse(JSON.stringify(this.props.sequence))
		let index = KeyframeHelper.indexOfTime(this.props.currentTime, sequence)
		let keyframe = KeyframeHelper.newBasicSequenceKeyframeAt(this.props.sequence, this.props.currentTime)
		sequence.keyframes.splice(index, 0, keyframe)
		this.props.onBasicSequenceChange(sequence)
	}
}
