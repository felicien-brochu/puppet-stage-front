import units from '../../util/units'
import UUID from '../../util/uuid'
import {
	entries
} from '../../util/utils'


const NECK_H_AMP = 45;
const NECK_V_AMP = 100;
const EYES_H_AMP = 200;
const EYES_V_AMP = 100;
const EYEBROWS_AMP = 140;

const NECK_H_DEF_VAL = 50.
const NECK_V_DEF_VAL = 31.
const EYES_H_DEF_VAL = 50.7
const EYES_V_DEF_VAL = 43.2
const EYEBROWS_DEF_VAL = 50.

const BLINK_START_DURATION = 4 * units.FRAME_TIME
const BLINK_END_DURATION = 12 * units.FRAME_TIME
const EYELID_OPEN_VALUE = 0
const EYELID_CLOSE_VALUE = 45

const controlMap = {
	"Angle Control #2": "neckV",
	"Angle Control #3": "neckH",
	"Slider Control #4": "eyesH",
	"Slider Control #5": "eyesV",
	"Slider Control #6": "eyelids",
	"Angle Control #7": "eyebrows",
}


export default class HeadTracking {

	static importTrackingData(afterEffectsKeyframesText, stageDuration) {
		let tracking = new HeadTracking(afterEffectsKeyframesText)
		return tracking.init(stageDuration)
			.then(() => {
				tracking.generateSequences()
				return tracking.getSequencesList()
			})
	}

	constructor(afterEffectsKeyframesText) {
		this.afterEffectsKeyframesText = afterEffectsKeyframesText
	}

	getSequencesList() {
		let sequenceList = []
		for (let [, sequence] of entries()(this.sequences)) {
			sequenceList.push(sequence)
		}
		return sequenceList
	}

	generateSequences() {
		this.parseAfterEffectsKeyframesText()

		for (let control of this.controls) {
			switch (controlMap[control.name]) {
				case "neckH":
					this.generateNeckH(control)
					break
				case "neckV":
					this.generateNeckV(control)
					break
				case "eyesH":
					this.generateEyesH(control)
					break
				case "eyesV":
					this.generateEyesV(control)
					break
				case "eyelids":
					this.generateEyelids(control)
					break
				case "eyebrows":
					this.generateEyebrows(control)
					break
				default:
			}
		}
	}

	generateLinearSequence(control, sequenceIndex, amplitude, defValue = 50.) {
		let sequence = this.sequences[sequenceIndex]

		for (let keyframe of control.keyframes) {
			let t = Math.round(keyframe.t * units.FRAME_TIME)
			let v = keyframe.v * amplitude + defValue;
			if (v < 0 || v > 100) {
				console.warn(control, "Tracking value out of range in [", controlMap[control.name], "] at ", keyframe.t, v);
				v = Math.min(Math.max(v, 0), 100)
			}
			sequence.keyframes.push({
				p: {
					t: t,
					v: v,
				},
				c1: {
					t: t,
					v: v,
				},
				c2: {
					t: t,
					v: v,
				},
			})
		}
	}

	generateNeckH(control) {
		this.generateLinearSequence(control, "neckH", NECK_H_AMP, NECK_H_DEF_VAL)
	}

	generateNeckV(control) {
		this.generateLinearSequence(control, "neckV", NECK_V_AMP, NECK_V_DEF_VAL)
	}

	generateEyesH(control) {
		this.generateLinearSequence(control, "eyesH", EYES_H_AMP, EYES_H_DEF_VAL)
	}
	generateEyesV(control) {
		this.generateLinearSequence(control, "eyesV", EYES_V_AMP, EYES_V_DEF_VAL)
	}

