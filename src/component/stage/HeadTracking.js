import units from '../../util/units'
import UUID from '../../util/uuid'
import {
	entries
} from '../../util/utils'

export default class HeadTracking {

	static importTrackingData(afterEffectsKeyframesText, stageDuration) {
		let tracking = new HeadTracking(afterEffectsKeyframesText)
		return tracking.init(stageDuration)
			.then(() => {
				tracking.generateSequences()
				return tracking.sequences
			})
	}

	constructor(afterEffectsKeyframesText) {
		this.afterEffectsKeyframesText = afterEffectsKeyframesText
	}

	init(duration) {
		this.duration = duration

		this.sequences = {
			neckH: {
				name: 'neckH[Tracking]',
			},
			neckV: {
				name: 'neckV[Tracking]',
			},
			eyesH: {
				name: 'eyesH[Tracking]',
			},
			eyesV: {
				name: 'eyesV[Tracking]',
			},
			browLeft: {
				name: 'browLeft[Tracking]',
			},
			browRight: {
				name: 'browRight[Tracking]',
			},
			leftLid: {
				name: 'leftLid[Tracking]',
			},
			rightLid: {
				name: 'rightLid[Tracking]',
			}
		}

		let uuidPromises = []
		for (let [key, sequence] of entries()(this.sequences)) {
			uuidPromises.push(
				UUID.getUUID()
				.then(uuid => {
					this.sequences[key] = {
						...sequence,
						id: uuid,
						start: 0,
						duration: duration,
						defaultValue: 50,
						playEnabled: true,
						previewEnabled: false,
						showGraph: false,
						keyframes: [],
					}
				})
			)
		}

		return Promise.all(uuidPromises)
	}

	generateSequences() {
		this.parseAfterEffectsKeyframesText()

		for (let control of this.controls) {

		}
	}

	parseAfterEffectsKeyframesText() {
		let lines = this.afterEffectsKeyframesText.split('\n')
		let dataStart = 0
		let emptyLineCount = 0

		// Find start
		for (let i = 0; i < lines.length; i++) {
			if (lines[i] === "") {
				emptyLineCount++
				if (emptyLineCount === 2) {
					dataStart = i + 1
					break
				}
			}
		}

		this.controls = []
		let controlDataStart = dataStart
		let keyframeRegex = /^\t(\d+)\t([-0-9\.]+)\t$/

		while (true) {
			let i
			let control = {
				name: "",
				keyframes: [],
			}

			for (i = controlDataStart; lines[i] !== ""; i++) {
				let line = lines[i]
				if (i < controlDataStart + 2) {
					if (i === controlDataStart) {
						control.name = line.split("\t")[1]
					}
				} else {
					let result = keyframeRegex.exec(line)
					control.keyframes.push({
						t: parseInt(result[1]),
						v: parseFloat(result[2]),
					})
				}
			}

			controlDataStart = i + 1
			this.controls.push(control)

			if (lines[controlDataStart] === "") {
				break
			}
		}
	}
}