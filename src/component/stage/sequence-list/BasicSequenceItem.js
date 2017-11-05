import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {
	ContextMenuTrigger
} from 'react-contextmenu'
import KeyframeHelper from '../KeyframeHelper'
import NumberInput from '../../base/NumberInput'
import ToggleButton from './ToggleButton'
import KeyframeNavigator from './KeyframeNavigator'


export default class BasicSequenceItem extends React.Component {

	static propTypes = {
		sequence: PropTypes.object.isRequired,
		currentTime: PropTypes.number.isRequired,
		selected: PropTypes.bool.isRequired,

		onGoToKeyframe: PropTypes.func.isRequired,
		onBasicSequenceChange: PropTypes.func.isRequired,
		onBasicSequenceMove: PropTypes.func.isRequired,
		onSelect: PropTypes.func.isRequired,
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
		this.handleValueChange = this.handleValueChange.bind(this)
		this.handleValueConfirmed = this.handleValueConfirmed.bind(this)
		this.handlePreviewEnabledChange = this.handlePreviewEnabledChange.bind(this)
		this.handlePlayEnabledChange = this.handlePlayEnabledChange.bind(this)
		this.handleShowGraphChange = this.handleShowGraphChange.bind(this)
		this.handleDragStart = this.handleDragStart.bind(this)
		this.handleDragExit = this.handleDragExit.bind(this)
		this.handleDragOver = this.handleDragOver.bind(this)
		this.handleDrop = this.handleDrop.bind(this)
		this.handleClick = this.handleClick.bind(this)

		this.state = {
			dragOver: 'none',
		}
	}

	componentWillReceiveProps(nextProps) {
		this.currentTimeKeyframe = KeyframeHelper.getCurrentTimeKeyframe(nextProps.currentTime, nextProps.sequence)
		this.prevKeyframes = KeyframeHelper.getPrevKeyframes(nextProps.currentTime, nextProps.sequence)
		this.nextKeyframes = KeyframeHelper.getNextKeyframes(nextProps.currentTime, nextProps.sequence)
	}

	render() {
		let currentValue = KeyframeHelper.getBasicSequenceValueAt(this.props.sequence, this.props.currentTime)

		return (
			<ContextMenuTrigger
				attributes={{
					className: classNames("basic-sequence-list-item", {
							'selected': this.props.selected,
							'drag-over-top': this.state.dragOver === 'top',
							'drag-over-bottom': this.state.dragOver === 'bottom',
					}),
					draggable: true,
					onDragStart: this.handleDragStart,
					onDragExit: this.handleDragExit,
					onDragOver: this.handleDragOver,
					onDrop: this.handleDrop,
					onClick: this.handleClick,
				}}
				id="basic-sequence-context-menu"
				collect={() => {
					return {
						sequence: this.props.sequence
					}
				}}
				ref={container => this.container = container}
				renderTag="li"
				holdToDisplay={1e9}
			>

				<ToggleButton
					shape="#eye-shape"
					checked={this.props.sequence.previewEnabled}
					onChange={this.handlePreviewEnabledChange}/>

				<ToggleButton
					shape="#point-shape"
					checked={this.props.sequence.playEnabled}
					onChange={this.handlePlayEnabledChange}/>

				<ToggleButton
					shape="#graph-shape"
					checked={this.props.sequence.showGraph}
					onChange={this.handleShowGraphChange}/>


				<span className="sequence-label">
					{this.props.sequence.name}
				</span>


				<NumberInput
					defaultValue={currentValue}
					min={0}
					max={100}
					scale={50}
					percentFormat={true}
					onChange={this.handleValueChange}
					onValueConfirmed={this.handleValueConfirmed}/>

				<KeyframeNavigator
					currentTimeKeyframe={this.currentTimeKeyframe}
					prevKeyframes={this.prevKeyframes}
					nextKeyframes={this.nextKeyframes}

					onGoToPrevKeyframe={this.handleGoToPrevKeyframe}
					onGoToNextKeyframe={this.handleGoToNextKeyframe}
					onRemoveKeyframe={this.handleRemoveKeyframe}
					onCreateKeyframe={this.handleCreateDefaultKeyframe}/>
			</ContextMenuTrigger>
		)
	}

