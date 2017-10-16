import * as util from './utils'

export default class Model {
	static getServos(boards) {
		let servos = {}
		for (let [, board] of util.entries(boards)) {
			servos = {
				...servos,
				...board.servos
			}
		}
		return servos
	}

	static indexOfDriverSequence(sequences, sequenceID) {
		let index = -1
		sequences.forEach((sequence, i) => {
			if (sequence.id === sequenceID) {
				index = i
				return false
			}
		})
		return index
	}
}
