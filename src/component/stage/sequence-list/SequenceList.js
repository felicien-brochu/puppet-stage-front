import React from 'react'
import PropTypes from 'prop-types'
import UUID from '../../../util/uuid'
import model from '../../../util/model'
import {
	entries
} from '../../../util/utils'
import colorClasses from '../colorclasses'
import LipSync from '../LipSync'
import {
	ContextMenuTrigger,
	ContextMenu,
	MenuItem,
} from 'react-contextmenu'
import DriverSequenceModal from './modal/DriverSequenceModal'
import BasicSequenceModal from './modal/BasicSequenceModal'
import LipSyncModal from './modal/LipSyncModal'
import ConfirmModal from './modal/ConfirmModal'
import LookGenerator from '../LookGenerator'
import AudioSequenceItem from './AudioSequenceItem'
import DriverSequenceItem from './DriverSequenceItem'
import SequenceListActionBar from './SequenceListActionBar'

// ContextMenu Actions
const
	NEW_DRIVER_SEQUENCE = "NEW_DRIVER_SEQUENCE",
	EDIT_DRIVER_SEQUENCE = "EDIT_DRIVER_SEQUENCE",
	REMOVE_DRIVER_SEQUENCE = "REMOVE_DRIVER_SEQUENCE",
	ADD_BASIC_SEQUENCE = "ADD_BASIC_SEQUENCE",
	LIP_SYNC_SEQUENCE = "LIP_SYNC_SEQUENCE",
	GENERATE_LOOK_SEQUENCES = "GENERATE_LOOK_SEQUENCES",
	EDIT_BASIC_SEQUENCE = "EDIT_BASIC_SEQUENCE",
	REMOVE_BASIC_SEQUENCE = "REMOVE_BASIC_SEQUENCE"

export default class SequenceList extends React.Component {

	static propTypes = {
		puppet: PropTypes.object.isRequired,
		stage: PropTypes.object.isRequired,
		playing: PropTypes.bool.isRequired,
		scrollY: PropTypes.number.isRequired,
		currentTime: PropTypes.number.isRequired,
		saveState: PropTypes.oneOf(['saved', 'saving', 'modified', 'traveled']).isRequired,
		showGraph: PropTypes.bool.isRequired,
		selectedDriverSequences: PropTypes.array.isRequired,
		selectedBasicSequences: PropTypes.array.isRequired,

		onNewDriverSequence: PropTypes.func.isRequired,
		onDriverSequenceChange: PropTypes.func.isRequired,
		onDriverSequenceMove: PropTypes.func.isRequired,
		onBasicSequenceMove: PropTypes.func.isRequired,
		onRemoveDriverSequence: PropTypes.func.isRequired,
		onNewBasicSequence: PropTypes.func.isRequired,
		onBasicSequenceChange: PropTypes.func.isRequired,
		onGoToTime: PropTypes.func.isRequired,
		onOpenStageSettings: PropTypes.func.isRequired,
		onShowGraphChange: PropTypes.func.isRequired,
		onStartPlaying: PropTypes.func.isRequired,
		onStopPlaying: PropTypes.func.isRequired,
		onSelectDriverSequence: PropTypes.func.isRequired,
		onSelectBasicSequence: PropTypes.func.isRequired,
		onUnselectAll: PropTypes.func.isRequired,
		onMuteChange: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.state = {
			driverSequenceModal: {
				show: false,
				sequence: null,
			},

			basicSequenceModal: {
				show: false,
				driverSequence: null,
				sequence: null,
			},

			lipSyncModal: {
				show: false,
				driverSequence: null,
			},

			confirmModal: {
				show: false,
				target: null,
				title: "Confirmation",
				message: "Are you sure?",
				onConfirm: null,
			},
		}

		this.handleContextMenuClick = this.handleContextMenuClick.bind(this)
		this.handleDriverSequenceExpand = this.handleDriverSequenceExpand.bind(this)
		this.handleBasicSequenceChange = this.handleBasicSequenceChange.bind(this)
		this.handleGoToKeyframe = this.handleGoToKeyframe.bind(this)
		this.handleCreateDriverSequence = this.handleCreateDriverSequence.bind(this)
		this.handleCreateUpdateDriverSequence = this.handleCreateUpdateDriverSequence.bind(this)
		this.handleCancelDriverSequenceModal = this.handleCancelDriverSequenceModal.bind(this)
		this.handleRemoveDriverSequenceConfirm = this.handleRemoveDriverSequenceConfirm.bind(this)
		this.handleNewLipSyncSequence = this.handleNewLipSyncSequence.bind(this)
		this.handleCancelLipSyncModal = this.handleCancelLipSyncModal.bind(this)
		this.handleCreateLipSyncSequence = this.handleCreateLipSyncSequence.bind(this)
		this.handleGenerateLookSequences = this.handleGenerateLookSequences.bind(this)
		this.handleCreateUpdateBasicSequence = this.handleCreateUpdateBasicSequence.bind(this)
		this.handleCancelBasicSequenceModal = this.handleCancelBasicSequenceModal.bind(this)
		this.handleRemoveBasicSequenceConfirm = this.handleRemoveBasicSequenceConfirm.bind(this)
		this.handleConfirmModalCancel = this.handleConfirmModalCancel.bind(this)
	}

