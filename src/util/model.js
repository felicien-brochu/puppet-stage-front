import * as util from './utils'

export default class Model {
	static getServos(boards) {
		let servos = {}
		for (let [, board] of util.entries()(boards)) {
			servos = {
				...servos,
				...board.servos
			}
		}
		return servos
	}

	static getServo(puppet, servoID) {
		let servos = Model.getServos(puppet.boards)
		return servos[servoID]
	}

	static indexOfID(list, id) {
		let index = -1
		list.forEach((item, i) => {
			if (item.id === id) {
				index = i
				return false
			}
		})
		return index
	}

	static itemOfID(list, id) {
		let item = null
		list.forEach((element) => {
			if (element.id === id) {
				item = element
				return false
			}
		})
		return item
	}

	static getBasicSequenceParent(driverSequences, basicSequenceID) {
		for (let driverSequence of driverSequences) {
			for (let sequence of driverSequence.sequences) {
				if (sequence.id === basicSequenceID) {
					return driverSequence
				}
			}
		}
		return null
	}

	static getBasicSequence(sequences, basicSequenceID) {
		for (let driverSequence of sequences) {
			let sequence = Model.itemOfID(driverSequence.sequences, basicSequenceID)
			if (sequence) {
				return sequence
			}
		}
		return null
	}
}
