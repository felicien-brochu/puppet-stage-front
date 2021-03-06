import units from '../../util/units'
import model from '../../util/model'

const SMOOTHING_DELAY = 40

export default class KeyframeHelper {

	static constructTranslationObject(stage, selectedKeyframes, targetKeyframe, scaleEnabled, clientX, clientY, modifyValue) {
		let
			mode = 'translate',
			initialKeyframes = KeyframeHelper.collectSelectedKeyframes(stage, selectedKeyframes),
			refTime = 0,
			refValue = 0,
			timeInterval = 0,
			valueInterval = 0,
			scaleTime = false,
			scaleValue = false

		let {
			minT,
			maxT,
			minV,
			maxV
		} = KeyframeHelper.getSelectionBoundaries(initialKeyframes, selectedKeyframes)

		let
			deltaTMin = -minT,
			deltaTMax = stage.duration - maxT,
			deltaVMin = -minV,
			deltaVMax = units.MAX_VALUE - maxV

		// Enable Translate Scale if Alt key is down and if the target keyframe is
		// the first or the last of selection. Store the fix point of
		// time for the scale in var refTime.
		if (scaleEnabled) {
			let keyframe = KeyframeHelper.getKeyframeFromRef(stage.sequences, targetKeyframe)
			let
				isMinT = keyframe.p.t === minT,
				isMaxT = keyframe.p.t === maxT,
				isMinV = keyframe.p.v === minV,
				isMaxV = keyframe.p.v === maxV

			scaleTime = isMinT || isMaxT
			scaleValue = modifyValue && (isMinV || isMaxV)
			if (scaleTime || scaleValue) {
				mode = 'scale'
			}

			if (scaleTime) {
				if (isMinT) {
					refTime = maxT
					timeInterval = minT - maxT
					deltaTMin = -minT
					deltaTMax = stage.duration - minT
				} else if (isMaxT) {
					refTime = minT
					timeInterval = maxT - minT
					deltaTMin = -maxT
					deltaTMax = stage.duration - maxT
				}
			}

			if (scaleValue) {
				if (isMinV) {
					refValue = maxV
					valueInterval = minV - maxV
					deltaVMin = -minV
					deltaVMax = units.MAX_VALUE - minV
				} else if (isMaxV) {
					refValue = minV
					valueInterval = maxV - minV
					deltaVMin = -maxV
					deltaVMax = units.MAX_VALUE - maxV
				}
			}
		}

		return {
			initialSelectedKeyframes: JSON.parse(JSON.stringify(selectedKeyframes)),
			initialKeyframes: initialKeyframes,
			modifyValue: modifyValue,
			clientX: clientX,
			clientY: clientY,
			refTime: refTime,
			refValue: refValue,
			timeInterval: timeInterval,
			valueInterval: valueInterval,
			mode: mode,
			deltaTMin: deltaTMin,
			deltaTMax: deltaTMax,
			deltaVMin: deltaVMin,
			deltaVMax: deltaVMax,
			lastDeltaT: 0,
			lastDeltaV: 0,
			hasChanged: false,
			scaleTime: scaleTime,
			scaleValue: scaleValue,
			scheduler: {
				timeoutID: NaN,
				pendingModification: {},
				lastModification: 0,
			},
		}
	}

	static applySmoothTranslation(stage, selectedKeyframes, translation, newClientX, newClientY, timeScale, valueScale) {
		let {
			scheduler,
		} = translation

		scheduler.pendingModification = {
			stage: stage,
			selectedKeyframes: selectedKeyframes,
			newClientX: newClientX,
			newClientY: newClientY,
			timeScale: timeScale,
			valueScale: valueScale,
		}

		if (isNaN(scheduler.timeoutID)) {
			return new Promise((resolve) => {
				let now = new Date().getTime()
				let delay = Math.max(SMOOTHING_DELAY - now + scheduler.lastModification, 0)
				scheduler.timeoutID = window.setTimeout(() => KeyframeHelper.applyTranslation(translation, resolve), delay)
			})
		}

		return Promise.reject()
	}


