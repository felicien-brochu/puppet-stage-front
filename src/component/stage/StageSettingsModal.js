import React from 'react'
import PropTypes from 'prop-types'
import Modal from '../base/Modal'
import NumberInput from '../base/NumberInput'

export default class StageSettingsModal extends React.Component {
	static propTypes = {
		stage: PropTypes.object.isRequired,
		isOpen: PropTypes.bool.isRequired,

		onConfirm: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
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
					<h3>Stage Settings</h3>
					<button
						className="close-button modal-close-button"
						onClick={this.handleRequestClose}>
						🗙
					</button>
				</div>
				<div className="content">
					<form onSubmit={this.handleSubmit}>
						<div className="value-panel">

							<div className="row">
								<label className="label">name</label>
								<input
									ref={nameInput => this.nameInput = nameInput}
									type="text"
									defaultValue={this.props.stage.name}/>
							</div>

							<div className="row">
								<label className="label">duration</label>
								<NumberInput
									ref={durationInput => this.durationInput = durationInput}
									step={0.1}
									scale={5}
									min={1}
									max={1e6}
									defaultValue={this.props.stage.duration/1e9}/>s
							</div>

							<div className="row">
								<label className="label">audio</label>
								<input
									ref={audioInput => this.audioInput = audioInput}
									type="file"
									defaultValue={this.props.stage.audio}/>
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
		if (typeof this.props.onConfirm === 'function') {
			let stage = JSON.parse(JSON.stringify(this.props.stage))
			stage.name = this.nameInput.value
			stage.duration = Math.round(this.durationInput.state.value * 1e9)
			let file = this.audioInput.files[0]
			this.props.onConfirm(stage, file)
		}
	}
}
