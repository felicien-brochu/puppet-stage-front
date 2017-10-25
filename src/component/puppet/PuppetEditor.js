import React from 'react'
import Alert from 'react-s-alert'

import List from '../base/List'
import TextCreator from '../base/TextCreator'
import ServoEditor from './ServoEditor'

import fetchAPI from '../../util/api'
import alert from '../../util/alert'

export default class PuppetEditor extends React.Component {

	constructor() {
		super()

		this.state = {
			puppet: {
				id: null,
				name: null,
				boards: {}
			},
			selectedBoard: null,
			selectedServo: null,
			boardWebsocket: null,
			saved: true,
		}

		this.handleCreateBoard = this.handleCreateBoard.bind(this)
		this.handleCreateServo = this.handleCreateServo.bind(this)
		this.handlePuppetRetrieved = this.handlePuppetRetrieved.bind(this)
		this.handleCreateBoardSuccess = this.handleCreateBoardSuccess.bind(this)
		this.handleConnectBoardClick = this.handleConnectBoardClick.bind(this)
		this.handleConnectBoardSuccess = this.handleConnectBoardSuccess.bind(this)
		this.handleSaveClick = this.handleSaveClick.bind(this)
		this.handleBoardSelect = this.handleBoardSelect.bind(this)
		this.handleServoSelect = this.handleServoSelect.bind(this)
		this.handleServoChange = this.handleServoChange.bind(this)
		this.handleServoPositionChange = this.handleServoPositionChange.bind(this)
	}

	componentWillMount() {
		this.fetchPuppet()
	}

	render() {
		return (
			<div className="puppet-editor">
				<h3>
					{this.state.puppet.name} puppet
					<button
						type="button"
						onClick={this.handleSaveClick}
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
						itemKeyKey="id"
						itemValueKey="name"
						selectedItem={this.state.selectedBoard}
						onSelect={this.handleBoardSelect}
					/>
				</div>
				{this.renderServoBrowser()}
				{this.renderServoEditor()}

				<Alert stack={true} timeout={3000} />
			</div>
		)
	}

	renderServoBrowser() {
		if (this.state.selectedBoard) {
			return (
				<div className="servo-browser">
					<h4>Servos
						<button
							type="button"
							onClick={this.handleConnectBoardClick}
							disabled={this.state.boardWebsocket !== null}
						>
							Connect
						</button>
					</h4>
					<TextCreator
						onCreate={this.handleCreateServo}
						placeholder="Servo Name"
					/>
					<List
						list={this.state.selectedBoard.servos}
						itemKeyKey="id"
						itemValueKey="name"
						selectedItem={this.state.selectedServo}
						onSelect={this.handleServoSelect}
					/>
				</div>
			)
		}
		return
	}

	renderServoEditor() {
		if (this.state.selectedServo) {
			return (
				<ServoEditor
					servo={this.state.selectedServo}
					onChange={this.handleServoChange}
					onPositionChange={this.handleServoPositionChange}
				/>
			)
		}
		return
	}

	fetchPuppet() {
		let id = this.props.match.params.id
		fetchAPI(
			"/puppet/" + id, {},
			this.handlePuppetRetrieved,
			null,
			"Error retrieving puppet:"
		)
	}

	handlePuppetRetrieved(puppet) {
		let selectedBoard = null
		if (Object.keys(puppet.boards).length > 0) {
			selectedBoard = Object.entries(puppet.boards)[0][1]
		}
		this.setState({
			puppet: puppet,
			selectedBoard: selectedBoard,
		})
	}

	handleCreateBoard(name) {
		fetchAPI(
			"/board/new", {},
			(board) => this.handleCreateBoardSuccess(board, name),
			null,
			"Create board error: "
		)
	}

	handleCreateBoardSuccess(board, name) {
		board.name = name
		let puppet = {
			...this.state.puppet
		}
		puppet.boards[board.id] = board

		if (this.state.boardWebsocket) {
			this.state.boardWebsocket.close()
		}

		this.setState({
			puppet: puppet,
			selectedBoard: board,
			boardWebsocket: null,
			saved: false,
		})
	}

	handleBoardSelect(board) {
		if (!this.state.selectedBoard || board.id !== this.state.selectedBoard.id) {
			let selectedServo = this.state.selectedServo
			if (board) {
				if (!this.state.selectedBoard || board.id !== this.state.selectedBoard.id) {
					if (Object.keys(board.servos).length > 0) {
						selectedServo = Object.entries(board.servos)[0][1]
					} else {
						selectedServo = null
					}
				}
			} else {
				selectedServo = null
			}
			if (this.state.boardWebsocket) {
				this.state.boardWebsocket.close()
			}
			this.setState({
				selectedBoard: board,
				selectedServo: selectedServo,
				boardWebsocket: null,
			})
		}
	}

	handleConnectBoardClick() {
		fetchAPI(
			"/puppet/" + this.state.puppet.id + "/board/" + this.state.selectedBoard.id + "/start", {
				method: 'POST'
			},
			this.handleConnectBoardSuccess,
			null,
			"Connect board error: "
		)
	}

	handleConnectBoardSuccess() {
		let boardWebsocket = new WebSocket("ws://localhost:8080/puppet/" + this.state.puppet.id + "/board/" + this.state.selectedBoard.id + "/websocket")
		this.setState({
			boardWebsocket: boardWebsocket
		})
	}

	handleCreateServo(name) {
		fetchAPI(
			"/servo/new", {},
			(servo) => this.handleCreateServoSuccess(servo, name),
			null,
			"Create servo error: "
		)
	}

	handleCreateServoSuccess(servo, name) {
		servo.name = name
		let puppet = {
			...this.state.puppet
		}

		puppet.boards[this.state.selectedBoard.id].servos[servo.id] = servo

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
		}

		let board = puppet.boards[this.state.selectedBoard.id]
		board.servos[servo.id] = servo

		this.setState({
			puppet: puppet,
			selectedServo: servo,
			saved: false,
		})
	}

	handleServoPositionChange(position) {
		if (this.state.boardWebsocket) {
			let command = {
				addr: this.state.selectedServo.addr,
				position: position,
			}
			this.state.boardWebsocket.send(JSON.stringify(command))
		}
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
		)

		this.setState({
			saved: true
		})
	}

	handleSaveSuccess(puppet) {
		alert.successAlert("Save complete")
	}

	handleSaveError() {
		this.setState({
			saved: false
		})
	}
}
