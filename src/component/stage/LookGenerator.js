import units from '../../util/units'
import UUID from '../../util/uuid'
import {
	entries
} from '../../util/utils'
import KeyframeHelper from './KeyframeHelper'


const BLINK_START_DURATION = 4 * units.FRAME_TIME
const BLINK_END_DURATION = 12 * units.FRAME_TIME
const BLINK_MIN_INTERVAL = 2 * units.FRAME_TIME // Minimum time interval between two blinks
const BLINK_AVG_INTERVAL = 4e9 // Human is between 2s and 10s. 6s on avg
const BLINK_RANDOM_INTERVAL = 1e9 // Human is between 2s and 10s. 6s on avg
const BLINK_THRESHOLD = 40 * Math.PI / 180 // Blink when look moves more than this angle by second
const LOW_BLINK_THRESHOLD = 20 * Math.PI / 180 // Blink when look moves more than this angle by second and last blink was a while ago
const EYELID_OPEN_VALUE = 30
const EYELID_CLOSE_VALUE = 100

const EYE_THRESHOLD = 25 * Math.PI / 180 // Move the neck if eyes moves more than this angle. Else only move eyes
const MAX_TIME_NONFOCUS_EYES = 0.4e9 // Maximum time with eyes away from focus (= neck and eyes not at rest)
const NONFOCUS_THRESHOLD = 3.5 * Math.PI / 180 // Angle delta at which we consider neck and eyes not at rest
const LOOK_X_ANGLE = 115 * Math.PI / 180 // Total semi angle of the look on the horizontal axis
const LOOK_Y_ANGLE = 70 * Math.PI / 180 // Total semi angle of the look on the vertical axis
const NECK_X_ANGLE = 90 * Math.PI / 180 // Total semi angle of the neck on the horizontal axis
const NECK_Y_ANGLE = 45 * Math.PI / 180 // Total semi angle of the neck on the vertical axis
const EYES_X_ANGLE = 25 * Math.PI / 180 // Total semi angle of eyes on the horizontal axis
const EYES_Y_ANGLE = 25 * Math.PI / 180 // Total semi angle of eyes on the vertical axis
const MIN_EASE = 10 * units.FRAME_TIME
const MAX_EASE = 30 * units.FRAME_TIME

export default class LookGenerator {

	static generateLookSequences(lookSequences, duration) {
		let xSequence = lookSequences[0]
		let ySequence = lookSequences[1]

		let look = new Look()
		return look.init(duration, xSequence, ySequence)
			.then(() => {
				look.generateSequences()
				return look.sequences
			})
	}
}

