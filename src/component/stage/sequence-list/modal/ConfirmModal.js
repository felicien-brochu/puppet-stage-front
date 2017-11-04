import React from 'react'
import PropTypes from 'prop-types'
import Modal from '../../../base/Modal'

export default class ConfirmModal extends React.Component {
	static propTypes = {
		isOpen: PropTypes.bool.isRequired,
		onConfirm: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		target: PropTypes.object.isRequired,
		message: PropTypes.string,
		title: PropTypes.string,
	}

	static defaultProps = {
		message: "Are you sure ?",
		title: "Confirmation",
	}

	constructor(props) {
		super(props)

		this.handleRequestClose = this.handleRequestClose.bind(this)
		this.handleCancelClick = this.handleCancelClick.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
	}

	render() {
		return (
			<Modal
				isOpen={this.props.isOpen}
				onRequestClose={this.handleRequestClose}>
				<div className="top-bar">
					<h3>{this.props.title}</h3>
					<button
						className="close-button modal-close-button"
						onClick={this.handleRequestClose}
					>
						🗙
					</button>
				</div>
				<div className="content">
					{this.props.message}
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
		if (typeof this.props.onConfirm === 'function') {
			this.props.onConfirm(this.props.target)
		}
	}
}