	render() {
		return (
			<div className="sequence-list">
				<SequenceListActionBar
					saveState={this.props.saveState}

					currentTime={this.props.currentTime}
					stageDuration={this.props.stage.duration}
					playing={this.props.playing}

					onOpenStageSettings={this.props.onOpenStageSettings}
					onStartPlaying={this.props.onStartPlaying}
					onStopPlaying={this.props.onStopPlaying}

					onGoToTime={this.props.onGoToTime}

					showGraph={this.props.showGraph}
					onShowGraphChange={this.props.onShowGraphChange}/>

				<ContextMenuTrigger
					attributes={{
							className: "main-list-container",
						onClick: this.props.onUnselectAll,
					}}
					id="sequence-list-context-menu"
					renderTag="div"
					holdToDisplay={1e9}
				>
					{this.renderList()}
				</ContextMenuTrigger>

				<ContextMenu id="sequence-list-context-menu">
					<MenuItem
						data={{action: NEW_DRIVER_SEQUENCE}}
						onClick={this.handleContextMenuClick}
					>
						New Driver Sequence
					</MenuItem>
				</ContextMenu>

				<ContextMenu id="driver-sequence-context-menu">
					<MenuItem
						data={{action: EDIT_DRIVER_SEQUENCE}}
						onClick={this.handleContextMenuClick}
					>
						Edit
					</MenuItem>
					<MenuItem
						data={{action: REMOVE_DRIVER_SEQUENCE}}
						onClick={this.handleContextMenuClick}
					>
						Remove
					</MenuItem>
					<MenuItem
						data={{action: ADD_BASIC_SEQUENCE}}
						onClick={this.handleContextMenuClick}
					>
						Add Basic Sequence
					</MenuItem>
					<MenuItem
						data={{action: LIP_SYNC_SEQUENCE}}
						onClick={this.handleContextMenuClick}
					>
						New Lip Sync Sequence
					</MenuItem>
					<MenuItem
						data={{action: GENERATE_LOOK_SEQUENCES}}
						onClick={this.handleContextMenuClick}
						disabled={this.props.selectedBasicSequences.length !== 2}
					>
						Generate Look Sequences
					</MenuItem>
				</ContextMenu>

				<ContextMenu id="basic-sequence-context-menu">
					<MenuItem
						data={{action: EDIT_BASIC_SEQUENCE}}
						onClick={this.handleContextMenuClick}
					>
						Edit
					</MenuItem>
					<MenuItem
						data={{action: REMOVE_BASIC_SEQUENCE}}
						onClick={this.handleContextMenuClick}
					>
						Remove
					</MenuItem>
				</ContextMenu>


				{this.renderModals()}

			</div>
		)
	}

