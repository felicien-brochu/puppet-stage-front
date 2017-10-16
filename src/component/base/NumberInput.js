import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

export default class NumberInput extends React.Component {

	static propTypes = {
		defaultValue: PropTypes.number.isRequired,
		min: PropTypes.number,
		max: PropTypes.number,
		scale: PropTypes.number,
		step: PropTypes.number,
		onChange: PropTypes.func,
		onValueConfirmed: PropTypes.func,
	}

	static defaultProps = {
		scale: 100
	};

	constructor(props) {
		super(props);

		this.state = {
			value: props.defaultValue,
			editing: 'none',
			isEditing: false,
		}
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			value: nextProps.defaultValue
		})
	}

	render() {
		const inputClasses = classNames('number-input', {
			'editing': this.state.editing === 'text',
			'edit-dragged': this.state.editing === 'drag',
		});
		const overlayClasses = classNames('drag-overlay', {
			'edit-dragged': this.state.editing === 'drag',
			'disabled': this.state.editing === 'text',
		});

		return (
			<div className="number-input-container">
				<input
					type="number"
					className={inputClasses}
					value={this.state.value}
					onChange={(e) => this.handleChange(e)}
					onBlur={(e) => this.handleBlur(e)}
					onKeyDown={(e) => this.handleKeyDown(e)}
					ref={input => this.input = input}
				/>
				<div
					className={overlayClasses}
					onMouseDown={(e) => this.handleMouseDown(e)}
					onClick={(e) => this.handleClick(e)}
					onDragStart={(e) => e.preventDefault()}
				/>
			</div>
		);
	}

	handleChange(e) {
		this.setValue(e.target.value);
	}

	handleClick(e) {
		this.setState({
			editing: 'text',
		});
		this.input.select();
	}

	handleMouseDown(e) {
		e.preventDefault();

		let startValue = this.state.value,
			startX = e.clientX,
			startY = e.clientY;

		let handleMouseMove = function(e) {
			this.onDragValue(startValue, e.clientX - startX, e.clientY - startY);
		}.bind(this);

		let handleMouseUp = function() {
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('mousemove', handleMouseMove);
			this.confirmValue();
		}.bind(this);

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}

	onDragValue(startValue, offsetX, offsetY) {
		let scale = this.props.scale / 100;
		offsetX *= scale;
		offsetY *= scale;
		this.setValue(Number(startValue) + offsetX - offsetY);
	}

	setValue(value) {
		if (this.props.step !== undefined) {
			let step = this.props.step;
			value /= step;
			value = Math.floor(value);
			value *= step;
		}
		if (this.props.max !== undefined && value > this.props.max) {
			value = this.props.max;
		} else if (this.props.min !== undefined && value < this.props.min) {
			value = this.props.min;
		}
		this.setState({
			value: value
		});

		if (typeof this.props.onChange === 'function') {
			this.props.onChange(value);
		}
	}

	confirmValue() {
		if (typeof this.props.onChange === 'function') {
			this.props.onChange(this.state.value);
		}
		if (typeof this.props.onValueConfirmed === 'function') {
			this.props.onValueConfirmed(this.state.value);
		}
	}

	exitEditing() {
		this.setState({
			editing: 'none',
		});
	}

	handleBlur(e) {
		if (this.state.editing === 'text') {
			this.exitEditing();
			this.confirmValue();
		}
	}

	handleKeyDown(e) {
		if (this.state.editing === 'text' && (e.key === 'Enter' || e.key === 'Escape')) {
			this.input.blur();
			this.exitEditing();
			this.confirmValue();
		}
	}
}
