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
		stepX: PropTypes.number,
		stepY: PropTypes.number,

		contentSize: PropTypes.shape({
			startX: PropTypes.number.isRequired,
			endX: PropTypes.number.isRequired,
			width: PropTypes.number.isRequired,
			startY: PropTypes.number.isRequired,
			endY: PropTypes.number.isRequired,
			height: PropTypes.number.isRequired,
		}).isRequired,

		onScrollScaleX: PropTypes.func.isRequired,
		onScrollScaleY: PropTypes.func.isRequired,
		onScrollToX: PropTypes.func.isRequired,
		onScrollToY: PropTypes.func.isRequired,
		onResize: PropTypes.func.isRequired,
	}

	static defaultProps = {
		stepX: NaN,
		stepY: NaN,
	}

	constructor(props) {
		super(props)

		this.handleScrollToX = this.handleScrollToX.bind(this)
		this.handleScrollToY = this.handleScrollToY.bind(this)
		this.handleResize = this.handleResize.bind(this)
		this.handleWheel = this.handleWheel.bind(this)
	}

	render() {
		let contentSize = this.props.contentSize
		return (
			<div
				className="time-scroll"
				onWheel={this.handleWheel}
			>
				<div className="horizontal-pane">
					<div
						className="children-container"
						ref={childrenContainer => this.childrenContainer = childrenContainer}
					>
						{this.props.children}
					</div>
					<ScrollBar
						orientation="vertical"
						contentSize={contentSize.height}
						contentMin={contentSize.minY}
						contentMax={contentSize.maxY}
						contentStart={contentSize.startY}
						contentEnd={contentSize.endY}
						onScroll={this.handleScrollToY}
					/>
					<ReactResizeDetector handleWidth handleHeight onResize={this.handleResize}/>
				</div>
				<ScrollBar
					orientation="horizontal"
					contentSize={contentSize.width}
					contentMin={contentSize.minX}
					contentMax={contentSize.maxX}
					contentStart={contentSize.startX}
					contentEnd={contentSize.endX}
					onScroll={this.handleScrollToX}
				/>
			</div>
		)
	}

	handleScrollToX(x) {
		this.fireScrollToX(x)
	}

	handleScrollToY(y) {
		this.fireScrollToY(y)
	}

	handleWheel(e) {
		let deltaX = e.deltaX
		let deltaY = e.deltaY
		let {
			minX,
			maxX,
			startX,
			endX,
			width,
			minY,
			maxY,
			startY,
			endY,
			height,
		} = this.props.contentSize

		if (e.deltaMode === DOM_DELTA_LINE) {
			deltaX *= DELTA_LINE_PX
			deltaY *= DELTA_LINE_PX
		} else if (e.deltaMode === DOM_DELTA_PAGE) {
			deltaX *= DELTA_PAGE_PX
			deltaY *= DELTA_PAGE_PX
		}

		if (deltaX !== 0) {
			let x = startX
			if (!isNaN(this.props.stepX)) {
				x += Math.sign(deltaX) * width / this.props.stepX
			} else {
				x += deltaX
			}
			if (x > maxX - (endX - startX)) {
				x = maxX - (endX - startX)
			}
			if (x < minX) {
				x = minX
			}
			this.fireScrollToX(x)
		}

		if (deltaY !== 0) {
			if (e.altKey || e.ctrlKey) {
				let
					deltaScale = deltaY < 0 ? -1 : 1,
					rect = this.childrenContainer.getBoundingClientRect(),
					from = {
						x: e.clientX - rect.x,
						y: e.clientY - rect.y,
					}

				if (e.altKey) {
					this.fireScrollScaleX(deltaScale, from)
				} else if (e.ctrlKey) {
					this.fireScrollScaleY(deltaScale, from)
				}
			} else if (e.shiftKey) {
				let x = startX
				if (!isNaN(this.props.stepX)) {
					x += Math.sign(deltaY) * width / this.props.stepX
				} else {
					x += deltaY
				}
				if (x > maxX - (endX - startX)) {
					x = maxX - (endX - startX)
				}
				if (x < minX) {
					x = minX
				}
				this.fireScrollToX(x)
			} else {
				let y = startY
				if (!isNaN(this.props.stepY)) {
					y += Math.sign(deltaY) * height / this.props.stepY
				} else {
					y += deltaY
				}
				if (y > maxY - (endY - startY)) {
					y = maxY - (endY - startY)
				}
				if (y < minY) {
					y = minY
				}
				this.fireScrollToY(y)
			}
		}

		e.preventDefault()
	}

	fireScrollToX(x) {
		this.props.onScrollToX(x)
	}

	fireScrollToY(y) {
		this.props.onScrollToY(y)
	}

	fireScrollScaleX(delta, from) {
		this.props.onScrollScaleX(delta, from)
	}

	fireScrollScaleY(delta, from) {
		this.props.onScrollScaleY(delta, from)
	}


	handleResize(width, height) {
		if (typeof this.props.onResize === 'function') {
			this.props.onResize(width - SCROLL_BAR_WIDTH, height)
		}
	}
}