	handlePreviewEnabledChange(enabled) {
		let sequence = JSON.parse(JSON.stringify(this.props.sequence))
		sequence.previewEnabled = enabled
		this.props.onBasicSequenceChange(sequence)
	}

	handlePlayEnabledChange(enabled) {
		let sequence = JSON.parse(JSON.stringify(this.props.sequence))
		sequence.playEnabled = enabled
		this.props.onBasicSequenceChange(sequence)
	}

	handleShowGraphChange(show) {
		let sequence = JSON.parse(JSON.stringify(this.props.sequence))
		sequence.showGraph = show
		this.props.onBasicSequenceChange(sequence)
	}

	handleValueChange(value) {
		this.createOrUpdateCurrentKeyframe(value, false)
	}

	handleValueConfirmed(value) {
		this.createOrUpdateCurrentKeyframe(value, true)
	}

	createOrUpdateCurrentKeyframe(value, save) {
		let sequence = JSON.parse(JSON.stringify(this.props.sequence))
		let keyframe
		let isNew = false

		if (!this.currentTimeKeyframe) {
			keyframe = KeyframeHelper.newBasicSequenceKeyframeAt(sequence, this.props.currentTime)
			let keyframeIndex = KeyframeHelper.indexOfTime(this.props.currentTime, sequence)
			sequence.keyframes.splice(keyframeIndex, 0, keyframe)
			isNew = true
		} else {
			keyframe = sequence.keyframes[this.currentTimeKeyframe.index]
		}

		let deltaV = value - keyframe.p.v
		keyframe.p.v += deltaV
		keyframe.c1.v += deltaV
		keyframe.c2.v += deltaV

		this.props.onBasicSequenceChange(sequence, save || isNew)
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
		this.props.onBasicSequenceChange(sequence, true)
	}

	handleCreateDefaultKeyframe() {
		let sequence = JSON.parse(JSON.stringify(this.props.sequence))
		let index = KeyframeHelper.indexOfTime(this.props.currentTime, sequence)
		let keyframe = KeyframeHelper.newBasicSequenceKeyframeAt(this.props.sequence, this.props.currentTime)
		sequence.keyframes.splice(index, 0, keyframe)
		this.props.onBasicSequenceChange(sequence, true)
	}

	handleClick(e) {
		this.props.onSelect(this.props.sequence.id, e.ctrlKey || e.shiftKey)
		e.stopPropagation()
	}


	handleDragStart(e) {
		e.dataTransfer.setData("application/json", JSON.stringify({
			type: 'basicSequence',
			sequenceID: this.props.sequence.id,
		}))
		e.dataTransfer.dropEffect = 'move'
	}

	handleDragExit(e) {
		this.setState({
			dragOver: 'none',
		})
	}

	handleDragOver(e) {
		let data = JSON.parse(e.dataTransfer.getData("application/json"))
		if (data.type === 'basicSequence' && data.sequenceID !== this.props.sequence.id) {
			e.preventDefault()
			e.dataTransfer.dropEffect = 'move'

			let container = this.container.elem.getBoundingClientRect()
			if (e.clientY < container.y + (container.height / 2)) {
				if (this.state.dragOver !== 'top') {
					this.setState({
						dragOver: 'top',
					})
				}
			} else {
				if (this.state.dragOver !== 'bottom') {
					this.setState({
						dragOver: 'bottom',
					})
				}
			}
		}
	}

	handleDrop(e) {
		let data = JSON.parse(e.dataTransfer.getData("application/json"))

		if (data.type === 'basicSequence' && data.sequenceID !== this.props.sequence.id) {
			let relativeIndex
			let container = this.container.elem.getBoundingClientRect()
			if (e.clientY < container.y + (container.height / 2)) {
				relativeIndex = 0
			} else {
				relativeIndex = 1
			}

			this.props.onBasicSequenceMove(data.sequenceID, this.props.sequence.id, relativeIndex)
		}
		this.setState({
			dragOver: 'none',
		})
	}
}