	renderList() {
		let sequenceItems = []

		if (this.props.stage.audio.file) {
			sequenceItems.push(
				<AudioSequenceItem
					key="AudioSequenceItem"
					fileName={this.props.stage.audio.file}
					mute={this.props.stage.audio.mute}
					onMuteChange={this.props.onMuteChange}/>
			)
		}

		for (let i = 0; i < this.props.stage.sequences.length; i++) {
			let sequence = this.props.stage.sequences[i]
			sequenceItems.push(
				<DriverSequenceItem
					key={sequence.id}
					sequence={sequence}
					currentTime={this.props.currentTime}
					selected={this.props.selectedDriverSequences.includes(sequence.id)}
					selectedBasicSequences={this.props.selectedBasicSequences}
					onExpand={this.handleDriverSequenceExpand}
					onBasicSequenceChange={this.handleBasicSequenceChange}
					onDriverSequenceChange={this.props.onDriverSequenceChange}
					onDriverSequenceMove={this.props.onDriverSequenceMove}
					onBasicSequenceMove={this.props.onBasicSequenceMove}
					onGoToKeyframe={this.handleGoToKeyframe}
					onSelectDriverSequence={this.props.onSelectDriverSequence}
					onSelectBasicSequence={this.props.onSelectBasicSequence}/>
			)
		}
		return (
			<ul
				className="sequence-main-list"
				style={{
					top: -this.props.scrollY,
				}}
			>
				{sequenceItems}
			</ul>
		)
	}

	renderModals() {
		let modals = []
		modals.push(
			<DriverSequenceModal
				key="DriverSequenceModal"
				isOpen={this.state.driverSequenceModal.show}
				boards={this.props.puppet.boards}
				sequence={this.state.driverSequenceModal.sequence}
				onConfirm={this.handleCreateUpdateDriverSequence}
				onCancel={this.handleCancelDriverSequenceModal}
			/>
		)

		if (this.state.basicSequenceModal.driverSequence) {
			modals.push(
				<BasicSequenceModal
					key="BasicSequenceModal"
					isOpen={this.state.basicSequenceModal.show}
					sequence={this.state.basicSequenceModal.sequence}
					driverSequence={this.state.basicSequenceModal.driverSequence}
					onConfirm={this.handleCreateUpdateBasicSequence}
					onCancel={this.handleCancelBasicSequenceModal}
				/>
			)
		}

		if (this.state.lipSyncModal.driverSequence) {
			modals.push(
				<LipSyncModal
					key="LipSyncModal"
					isOpen={this.state.lipSyncModal.show}
					driverSequence={this.state.lipSyncModal.driverSequence}
					onConfirm={this.handleCreateLipSyncSequence}
					onCancel={this.handleCancelLipSyncModal}
				/>
			)
		}

		if (this.state.confirmModal.show) {
			modals.push(
				<ConfirmModal
				key="ConfirmModal"
				isOpen={this.state.confirmModal.show}
				target={this.state.confirmModal.target}
				title={this.state.confirmModal.title}
				message={this.state.confirmModal.message}
				onConfirm={this.state.confirmModal.onConfirm}
				onCancel={this.handleConfirmModalCancel}
			/>
			)
		}
		return (
			<div>

				{modals}

			</div>
		)
	}

	handleContextMenuClick(e, data) {
		switch (data.action) {
			case NEW_DRIVER_SEQUENCE:
				this.handleCreateDriverSequence()
				break
			case EDIT_DRIVER_SEQUENCE:
				this.handleEditDriverSequence(data.sequence)
				break
			case REMOVE_DRIVER_SEQUENCE:
				this.handleRemoveDriverSequence(data.sequence)
				break
			case ADD_BASIC_SEQUENCE:
				this.handleAddBasicSequence(data.sequence)
				break
			case LIP_SYNC_SEQUENCE:
				this.handleNewLipSyncSequence(data.sequence)
				break
			case GENERATE_LOOK_SEQUENCES:
				this.handleGenerateLookSequences(data.sequence)
				break
			case EDIT_BASIC_SEQUENCE:
				this.handleEditBasicSequence(data.sequence)
				break
			case REMOVE_BASIC_SEQUENCE:
				this.handleRemoveBasicSequence(data.sequence)
				break
			default:
				console.warn(`ContextMenu: action ${data.action} not supported`)
		}
	}