	static applyTranslation(translation, resolve) {
		let {
			initialKeyframes,
			clientX,
			clientY,
			refTime,
			refValue,
			timeInterval,
			valueInterval,
			mode,
			deltaTMin,
			deltaTMax,
			deltaVMin,
			deltaVMax,
			lastDeltaT,
			lastDeltaV,
			scaleTime,
			scaleValue,
			modifyValue,
			scheduler,
		} = translation

		let {
			stage,
			selectedKeyframes,
			newClientX,
			newClientY,
			timeScale,
			valueScale,
		} = scheduler.pendingModification

		let hasChanged = false
		let deltaT = (newClientX - clientX) * (1 / timeScale)
		deltaT = Math.round(deltaT / units.FRAME_TIME) * units.FRAME_TIME

		deltaT = Math.max(deltaT, deltaTMin)
		deltaT = Math.min(deltaT, deltaTMax)

		let deltaV = -(newClientY - clientY) * (1 / valueScale)
		deltaV = Math.max(deltaV, deltaVMin)
		deltaV = Math.min(deltaV, deltaVMax)

		if (deltaT !== lastDeltaT || (modifyValue && deltaV !== lastDeltaV)) {
			let stageKeyframes = new Map(JSON.parse(JSON.stringify([...initialKeyframes])))

			for (let [sequenceID, keyframes] of stageKeyframes) {
				if (mode === 'translate') {
					KeyframeHelper.translateKeyframesTime(keyframes, deltaT)
					if (modifyValue) {
						KeyframeHelper.translateKeyframesValue(keyframes, deltaV)
					}
				} else if (mode === 'scale') {
					if (scaleTime) {
						let scaleTimeFactor = 0
						if (timeInterval !== 0) {
							scaleTimeFactor = (timeInterval + deltaT) / timeInterval
						}
						KeyframeHelper.scaleKeyframesTime(keyframes, scaleTimeFactor, refTime)
					}
					if (scaleValue) {
						let scaleValueFactor = 0
						if (valueInterval !== 0) {
							scaleValueFactor = (valueInterval + deltaV) / valueInterval
						}
						KeyframeHelper.scaleKeyframesValue(keyframes, scaleValueFactor, refValue)
					}
				}
				KeyframeHelper.sortKeyframes(keyframes)
				KeyframeHelper.removeDoubleKeyframes(keyframes)
				KeyframeHelper.correctControlPoints(keyframes.keyframes)

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
			translation.lastDeltaV = deltaV
			translation.hasChanged = deltaT !== 0 || (modifyValue && deltaV !== 0)

			hasChanged = true
		}

		scheduler.timeoutID = NaN
		scheduler.lastModification = new Date().getTime()
		resolve({
			hasChanged: hasChanged,
			stage: stage,
			selectedKeyframes: selectedKeyframes,
		})
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

	static containsKeyframe(keyframes, keyframe) {
		let found = false
		for (let i = 0; i < keyframes.length; i++) {
			if (KeyframeHelper.equals(keyframes[i], keyframe)) {
				found = true
				break
			}
		}
		return found
	}

	static getKeyframeFromRef(sequences, keyframeRef) {
		let sequence = model.getBasicSequence(sequences, keyframeRef.sequenceID)
		return sequence.keyframes[keyframeRef.index]
	}

	static getSelectionBoundaries(stageKeyframes, selectedKeyframes) {
		let
			minT = Number.POSITIVE_INFINITY,
			maxT = Number.NEGATIVE_INFINITY,
			minV = Number.POSITIVE_INFINITY,
			maxV = Number.NEGATIVE_INFINITY

		for (let keyframe of selectedKeyframes) {
			for (let [sequenceID, keyframes] of stageKeyframes) {
				for (let i = 0; i < keyframes.keyframes.length; i++) {
					if (keyframe.sequenceID === sequenceID && keyframe.index === i) {
						minT = Math.min(minT, keyframes.keyframes[i].p.t)
						maxT = Math.max(maxT, keyframes.keyframes[i].p.t)
						minV = Math.min(minV, keyframes.keyframes[i].p.v)
						maxV = Math.max(maxV, keyframes.keyframes[i].p.v)
					}
				}
			}
		}

		return {
			minT: minT,
			maxT: maxT,
			minV: minV,
			maxV: maxV,
		}
	}

	static translateKeyframesTime(keyframes, deltaT) {
		for (let i = 0; i < keyframes.selected.length; i++) {
			if (keyframes.selected[i]) {
				let keyframe = keyframes.keyframes[i]
				keyframe.p.t += deltaT
				keyframe.p.t = Math.round(Math.round(keyframe.p.t / units.FRAME_TIME) * units.FRAME_TIME)
				keyframe.c1.t += deltaT
				keyframe.c1.t = Math.round(Math.round(keyframe.c1.t / units.FRAME_TIME) * units.FRAME_TIME)
				keyframe.c2.t += deltaT
				keyframe.c2.t = Math.round(Math.round(keyframe.c2.t / units.FRAME_TIME) * units.FRAME_TIME)
			}
		}
	}

	static translateKeyframesValue(keyframes, deltaV) {
		for (let i = 0; i < keyframes.selected.length; i++) {
			if (keyframes.selected[i]) {
				let keyframe = keyframes.keyframes[i]
				keyframe.p.v += deltaV
				keyframe.c1.v += deltaV
				keyframe.c2.v += deltaV
			}
		}
	}

	static scaleKeyframesTime(keyframes, scaleFactor, refTime) {
		for (let i = 0; i < keyframes.selected.length; i++) {
			if (keyframes.selected[i]) {
				let keyframe = keyframes.keyframes[i]
				keyframe.p.t = refTime + scaleFactor * (keyframe.p.t - refTime)
				keyframe.p.t = Math.round(Math.round(keyframe.p.t / units.FRAME_TIME) * units.FRAME_TIME)
				keyframe.c1.t = refTime + scaleFactor * (keyframe.c1.t - refTime)
				keyframe.c1.t = Math.round(keyframe.c1.t)
				keyframe.c2.t = refTime + scaleFactor * (keyframe.c2.t - refTime)
				keyframe.c2.t = Math.round(keyframe.c2.t)
			}
		}
	}

	static scaleKeyframesValue(keyframes, scaleFactor, refValue) {
		for (let i = 0; i < keyframes.selected.length; i++) {
			if (keyframes.selected[i]) {
				let keyframe = keyframes.keyframes[i]
				keyframe.p.v = refValue + scaleFactor * (keyframe.p.v - refValue)
				keyframe.c1.v = refValue + scaleFactor * (keyframe.c1.v - refValue)
				keyframe.c2.v = refValue + scaleFactor * (keyframe.c2.v - refValue)
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

	static correctControlPoints(keyframes) {
		for (let i = 0; i < keyframes.length; i++) {
			let keyframe = keyframes[i]

			if (i > 0) {
				let prevKeyframe = keyframes[i - 1]
				if (keyframe.c1.t < prevKeyframe.p.t) {
					let
						deltaT = keyframe.c1.t - keyframe.p.t,
						deltaV = keyframe.c1.v - keyframe.p.v,
						modifT = prevKeyframe.p.t - keyframe.p.t,
						modifRatio = modifT / deltaT

					keyframe.c1.t = prevKeyframe.p.t
					keyframe.c1.v = keyframe.p.v + modifRatio * deltaV
				}
			}

			if (i < keyframes.length - 1) {
				let nextKeyframe = keyframes[i + 1]
				if (keyframe.c2.t > nextKeyframe.p.t) {
					let
						deltaT = keyframe.c2.t - keyframe.p.t,
						deltaV = keyframe.c2.v - keyframe.p.v,
						modifT = nextKeyframe.p.t - keyframe.p.t,
						modifRatio = modifT / deltaT

					keyframe.c2.t = nextKeyframe.p.t
					keyframe.c2.v = keyframe.p.v + modifRatio * deltaV
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

	static collectKeyframes(sequences, keyframeRefs) {
		let sequenceRefs = []
		for (let keyframeRef of keyframeRefs) {
			let sequence = model.getBasicSequence(sequences, keyframeRef.sequenceID)
			let i = 0
			for (; i < sequenceRefs.length; i++) {
				if (sequenceRefs[i].sequenceID === sequence.id) {
					break
				}
			}
			if (i >= sequenceRefs.length) {
				sequenceRefs.push({
					sequenceID: sequence.id,
					keyframes: [],
				})
			}

			sequenceRefs[i].keyframes.push(sequence.keyframes[keyframeRef.index])
		}

		let flatSequences = model.getFlatBasicSequences(sequences)
		sequenceRefs.sort((a, b) => {
			let aIndex = 0,
				bIndex = 0
			for (var i = 0; i < flatSequences.length; i++) {
				if (flatSequences[i].id === a.sequenceID) {
					aIndex = i
				} else if (flatSequences[i].id === b.sequenceID) {
					bIndex = i
				}
			}

			return aIndex - bIndex
		})

		return sequenceRefs
	}

	static pasteKeyframes(sequences, selectedSequences, keyframes, t, stageDuration, selectedKeyframes) {
		if (selectedSequences.length === 0) {
			return
		}

		let flatSequences = model.getFlatBasicSequences(sequences)
		let sequenceIndices = []
		let min = Number.POSITIVE_INFINITY
		let max = Number.NEGATIVE_INFINITY

		for (let i = 0; i < keyframes.length; i++) {
			let index
			for (let j = 0; j < flatSequences.length; j++) {
				if (flatSequences[j].id === keyframes[i].sequenceID) {
					max = Math.max(max, j)
					min = Math.min(min, j)
					index = j
					break
				}
			}

			sequenceIndices.push(index)
		}

		let pasteSequenceIndex
		for (let i = 0; i < flatSequences.length; i++) {
			if (selectedSequences[0] === flatSequences[i].id) {
				pasteSequenceIndex = i
				break
			}
		}

		for (let i = 0; i < sequenceIndices.length; i++) {
			sequenceIndices[i] += pasteSequenceIndex - min
		}

		let minT = Number.POSITIVE_INFINITY
		for (let sequence of keyframes) {
			for (let keyframe of sequence.keyframes) {
				minT = Math.min(minT, keyframe.p.t)
			}
		}

		for (let i = 0; i < keyframes.length; i++) {
			let sequence = flatSequences[sequenceIndices[i]]
			let keyframesCopy = JSON.parse(JSON.stringify(keyframes[i].keyframes))
			let pastedSequence = {
				keyframes: [],
				selected: Array(sequence.keyframes.length).fill(false),
			}
			for (let j = 0; j < keyframesCopy.length; j++) {
				let keyframe = keyframesCopy[j]
				keyframe.p.t += -minT + t
				keyframe.c1.t += -minT + t
				keyframe.c2.t += -minT + t
				if (keyframe.p.t > stageDuration) {
					keyframesCopy.splice(j, 1)
					j--
					continue
				}
				pastedSequence.selected.push(true)
			}
			pastedSequence.keyframes = sequence.keyframes.concat(keyframesCopy)

			KeyframeHelper.sortKeyframes(pastedSequence)
			KeyframeHelper.removeDoubleKeyframes(pastedSequence)
			KeyframeHelper.correctControlPoints(pastedSequence.keyframes)

			// Update selected keyframes
			pastedSequence.selected.forEach((selected, index) => {
				if (selected) {
					selectedKeyframes.push({
						sequenceID: sequence.id,
						index: index,
					})
				}
			})

			sequence.keyframes = pastedSequence.keyframes
		}
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

	static getKeyframesSequenceIDs(keyframeRefs) {
		let ids = []
		for (let keyframeRef of keyframeRefs) {
			if (!ids.includes(keyframeRef.sequenceID)) {
				ids.push(keyframeRef.sequenceID)
			}
		}
		return ids
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
