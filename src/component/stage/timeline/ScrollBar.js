import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const NUB_MIN_SIZE = 2

export default class ScrollBar extends React.Component {
	static propTypes = {
		orientation: PropTypes.oneOf(['horizontal', 'vertical']).isRequired,
		contentSize: PropTypes.number.isRequired,
		viewStart: PropTypes.number.isRequired,
		viewEnd: PropTypes.number.isRequired,
		onScroll: PropTypes.func,
	}

	constructor(props) {
		super(props)

		this.handleBackgroundClick = this.handleBackgroundClick.bind(this)
		this.handleNubClick = this.handleNubClick.bind(this)
		this.handleMouseDown = this.handleMouseDown.bind(this)
		this.handleMouseMove = this.handleMouseMove.bind(this)
		this.handleMouseUpWindow = this.handleMouseUpWindow.bind(this)
	}

	render() {
		let viewSize = this.props.viewEnd - this.props.viewStart
		let disabled = false
		if (viewSize >= this.props.contentSize) {
			disabled = true
		}

		let nubSize = 100
		let nubOffset = 0
		if (this.props.contentSize > 0) {
			nubSize = Math.max(viewSize / this.props.contentSize * 100, NUB_MIN_SIZE)
			nubSize = Math.min(nubSize, 100)
			nubOffset = this.props.viewStart / this.props.contentSize * 100
		}
		nubSize = `${nubSize}%`
		nubOffset = `${nubOffset}%`

		let nubStyle = {}
		if (this.props.orientation === 'horizontal') {
			nubStyle = {
				width: nubSize,
				left: nubOffset,
			}
		} else if (this.props.orientation === 'vertical') {
			nubStyle = {
				height: nubSize,
				top: nubOffset,
			}
		}

		return (
			<div
				ref="container"
				className={classNames('scroll-bar', {
					horizontal: this.props.orientation === 'horizontal',
					vertical: this.props.orientation === 'vertical',
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
		let nubRect = this.refs.nub.getBoundingClientRect()
		let scroll = 0
		let viewSize = this.props.viewEnd - this.props.viewStart

		let nubStart = 0
		let clickPosition = 0
		let nubSize = 0

		if (this.props.orientation === 'horizontal') {
			nubStart = nubRect.x
			clickPosition = e.clientX
			nubSize = nubRect.width
		} else if (this.props.orientation === 'vertical') {
			nubStart = nubRect.y
			clickPosition = e.clientY
			nubSize = nubRect.height
		}

		if (clickPosition < nubStart) {
			scroll = this.props.viewStart - viewSize
		} else if (clickPosition > nubStart + nubSize) {
			scroll = this.props.viewStart + viewSize
		}

		if (scroll !== 0) {
			this.fireScroll(scroll)
		}
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
			this.fireScroll(rate * this.props.contentSize)
		}
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

		let viewRate = Math.min((this.props.viewEnd - this.props.viewStart) / this.props.contentSize, 1)
		if (rate + viewRate > 1) {
			rate = 1 - viewRate
		}
		rate = Math.max(rate, 0)

		return rate
	}
}