	handleCreateDriverSequence() {
		this.setState({
			driverSequenceModal: {
				show: true,
				sequence: null,
			}
		})
	}

	handleEditDriverSequence(sequence) {
		this.setState({
			driverSequenceModal: {
				show: true,
				sequence: sequence,
			}
		})
	}

	handleCreateUpdateDriverSequence(sequence) {
		if (!sequence.id) {
			this.createDriverSequence(sequence)
		} else {
			this.updateDriverSequence(sequence)
		}
	}

	createDriverSequence(sequence) {
		UUID.getUUID().then((uuid) => {
			sequence = {
				id: uuid,
				name: sequence.name,
				servoID: sequence.servoID,
				expanded: true,
				color: this.props.stage.sequences.length % colorClasses.length,
				playEnabled: true,
				sequences: [],
			}
			if (typeof this.props.onNewDriverSequence === 'function') {
				this.props.onNewDriverSequence(sequence)
			}

			this.setState({
				driverSequenceModal: {
					show: false,
					sequence: null,
				}
			})
		}).catch((error) => {
			console.error(error);
		})
	}

	updateDriverSequence(sequence) {
		if (typeof this.props.onDriverSequenceChange === 'function') {
			this.props.onDriverSequenceChange(sequence)
		}

		this.setState({
			driverSequenceModal: {
				show: false,
				sequence: null,
			}
		})
	}

	handleRemoveDriverSequence(sequence) {
		this.setState({
			confirmModal: {
				show: true,
				target: sequence,
				title: "Remove Driver Sequence",
				message: "Are you sure you want to remove this driver sequence?",
				onConfirm: this.handleRemoveDriverSequenceConfirm,
			},
		})
	}

	handleRemoveDriverSequenceConfirm(sequence) {
		this.props.onRemoveDriverSequence(sequence)
		this.hideConfirmModal()
	}

	handleAddBasicSequence(driverSequence) {
		this.setState({
			basicSequenceModal: {
				show: true,
				driverSequence: driverSequence,
				sequence: null,
			},
		})
	}

	handleCancelDriverSequenceModal() {
		this.setState({
			driverSequenceModal: {
				show: false,
				sequence: null,
			},
		})
	}

	handleNewLipSyncSequence(driverSequence) {
		this.setState({
			lipSyncModal: {
				show: true,
				driverSequence: driverSequence,
			},
		})
	}

	handleCreateLipSyncSequence(driverSequence, text) {
		let keyframes = LipSync.generateKeyframes(text)

		if (keyframes.length > 0) {
			UUID.getUUID().then((uuid) => {
				let servo = model.getServo(this.props.puppet.boards, driverSequence.servoID)

				let defaultValue = (servo.defaultPosition - servo.min) / (servo.max - servo.min) * 100,
					sequence = {
						id: uuid,
						name: 'Lip Sync',
						defaultValue: defaultValue,
						start: 0,
						duration: this.props.stage.duration, // 10 s = 1e10 ns
						slave: false,
						playEnabled: true,
						previewEnabled: false,
						showGraph: false,
						keyframes: keyframes,
					}

				if (typeof this.props.onNewBasicSequence === 'function') {
					this.props.onNewBasicSequence(sequence, driverSequence)
				}
			}).catch((error) => {
				console.error(error)
			})
		}

		this.setState({
			lipSyncModal: {
				show: false,
				driverSequence: null,
			},
		})
	}

	handleCancelLipSyncModal() {
		this.setState({
			lipSyncModal: {
				show: false,
				driverSequence: null,
			},
		})
	}

	handleGenerateLookSequences(driverSequence) {
		if (this.props.selectedBasicSequences.length === 2) {
			let selectedSequences = this.props.selectedBasicSequences.map(sequenceID => model.getBasicSequence(this.props.stage.sequences, sequenceID))

			LookGenerator.generateLookSequences(selectedSequences, this.props.stage.duration)
				.then((sequences) => {
					let newSequence = JSON.parse(JSON.stringify(driverSequence))

					for (let [, sequence] of entries()(sequences)) {
						newSequence.sequences.push(sequence)
					}
					this.props.onDriverSequenceChange(newSequence)
				})
		}
	}

