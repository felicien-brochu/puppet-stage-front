import * as util from './utils'
import UUID from './uuid'

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

	static getServo(boards, servoID) {
		let servos = Model.getServos(boards)
		return servos[servoID]
	}

	static getServosByTag(boards, selectTag) {
		let servos = []
		let allServos = Model.getServos(boards)
		for (let [, servo] of util.entries()(allServos)) {
			servo.tags.forEach(tag => {
				if (tag === selectTag) {
					servos.push(servo)
				}
			})
		}

		return servos
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

	static getFlatBasicSequences(sequences) {
		let flatSequences = []

		for (let driverSequence of sequences) {
			for (let sequence of driverSequence.sequences) {
				flatSequences.push(sequence)
			}
		}

		return flatSequences
	}

	static cloneBasicSequence(basicSequence) {
		return UUID.getUUID()
			.then(uuid => {
				let sequence = JSON.parse(JSON.stringify(basicSequence))
				sequence.id = uuid
				return sequence
			})
	}

	static cloneDriverSequence(driverSequence) {
		return new Promise((resolve, reject) => {
			let sequence = JSON.parse(JSON.stringify(driverSequence))
			let promises = []
			for (let basicSequence of sequence.sequences) {
				promises.push(
					UUID.getUUID()
					.then(uuid => {
						basicSequence.id = uuid
					})
					.catch(error => reject(error))
				)
			}
			promises.push(
				UUID.getUUID()
				.then(
					uuid => {
						sequence.id = uuid
					},
					error => {
						reject(error)
					}
				)
			)

			Promise.all(promises)
				.then(
					() => resolve(sequence),
					error => reject(error)
				)
		})
	}
}