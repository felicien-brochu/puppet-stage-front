import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

export default class NumberInput extends React.Component {

	static propTypes = {
		defaultValue: PropTypes.number.isRequired,
		min: PropTypes.number,
		max: PropTypes.number,
		scale: PropTypes.number,
		step: PropTypes.number,
		percentFormat: PropTypes.bool,

		onChange: PropTypes.func,
		onValueConfirmed: PropTypes.func,
	}

	static defaultProps = {
		defaultValue: 0,
		min: 0,
		max: 100,
		scale: 100,
		percentFormat: false,
	}

	constructor(props) {
		super(props)

		this.state = {
			value: this.formatValue(props.defaultValue),
			editing: 'none',
			isEditing: false,
		}

		this.handleChange = this.handleChange.bind(this)
		this.handleBlur = this.handleBlur.bind(this)
		this.handleKeyDown = this.handleKeyDown.bind(this)
		this.handleMouseDown = this.handleMouseDown.bind(this)
		this.handleClick = this.handleClick.bind(this)
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			value: this.formatValue(nextProps.defaultValue),
		})
	}

	render() {
		const inputClasses = classNames('number-input', {
			'editing': this.state.editing === 'text',
			'edit-dragged': this.state.editing === 'drag',
		})
		const overlayClasses = classNames('drag-overlay', {
			'edit-dragged': this.state.editing === 'drag',
			'disabled': this.state.editing === 'text',
		})

		return (
			<div className="number-input-container">
				<input
					type="text"
					className={inputClasses}
					value={this.state.value}
					onChange={this.handleChange}
					onBlur={this.handleBlur}
					onKeyDown={this.handleKeyDown}
					ref={input => this.input = input}
				/>
				<div
					className={overlayClasses}
					onMouseDown={this.handleMouseDown}
					onClick={this.handleClick}
					onDragStart={(e) => e.preventDefault()}
				/>
			</div>
		)
	}

	setControlledValue(value) {
		value = this.getControlledValue(value)
		value = this.formatValue(value)

		if (this.state.value !== value) {
			this.fireChange(value)
		}
		this.setState({
			value: value
		})

		return value
	}

	getControlledValue(value) {
		if (this.props.step !== undefined) {
			let step = this.props.step
			value /= step
			value = Math.floor(value)
			value *= step
		}
		if (this.props.max !== undefined && value > this.props.max) {
			value = this.props.max
		} else if (this.props.min !== undefined && value < this.props.min) {
			value = this.props.min
		}
		return value
	}

	formatValue(value) {
		if (this.props.percentFormat) {
			let formatter = new Intl.NumberFormat('en-US', {
				minimumFractionDigits: 1,
				maximumFractionDigits: 1,
			})
			value = formatter.format(value)
		}
		return value
	}

	handleChange(e) {
		let value = e.target.value
		if (!isNaN(value)) {
			this.setState({
				value: value,
			})
		}
	}

	handleClick(e) {
		this.startValue = parseFloat(this.state.value)
		this.setState({
			editing: 'text',
			value: `${this.state.value}`.trim(),
		})
		this.input.select()
	}

	handleMouseDown(e) {
		e.preventDefault()
		e.stopPropagation()

		let startValue = this.state.value,
			startX = e.clientX,
			startY = e.clientY,
			scaleDivisor = 1

		if (e.ctrlKey) {
			scaleDivisor = 20
		}

		let handleMouseMove = function(e) {
			this.onDragValue(startValue, e.clientX - startX, e.clientY - startY, scaleDivisor)
		}.bind(this)

		let handleMouseUp = function() {
			window.removeEventListener('mouseup', handleMouseUp)
			window.removeEventListener('mousemove', handleMouseMove)

			if (this.state.value !== startValue) {
				this.confirmValue()
			}
		}.bind(this)

		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)
	}

	onDragValue(startValue, offsetX, offsetY, scaleDivisor) {
		let scale = this.props.scale / 100 / scaleDivisor
		offsetX *= scale
		offsetY *= scale
		this.setControlledValue(Number(startValue) + offsetX - offsetY)
	}

	confirmValue() {
		let value = this.setControlledValue(this.state.value)
		this.fireValueConfirmed(value)
	}

	exitEditing() {
		this.setState({
			editing: 'none',
			value: this.formatValue(this.state.value),
		})
	}

	handleBlur(e) {
		if (this.state.editing === 'text') {
			this.exitEditing()
			if (parseFloat(this.state.value) !== this.startValue) {
				this.confirmValue()
			}
		}
	}

	handleKeyDown(e) {
		if (this.state.editing === 'text' && (e.key === 'Enter' || e.key === 'Escape')) {
			this.input.blur()
			e.stopPropagation()
		}
	}

	fireChange(value) {
		if (typeof this.props.onChange === 'function') {
			this.props.onChange(parseFloat(value))
		}
	}

	fireValueConfirmed(value) {
		if (typeof this.props.onValueConfirmed === 'function') {
			this.props.onValueConfirmed(parseFloat(value))
		}
	}
}
