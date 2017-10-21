import React from 'react'
import PropTypes from 'prop-types'
import uuid from '../../../util/uuid'
import model from '../../../util/model'
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
		sequences: PropTypes.array.isRequired,
		onNewDriverSequence: PropTypes.func,
		onDriverSequenceChange: PropTypes.func,
		onNewBasicSequence: PropTypes.func,
		onBasicSequenceChange: PropTypes.func,
		scrollY: PropTypes.number.isRequired,
	}

	constructor(props) {
		super(props);

		this.state = {
			sequences: props.sequences,

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
		this.createDriverSequence = this.createDriverSequence.bind(this)
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
				<SequenceListActionBar/>
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
		);
	}

	renderList() {
		if (this.props.sequences.length === 0) {
			return null
		}
		return (
			<ul
				className="sequence-main-list"
				style={{
					top: -this.props.scrollY,
				}}
			>
				{this.props.sequences.map(this.renderItem.bind(this))}
			</ul>
		)
	}

	renderItem(sequence) {
		return (
			<DriverSequenceItem
				key={sequence.id}
				sequence={sequence}
				onExpand={this.handleDriverSequenceExpand}/>
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
				onConfirm={(sequence) => this.handleCreateUpdateDriverSequence(sequence)}
				onCancel={() => this.handleCancelDriverSequenceModal()}
			/>
		)

		if (this.state.basicSequenceModal.driverSequence) {
			modals.push(
				<BasicSequenceModal
					key="BasicSequenceModal"
					isOpen={this.state.basicSequenceModal.show}
					sequence={this.state.basicSequenceModal.sequence}
					driverSequence={this.state.basicSequenceModal.driverSequence}
					onConfirm={(sequence, driverSequence) => this.handleCreateUpdateBasicSequence(sequence, driverSequence)}
					onCancel={() => this.handleCancelBasicSequenceModal()}
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
		console.log(data);
		switch (data.action) {
			case NEW_DRIVER_SEQUENCE:
				this.createDriverSequence()
				break
			case EDIT_DRIVER_SEQUENCE:
				this.editDriverSequence(data.sequence)
				break
			case ADD_BASIC_SEQUENCE:
				this.addBasicSequence(data.sequence)
				break
			case EDIT_BASIC_SEQUENCE:
				this.editBasicSequence(data.sequence)
				break
			default:
				console.warn(`ContextMenu: action ${data.action} not supported`)
		}
	}

	createDriverSequence() {
		this.setState({
			driverSequenceModal: {
				show: true,
				sequence: null,
			}
		})
	}

	editDriverSequence(sequence) {
		this.setState({
			driverSequenceModal: {
				show: true,
				sequence: sequence,
			}
		})
	}

	handleCreateUpdateDriverSequence(sequence) {
		if (!sequence.id) {
			sequence.id = uuid.getUUID()
			if (typeof this.props.onNewDriverSequence === 'function') {
				this.props.onNewDriverSequence(sequence)
			}
		} else if (typeof this.props.onDriverSequenceChange === 'function') {
			this.props.onDriverSequenceChange(sequence)
		}

		this.setState({
			driverSequenceModal: {
				show: false,
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

	addBasicSequence(driverSequence) {
		this.setState({
			basicSequenceModal: {
				show: true,
				driverSequence: driverSequence,
				sequence: null,
			}
		})
	}

	editBasicSequence(sequence) {
		let driverSequence = model.getBasicSequenceParent(this.props.sequences, sequence)
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
			sequence.id = uuid.getUUID()
			if (typeof this.props.onNewBasicSequence === 'function') {
				this.props.onNewBasicSequence(sequence, driverSequence)
			}
		} else if (typeof this.props.onBasicSequenceChange === 'function') {
			this.props.onBasicSequenceChange(sequence, driverSequence)
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
			this.props.onDriverSequenceChange(sequence)
		}
	}
};