class Look {
	init(duration, xSequence, ySequence) {
		this.duration = duration
		this.xSequence = xSequence
		this.ySequence = ySequence

		this.sequences = {
			neckH: {
				name: 'Look[neckH]',
			},
			neckV: {
				name: 'Look[neckV]',
			},
			eyesH: {
				name: 'Look[eyesH]',
			},
			eyesV: {
				name: 'Look[eyesV]',
			},
			leftLid: {
				name: 'Look[leftLid]',
			},
			rightLid: {
				name: 'Look[rightLid]',
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
		let xKeyframes = this.xSequence.keyframes,
			yKeyframes = this.ySequence.keyframes

		let
			keyTime = [0],
			lastT = 0,
			lastX = KeyframeHelper.getBasicSequenceValueAt(this.xSequence, 0),
			lastY = KeyframeHelper.getBasicSequenceValueAt(this.ySequence, 0),
			lastA = (lastX / 100 - 0.5) * LOOK_X_ANGLE * 2,
			lastB = (lastY / 100 - 0.5) * LOOK_Y_ANGLE * 2

		for (let i = 0, j = 0; i < xKeyframes.length || j < yKeyframes.length;) {
			let t = 0
			if (j >= yKeyframes.length || (i < xKeyframes.length && xKeyframes[i].p.t <= yKeyframes[j].p.t)) {
				t = xKeyframes[i].p.t
				i++
			} else if (i >= xKeyframes.length || (j < yKeyframes.length && yKeyframes[j].p.t <= xKeyframes[i].p.t)) {
				t = yKeyframes[j].p.t
				j++
			}

			if (keyTime.length > 0 && keyTime[keyTime.length - 1] !== t) {
				keyTime.push(t)
			}
		}

		keyTime.push(this.duration)

		let correctFocus = false,
			lastCorrectionTime = 0

		for (let i = 0; i < keyTime.length; i++) {
			let
				t = keyTime[i],
				x = KeyframeHelper.getBasicSequenceValueAt(this.xSequence, t),
				y = KeyframeHelper.getBasicSequenceValueAt(this.ySequence, t),
				a = (x / 100 - 0.5) * LOOK_X_ANGLE * 2,
				b = (y / 100 - 0.5) * LOOK_Y_ANGLE * 2


			let correctionTime = this.generateMovement(lastT, lastA, lastB, t, a, b, correctFocus)

			if (correctionTime === lastCorrectionTime) {
				console.error("LookGenerator: INFINITE CORRECTION LOOP")
				return
			}
			correctFocus = !isNaN(correctionTime)
			if (correctFocus) {
				lastCorrectionTime = correctionTime
				// Rewind the generation
				this.eraseMovesFrom(correctionTime)
				while (keyTime[i] > correctionTime) {
					i--
				}

				if (i > 0) {
					t = keyTime[i - 1]
				} else {
					t = 0
				}
				x = KeyframeHelper.getBasicSequenceValueAt(this.xSequence, t)
				y = KeyframeHelper.getBasicSequenceValueAt(this.ySequence, t)
				a = (x / 100 - 0.5) * LOOK_X_ANGLE * 2
				b = (y / 100 - 0.5) * LOOK_Y_ANGLE * 2
			}

			lastT = t
			lastX = x
			lastY = y
			lastA = a
			lastB = b
		}

		this.easeSequences()
	}

	eraseMovesFrom(t) {
		let sequenceKeys = ["neckH", "neckV", "eyesH", "eyesV", "leftLid", "rightLid"]
		sequenceKeys.forEach(sequenceKey => {
			for (let i = this.sequences[sequenceKey].keyframes.length - 1; i >= 0; i--) {
				if (this.sequences[sequenceKey].keyframes[i].p.t > t) {
					this.sequences[sequenceKey].keyframes.splice(i, 1)
				}
			}
		})
	}

	generateMovement(lastT, lastA, lastB, t, a, b, correctFocus) {
		let correctionTime = this.generateNeckAndEyes(lastT, lastA, lastB, t, a, b, correctFocus)
		if (!isNaN(correctionTime)) {
			return correctionTime
		}
		this.generateBlinks(lastT, lastA, lastB, t, a, b)
	}

	generateNeckAndEyes(lastT, lastA, lastB, t, a, b, forceLargeMove) {
		let
			neckH = 50,
			neckV = 50,
			eyesH = 50,
			eyesV = 50,
			doLargeMove = true


		if (!forceLargeMove && t !== 0) {
			// Check if eyes only can move to reach the target
			let
				lastNeckH = this.sequences.neckH.keyframes[this.sequences.neckH.keyframes.length - 1].p.v,
				lastNeckV = this.sequences.neckV.keyframes[this.sequences.neckV.keyframes.length - 1].p.v,
				neckHAngle = (lastNeckH - 50) / 100 * NECK_X_ANGLE * 2,
				neckVAngle = (lastNeckV - 50) / 100 * NECK_Y_ANGLE * 2,
				eyesHAngle = a - neckHAngle,
				eyesVAngle = b - neckVAngle

			// Small movement only with eyes
			if (Math.abs(Math.acos(Math.cos(eyesHAngle) * Math.cos(eyesVAngle))) < EYE_THRESHOLD) {
				doLargeMove = false
				eyesH = (eyesHAngle / (EYES_X_ANGLE * 2)) * 100 + 50
				eyesV = (eyesVAngle / (EYES_Y_ANGLE * 2)) * 100 + 50
				neckH = lastNeckH
				neckV = lastNeckV

				this.addNeckAndEyesKeyframe(t, neckH, neckV, eyesH, eyesV)
				return this.correctFocus(t)
			}
		}
		if (doLargeMove) { // Large movement: Neck + Eyes proportionaly in the direction
			this.doLargeMove(t, a, b)
		}
	}

	correctFocus(t) {
		// Search last focus (= Neck and eyes at rest)
		let
			lastFocus = t,
			i = 0
		while (lastFocus > 0) {
			let x = KeyframeHelper.getBasicSequenceValueAt(this.xSequence, lastFocus),
				y = KeyframeHelper.getBasicSequenceValueAt(this.ySequence, lastFocus),
				aSearch = (x / 100 - 0.5) * LOOK_X_ANGLE * 2,
				bSearch = (y / 100 - 0.5) * LOOK_Y_ANGLE * 2,
				focusEyesHAngleSearch = (aSearch / LOOK_X_ANGLE) * EYES_X_ANGLE,
				focusEyesVAngleSearch = (bSearch / LOOK_Y_ANGLE) * EYES_Y_ANGLE,
				eyesHAngleSearch = (KeyframeHelper.getBasicSequenceValueAt(this.sequences.eyesH, lastFocus) / 100 - 0.5) * 2 * EYES_X_ANGLE,
				eyesVAngleSearch = (KeyframeHelper.getBasicSequenceValueAt(this.sequences.eyesV, lastFocus) / 100 - 0.5) * 2 * EYES_Y_ANGLE

			if (Math.abs(Math.acos(Math.cos(eyesHAngleSearch - focusEyesHAngleSearch) * Math.cos(eyesVAngleSearch - focusEyesVAngleSearch))) < NONFOCUS_THRESHOLD) {
				break
			}
			i++
			lastFocus = Math.round(t - i * units.FRAME_TIME)
		}

		if (t - lastFocus > MAX_TIME_NONFOCUS_EYES) {
			return lastFocus
		}
	}

	doLargeMove(t, a, b) {
		let
			eyesHAngle = (a / LOOK_X_ANGLE) * EYES_X_ANGLE,
			eyesVAngle = (b / LOOK_Y_ANGLE) * EYES_Y_ANGLE,
			eyesH = (eyesHAngle / (EYES_X_ANGLE * 2)) * 100 + 50,
			eyesV = (eyesVAngle / (EYES_Y_ANGLE * 2)) * 100 + 50,
			neckH = ((a - eyesHAngle) / (NECK_X_ANGLE * 2)) * 100 + 50,
			neckV = ((b - eyesVAngle) / (NECK_Y_ANGLE * 2)) * 100 + 50

		this.addNeckAndEyesKeyframe(t, neckH, neckV, eyesH, eyesV)
	}

	addNeckAndEyesKeyframe(t, neckH, neckV, eyesH, eyesV) {
		t = Math.round(t)
		neckH = bound(neckH, 0, 100)
		neckV = bound(neckV, 0, 100)
		eyesH = bound(eyesH, 0, 100)
		eyesV = bound(eyesV, 0, 100)

		let neckHPoint = {
			t: t,
			v: neckH,
		}
		this.sequences.neckH.keyframes.push({
			p: JSON.parse(JSON.stringify(neckHPoint)),
			c1: JSON.parse(JSON.stringify(neckHPoint)),
			c2: JSON.parse(JSON.stringify(neckHPoint)),
		})

		let neckVPoint = {
			t: t,
			v: neckV,
		}
		this.sequences.neckV.keyframes.push({
			p: JSON.parse(JSON.stringify(neckVPoint)),
			c1: JSON.parse(JSON.stringify(neckVPoint)),
			c2: JSON.parse(JSON.stringify(neckVPoint)),
		})

		let eyesHPoint = {
			t: t,
			v: eyesH,
		}
		this.sequences.eyesH.keyframes.push({
			p: JSON.parse(JSON.stringify(eyesHPoint)),
			c1: JSON.parse(JSON.stringify(eyesHPoint)),
			c2: JSON.parse(JSON.stringify(eyesHPoint)),
		})

		let eyesVPoint = {
			t: t,
			v: eyesV,
		}
		this.sequences.eyesV.keyframes.push({
			p: JSON.parse(JSON.stringify(eyesVPoint)),
			c1: JSON.parse(JSON.stringify(eyesVPoint)),
			c2: JSON.parse(JSON.stringify(eyesVPoint)),
		})
	}

	generateBlinks(lastT, lastA, lastB, t, a, b) {
		let
			angle = Math.acos(Math.cos(a - lastA) * Math.cos(b - lastB)),
			speed = angle / ((t - lastT) / 1e9),
			lastBlinkT = this.getLastBlinkTime()

		// Blink for look movements
		if (!isNaN(speed) && ((speed > BLINK_THRESHOLD && lastT - lastBlinkT >= BLINK_MIN_INTERVAL) || (speed > LOW_BLINK_THRESHOLD && t - lastBlinkT > BLINK_AVG_INTERVAL))) {
			this.sequences.leftLid.keyframes = this.sequences.leftLid.keyframes.concat(this.getBlink(lastT))
			this.sequences.rightLid.keyframes = this.sequences.rightLid.keyframes.concat(this.getBlink(lastT))
		}

		lastBlinkT = this.getLastBlinkTime()
		// Feel the gaps between the blinks
		while (t - lastBlinkT > BLINK_AVG_INTERVAL) {
			let
				min = Math.max(lastBlinkT, 0) + BLINK_AVG_INTERVAL - BLINK_RANDOM_INTERVAL,
				max = Math.min(lastBlinkT + BLINK_AVG_INTERVAL + BLINK_RANDOM_INTERVAL, t),
				blinkT = Math.round(Math.random() * (max - min) + min)

			this.sequences.leftLid.keyframes = this.sequences.leftLid.keyframes.concat(this.getBlink(blinkT))
			this.sequences.rightLid.keyframes = this.sequences.rightLid.keyframes.concat(this.getBlink(blinkT))

			lastBlinkT = this.getLastBlinkTime()
		}
	}

	getLastBlinkTime() {
		let
			lastBlinkT = 0,
			lidKeyframes = this.sequences.leftLid.keyframes

		for (let i = lidKeyframes.length - 2; i > 0; i--) {
			if (lidKeyframes[i].p.v === EYELID_CLOSE_VALUE) {
				lastBlinkT = lidKeyframes[i + 1].p.t
				break
			}
		}

		return lastBlinkT
	}

	getBlink(t) {
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

	easeSequences() {
		let sequenceKeys = ["neckH", "neckV", "eyesH", "eyesV"]
		const easeRatio = 0.7
		for (let i = 0; i < this.sequences.neckH.keyframes.length; i++) {
			sequenceKeys.forEach(sequenceKey => {
				let k1 = this.sequences[sequenceKey].keyframes[i]

				if (i > 0) {
					let k0 = this.sequences[sequenceKey].keyframes[i - 1],
						c1t = (k1.p.t - k0.p.t) * easeRatio

					c1t = bound(c1t, Math.min(MIN_EASE, c1t), MAX_EASE)
					c1t = Math.round(c1t)
					k1.c1.t -= c1t
				}

				if (i < this.sequences[sequenceKey].keyframes.length - 1) {
					let k2 = this.sequences[sequenceKey].keyframes[i + 1],
						c2t = (k2.p.t - k1.p.t) * easeRatio

					c2t = bound(c2t, Math.min(MIN_EASE, c2t), MAX_EASE)
					c2t = Math.round(c2t)
					k1.c2.t += c2t
				}
			})
		}
	}

}

function bound(x, min, max) {
	if (x < min) {
		x = min
	} else if (x > max) {
		x = max
	}
	return x
}