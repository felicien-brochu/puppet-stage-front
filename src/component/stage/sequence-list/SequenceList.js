import React from 'react'
import PropTypes from 'prop-types'
import UUID from '../../../util/uuid'
import model from '../../../util/model'
import colorClasses from '../colorclasses'
import {
	ContextMenuTrigger,
	ContextMenu,
	MenuItem,
} from 'react-contextmenu'
import DriverSequenceModal from './modal/DriverSequenceModal'
import BasicSequenceModal from './modal/BasicSequenceModal'
import DriverSequenceItem from './DriverSequenceItem'
import SequenceListActionBar from './SequenceListActionBar'

// ContextMenu Actions
const
	NEW_DRIVER_SEQUENCE = "NEW_DRIVER_SEQUENCE",
	EDIT_DRIVER_SEQUENCE = "EDIT_DRIVER_SEQUENCE",
	ADD_BASIC_SEQUENCE = "ADD_BASIC_SEQUENCE",
	EDIT_BASIC_SEQUENCE = "EDIT_BASIC_SEQUENCE"

export default class SequenceList extends React.Component {

	static propTypes = {
		puppet: PropTypes.object.isRequired,
		stage: PropTypes.object.isRequired,
		scrollY: PropTypes.number.isRequired,
		currentTime: PropTypes.number.isRequired,
		saveState: PropTypes.oneOf(['saved', 'saving', 'modified', 'traveled']).isRequired,

		onNewDriverSequence: PropTypes.func.isRequired,
		onDriverSequenceChange: PropTypes.func.isRequired,
		onNewBasicSequence: PropTypes.func.isRequired,
		onBasicSequenceChange: PropTypes.func.isRequired,
		onGoToTime: PropTypes.func.isRequired,
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
		}

		this.handleContextMenuClick = this.handleContextMenuClick.bind(this)
		this.handleDriverSequenceExpand = this.handleDriverSequenceExpand.bind(this)
		this.handleBasicSequenceChange = this.handleBasicSequenceChange.bind(this)
		this.handleGoToKeyframe = this.handleGoToKeyframe.bind(this)
		this.handleCreateDriverSequence = this.handleCreateDriverSequence.bind(this)
		this.handleCreateUpdateDriverSequence = this.handleCreateUpdateDriverSequence.bind(this)
		this.handleCancelDriverSequenceModal = this.handleCancelDriverSequenceModal.bind(this)
		this.handleCreateUpdateBasicSequence = this.handleCreateUpdateBasicSequence.bind(this)
		this.handleCancelBasicSequenceModal = this.handleCancelBasicSequenceModal.bind(this)
	}

	render() {
		return (
			<ContextMenuTrigger
				attributes={{
					className: "sequence-list"
				}}
				id="sequence-list-context-menu"
				renderTag="div"
			>
				<SequenceListActionBar
					saveState={this.props.saveState}/>

				<div className="main-list-container">
					{this.renderList()}
				</div>

				<ContextMenu id="sequence-list-context-menu">
					<MenuItem
						data={{action: NEW_DRIVER_SEQUENCE}}
						onClick={this.handleContextMenuClick}
					>
						New Driver Sequence
					</MenuItem>
					<MenuItem divider />
				</ContextMenu>

				<ContextMenu id="driver-sequence-context-menu">
					<MenuItem
						data={{action: EDIT_DRIVER_SEQUENCE}}
						onClick={this.handleContextMenuClick}
					>
						Edit Driver Sequence
					</MenuItem>
					<MenuItem
						data={{action: ADD_BASIC_SEQUENCE}}
						onClick={this.handleContextMenuClick}
					>
						Add Basic Sequence
					</MenuItem>
				</ContextMenu>

				<ContextMenu id="basic-sequence-context-menu">
					<MenuItem
						data={{action: EDIT_BASIC_SEQUENCE}}
						onClick={this.handleContextMenuClick}
					>
						Edit Basic Sequence
					</MenuItem>
				</ContextMenu>


				{this.renderModals()}

				</ContextMenuTrigger>
		)
	}

	renderList() {
		if (this.props.stage.sequences.length === 0) {
			return null
		}

		let sequenceItems = []
		for (let i = 0; i < this.props.stage.sequences.length; i++) {
			let sequence = this.props.stage.sequences[i]
			sequenceItems.push(
				<DriverSequenceItem
					key={sequence.id}
					sequence={sequence}
					currentTime={this.props.currentTime}
					onExpand={this.handleDriverSequenceExpand}
					onBasicSequenceChange={this.handleBasicSequenceChange}
					onDriverSequenceChange={this.props.onDriverSequenceChange}
					onGoToKeyframe={this.handleGoToKeyframe}/>
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
			case ADD_BASIC_SEQUENCE:
				this.handleAddBasicSequence(data.sequence)
				break
			case EDIT_BASIC_SEQUENCE:
				this.handleEditBasicSequence(data.sequence)
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

	handleAddBasicSequence(driverSequence) {
		this.setState({
			basicSequenceModal: {
				show: true,
				driverSequence: driverSequence,
				sequence: null,
			}
		})
	}

	handleCancelDriverSequenceModal() {
		this.setState({
			driverSequenceModal: {
				show: false,
				sequence: null,
			}
		})
	}

	handleEditBasicSequence(sequence) {
		let driverSequence = model.getBasicSequenceParent(this.props.stage.sequences, sequence.id)
		this.setState({
			basicSequenceModal: {
				show: true,
				driverSequence: driverSequence,
				sequence: sequence,
			}
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
				}
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
			}
		})
	}

	handleCancelBasicSequenceModal() {
		this.setState({
			basicSequenceModal: {
				show: false,
				sequence: null,
				driverSequence: null,
			}
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
