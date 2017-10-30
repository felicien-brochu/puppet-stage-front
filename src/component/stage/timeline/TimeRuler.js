import React from 'react'
import PropTypes from 'prop-types'
import units from '../../../util/units'

const RULER_HEIGHT = 30

export default class TimeRuler extends React.Component {
	static propTypes = {
		onCurrentTimeChange: PropTypes.func.isRequired,
		timeline: PropTypes.shape({
			paddingLeft: PropTypes.number.isRequired,
			paddingRight: PropTypes.number.isRequired,
			start: PropTypes.number.isRequired,
			end: PropTypes.number.isRequired,
			width: PropTypes.number.isRequired,
			duration: PropTypes.number.isRequired,
		}).isRequired,
	}

	constructor(props) {
		super(props)

		this.handleMouseDown = this.handleMouseDown.bind(this)
		this.handleMouseMoveWindow = this.handleMouseMoveWindow.bind(this)
		this.handleMouseUpWindow = this.handleMouseUpWindow.bind(this)
	}

	render() {
		return (
			<div
				className="time-ruler"
				ref="container"
				onMouseDown={this.handleMouseDown}>
				<svg>
					{this.renderElements()}
				</svg>
			</div>
		)
	}

	renderElements() {
		let elements = []
		if (this.props.timeline.width) {
			let timeline = this.props.timeline
			let width = timeline.width - timeline.paddingLeft - timeline.paddingRight
			if (width < 1) {
				width = 1
			}
			let unit = units.chooseTimeUnit(width, timeline.start, timeline.end)

			let scale = timeline.getScale()
			let unitWidth = unit.interval * scale

			// Out of stage time markers
			let x = timeline.paddingLeft + (0 - timeline.start) * scale

			if (x > 0) {
				elements.push(
					<rect
						className="ruler-out-time"
						key="out-time-before"
						x={0}
						y={-1}
						width={x}
						height={RULER_HEIGHT + 1}
					/>)
			}

			x = timeline.paddingLeft + (timeline.duration - timeline.start) * scale

			if (x < timeline.width + timeline.paddingRight) {
				elements.push(
					<rect
						className="ruler-out-time"
						key="out-time-after"
						x={x}
						y={-1}
						width={timeline.width - x + 32}
						height={RULER_HEIGHT + 1}
					/>)
			}

			for (let i = Math.floor(timeline.start / unit.interval); i <= Math.ceil(timeline.end / unit.interval); i++) {
				let t = i * unit.interval
				let x = timeline.paddingLeft + (t - timeline.start) * scale

				// Inter-Graduation
				if (unit.showInterIntervals) {
					elements.push(
						<line
							className="ruler-line"
							key={`lineI${i}`}
							x1={x - (unitWidth / 2)}
							y1={RULER_HEIGHT}
							x2={x - (unitWidth / 2)}
							y2={RULER_HEIGHT - 3}
						/>
					)
				}

				// Graduation
				elements.push(
					<line
						className="ruler-line"
						key={`line${i}`}
						x1={x}
						y1={RULER_HEIGHT}
						x2={x}
						y2={RULER_HEIGHT - 5}
					/>
				)

				// Time text
				elements.push(
					<text
						className="ruler-text"
						key={`text${i}`}
						x={x - 13} y={20}
					>{unit.format(t)}</text>)
			}
		}

		return elements
	}

	handleMouseDown(e) {
		window.addEventListener('mouseup', this.handleMouseUpWindow)
		window.addEventListener('mousemove', this.handleMouseMoveWindow)
		this.dragging = true

		e.preventDefault()
		this.handleTimeMove(e)
	}

	handleMouseUpWindow() {
		this.dragging = false
		window.removeEventListener('mouseup', this.handleMouseUpWindow)
		window.removeEventListener('mousemove', this.handleMouseMoveWindow)
	}

	handleMouseMoveWindow(e) {
		if (this.dragging) {
			this.handleTimeMove(e)
		}
	}

	handleTimeMove(e) {
		let timeline = this.props.timeline
		let x = e.clientX - this.refs.container.getBoundingClientRect().x
		let t = (x - timeline.paddingLeft) / timeline.getScale() + timeline.start
		t = Math.max(t, 0)
		t = Math.min(t, timeline.duration)

		// Magnet on frame
		if (t % units.FRAME_TIME !== 0) {
			t = Math.round(Math.round(t / units.FRAME_TIME) * units.FRAME_TIME)
		}
		this.fireCurrentTimeChange(t)
	}

	fireCurrentTimeChange(time) {
		if (typeof this.props.onCurrentTimeChange === 'function') {
			this.props.onCurrentTimeChange(time)
		}
	}
}
