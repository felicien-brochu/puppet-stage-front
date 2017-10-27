import React from 'react'
import PropTypes from 'prop-types'
import * as util from '../../../../util/utils'
import model from '../../../../util/model'
import Modal from '../../../base/Modal'

export default class DriverSequenceModal extends React.Component {
	static propTypes = {
		isOpen: PropTypes.bool.isRequired,
		onConfirm: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		boards: PropTypes.object.isRequired,
		sequence: PropTypes.object,
	}

	static defaultProps = {
		isOpen: false,
	}

	constructor(props) {
		super(props)

		this.handleRequestClose = this.handleRequestClose.bind(this)
		this.handleCancelClick = this.handleCancelClick.bind(this)
		this.handleOKClick = this.handleOKClick.bind(this)
	}

	render() {
		let servos = model.getServos(this.props.boards)
		let defaultName, defaultServoID
		if (this.props.sequence) {
			defaultName = this.props.sequence.name
			defaultServoID = this.props.sequence.servoID
		}
		let options = []
		for (let [servoID, servo] of util.entries()(servos)) {
			options.push(
				<option
					key={servoID}
					value={servoID}
				>
					{servo.name}
				</option>
			)
		}

		return (
			<Modal
				isOpen={this.props.isOpen}
				onRequestClose={this.handleRequestClose}>
				<div className="top-bar">
					<h3>{this.props.sequence ? "Edit": "New"} Driver Sequence</h3>
					<button
						className="close-button modal-close-button"
						onClick={this.handleRequestClose}
					>
						🗙
					</button>
				</div>
				<div className="content">
					<div className="value-panel">
						<div className="row">
							<span className="label">servo</span>
							<select
								ref="servoSelect"
								defaultValue={defaultServoID}
							>
								{options}
							</select>
						</div>
						<div className="row">
							<span className="label">name</span>
							<input ref="nameInput" type="text" defaultValue={defaultName}/>
						</div>
					</div>
				</div>
				<div className="bottom-bar">
					<button onClick={this.handleCancelClick}>Cancel</button>
					<button onClick={this.handleOKClick}>OK</button>
				</div>
			</Modal>
		)
	}

	handleRequestClose() {
		if (typeof this.props.onCancel === 'function') {
			this.props.onCancel()
		}
	}

	handleCancelClick() {
		if (typeof this.props.onCancel === 'function') {
			this.props.onCancel()
		}
	}

	handleOKClick() {
		let servoID = this.refs.servoSelect.value
		let name = this.refs.nameInput.value
		if (servoID === "" || name === "") {
			return
		}

		let sequence = {}
		if (this.props.sequence) {
			sequence = JSON.parse(JSON.stringify(this.props.sequence))
		}
		sequence = {
			...sequence,
			servoID: servoID,
			name: name,
		}


		if (typeof this.props.onConfirm === 'function') {
			this.props.onConfirm(sequence)
		}
	}
}
