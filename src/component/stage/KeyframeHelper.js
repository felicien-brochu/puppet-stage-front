import units from '../../util/units'
import model from '../../util/model'

export default class KeyframeHelper {

	static applyTranslation(stage, selectedKeyframes, translation, newClientX, timeScale) {
		let {
			initialKeyframes,
			clientX,
			refTime,
			refDuration,
			mode,
			deltaMin,
			deltaMax,
			lastDeltaT,
		} = translation

		let deltaT = (newClientX - clientX) * (1 / timeScale)
		deltaT = Math.round(deltaT / units.FRAME_TIME) * units.FRAME_TIME

		deltaT = Math.max(deltaT, deltaMin)
		deltaT = Math.min(deltaT, deltaMax)

		if (deltaT !== lastDeltaT) {
			let stageKeyframes = new Map(JSON.parse(JSON.stringify([...initialKeyframes])))

			for (let [sequenceID, keyframes] of stageKeyframes) {
				if (mode === 'translate') {
					KeyframeHelper.translateKeyframes(keyframes, deltaT)
				} else if (mode === 'scale') {
					let scaleFactor = (refDuration + deltaT) / refDuration
					KeyframeHelper.scaleKeyframes(keyframes, scaleFactor, refTime)
				}
				KeyframeHelper.sortKeyframes(keyframes)
				KeyframeHelper.removeDoubleKeyframes(keyframes)

				let sequence = model.getBasicSequence(stage.sequences, sequenceID)
				sequence.keyframes = keyframes.keyframes

				// Update selected keyframes
				keyframes.selected.forEach((selected, index) => {
					if (selected) {
						selectedKeyframes.push({
							sequenceID: sequenceID,
							index: index,
						})
					}
				})
			}

			translation.lastDeltaT = deltaT
			translation.hasChanged = deltaT !== 0
			return true
		}

		return false
	}

	static equals(keyframe1, keyframe2) {
		return keyframe1.sequenceID === keyframe2.sequenceID && keyframe1.index === keyframe2.index
	}

	static mergeSelectedKeyframes(selectedKeyframes, newKeyframes) {
		selectedKeyframes = Array.from(selectedKeyframes)
		newKeyframes = Array.from(newKeyframes)

		// Remove intersection
		for (let i = 0; i < selectedKeyframes.length; i++) {
			let keyframe = selectedKeyframes[i]
			for (let j = 0; j < newKeyframes.length; j++) {
				let newKeyframe = newKeyframes[j]
				if (keyframe.sequenceID === newKeyframe.sequenceID && keyframe.index === newKeyframe.index) {
					newKeyframes.splice(j, 1)
					selectedKeyframes.splice(i, 1)
					i--
					break
				}
			}
		}

		return selectedKeyframes.concat(newKeyframes)
	}

	static containsKeyframe(selectedKeyframes, newKeyframe) {
		let found = false
		for (let i = 0; i < selectedKeyframes.length; i++) {
			let keyframe = selectedKeyframes[i]
			if (keyframe.sequenceID === newKeyframe.sequenceID && keyframe.index === newKeyframe.index) {
				found = true
				break
			}
		}
		return found
	}

	static constructTranslationObject(stage, selectedKeyframes, targetKeyframe, scaleEnabled, clientX, clientY) {
		let
			mode = 'translate',
			initialKeyframes = KeyframeHelper.collectSelectedKeyframes(stage, selectedKeyframes),
			refTime = 0,
			refDuration = 0,
			boundaries = KeyframeHelper.getSelectionBoundaries(initialKeyframes, selectedKeyframes),
			deltaMin = -boundaries.minT,
			deltaMax = stage.duration - boundaries.maxT

		// Enable Translate Scale if Alt key is down and if the target keyframe is
		// the first or the last of selection. Store the fix point of
		// time for the scale in var refTime.
		if (scaleEnabled) {
			if (boundaries.minT !== boundaries.maxT) {
				let keyframe = KeyframeHelper.getKeyframeFromRef(stage.sequences, targetKeyframe)
				let isMin = keyframe.p.t === boundaries.minT
				let isMax = keyframe.p.t === boundaries.maxT

				if (isMin || isMax) {
					mode = 'scale'

					if (isMin) {
						refTime = boundaries.maxT
						refDuration = boundaries.minT - boundaries.maxT
						deltaMin = -boundaries.minT
						deltaMax = stage.duration - boundaries.minT
					} else if (isMax) {
						refTime = boundaries.minT
						refDuration = boundaries.maxT - boundaries.minT
						deltaMin = -boundaries.maxT
						deltaMax = stage.duration - boundaries.maxT
					}
				}
			}
		}

		return {
			initialSelectedKeyframes: JSON.parse(JSON.stringify(selectedKeyframes)),
			initialKeyframes: initialKeyframes,
			clientX: clientX,
			clientY: clientY,
			refTime: refTime,
			refDuration: refDuration,
			mode: mode,
			deltaMin: deltaMin,
			deltaMax: deltaMax,
			lastDeltaT: 0,
			hasChanged: false,
		}
	}

