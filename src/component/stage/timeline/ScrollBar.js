import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const NUB_MIN_SIZE = 2
const SMOOTHING_DELAY = 20

export default class ScrollBar extends React.Component {
	static propTypes = {
		orientation: PropTypes.oneOf(['horizontal', 'vertical']).isRequired,
		contentSize: PropTypes.number.isRequired,
		contentMin: PropTypes.number.isRequired,
		contentMax: PropTypes.number.isRequired,
		contentStart: PropTypes.number.isRequired,
		contentEnd: PropTypes.number.isRequired,

		onScroll: PropTypes.func,
	}

	constructor(props) {
		super(props)

		this.handleBackgroundClick = this.handleBackgroundClick.bind(this)
		this.handleNubClick = this.handleNubClick.bind(this)
		this.handleMouseDown = this.handleMouseDown.bind(this)
		this.handleMouseMove = this.handleMouseMove.bind(this)
		this.handleMouseUpWindow = this.handleMouseUpWindow.bind(this)

		this.scheduler = {
			timeoutID: NaN,
			lastModification: 0,
			scroll: 0,
		}
	}

	render() {
		let {
			contentSize,
			contentMin,
			contentStart,
			contentEnd,
			orientation,
		} = this.props

		let viewSize = contentEnd - contentStart
		let disabled = false
		if (viewSize >= contentSize) {
			disabled = true
		}

		let nubSize = 100
		let nubOffset = 0
		if (contentSize > 0) {
			nubSize = Math.max(viewSize / contentSize * 100, NUB_MIN_SIZE)
			nubSize = Math.min(nubSize, 100)
			nubOffset = (contentStart - contentMin) / contentSize * 100
		}
		nubSize = `${nubSize}%`
		nubOffset = `${nubOffset}%`

		let nubStyle = {}
		if (orientation === 'horizontal') {
			nubStyle = {
				width: nubSize,
				left: nubOffset,
			}
		} else if (orientation === 'vertical') {
			nubStyle = {
				height: nubSize,
				top: nubOffset,
			}
		}

		return (
			<div
				ref="container"
				className={classNames('scroll-bar', {
					horizontal: orientation === 'horizontal',
					vertical: orientation === 'vertical',
				})}
				onClick={this.handleBackgroundClick}
				disabled={disabled}
			>
				<div
					ref="nub"
					className="scroll-bar-nub"
					style={nubStyle}
					onClick={this.handleNubClick}
					onMouseDown={this.handleMouseDown}
					draggable={false}
				/>
			</div>
		)
	}

	handleBackgroundClick(e) {
		let {
			contentMin,
			contentMax,
			contentStart,
			contentEnd,
			orientation,
		} = this.props
		let nubRect = this.refs.nub.getBoundingClientRect()
		let scroll = 0
		let viewSize = contentEnd - contentStart

		let nubStart = 0
		let clickPosition = 0
		let nubSize = 0

		if (orientation === 'horizontal') {
			nubStart = nubRect.x
			clickPosition = e.clientX
			nubSize = nubRect.width
		} else if (orientation === 'vertical') {
			nubStart = nubRect.y
			clickPosition = e.clientY
			nubSize = nubRect.height
		}

		if (clickPosition < nubStart) {
			scroll = contentStart - viewSize
		} else if (clickPosition > nubStart + nubSize) {
			scroll = contentStart + viewSize
		}

		scroll = Math.max(scroll, contentMin)
		scroll = Math.min(scroll, contentMax - viewSize)

		this.fireScroll(scroll)
	}

	handleNubClick(e) {
		e.stopPropagation()
	}

	handleMouseDown(e) {
		this.dragging = true
		this.dragOffset = this.getDragOffset(e)
		window.addEventListener('mouseup', this.handleMouseUpWindow)
		window.addEventListener('mousemove', this.handleMouseMove)
	}

	handleMouseUpWindow() {
		this.dragging = false
		this.dragOffset = 0
		window.removeEventListener('mouseup', this.handleMouseUpWindow)
		window.removeEventListener('mousemove', this.handleMouseMove)
	}

	handleMouseMove(e) {
		if (this.dragging) {
			let rate = this.getDraggingRate(e)
			let scheduler = this.scheduler
			scheduler.scroll = rate * this.props.contentSize + this.props.contentMin

			if (isNaN(scheduler.timeoutID)) {
				let now = new Date().getTime()
				let delay = Math.max(SMOOTHING_DELAY - now + scheduler.lastModification, 0)
				scheduler.timeoutID = window.setTimeout(this.fireScrollAsync.bind(this), delay)
			}
		}
	}

	fireScrollAsync() {
		let scheduler = this.scheduler
		this.fireScroll(scheduler.scroll)
		scheduler.timeoutID = NaN
		scheduler.lastModification = new Date().getTime()
	}

	fireScroll(scroll) {
		if (typeof this.props.onScroll === 'function') {
			this.props.onScroll(scroll)
		}
	}

	getDragOffset(e) {
		let dragOffset = 0
		if (this.props.orientation === 'horizontal') {
			dragOffset = e.clientX - this.refs.nub.getBoundingClientRect().x
		} else if (this.props.orientation === 'vertical') {
			dragOffset = e.clientY - this.refs.nub.getBoundingClientRect().y
		}

		return dragOffset
	}

	getDraggingRate(e) {
		let offset = 0
		if (this.props.orientation === 'horizontal') {
			offset = e.clientX - this.refs.container.getBoundingClientRect().x
		} else if (this.props.orientation === 'vertical') {
			offset = e.clientY - this.refs.container.getBoundingClientRect().y
		}

		let containerRect = this.refs.container.getBoundingClientRect()
		let size = 0
		if (this.props.orientation === 'horizontal') {
			size = containerRect.width
		} else if (this.props.orientation === 'vertical') {
			size = containerRect.height
		}

		let start = offset - this.dragOffset
		let rate = start / size

		let viewRate = Math.min((this.props.contentEnd - this.props.contentStart) / this.props.contentSize, 1)
		if (rate + viewRate > 1) {
			rate = 1 - viewRate
		}
		rate = Math.max(rate, 0)

		return rate
	}
}