	handleEditBasicSequence(sequence) {
		let driverSequence = model.getBasicSequenceParent(this.props.stage.sequences, sequence.id)
		this.setState({
			basicSequenceModal: {
				show: true,
				driverSequence: driverSequence,
				sequence: sequence,
			},
		})
	}

	handleCreateUpdateBasicSequence(sequence, driverSequence) {
		if (!sequence.id) {
			this.createBasicSequence(sequence, driverSequence)
		} else {
			this.updateBasicSequence(sequence, driverSequence)
		}
	}

	handleBasicSequenceChange(basicSequence, driverSequence, save = true) {
		this.updateBasicSequence(basicSequence, driverSequence, save)
	}

	createBasicSequence(sequence, driverSequence) {
		UUID.getUUID().then((uuid) => {
			let servo = model.getServo(this.props.puppet.boards, driverSequence.servoID)

			let defaultValue = (servo.defaultPosition - servo.min) / (servo.max - servo.min) * 100
			sequence = {
				id: uuid,
				name: sequence.name,
				defaultValue: defaultValue,
				start: 0,
				duration: this.props.stage.duration, // 10 s = 1e10 ns
				slave: false,
				playEnabled: true,
				previewEnabled: false,
				showGraph: false,
				keyframes: [],
			}

			if (typeof this.props.onNewBasicSequence === 'function') {
				this.props.onNewBasicSequence(sequence, driverSequence)
			}

			this.setState({
				basicSequenceModal: {
					show: false,
					sequence: null,
					driverSequence: null,
				},
			})
		}).catch((error) => {
			console.error(error)
		})
	}

	updateBasicSequence(sequence, driverSequence, save = true) {
		if (typeof this.props.onBasicSequenceChange === 'function') {
			this.props.onBasicSequenceChange(sequence, driverSequence, save)
		}

		this.setState({
			basicSequenceModal: {
				show: false,
				sequence: null,
				driverSequence: null,
			},
		})
	}

	handleRemoveBasicSequence(sequence) {
		this.setState({
			confirmModal: {
				show: true,
				target: sequence,
				title: "Remove Basic Sequence",
				message: "Are you sure you want to remove this basic sequence?",
				onConfirm: this.handleRemoveBasicSequenceConfirm,
			},
		})
	}

	handleRemoveBasicSequenceConfirm(sequence) {
		let driverSequence = model.getBasicSequenceParent(this.props.stage.sequences, sequence.id)
		driverSequence = JSON.parse(JSON.stringify(driverSequence))
		for (let i = 0; i < driverSequence.sequences.length; i++) {
			if (driverSequence.sequences[i].id === sequence.id) {
				driverSequence.sequences.splice(i, 1)
				break
			}
		}
		this.props.onDriverSequenceChange(driverSequence)
		this.hideConfirmModal()
	}

	handleCancelBasicSequenceModal() {
		this.setState({
			basicSequenceModal: {
				show: false,
				sequence: null,
				driverSequence: null,
			},
		})
	}

	handleConfirmModalCancel() {
		this.hideConfirmModal()
	}

	hideConfirmModal() {
		this.setState({
			confirmModal: {
				show: false,
				target: null,
				title: "Confirmation",
				message: "Are you sure?",
				onConfirm: null,
			},
		})
	}

	handleDriverSequenceExpand(sequence, expanded) {
		sequence.expanded = expanded
		if (typeof this.props.onDriverSequenceChange === 'function') {
			this.props.onDriverSequenceChange(sequence, false)
		}
	}

	handleGoToKeyframe(keyframe) {
		let basicSequence = model.getBasicSequence(this.props.stage.sequences, keyframe.sequenceID)
		let t = basicSequence.keyframes[keyframe.index].p.t
		this.props.onGoToTime(t)
	}
}
