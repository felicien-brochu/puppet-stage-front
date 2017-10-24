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
		} = translation

		let deltaT = (newClientX - clientX) * (1 / timeScale)
		deltaT = Math.round(deltaT / units.FRAME_TIME) * units.FRAME_TIME

		deltaT = Math.max(deltaT, deltaMin)
		deltaT = Math.min(deltaT, deltaMax)

		if (deltaT !== 0) {
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

				let sequence = model.getBasicSequence(stage, sequenceID)
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
				let isMin = KeyframeHelper.equals(targetKeyframe, boundaries.minKeyframe)
				let isMax = KeyframeHelper.equals(targetKeyframe, boundaries.maxKeyframe)

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
		}
	}

	static getSelectionBoundaries(stageKeyframes, selectedKeyframes) {
		let
			minT = Number.MAX_VALUE,
			maxT = 0,
			minKeyframe,
			maxKeyframe

		for (let keyframe of selectedKeyframes) {
			for (let [sequenceID, keyframes] of stageKeyframes) {
				for (let i = 0; i < keyframes.keyframes.length; i++) {
					if (keyframe.sequenceID === sequenceID && keyframe.index === i) {
						if (minT > keyframes.keyframes[i].p.t) {
							minT = keyframes.keyframes[i].p.t
							minKeyframe = {
								sequenceID: sequenceID,
								index: i,
							}
						}
						if (maxT < keyframes.keyframes[i].p.t) {
							maxT = keyframes.keyframes[i].p.t
							maxKeyframe = {
								sequenceID: sequenceID,
								index: i,
							}
						}
					}
				}
			}
		}

		return {
			minT: minT,
			maxT: maxT,
			minKeyframe: minKeyframe,
			maxKeyframe: maxKeyframe,
		}
	}

	static translateKeyframes(keyframes, deltaT) {
		for (let i = 0; i < keyframes.selected.length; i++) {
			if (keyframes.selected[i]) {
				keyframes.keyframes[i].p.t += deltaT
				keyframes.keyframes[i].p.t = Math.round(keyframes.keyframes[i].p.t / units.FRAME_TIME) * units.FRAME_TIME
				keyframes.keyframes[i].c1.t += deltaT
				keyframes.keyframes[i].c1.t = Math.round(keyframes.keyframes[i].c1.t / units.FRAME_TIME) * units.FRAME_TIME
				keyframes.keyframes[i].c2.t += deltaT
				keyframes.keyframes[i].c2.t = Math.round(keyframes.keyframes[i].c2.t / units.FRAME_TIME) * units.FRAME_TIME
			}
		}
	}

	static scaleKeyframes(keyframes, scaleFactor, refTime) {
		for (let i = 0; i < keyframes.selected.length; i++) {
			if (keyframes.selected[i]) {
				keyframes.keyframes[i].p.t = refTime + scaleFactor * (keyframes.keyframes[i].p.t - refTime)
				keyframes.keyframes[i].p.t = Math.round(keyframes.keyframes[i].p.t / units.FRAME_TIME) * units.FRAME_TIME
				keyframes.keyframes[i].c1.t = refTime + scaleFactor * (keyframes.keyframes[i].c1.t - refTime)
				keyframes.keyframes[i].c1.t = Math.round(keyframes.keyframes[i].c1.t / units.FRAME_TIME) * units.FRAME_TIME
				keyframes.keyframes[i].c2.t = refTime + scaleFactor * (keyframes.keyframes[i].c2.t - refTime)
				keyframes.keyframes[i].c2.t = Math.round(keyframes.keyframes[i].c2.t / units.FRAME_TIME) * units.FRAME_TIME
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
			let sequence = model.getBasicSequence(stage, keyframe.sequenceID)
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
}
