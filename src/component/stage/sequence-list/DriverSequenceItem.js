import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {
	ContextMenuTrigger
} from 'react-contextmenu'
import colorClasses from '../colorclasses'
import BasicSequenceItem from './BasicSequenceItem'
import ExpandButton from './ExpandButton'
import ToggleButton from './ToggleButton'


export default class DriverSequenceItem extends React.Component {

	static propTypes = {
		sequence: PropTypes.object.isRequired,
		currentTime: PropTypes.number.isRequired,
		selected: PropTypes.bool.isRequired,
		selectedBasicSequences: PropTypes.array.isRequired,

		onExpand: PropTypes.func.isRequired,
		onBasicSequenceChange: PropTypes.func.isRequired,
		onBasicSequenceMove: PropTypes.func.isRequired,
		onDriverSequenceChange: PropTypes.func.isRequired,
		onDriverSequenceMove: PropTypes.func.isRequired,
		onGoToKeyframe: PropTypes.func.isRequired,
		onSelectDriverSequence: PropTypes.func.isRequired,
		onSelectBasicSequence: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.handleExpand = this.handleExpand.bind(this)
		this.handlePreviewEnabledChange = this.handlePreviewEnabledChange.bind(this)
		this.handlePlayEnabledChange = this.handlePlayEnabledChange.bind(this)
		this.handleDriverSequenceTitleClick = this.handleDriverSequenceTitleClick.bind(this)
		this.handleDragStart = this.handleDragStart.bind(this)
		this.handleDragExit = this.handleDragExit.bind(this)
		this.handleDragOver = this.handleDragOver.bind(this)
		this.handleDrop = this.handleDrop.bind(this)

		this.state = {
			dragOver: 'none',
		}
	}

	render() {
		let previewEnabled = false
		for (let basicSequence of this.props.sequence.sequences) {
			if (basicSequence.previewEnabled) {
				previewEnabled = true
				break
			}
		}

		return (
			<ContextMenuTrigger
				attributes={{
					className: classNames("driver-sequence-list-item", {
						'drag-over-top': this.state.dragOver === 'top',
						'drag-over-bottom': this.state.dragOver === 'bottom',
					}),
					onDragExit: this.handleDragExit,
					onDragOver: this.handleDragOver,
					onDrop: this.handleDrop,
				}}
				id="driver-sequence-context-menu"
				collect={() => {
					return {
						sequence: this.props.sequence
					}
				}}
				renderTag="li"
				holdToDisplay={1e9}
				ref={container => this.container = container}
			>
				<div
					className={classNames("driver-sequence-title", {
						selected: this.props.selected
					})}
					onClick={this.handleDriverSequenceTitleClick}
					draggable={true}
					onDragStart={this.handleDragStart}>

					<ToggleButton
						shape="#eye-shape"
						checked={previewEnabled}
						onChange={this.handlePreviewEnabledChange}/>

					<ToggleButton
						shape="#point-shape"
						checked={this.props.sequence.playEnabled}
						onChange={this.handlePlayEnabledChange}/>

					<ExpandButton
						expanded={this.props.sequence.expanded}
						onExpand={this.handleExpand}
						disabled={this.props.sequence.sequences.length === 0}/>

					<span className={classNames("color-tile", colorClasses[this.props.sequence.color])}/>
					<span className="sequence-label">
						{this.props.sequence.name}
					</span>
				</div>
				{this.renderBasicSequenceList()}
			</ContextMenuTrigger>
		)
	}

	renderBasicSequenceList() {
		if (this.props.sequence.expanded && this.props.sequence.sequences.length > 0) {
			return (
				<ul className="basic-sequence-list">
					{this.props.sequence.sequences.map(this.renderBasicSequenceItem.bind(this))}
				</ul>
			)
		} else {
			return null
		}
	}

	renderBasicSequenceItem(basicSequence) {
		return (
			<BasicSequenceItem
				key={basicSequence.id}
				sequence={basicSequence}
				currentTime={this.props.currentTime}
				selected={this.props.selectedBasicSequences.includes(basicSequence.id)}
				onBasicSequenceChange={(basicSequence, save) => {this.props.onBasicSequenceChange(basicSequence, this.props.sequence, save)}}
				onBasicSequenceMove={this.props.onBasicSequenceMove}
				onGoToKeyframe={this.props.onGoToKeyframe}
				onSelect={this.props.onSelectBasicSequence}/>
		)
	}

	handleExpand(expanded) {
		if (typeof this.props.onExpand === 'function') {
			this.props.onExpand(this.props.sequence, expanded)
		}
	}

	handlePreviewEnabledChange(enabled) {
		let sequence = JSON.parse(JSON.stringify(this.props.sequence))

		for (let basicSequence of sequence.sequences) {
			basicSequence.previewEnabled = enabled
		}
		this.props.onDriverSequenceChange(sequence)
	}

	handlePlayEnabledChange(enabled) {
		let sequence = JSON.parse(JSON.stringify(this.props.sequence))
		sequence.playEnabled = enabled
		this.props.onDriverSequenceChange(sequence)
	}

	handleDriverSequenceTitleClick(e) {
		this.props.onSelectDriverSequence(this.props.sequence.id, e.ctrlKey || e.shiftKey)
		e.stopPropagation()
	}

	handleDragStart(e) {
		e.dataTransfer.setData("application/json", JSON.stringify({
			type: 'driverSequence',
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
		if (data.type === 'driverSequence' && data.sequenceID !== this.props.sequence.id) {
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

		if (data.type === 'driverSequence' && data.sequenceID !== this.props.sequence.id) {
			let relativeIndex
			let container = this.container.elem.getBoundingClientRect()
			if (e.clientY < container.y + (container.height / 2)) {
				relativeIndex = 0
			} else {
				relativeIndex = 1
			}

			this.props.onDriverSequenceMove(data.sequenceID, this.props.sequence.id, relativeIndex)
		}
		this.setState({
			dragOver: 'none',
		})
	}
}
