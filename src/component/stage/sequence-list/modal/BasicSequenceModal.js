import React from 'react'
import PropTypes from 'prop-types'
import Modal from '../../../base/Modal'

export default class BasicSequenceModal extends React.Component {
	static propTypes = {
		isOpen: PropTypes.bool.isRequired,
		onConfirm: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		driverSequence: PropTypes.object.isRequired,
		sequence: PropTypes.object,
	}

	static defaultProps = {
		isOpen: false,
	}

	constructor(props) {
		super(props)

		this.handleRequestClose = this.handleRequestClose.bind(this)
		this.handleCancelClick = this.handleCancelClick.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	render() {
		let defaultName = ""
		if (this.props.sequence) {
			defaultName = this.props.sequence.name
		}
		return (
			<Modal
				isOpen={this.props.isOpen}
				onRequestClose={this.handleRequestClose}>
				<div className="top-bar">
					<h3>{this.props.sequence ? "Edit" : "New"} Basic Sequence</h3>
					<button
						className="close-button modal-close-button"
						onClick={this.handleRequestClose}
					>
						🗙
					</button>
				</div>
				<div className="content">
					<form onSubmit={this.handleSubmit}>
						<div className="value-panel">
							<div className="row">
								<span className="label">name</span>
								<input ref="nameInput" type="text" defaultValue={defaultName}/>
							</div>
						</div>
					</form>
				</div>
				<div className="bottom-bar">
					<button onClick={this.handleCancelClick}>Cancel</button>
					<button onClick={this.handleSubmit}>OK</button>
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

	handleSubmit(e) {
		e.preventDefault()

		let name = this.refs.nameInput.value
		if (name === "") {
			return
		}

		let sequence = {}
		if (this.props.sequence) {
			sequence = JSON.parse(JSON.stringify(this.props.sequence))
		}
		sequence.name = name

		if (typeof this.props.onConfirm === 'function') {
			this.props.onConfirm(sequence, this.props.driverSequence)
		}
	}
}
