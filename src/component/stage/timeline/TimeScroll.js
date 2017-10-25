import React from 'react'
import PropTypes from 'prop-types'
import ReactResizeDetector from 'react-resize-detector'
import ScrollBar from './ScrollBar'

const DELTA_LINE_PX = 26
const DELTA_PAGE_PX = DELTA_LINE_PX * 10
const DOM_DELTA_PIXEL = 0
const DOM_DELTA_LINE = 1
const DOM_DELTA_PAGE = 2
const SCROLL_BAR_WIDTH = 16

export default class TimeScroll extends React.Component {
	static propTypes = {
		onScrollX: PropTypes.func.isRequired,
		onScrollY: PropTypes.func.isRequired,
		onScrollScale: PropTypes.func.isRequired,
		onScrollToT: PropTypes.func.isRequired,
		onResize: PropTypes.func.isRequired,

		scrollY: PropTypes.number.isRequired,
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

		this.handleScrollToT = this.handleScrollToT.bind(this)
		this.handleScrollToY = this.handleScrollToY.bind(this)
		this.handleResize = this.handleResize.bind(this)
	}

	render() {
		return (
			<div
				className="time-scroll"
				onWheel={this.handleWheel}
			>
				<div
					className="children-container"
					ref="childrenContainer"
					style={{
						top: -this.props.scrollY,
					}}
				>
					{this.props.children}
				</div>
				<div className="horizontal-pane">
					<ScrollBar
						orientation="vertical"
						contentSize={this.refs.childrenContainer ? this.refs.childrenContainer.getBoundingClientRect().height : 0}
						viewStart={this.props.scrollY}
						viewEnd={this.props.timeline.height + this.props.scrollY}
						onScroll={this.handleScrollToY}
					/>
					<ReactResizeDetector handleWidth handleHeight onResize={this.handleResize}/>
				</div>
				<ScrollBar
					orientation="horizontal"
					contentSize={this.props.timeline.duration}
					viewStart={this.props.timeline.start}
					viewEnd={this.props.timeline.end}
					onScroll={this.handleScrollToT}
				/>
			</div>
		)
	}

	getScale() {
		let {
			paddingLeft,
			paddingRight,
			start,
			end,
			width
		} = this.props.timeline
		return (width - paddingLeft - paddingRight) / (end - start)
	}

	handleScrollToT(scrollTime) {
		this.fireScrollToT(scrollTime)
	}

	handleScrollToY(scrollY) {
		this.fireScrollY(scrollY - this.props.scrollY)
	}

	handleWheel(e) {
		let deltaX = e.deltaX
		let deltaY = e.deltaY

		if (e.deltaMode === DOM_DELTA_LINE) {
			deltaX *= DELTA_LINE_PX
			deltaY *= DELTA_LINE_PX
		} else if (e.deltaMode === DOM_DELTA_PAGE) {
			deltaX *= DELTA_PAGE_PX
			deltaY *= DELTA_PAGE_PX
		}

		if (deltaX !== 0) {
			this.fireScrollX(deltaX)
		}

		if (deltaY !== 0) {
			if (e.altKey || e.ctrlKey) {
				let scale = deltaY < 0 ? -1 : 1
				let rect = this.refs.childrenContainer.getBoundingClientRect()
				this.fireScrollScale(scale, {
					x: e.clientX - rect.x,
					y: e.clientY - rect.y,
				})
			} else if (e.shiftKey) {
				this.fireScrollX(deltaY)
			} else {
				let viewHeight = this.props.timeline.height
				let contentHeight = this.refs.childrenContainer.getBoundingClientRect().height

				if (contentHeight > viewHeight) {
					let scrollY = Math.min(this.props.scrollY + deltaY, contentHeight - viewHeight)
					scrollY = Math.max(scrollY, 0)
					deltaY = scrollY - this.props.scrollY
					this.fireScrollY(deltaY)
				} else {
					deltaY = -this.props.scrollY
					this.fireScrollY(deltaY)
				}
			}
		}

		e.preventDefault()
	}

	fireScrollToT(x) {
		if (typeof this.props.onScrollToT === 'function') {
			this.props.onScrollToT(x)
		}
	}

	fireScrollX(delta) {
		if (typeof this.props.onScrollX === 'function') {
			this.props.onScrollX(delta)
		}
	}

	fireScrollY(delta) {
		if (typeof this.props.onScrollY === 'function') {
			this.props.onScrollY(delta)
		}
	}

	fireScrollScale(delta, from) {
		if (typeof this.props.onScrollScale === 'function') {
			this.props.onScrollScale(delta, from)
		}
	}


	handleResize(width, height) {
		let contentHeight = this.refs.childrenContainer.getBoundingClientRect().height

		if (contentHeight - this.props.scrollY < height && this.props.scrollY > 0) {
			let scrollY = Math.max(contentHeight - height, 0)
			let deltaY = scrollY - this.props.scrollY
			this.fireScrollY(deltaY)
		}

		if (typeof this.props.onResize === 'function') {
			this.props.onResize(width - SCROLL_BAR_WIDTH, height)
		}
	}
}
