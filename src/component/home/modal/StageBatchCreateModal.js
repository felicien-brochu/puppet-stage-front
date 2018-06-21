import React from 'react'
import PropTypes from 'prop-types'
import Modal from '../../base/Modal'

export default class StageBatchCreateModal extends React.Component {
	static propTypes = {
		isOpen: PropTypes.bool.isRequired,
		onConfirm: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.state = {
			wavFiles: [],
			lipSyncFiles: [],
			headTrackingFiles: [],
		}

		this.handleRequestClose = this.handleRequestClose.bind(this)
		this.handleCancelClick = this.handleCancelClick.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)

		this.handleWavFilesChange = this.handleWavFilesChange.bind(this)
		this.handleLipSyncFilesChange = this.handleLipSyncFilesChange.bind(this)
		this.handleHeadTrackingFilesChange = this.handleHeadTrackingFilesChange.bind(this)
	}

	render() {
		return (
			<Modal
				isOpen={this.props.isOpen}
				onRequestClose={this.handleRequestClose}>
				<div className="top-bar">
					<h3>Batch Create Stages</h3>
					<button
						className="close-button modal-close-button"
						onClick={this.handleRequestClose}
					>
						🗙
					</button>
				</div>
				<div className="content">
					Prefix:
					<input
						type="text"
						ref={prefixInput => this.prefixInput = prefixInput}/>
					<div>
						Wav:
						<input
							type="file"
							multiple="multiple"
							ref={wavFilesInput => this.wavFilesInput = wavFilesInput}
							onChange={this.handleWavFilesChange}/>
						{this.renderFilesList(this.state.wavFiles)}
					</div>
					<div>
						Lip Sync:
						<input
							type="file"
							multiple="multiple"
							ref={lipSyncFilesInput => this.lipSyncFilesInput = lipSyncFilesInput}
							onChange={this.handleLipSyncFilesChange}/>
						{this.renderFilesList(this.state.lipSyncFiles)}
					</div>
					<div>
						Head Tracking:
						<input
							type="file"
							multiple="multiple"
							ref={headTrackingFilesInput => this.headTrackingFilesInput = headTrackingFilesInput}
							onChange={this.handleHeadTrackingFilesChange}/>
						{this.renderFilesList(this.state.headTrackingFiles)}
					</div>
				</div>
				<div className="bottom-bar">
					<button onClick={this.handleCancelClick}>Cancel</button>
					<button onClick={this.handleSubmit}>OK</button>
				</div>
			</Modal>
		)
	}

	renderFilesList(files) {
		let items = []
		for (let file of files) {
			items.push(
				<li key={file.name}>
					{file.name}
				</li>
			)
		}

		return (
			<ol className="raw-file-list">{items}</ol>
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
			this.props.onConfirm(this.prefixInput.value, this.state.wavFiles, this.state.lipSyncFiles, this.state.headTrackingFiles)
		}
	}

	handleWavFilesChange(e) {
		this.setState({
			wavFiles: e.target.files,
		})
	}

	handleLipSyncFilesChange(e) {
		this.setState({
			lipSyncFiles: e.target.files,
		})
	}

	handleHeadTrackingFilesChange(e) {
		this.setState({
			headTrackingFiles: e.target.files,
		})
	}
}