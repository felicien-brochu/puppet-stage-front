import React from 'react'
import PropTypes from 'prop-types'

const NUB_MIN_SIZE = 2

export default class HorizontalScrollBar extends React.Component {
	static propTypes = {
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

		let nubWidth = viewSize / this.props.contentSize * 100
		if (nubWidth < NUB_MIN_SIZE) {
			nubWidth = NUB_MIN_SIZE
		}
		nubWidth = `${nubWidth}%`
		let nubMargin = `${this.props.viewStart / this.props.contentSize * 100}%`

		return (
			<div
				ref="container"
				className="horizontal-scroll-bar"
				onClick={this.handleBackgroundClick}
				disabled={disabled}
			>
				<div
					ref="nub"
					className="horizontal-nub"
					style={{
						width: nubWidth,
						marginLeft: nubMargin,
					}}
					onClick={this.handleNubClick}
					onMouseDown={this.handleMouseDown}
					draggable={false}
				/>
			</div>
		);
	}

	handleBackgroundClick(e) {
		let nubRect = this.refs.nub.getBoundingClientRect()
		let scroll = 0
		let viewSize = this.props.viewEnd - this.props.viewStart

		if (e.clientX < nubRect.x) {
			scroll = this.props.viewStart - viewSize
		} else if (e.clientX > nubRect.x + nubRect.width) {
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
		this.dragOffset = e.clientX - this.refs.nub.getBoundingClientRect().x
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
			let containerRect = this.refs.container.getBoundingClientRect()
			let x = e.clientX - containerRect.x
			let startX = x - this.dragOffset
			if (startX < 0) {
				startX = 0
			}

			let rate = startX / containerRect.width
			this.fireScroll(rate * this.props.contentSize)
		}
	}

	fireScroll(scroll) {
		if (typeof this.props.onScroll === 'function') {
			this.props.onScroll(scroll)
		}
	}
};
