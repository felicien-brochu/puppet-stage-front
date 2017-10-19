import React from 'react'
import PropTypes from 'prop-types'
import HorizontalScrollBar from './HorizontalScrollBar'
import VerticalScrollBar from './VerticalScrollBar'

const DELTA_LINE_PX = 26
const DELTA_PAGE_PX = DELTA_LINE_PX * 10
const DOM_DELTA_PIXEL = 0
const DOM_DELTA_LINE = 1
const DOM_DELTA_PAGE = 2

export default class TimeScroll extends React.Component {
	static propTypes = {
		onScrollX: PropTypes.func.isRequired,
		onScrollY: PropTypes.func.isRequired,
		onScrollScale: PropTypes.func.isRequired,
	}

	render() {
		return (
			<div
				className="time-scroll"
				onWheel={(e) => this.handleWheel(e)}
			>
				<div className="horizontal-pane">
					{this.props.children}
					<VerticalScrollBar/>
				</div>
				<HorizontalScrollBar/>
			</div>
		);
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
				this.fireScrollScale(deltaY)
			} else if (e.shiftKey) {
				this.fireScrollX(deltaY)
			} else {
				this.fireScrollY(deltaY)
			}
		}
		e.preventDefault()
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

	fireScrollScale(delta) {
		if (typeof this.props.onScrollScale === 'function') {
			this.props.onScrollScale(delta)
		}
	}
};