	static getKeyframeFromRef(sequences, keyframeRef) {
		let sequence = model.getBasicSequence(sequences, keyframeRef.sequenceID)
		return sequence.keyframes[keyframeRef.index]
	}

	static getSelectionBoundaries(stageKeyframes, selectedKeyframes) {
		let
			minT = Number.MAX_VALUE,
			maxT = 0

		for (let keyframe of selectedKeyframes) {
			for (let [sequenceID, keyframes] of stageKeyframes) {
				for (let i = 0; i < keyframes.keyframes.length; i++) {
					if (keyframe.sequenceID === sequenceID && keyframe.index === i) {
						if (minT > keyframes.keyframes[i].p.t) {
							minT = keyframes.keyframes[i].p.t
						}
						if (maxT < keyframes.keyframes[i].p.t) {
							maxT = keyframes.keyframes[i].p.t
						}
					}
				}
			}
		}

		return {
			minT: minT,
			maxT: maxT,
		}
	}

	static translateKeyframes(keyframes, deltaT) {
		for (let i = 0; i < keyframes.selected.length; i++) {
			if (keyframes.selected[i]) {
				keyframes.keyframes[i].p.t += deltaT
				keyframes.keyframes[i].p.t = Math.round(Math.round(keyframes.keyframes[i].p.t / units.FRAME_TIME) * units.FRAME_TIME)
				keyframes.keyframes[i].c1.t += deltaT
				keyframes.keyframes[i].c1.t = Math.round(Math.round(keyframes.keyframes[i].c1.t / units.FRAME_TIME) * units.FRAME_TIME)
				keyframes.keyframes[i].c2.t += deltaT
				keyframes.keyframes[i].c2.t = Math.round(Math.round(keyframes.keyframes[i].c2.t / units.FRAME_TIME) * units.FRAME_TIME)
			}
		}
	}

	static scaleKeyframes(keyframes, scaleFactor, refTime) {
		for (let i = 0; i < keyframes.selected.length; i++) {
			if (keyframes.selected[i]) {
				keyframes.keyframes[i].p.t = refTime + scaleFactor * (keyframes.keyframes[i].p.t - refTime)
				keyframes.keyframes[i].p.t = Math.round(Math.round(keyframes.keyframes[i].p.t / units.FRAME_TIME) * units.FRAME_TIME)
				keyframes.keyframes[i].c1.t = refTime + scaleFactor * (keyframes.keyframes[i].c1.t - refTime)
				keyframes.keyframes[i].c1.t = Math.round(Math.round(keyframes.keyframes[i].c1.t / units.FRAME_TIME) * units.FRAME_TIME)
				keyframes.keyframes[i].c2.t = refTime + scaleFactor * (keyframes.keyframes[i].c2.t - refTime)
				keyframes.keyframes[i].c2.t = Math.round(Math.round(keyframes.keyframes[i].c2.t / units.FRAME_TIME) * units.FRAME_TIME)
			}
		}
	}

	static sortKeyframes(keyframes) {
		let changed
		do {
			changed = false
			for (let i = 0; i < keyframes.keyframes.length - 1; i++) {
				let keyframe1 = keyframes.keyframes[i]
				let keyframe2 = keyframes.keyframes[i + 1]
				if (keyframe1.p.t > keyframe2.p.t) {
					keyframes.keyframes.splice(i, 2, keyframe2, keyframe1)
					keyframes.selected.splice(i, 2, keyframes.selected[i + 1], keyframes.selected[i])
					changed = true
				}
			}
		} while (changed)
	}

	static removeDoubleKeyframes(keyframes) {
		for (let i = 0; i < keyframes.keyframes.length - 1; i++) {
			if (keyframes.keyframes[i].p.t === keyframes.keyframes[i + 1].p.t) {
				if (keyframes.selected[i]) {
					keyframes.keyframes.splice(i + 1, 1)
					keyframes.selected.splice(i + 1, 1)
					i--
				} else {
					keyframes.keyframes.splice(i, 1)
					keyframes.selected.splice(i, 1)
				}
			}
		}
	}