	generateEyelids(control) {
		let lidLeft = this.sequences.lidLeft
		let lidRight = this.sequences.lidRight
		const BLINK_TOP_THRESHOLD = 0.5

		// Detect blinks and reproduce them
		let blinks = []
		let topValue = 0
		let topTime = 0
		let firstHigh = 0
		let isLastHigh = false


		for (let keyframe of control.keyframes) {
			let isHigh = (keyframe.v > BLINK_TOP_THRESHOLD)

			if (isHigh) {
				if (isLastHigh) {
					if (keyframe.v > topValue) {
						topValue = keyframe.v
						topTime = keyframe.t
					}
				} else {
					isLastHigh = true
					firstHigh = keyframe.t
					topValue = keyframe.v
					topTime = keyframe.t
				}
			} else {
				if (isLastHigh) {
					isLastHigh = false
					blinks.push({
						top: {
							t: topTime,
							v: topValue,
						},
						start: firstHigh,
						end: keyframe.t,
					})
				}
			}
		}

		for (let blink of blinks) {
			let t = Math.round(blink.top.t * units.FRAME_TIME)
			let blinkKeyframes = getBlink(t)
			if (lidLeft.keyframes.length === 0 || lidLeft.keyframes[lidLeft.keyframes.length - 1].p.t <= t) {
				lidLeft.keyframes = lidLeft.keyframes.concat(blinkKeyframes)
				lidRight.keyframes = lidRight.keyframes.concat(blinkKeyframes)
			}
		}
	}

	generateEyebrows(control) {
		let browLeft = this.sequences.browLeft
		let browRight = this.sequences.browRight

		for (let keyframe of control.keyframes) {
			let t = Math.round(keyframe.t * units.FRAME_TIME)
			let v = keyframe.v * EYEBROWS_AMP + EYEBROWS_DEF_VAL;
			if (v < 0 || v > 100) {
				console.warn(control, "Tracking value out of range in [", controlMap[control.name], "] at ", keyframe.t, v);
				v = Math.min(Math.max(v, 0), 100)
			}

			let newKeyframe = {
				p: {
					t: t,
					v: v,
				},
				c1: {
					t: t,
					v: v,
				},
				c2: {
					t: t,
					v: v,
				},
			}
			browLeft.keyframes.push(newKeyframe)
			newKeyframe = JSON.parse(JSON.stringify(newKeyframe))
			browRight.keyframes.push(newKeyframe)
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
		let keyframeRegex = /^\t(\d+)\t([-0-9e.]+)\t$/

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
						t: parseInt(result[1], 10),
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
			lidLeft: {
				name: 'lidLeft[Tracking]',
			},
			lidRight: {
				name: 'lidRight[Tracking]',
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
						previewEnabled: true,
						showGraph: false,
						keyframes: [],
					}
				})
			)
		}

		return Promise.all(uuidPromises)
	}
}




function getBlink(t) {
	return [{
		p: {
			t: t,
			v: EYELID_OPEN_VALUE,
		},
		c1: {
			t: t,
			v: EYELID_OPEN_VALUE,
		},
		c2: {
			t: Math.round(t + BLINK_START_DURATION),
			v: EYELID_OPEN_VALUE,
		}
	}, {
		p: {
			t: Math.round(t + BLINK_START_DURATION),
			v: EYELID_CLOSE_VALUE,
		},
		c1: {
			t: t,
			v: EYELID_CLOSE_VALUE,
		},
		c2: {
			t: Math.round(t + BLINK_START_DURATION + BLINK_END_DURATION),
			v: EYELID_CLOSE_VALUE,
		}
	}, {
		p: {
			t: Math.round(t + BLINK_START_DURATION + BLINK_END_DURATION),
			v: EYELID_OPEN_VALUE,
		},
		c1: {
			t: Math.round(t + BLINK_START_DURATION + (BLINK_END_DURATION / 2)),
			v: EYELID_OPEN_VALUE,
		},
		c2: {
			t: Math.round(t + BLINK_START_DURATION + BLINK_END_DURATION),
			v: EYELID_OPEN_VALUE,
		}
	}, ]
}