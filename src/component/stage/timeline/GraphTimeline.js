import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import colorClasses from '../colorclasses'
import units from '../../../util/units'
import KeyframeHelper from '../KeyframeHelper'
import SelectionOverlay from './SelectionOverlay'

const PADDING_TOP = 30
const PADDING_BOTTOM = 30
const VALUE_HARD_MIN = 0
const VALUE_HARD_MAX = 100
const POINT_WIDTH = 6
const HANDLE_RADIUS = 2.5

export default class GraphTimeline extends React.Component {
	static propTypes = {
		sequences: PropTypes.array.isRequired,
		selectedKeyframes: PropTypes.array.isRequired,
		timeline: PropTypes.shape({
			paddingLeft: PropTypes.number.isRequired,
			paddingRight: PropTypes.number.isRequired,
			start: PropTypes.number.isRequired,
			end: PropTypes.number.isRequired,
			width: PropTypes.number.isRequired,
		}).isRequired,

		onSelectKeyframes: PropTypes.func.isRequired,
		onUnselectKeyframes: PropTypes.func.isRequired,
		onSingleKeyframeMouseDown: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.state = {
			minValue: 0,
			maxValue: 100,
			selection: {
				selecting: false,
				selectingKeyframes: [],
				x: 0,
				y: 0,
				clientX: 0,
				clientY: 0,
				width: 0,
				height: 0,
			},
		}


		this.handleMouseDown = this.handleMouseDown.bind(this)
		this.handleMouseUpWindow = this.handleMouseUpWindow.bind(this)
		this.handleMouseMoveWindow = this.handleMouseMoveWindow.bind(this)
		this.handleActiveSelectionChange = this.handleActiveSelectionChange.bind(this)
	}

	render() {
		return (
			<div className="graph-timeline-container">
				<svg
					ref={container => this.container = container}
					className="graph-timeline"
					onMouseDown={this.handleMouseDown}>
					{this.renderGrid()}
					{this.renderCurves()}
				</svg>

				<SelectionOverlay
					selection={this.state.selection}/>
			</div>
		)
	}

	renderGrid() {
		let grid = []
		let {
			width,
			height,
			paddingLeft,
			paddingRight,
			start,
			end,
			duration,
		} = this.props.timeline


		// Vertical graduation
		let innerWidth = width - paddingLeft - paddingRight
		if (innerWidth < 1) {
			innerWidth = 1
		}
		let horizontalUnit = units.chooseTimeUnit(innerWidth, start, end)
		let horizontalScale = this.getHorizontalScale()
		let unitWidth = horizontalUnit.interval * horizontalScale


		for (let i = Math.floor(start / horizontalUnit.interval); i <= Math.ceil(end / horizontalUnit.interval); i++) {
			let t = i * horizontalUnit.interval
			let x = Math.round(this.timeToX(t) + 0.5) - 0.5

			// Inter-Graduation
			if (horizontalUnit.showInterIntervals) {
				grid.push(
					<line
						className="graph-grid-line"
						key={`lineVI${i}`}
						x1={x - (unitWidth / 2)}
						y1={0}
						x2={x - (unitWidth / 2)}
						y2={height}
					/>
				)
			}

			// Graduation
			grid.push(
				<line
					className="graph-grid-line"
					key={`lineV${i}`}
					x1={x}
					y1={0}
					x2={x}
					y2={height}
				/>
			)
		}

		// Out of stage time markers
		let x = paddingLeft + (0 - start) * horizontalScale

		if (x > 0) {
			grid.push(
				<rect
					className="graph-out-time"
					key="out-time-before"
					x={0}
					y={0}
					width={x}
					height={height}
				/>)
		}

		x = paddingLeft + (duration - start) * horizontalScale

		if (x < width + paddingRight) {
			grid.push(
				<rect
					className="graph-out-time"
					key="out-time-after"
					x={x}
					y={0}
					width={width - x + 32}
					height={height}
				/>)
		}


		// Horizontal graduation
		let innerHeight = height - PADDING_TOP - PADDING_BOTTOM
		let {
			minValue,
			maxValue
		} = this.state
		let verticalUnit = units.choosePercentUnit(innerHeight, minValue, maxValue)
		let verticalScale = this.getVerticalScale()

		for (let i = Math.floor(minValue / verticalUnit.interval); i <= Math.ceil(maxValue / verticalUnit.interval); i++) {
			let value = i * verticalUnit.interval
			let y = Math.round(this.valueToY(value) + 0.5) - 0.5

			// Graduation
			grid.push(
				<line
					className="graph-grid-line"
					key={`lineH${i}`}
					x1={0}
					y1={y}
					x2={width}
					y2={y}
				/>
			)


			// Percent text
			grid.push(
				<text
					className="graph-grid-text"
					key={`text${i}`}
					x={20}
					y={y - 5}
				>{verticalUnit.format(value)}</text>)
		}

		// Hard min
		let y = this.valueToY(VALUE_HARD_MIN)
		grid.push(
			<line
				className="graph-hard-bound-line"
				key="lineMin"
				x1={0}
				y1={y}
				x2={width}
				y2={y}
			/>
		)

		// Hard max
		y = this.valueToY(VALUE_HARD_MAX)
		grid.push(
			<line
				className="graph-hard-bound-line"
				key="lineMax"
				x1={0}
				y1={y}
				x2={width}
				y2={y}
			/>
		)

		return grid
	}

