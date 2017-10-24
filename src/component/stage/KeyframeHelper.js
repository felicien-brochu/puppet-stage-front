import units from '../../util/units'
import model from '../../util/model'

export default class KeyFrameHelper {

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
		return JSON.parse(JSON.stringify([...keyframes]))
	}
}
