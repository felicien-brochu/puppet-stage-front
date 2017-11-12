import units from '../../util/units'

const visemesValueAE = [
	50, // Neutral
	95, // Ah
	75, // D
	70, // Ee
	65, // F
	85, // L
	75, // M
	90, // Oh
	75, // R
	65, // S
	95, // Uh
	82, // W-Oo
	50, // Smile
	50, // Surprised
	50, // Kisz
]

// See https://github.com/DanielSWolf/rhubarb-lip-sync#mouth-shapes
const visemesValueRhubarb = {
	"X": 30, // Idle
	"A": 30, // Closed Mouth "P", "B", "M"
	"B": 59, // "K", "S", "T"...
	"C": 77, // "HE", "AE"
	"D": 90, // "AA",
	"E": 68, // "AO", "ER"
	"F": 30, // "OW", "W"
	"G": 44, // "F", "V"
	"H": 68, // Long "L"
}



export default class LipSync {

	static generateKeyframes(text) {
		let visemes = extractVisemesRhubarb(text)
		let keyframes = []
		let lastP = null
		for (let viseme of visemes) {
			let p = {
				t: viseme.t,
				v: visemesValueRhubarb[viseme.type],
			}

			if (lastP && p.t > lastP.t + 12 * units.FRAME_TIME) {
				let newP = {
					t: Math.round(p.t - (10 * units.FRAME_TIME)),
					v: lastP.v,
				}
				console.log("#########SUP", lastP);

				keyframes.push({
					p: newP,
					c1: JSON.parse(JSON.stringify(newP)),
					c2: JSON.parse(JSON.stringify(newP)),
				})
			}

			keyframes.push({
				p: p,
				c1: JSON.parse(JSON.stringify(p)),
				c2: JSON.parse(JSON.stringify(p)),
			})

			lastP = JSON.parse(JSON.stringify(p))
		}

		const easyEaseFactor = 4
		// Easy ease
		for (let i = 0; i < keyframes.length; i++) {
			let min, max
			if (i === 0) {
				min = 0
			} else {
				min = keyframes[i - 1].p.t
			}

			if (i === keyframes.length - 1) {
				max = Number.POSITIVE_INFINITY
			} else {
				max = keyframes[i + 1].p.t
			}

			let c1t = Math.max(Math.round(keyframes[i].p.t - (easyEaseFactor * units.FRAME_TIME)), min)
			let c2t = Math.min(Math.round(keyframes[i].p.t + (easyEaseFactor * units.FRAME_TIME)), max)
			keyframes[i].c1.t = c1t
			keyframes[i].c2.t = c2t
		}

		return keyframes
	}

	static generateKeyframesAE(text) {
		let visemes = extractVisemesAE(text)
		let keyframes = []
		let lastP = null
		for (let viseme of visemes) {
			let p = {
				t: Math.round(units.FRAME_TIME * viseme.t),
				v: visemesValueAE[viseme.type],
			}

			if (lastP && p.t > lastP.t + 6 * units.FRAME_TIME) {
				let newP = {
					t: Math.round(p.t - (5 * units.FRAME_TIME)),
					v: lastP.v,
				}
				console.log("#########SUP", lastP);

				keyframes.push({
					p: newP,
					c1: newP,
					c2: newP,
				})
			}

			keyframes.push({
				p: p,
				c1: p,
				c2: p,
			})

			lastP = p
		}

		return keyframes
	}
}

function extractVisemesRhubarb(json) {
	let rhubarbOutput = JSON.parse(json)
	let visemes = []

	for (let viseme of rhubarbOutput.mouthCues) {
		visemes.push({
			t: Math.round(1e9 * viseme.start),
			type: viseme.value,
		})
	}

	return visemes
}

function extractVisemesAE(text) {
	let lines = text.split('\n')
	let start = -1

	for (let i = 0; i < lines.length; i++) {
		if (lines[i] === '\tFrame\t\t') {
			start = i
			break
		}
	}

	if (start < 0) {
		return []
	}

	const lineRegExp = /^\t([0-9]+)\t([0-9]+)\t$/
	let visemes = []
	for (let i = start + 1; i < lines.length; i++) {
		let line = lines[i]
		let matches = line.match(lineRegExp)

		if (matches === null) {
			break
		}

		visemes.push({
			t: Math.round(matches[1]),
			type: Math.round(matches[2]),
		})
	}

	return visemes
}
