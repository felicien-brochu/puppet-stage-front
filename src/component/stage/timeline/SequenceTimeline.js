import React from 'react'
import PropTypes from 'prop-types'
import TimelineDriverSequence from './TimelineDriverSequence'
import SelectionOverlay from './SelectionOverlay'

export default class SequenceTimeline extends React.Component {
	static propTypes = {
		sequences: PropTypes.array.isRequired,
		selectedKeyframes: PropTypes.array.isRequired,

		onSelectKeyframes: PropTypes.func.isRequired,
		onUnselectKeyframes: PropTypes.func.isRequired,
		onSingleKeyframeMouseDown: PropTypes.func.isRequired,
		onBasicSequenceTimeChange: PropTypes.func.isRequired,

		timeline: PropTypes.shape({
			paddingLeft: PropTypes.number.isRequired,
			paddingRight: PropTypes.number.isRequired,
			start: PropTypes.number.isRequired,
			end: PropTypes.number.isRequired,
			width: PropTypes.number.isRequired,
		}).isRequired,
	}

	constructor(props) {
		super(props)

		this.state = {
			selection: {
				selecting: false,
				selectingKeyframes: [],
				x: 0,
				y: 0,
				clientX: 0,
				clientY: 0,
				width: 0,
				height: 0,
			}
		}

		this.sequenceViews = []
		this.container = null

		this.handleMouseUpWindow = this.handleMouseUpWindow.bind(this)
		this.handleMouseDown = this.handleMouseDown.bind(this)
		this.handleMouseMoveWindow = this.handleMouseMoveWindow.bind(this)
	}

	render() {
		let driverSequences = []
		for (let i = 0; i < this.props.sequences.length; i++) {
			let driverSequence = this.props.sequences[i]
			driverSequences.push(
				<TimelineDriverSequence
					ref={sequence => this.sequenceViews[i] = sequence}
					key={driverSequence.id}
					sequence={driverSequence}
					color={i}
					timeline={this.props.timeline}
					selectedKeyframes={this.props.selectedKeyframes}
					selectingKeyframes={this.state.selection.selectingKeyframes}
					onKeyframeMouseDown={this.props.onSingleKeyframeMouseDown}
					onBasicSequenceTimeChange={this.props.onBasicSequenceTimeChange}
				/>
			)
		}

		return (
			<div
				className="sequence-list-container"
				ref={container => this.container = container}
				onMouseDown={this.handleMouseDown}>
				<SelectionOverlay selection={this.state.selection}/>
				<ul
					className="sequence-timeline"
				ref="sequenceList">
					{driverSequences}
				</ul>
			</div>
		)
	}

	handleMouseDown(e) {
		window.addEventListener('mouseup', this.handleMouseUpWindow)
		window.addEventListener('mousemove', this.handleMouseMoveWindow)

		let container = this.container.getBoundingClientRect()
		let selection = {
			...this.state.selection,
			selecting: true,
			x: e.clientX - container.x,
			y: e.clientY - container.y,
			clientX: e.clientX,
			clientY: e.clientY,
			width: 0,
			height: 0,
		}

		if (!e.shiftKey && !e.ctrlKey) {
			if (typeof this.props.onUnselectKeyframes === 'function') {
				this.props.onUnselectKeyframes()
			}
		}

		this.setState({
			selection: selection,
		})

		e.preventDefault()
	}

	handleMouseUpWindow() {
		this.dragging = false
		window.removeEventListener('mouseup', this.handleMouseUpWindow)
		window.removeEventListener('mousemove', this.handleMouseMoveWindow)

		if (typeof this.props.onSelectKeyframes === 'function') {
			this.props.onSelectKeyframes(this.state.selection.selectingKeyframes)
		}

		let selection = {
			...this.state.selection,
			selecting: false,
			selectingKeyframes: [],
			x: 0,
			y: 0,
			clientX: 0,
			clientY: 0,
			width: 0,
			height: 0,
		}
		this.setState({
			selection: selection,
		})
	}

	handleMouseMoveWindow(e) {
		if (this.state.selection.selecting) {
			this.handleActiveSelectionChange(e)
		}
	}

	handleActiveSelectionChange(e) {
		let container = this.container.getBoundingClientRect()
		let width = e.clientX - container.x - this.state.selection.x
		let height = e.clientY - container.y - this.state.selection.y

		let selection = {
			...this.state.selection,
			width: width,
			height: height,
		}

		let selectionRect = {
			x: selection.clientX,
			y: selection.clientY,
			width: selection.width,
			height: selection.height,
		}

		if (selectionRect.width < 0) {
			selectionRect.x += selectionRect.width
			selectionRect.width = -selectionRect.width
		}
		if (selectionRect.height < 0) {
			selectionRect.y += selectionRect.height
			selectionRect.height = -selectionRect.height
		}
		selection.selectingKeyframes = this.getSelectingKeyframes(selectionRect)

		this.setState({
			selection: selection
		})
	}

	getSelectingKeyframes(selectionRect) {
		let keyframes = []
		for (let i = 0; i < this.props.sequences.length; i++) {
			let sequence = this.sequenceViews[i]
			keyframes = keyframes.concat(sequence.getSelectingKeyframes(selectionRect))
		}
		return keyframes
	}
}
