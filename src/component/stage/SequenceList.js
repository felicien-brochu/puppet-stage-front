import React from 'react'
import PropTypes from 'prop-types'
import uuid from '../../util/uuid'
import {
	ContextMenuTrigger,
	ContextMenu,
	MenuItem,
} from 'react-contextmenu'
import DriverSequenceModal from './modal/DriverSequenceModal'

// ContextMenu Actions
const
	NEW_DRIVER_SEQUENCE = "NEW_DRIVER_SEQUENCE";

export default class SequenceList extends React.Component {

	static propTypes = {
		puppet: PropTypes.object.isRequired,
		sequences: PropTypes.array.isRequired,
	}

	constructor(props) {
		super(props);

		this.state = {
			sequences: props.sequences,
			driverSequenceModal: {
				show: false,
				sequence: null,
			},
		}

		this.handleContextMenuCLick = this.handleContextMenuCLick.bind(this);
		this.createDriverSequence = this.createDriverSequence.bind(this);
	}

	render() {
		return (
			<div className="sequence-list">
				{this.renderList()}


				<ContextMenuTrigger id="sequence-list-context-menu">
					<div/>
				</ContextMenuTrigger>
				<ContextMenu id="sequence-list-context-menu">
					<MenuItem data={{action: NEW_DRIVER_SEQUENCE}} onClick={this.handleContextMenuCLick}>
						New Driver Sequence
					</MenuItem>
					<MenuItem divider />
				</ContextMenu>


				{this.renderModals()}
			</div>
		);
	}

	renderList() {
		return (
			<ul className="sequence-main-list">
				{this.props.sequences.map(this.renderItem)}
					</ul>
		)
	}

	renderItem(sequence) {
		return (
			<li key={sequence.id}>
				{sequence.name}
			</li>
		)
	}

	renderModals() {
		return (
			<DriverSequenceModal
				isOpen={this.state.driverSequenceModal.show}
				boards={this.props.puppet.boards}
				sequence={this.state.driverSequenceModal.sequence}
				onConfirm={(sequence) => this.handleCreateUpdateDriverSequence(sequence)}
				onCancel={() => this.handleCancelDriverSequenceModal()}
			/>
		)
	}

	handleContextMenuCLick(e, data) {
		switch (data.action) {
			case NEW_DRIVER_SEQUENCE:
				this.createDriverSequence();
				break;
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
};