	static collectSelectedKeyframes(stage, selectedKeyframes) {
		let keyframes = new Map()
		for (let keyframe of selectedKeyframes) {
			let sequence = model.getBasicSequence(stage.sequences, keyframe.sequenceID)
			if (!keyframes.has(keyframe.sequenceID)) {
				keyframes.set(keyframe.sequenceID, {
					keyframes: JSON.parse(JSON.stringify(sequence.keyframes)),
					selected: new Array(sequence.keyframes.length).fill(false),
				})
			}

			keyframes.get(keyframe.sequenceID).selected[keyframe.index] = true
		}
		return keyframes
	}

	static getCurrentTimeKeyframe(currentTime, sequence) {
		for (let i = 0; i < sequence.keyframes.length; i++) {
			if (sequence.keyframes[i].p.t === currentTime) {
				return {
					sequenceID: sequence.id,
					index: i,
				}
			}
		}
		return null
	}

	static indexOfTime(t, sequence) {
		let i = 0
		for (; i < sequence.keyframes.length; i++) {
			if (sequence.keyframes[i].p.t > t) {
				break
			}
		}
		return i
	}

	static getPrevKeyframes(currentTime, sequence) {
		let keyframes = []
		for (let i = 0; i < sequence.keyframes.length; i++) {
			if (sequence.keyframes[i].p.t < currentTime) {
				keyframes.push({
					sequenceID: sequence.id,
					index: i,
				})
			}
		}
		return keyframes
	}

	static getNextKeyframes(currentTime, sequence) {
		let keyframes = []
		for (let i = 0; i < sequence.keyframes.length; i++) {
			if (sequence.keyframes[i].p.t > currentTime) {
				keyframes.push({
					sequenceID: sequence.id,
					index: i,
				})
			}
		}
		return keyframes
	}

	static newBasicSequenceKeyframeAt(basicSequence, t) {
		let value = KeyframeHelper.getBasicSequenceValueAt(basicSequence, t)
		return {
			p: {
				t: t,
				v: value,
			},
			c1: {
				t: t,
				v: value,
			},
			c2: {
				t: t,
				v: value,
			},
		}
	}

	static getBasicSequenceValueAt(sequence, t) {
		let keyframes = sequence.keyframes
		if (keyframes.length === 0) {
			return sequence.defaultValue
		} else if (keyframes.length === 1) {
			return keyframes[0].p.v
		} else {
			if (t <= keyframes[0].p.t) {
				return keyframes[0].p.v
			} else if (t >= keyframes[keyframes.length - 1].p.t) {
				return keyframes[keyframes.length - 1].p.v
			} else {
				let keyframe1, keyframe2
				for (let i = 0; i < keyframes.length - 1; i++) {
					if (t <= keyframes[i + 1].p.t) {
						keyframe1 = keyframes[i]
						keyframe2 = keyframes[i + 1]
						break
					}
				}

				if (t === keyframe2.p.t) {
					return keyframe2.p.v
				} else {
					return Bezier.valueAt(t, keyframe1.p, keyframe1.c2, keyframe2.p, keyframe2.c1)
				}
			}
		}
	}
}

class Bezier {

	static valueAt(t, p1, c1, p2, c2) {
		let progress = 0.5
		let min = 0.
		let max = 1.
		let point

		while (true) {
			point = Bezier.progressPointAt(progress, p1, c1, p2, c2)
			if (Math.abs(point.t - t) < units.BEZIER_TIME_PRECISION) {
				break
			} else if (point.t < t) {
				min = progress
			} else {
				max = progress
			}
			progress = (max + min) / 2
		}
		return point.v
	}


	static progressPointAt(progress, p1, c1, p2, c2) {
		var a = Bezier.progressPoint(progress, p1, c1)
		var b = Bezier.progressPoint(progress, c1, c2)
		var c = Bezier.progressPoint(progress, c2, p2)
		var d = Bezier.progressPoint(progress, a, b)
		var e = Bezier.progressPoint(progress, b, c)
		return Bezier.progressPoint(progress, d, e)
	}

	static progressPoint(progress, a, b) {
		return {
			t: (b.t - a.t) * progress + a.t,
			v: (b.v - a.v) * progress + a.v,
		}
	}
}