	renderCurves() {
		let curves = []
		for (let driverSequence of this.props.sequences) {
			for (let basicSequence of driverSequence.sequences) {
				if (basicSequence.showGraph) {
					curves.push(this.renderBasicSequenceCurve(basicSequence, driverSequence))
				}
			}
		}
		return curves
	}

	renderBasicSequenceCurve(sequence, driverSequence) {
		let selectedKeyframes = KeyframeHelper.mergeSelectedKeyframes(this.props.selectedKeyframes, this.state.selection.selectingKeyframes)
		let elements = []
		let keyframes = sequence.keyframes

		if (keyframes.length === 0 || keyframes.length === 1) {
			let value
			if (keyframes.length === 0) {
				value = sequence.defaultValue
			} else {
				value = keyframes[0].p.v
			}
			let y = this.valueToY(value)
			let startX = this.timeToX(sequence.start)
			let endX = this.timeToX(sequence.start + sequence.duration)

			elements.push(
				<line
					className="default-value-graph"
					key="defaultValue"
					x1={startX}
					y1={y}
					x2={endX}
					y2={y}
				/>
			)
		} else {
			// Default value before and after path
			if (keyframes[0].p.t > sequence.start) {
				let y = this.valueToY(keyframes[0].p.v)
				let startX = this.timeToX(sequence.start)
				let endX = this.timeToX(keyframes[0].p.t)
				elements.push(
					<line
						className="default-value-graph"
						key="defaultValueStart"
						x1={startX}
						y1={y}
						x2={endX}
						y2={y}/>
				)
			}
			if (keyframes[keyframes.length - 1].p.t < sequence.start + sequence.duration) {
				let y = this.valueToY(keyframes[keyframes.length - 1].p.v)
				let startX = this.timeToX(keyframes[keyframes.length - 1].p.t)
				let endX = this.timeToX(sequence.start + sequence.duration)
				elements.push(
					<line
						className="default-value-graph"
						key="defaultValueEnd"
						x1={startX}
						y1={y}
						x2={endX}
						y2={y}/>
				)
			}

			// Path
			let path = `M${this.timeToX(keyframes[0].p.t)} ${this.valueToY(keyframes[0].p.v)} `
			for (let i = 0; i < keyframes.length - 1; i++) {
				let keyframe1 = keyframes[i]
				let keyframe2 = keyframes[i + 1]
				let
					c1t = this.timeToX(keyframe1.c2.t),
					c1v = this.valueToY(keyframe1.c2.v),
					c2t = this.timeToX(keyframe2.c1.t),
					c2v = this.valueToY(keyframe2.c1.v),
					p2t = this.timeToX(keyframe2.p.t),
					p2v = this.valueToY(keyframe2.p.v)

				path += `C ${c1t} ${c1v}, ${c2t} ${c2v}, ${p2t} ${p2v} `
			}

			elements.push(
				<path
					className="value-graph"
					key={"bezierCurves"}
					d={path}/>
			)

			// Points and Handles
			for (let i = 0; i < keyframes.length; i++) {
				let selected = KeyframeHelper.containsKeyframe(selectedKeyframes, {
					sequenceID: sequence.id,
					index: i,
				})
				let showC1 = i > 0 && (selected || KeyframeHelper.containsKeyframe(this.props.selectedKeyframes, {
					sequenceID: sequence.id,
					index: i - 1,
				}))
				let showC2 = i < keyframes.length - 1 && (selected || KeyframeHelper.containsKeyframe(this.props.selectedKeyframes, {
					sequenceID: sequence.id,
					index: i + 1,
				}))
				let {
					p,
					c1,
					c2,
				} = keyframes[i]
				let
					px = this.timeToX(p.t),
					py = this.valueToY(p.v)

				if (showC1 && (c1.t !== p.t || c1.v !== p.v)) {
					let
						c1x = this.timeToX(c1.t),
						c1y = this.valueToY(c1.v)

					elements.push(
						<line
							key={`handleLineC1:${i}`}
							className="control-handle-line"
							x1={px}
							y1={py}
							x2={c1x}
							y2={c1y}/>
					)

					elements.push(
						<circle
							key={`handleCircleC1:${i}`}
							className="control-handle-circle"
							cx={c1x}
							cy={c1y}
							r={HANDLE_RADIUS}/>
					)
				}
				if (showC2 && (c2.t !== p.t || c2.v !== p.v)) {
					let
						c2x = this.timeToX(c2.t),
						c2y = this.valueToY(c2.v)

					elements.push(
						<line
							key={`handleLineC2:${i}`}
							className="control-handle-line"
							x1={px}
							y1={py}
							x2={c2x}
							y2={c2y}/>
					)

					elements.push(
						<circle
							key={`handleCircleC2:${i}`}
							className="control-handle-circle"
							cx={c2x}
							cy={c2y}
							r={HANDLE_RADIUS}/>
					)
				}


				elements.push(
					<rect
						key={`point${i}`}
						className={classNames("graph-point", {
							"selected": selected,
						})}
						x={px - POINT_WIDTH / 2}
						y={py - POINT_WIDTH / 2}
						width={POINT_WIDTH}
						height={POINT_WIDTH}/>
				)
			}
		}

		return (
			<g
				className={classNames("graph-basic-sequence", colorClasses[driverSequence.color])}
				key={`basicSequence:${sequence.id}`}>

				{elements}

			</g>
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
		let selectingKeyframes = []
		let container = this.container.getBoundingClientRect()
		for (let driverSequence of this.props.sequences) {
			for (let sequence of driverSequence.sequences) {
				if (!sequence.showGraph) {
					continue
				}
				for (let i = 0; i < sequence.keyframes.length; i++) {
					let keyframe = sequence.keyframes[i]
					let x = container.x + this.timeToX(keyframe.p.t)
					let y = container.y + this.valueToY(keyframe.p.v)
					if (x + POINT_WIDTH / 2 >= selectionRect.x && x - POINT_WIDTH / 2 <= selectionRect.x + selectionRect.width &&
						y + POINT_WIDTH / 2 >= selectionRect.y && y - POINT_WIDTH / 2 <= selectionRect.y + selectionRect.height) {
						selectingKeyframes.push({
							sequenceID: sequence.id,
							index: i,
						})
					}
				}
			}
		}
		return selectingKeyframes
	}

	valueToY(value) {
		return this.props.timeline.height - PADDING_BOTTOM - (value - this.state.minValue) * this.getVerticalScale()
	}

	timeToX(t) {
		return this.props.timeline.paddingLeft + (t - this.props.timeline.start) * this.getHorizontalScale()
	}
	getVerticalScale() {
		return (this.props.timeline.height - PADDING_TOP - PADDING_BOTTOM) / (this.state.maxValue - this.state.minValue)
	}

	getHorizontalScale() {
		return this.props.timeline.getScale()
	}
}
