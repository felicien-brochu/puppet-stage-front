import React from 'react'
import PropTypes from 'prop-types'
import units from '../../../util/units'

const MIN_PX_BY_INTERVAL = 60
const MIN_PX_BY_INTER_INTERVAL = 40
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
			let unit = this.computeTimeUnit()
			let width = timeline.width - timeline.paddingLeft - timeline.paddingRight
			if (width < 1) {
				width = 1
			}

			let scale = width / (timeline.end - timeline.start)
			let unitWidth = unit.interval * scale

			// Out of stage time markers
			let x = timeline.paddingLeft + (0 - timeline.start) * scale

			if (x > 0) {
				elements.push(
					<rect
						className="ruler-out-time"
						key={'out-time-before'}
						x={0}
						y={-1}
						width={x}
						height={RULER_HEIGHT + 1}
					/>)
			}

			x = timeline.paddingLeft + (timeline.duration - timeline.start) * scale

			if (x < timeline.width) {
				elements.push(
					<rect
						className="ruler-out-time"
						key={'out-time-after'}
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
				if (unitWidth >= MIN_PX_BY_INTER_INTERVAL * 2) {
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

	computeTimeUnit() {

		let intFormatter = new Intl.NumberFormat('fr-FR', {
			minimumIntegerDigits: 2,
		})

		function frameFormat(t) {
			let s = Math.floor(t / 1e9)
			let f = (t - s * 1e9) / units.FRAME_TIME
			return `${intFormatter.format(s)}:${intFormatter.format(f)}f`
		}

		function secondFormat(t) {
			let m = Math.floor(t / 60e9)
			let s = Math.floor((t - m * 60e9) / 1e9)
			return `${intFormatter.format(m)}:${intFormatter.format(s)}s`
		}
		let intervals = [{
			interval: units.FRAME_TIME, // 1 frame at 60 fps
			format: frameFormat,
		}, {
			interval: 2 * units.FRAME_TIME,
			format: frameFormat,
		}, {
			interval: 5 * units.FRAME_TIME,
			format: frameFormat,
		}, {
			interval: 10 * units.FRAME_TIME,
			format: frameFormat,
		}, {
			interval: 15 * units.FRAME_TIME,
			format: frameFormat,
		}, {
			interval: 20 * units.FRAME_TIME,
			format: frameFormat,
		}, {
			interval: 30 * units.FRAME_TIME,
			format: frameFormat,
		}, {
			interval: 1e9,
			format: frameFormat,
		}, {
			interval: 2e9,
			format: frameFormat,
		}, {
			interval: 5e9,
			format: secondFormat,
		}, {
			interval: 10e9,
			format: secondFormat,
		}, {
			interval: 20e9,
			format: secondFormat,
		}, {
			interval: 30e9,
			format: secondFormat,
		}, {
			interval: 60e9,
			format: secondFormat,
		}, {
			interval: 120e9,
			format: secondFormat,
		}, {
			interval: 300e9,
			format: secondFormat,
		}, {
			interval: 600e9,
			format: secondFormat,
		}, {
			interval: 1200e9,
			format: secondFormat,
		}, {
			interval: 1800e9,
			format: secondFormat,
		}, {
			interval: 3600e9,
			format: secondFormat,
		}, ]

		let unit = intervals[intervals.length - 1]
		let {
			width,
			start,
			end,
			paddingLeft,
			paddingRight
		} = this.props.timeline
		let innerWidth = width - paddingLeft - paddingRight
		for (let u of intervals) {
			let unitWidth = innerWidth / ((end - start) / u.interval)
			if (unitWidth >= MIN_PX_BY_INTERVAL) {
				unit = u
				break
			}
		}
		return unit
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
			t = Math.round(t / units.FRAME_TIME) * units.FRAME_TIME
		}
		this.fireCurrentTimeChange(t)
	}

	fireCurrentTimeChange(time) {
		if (typeof this.props.onCurrentTimeChange === 'function') {
			this.props.onCurrentTimeChange(time)
		}
	}
}
