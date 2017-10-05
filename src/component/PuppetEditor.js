import React from 'react';
import Alert from 'react-s-alert';

import List from './base/List';
import TextCreator from './base/TextCreator';
import ServoEditor from './puppet/ServoEditor';

import fetchAPI from '../util/api';
import alert from '../util/alert';

export default class PuppetEditor extends React.Component {

	constructor() {
		super();

		this.state = {
			puppet: {
				id: null,
				name: null,
				boards: []
			},
			selectedBoard: null,
			selectedServo: null,
			saved: true,
		}

		this.handleCreateBoard = this.handleCreateBoard.bind(this);
		this.handleCreateServo = this.handleCreateServo.bind(this);
		this.handlePuppetRetrieved = this.handlePuppetRetrieved.bind(this);
	}

	componentWillMount() {
		this.fetchPuppet();
	}

	render() {
		return (
			<div className="puppet-editor">
				<h3>
					{this.state.puppet.name} puppet
					<button
						type="button"
						onClick={() => this.handleSaveClick()}
						disabled={this.state.saved}
					>
						Save
					</button>
				</h3>
				<div className="board-browser">
					<h4>Boards</h4>
					<TextCreator
						onCreate={this.handleCreateBoard}
						placeholder="Board Name"
					/>
					<List
						list={this.state.puppet.boards}
						itemKeyKey="name"
						itemValueKey="name"
						selectedItem={this.state.selectedBoard}
						onSelect={(p) => this.handleBoardSelect(p)}
					/>
				</div>
				{this.renderServoBrowser()}
				{this.renderServoEditor()}

				<Alert stack={true} timeout={3000} />
			</div>
		);
	}

	renderServoBrowser() {
		if (this.state.selectedBoard) {
			return (
				<div className="servo-browser">
					<h4>Servos</h4>
					<TextCreator
						onCreate={this.handleCreateServo}
						placeholder="Servo Name"
					/>
					<List
						list={this.state.selectedBoard.servos}
						itemKeyKey="name"
						itemValueKey="name"
						selectedItem={this.state.selectedServo}
						onSelect={(servo) => this.handleServoSelect(servo)}
					/>
				</div>
			);
		}
		return;
	}

	renderServoEditor() {
		if (this.state.selectedServo) {
			return (
				<ServoEditor
					servo={this.state.selectedServo}
					onChange={(servo) => this.handleServoChange(servo)}
					onPositionChange={(position) => {this.handleServoPositionChange(position)}}
				/>
			);
		}
		return;
	}

	fetchPuppet() {
		let id = this.props.match.params.id;
		fetchAPI(
			"/puppet/" + id, {},
			this.handlePuppetRetrieved,
			null,
			"Error retrieving puppet:"
		)
	}

	handlePuppetRetrieved(puppet) {
		let selectedBoard = null;
		if (puppet.boards.length > 0) {
			selectedBoard = puppet.boards[0];
		}
		this.setState({
			puppet: puppet,
			selectedBoard: selectedBoard,
		})
	}

	handleCreateBoard(name) {
		let board = {
			name: name,
			servos: [],
			busType: "serial",
		}
		let puppet = {
			...this.state.puppet
		};
		puppet.boards.push(board);

		this.setState({
			puppet: puppet,
			selectedBoard: board,
			saved: false,
		})
	}

	handleBoardSelect(board) {
		let selectedServo = this.state.selectedServo;
		if (board) {
			if (!this.state.selectedBoard || board.name !== this.state.selectedBoard.name) {
				if (board.servos.length > 0) {
					selectedServo = board.servos[0];
				} else {
					selectedServo = null;
				}
			}
		} else {
			selectedServo = null;
		}
		this.setState({
			selectedBoard: board,
			selectedServo: selectedServo,
		})
	}

	handleCreateServo(name) {
		let servo = {
			name: name,
			addr: -1,
			defaultPosition: 300,
			hardMin: 130,
			hardMax: 470,
			min: 130,
			max: 470,
		}

		let puppet = {
			...this.state.puppet
		};

		for (let board of puppet.boards) {
			if (board.name === this.state.selectedBoard.name) {
				board.servos.push(servo);
				break;
			}
		}

		this.setState({
			puppet: puppet,
			selectedServo: servo,
			saved: false,
		})
	}

	handleServoSelect(servo) {
		this.setState({
			selectedServo: servo
		})
	}

	handleServoChange(servo) {
		let puppet = {
			...this.state.puppet
		};

		for (let i = 0; i < puppet.boards.length; i++) {
			if (puppet.boards[i].name === this.state.selectedBoard.name) {
				let board = puppet.boards[i];
				for (let j = 0; j < board.servos.length; j++) {
					if (board.servos[j].name === this.state.selectedServo.name) {
						board.servos[j] = servo;
						break;
					}
				}
				break;
			}
		}

		this.setState({
			puppet: puppet,
			selectedServo: servo,
			saved: false,
		})
	}

	handleServoPositionChange(position) {
		console.log("Servo position: ", position);
	}

	handleSaveClick() {
		fetchAPI(
			"/puppet/" + this.state.puppet.id, {
				method: "PUT",
				body: JSON.stringify(this.state.puppet)
			},
			this.handleSaveSuccess,
			this.handleSaveError,
			"Save error: "
		);

		this.setState({
			saved: true
		});
	}

	handleSaveSuccess(puppet) {
		alert.successAlert("Save complete");
	}

	handleSaveError() {
		this.setState({
			saved: false
		});
	}
};
