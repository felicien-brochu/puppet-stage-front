import React from 'react'
import PropTypes from 'prop-types'

import NumberInput from '../base/NumberInput'

export default class ServoEditor extends React.Component {

	static propTypes = {
		servo: PropTypes.object.isRequired,
		onChange: PropTypes.func.isRequired,
		onPositionChange: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.handleAddrConfirmed = this.handleAddrConfirmed.bind(this)
		this.handleDefaultPositionChange = this.handleDefaultPositionChange.bind(this)
		this.handleDefaultPositionConfirmed = this.handleDefaultPositionConfirmed.bind(this)
		this.handleMinChange = this.handleMinChange.bind(this)
		this.handleMinConfirmed = this.handleMinConfirmed.bind(this)
		this.handleMaxChange = this.handleMaxChange.bind(this)
		this.handleMaxConfirmed = this.handleMaxConfirmed.bind(this)
	}

	render() {
		return (
			<div className="servo-editor">
				<h4>{this.props.servo.name}</h4>
				<div className="value-panel">
					<div className="row">
						addr
						<NumberInput
							defaultValue={this.props.servo.addr}
							min={0}
							max={4096}
							step={1}
							scale={10}
							onValueConfirmed={this.handleAddrConfirmed}
						/>
					</div>

					<div className="row">
						default position
						<NumberInput
							defaultValue={this.props.servo.defaultPosition}
							min={this.props.servo.min}
							max={this.props.servo.max}
							step={1}
							scale={50}
							onChange={this.handleDefaultPositionChange}
							onValueConfirmed={this.handleDefaultPositionConfirmed}
						/>
					</div>

					<div className="row">
						min
						<NumberInput
							defaultValue={this.props.servo.min}
							min={this.props.servo.hardMin}
							max={this.props.servo.defaultPosition}
							step={1}
							scale={50}
							onChange={this.handleMinChange}
							onValueConfirmed={this.handleMinConfirmed}
						/>
					</div>

					<div className="row">
						max
						<NumberInput
							defaultValue={this.props.servo.max}
							min={this.props.servo.defaultPosition}
							max={this.props.servo.hardMax}
							step={1}
							scale={50}
							onChange={this.handleMaxChange}
							onValueConfirmed={this.handleMaxConfirmed}
						/>
					</div>
				</div>
			</div>
		)
	}

	handleDefaultPositionChange(defaultPosition) {
		this.props.onPositionChange(defaultPosition)
	}

	handleMinChange(min) {
		this.props.onPositionChange(min)
	}

	handleMaxChange(max) {
		this.props.onPositionChange(max)
	}

	handleAddrConfirmed(addr) {
		let servo = {
			...this.props.servo
		}
		servo.addr = addr
		this.props.onChange(servo)
	}

	handleDefaultPositionConfirmed(defaultPosition) {
		let servo = {
			...this.props.servo
		}
		servo.defaultPosition = defaultPosition
		this.props.onChange(servo)
	}

	handleMinConfirmed(min) {
		let servo = {
			...this.props.servo
		}
		servo.min = min
		this.props.onChange(servo)
	}

	handleMaxConfirmed(max) {
		let servo = {
			...this.props.servo
		}
		servo.max = max
		this.props.onChange(servo)
	}

}
