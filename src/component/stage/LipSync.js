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
	"X": 10, // Idle
	"A": 10, // Closed Mouth "P", "B", "M"
	"B": 10, // "K", "S", "T"...
	"C": 48, // "HE", "AE"
	"D": 65, // "AA",
	"E": 42, // "AO", "ER"
	"F": 25, // "OW", "W"
	"G": 24, // "F", "V"
	"H": 40, // Long "L"
}

const papagayoRhubarbMap = {
	"MBP": "A",
	"etc": "B",
	"E": "C",
	"AI": "D",
	"O": "E",
	"U": "E",
	"WQ": "F",
	"FV": "G",
	"L": "H",
	"rest": "X",
}

// const MAX_SPEED = 60 / (12 * units.FRAME_TIME)
const MAX_ACCELERATION = 60 / (30 * units.FRAME_TIME * units.FRAME_TIME)



export default class LipSync {

	static generateKeyframes(papagayoText) {
		let lines = papagayoText.split(/\r?\n/)
		let word = null
		let words = []

		for (let line of lines) {
			if (!line.startsWith("\t\t\t")) {
				continue
			}

			// Word line
			if (!line.startsWith("\t\t\t\t")) {
				word = LipSync.readPapagayoWord(line)
				words.push(word)
			}
			// Phoneme line
			else {
				let phone = LipSync.readPapagayoPhone(line)
				word.phones.push(phone)
			}
		}

		// Fix void space between words
		for (let i = 1; i < words.length; i++) {
			if (words[i].start - words[i - 1].end <= 0.011) {
				words[i - 1].end = words[i].start
			}
		}

		let mouthCues = []
		let lastT = 0
		let lastPhone

		for (let word of words) {
			lastPhone = null
			for (let phoneIndex = 0; phoneIndex < word.size; phoneIndex++) {
				let phone = word.phones[phoneIndex]
				// Insert silence
				if (phoneIndex === 0 && phone.start - lastT > 0) {
					mouthCues.push({
						value: papagayoRhubarbMap["rest"],
						start: lastT,
						end: phone.start,
					})
					lastT = phone.start
				}
				// Insert previous phone
				else if (phoneIndex > 0) {
					mouthCues.push({
						value: papagayoRhubarbMap[lastPhone.phone],
						start: lastT,
						end: phone.start,
					})
					lastT = phone.start
				}

				// Insert last phone
				if (phoneIndex === word.size - 1) {
					mouthCues.push({
						value: papagayoRhubarbMap[phone.phone],
						start: phone.start,
						end: word.end,
					})
					lastT = word.end
				}
				lastPhone = phone
			}
		}

		// Insert final rest mouth cue
		mouthCues.push({
			value: papagayoRhubarbMap["rest"],
			start: lastT,
			end: lastT + 0.1,
		})

		return LipSync.generateRhubarbKeyframes({
			mouthCues: mouthCues
		})
	}

	static readPapagayoWord(wordLine) {
		let results = /^\t\t\t(.+)\s(\d+)\s(\d+)\s(\d+)$/.exec(wordLine)
		return {
			word: results[1],
			start: results[2] / 100,
			end: results[3] / 100,
			size: results[4],
			phones: [],
		}
	}

	static readPapagayoPhone(phoneLine) {
		let results = /^\t\t\t\t(\d+)\s(.+)$/.exec(phoneLine)
		return {
			phone: results[2],
			start: results[1] / 100,
		}
	}

	static generateRhubarbKeyframes(rhubarbOutput) {
		let visemes = extractVisemesRhubarb(rhubarbOutput)
		let keyframes = []
		let lastP = null
		for (let viseme of visemes) {
			let p = {
				t: viseme.t,
				v: visemesValueRhubarb[viseme.type],
			}

			if (lastP && Math.abs((p.v - lastP.v) / Math.pow((p.t - lastP.t) / 2, 2)) < MAX_ACCELERATION) {
				let newP = {
					t: p.t - Math.round(2 * Math.sqrt(Math.abs(p.v - lastP.v) / MAX_ACCELERATION)),
					v: lastP.v,
				}

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

		// const easyEaseFactor = 4
		// // Easy ease
		// for (let i = 0; i < keyframes.length; i++) {
		// 	let min, max
		// 	if (i === 0) {
		// 		min = 0
		// 	} else {
		// 		min = keyframes[i - 1].p.t
		// 	}
		//
		// 	if (i === keyframes.length - 1) {
		// 		max = Number.POSITIVE_INFINITY
		// 	} else {
		// 		max = keyframes[i + 1].p.t
		// 	}
		//
		// 	let c1t = Math.max(Math.round(keyframes[i].p.t - (easyEaseFactor * units.FRAME_TIME)), min)
		// 	let c2t = Math.min(Math.round(keyframes[i].p.t + (easyEaseFactor * units.FRAME_TIME)), max)
		// 	keyframes[i].c1.t = c1t
		// 	keyframes[i].c2.t = c2t
		// }

		// Easy ease
		for (let i = 0; i < keyframes.length; i++) {
			let p0, p1, p2
			p1 = keyframes[i].p

			if (i === 0) {
				p0 = p1
			} else {
				p0 = keyframes[i - 1].p
			}

			if (i === keyframes.length - 1) {
				p2 = p1
			} else {
				p2 = keyframes[i + 1].p
			}

			const easyEaseFactor = 10
			let project1 = computeProjection(p0, p1, p2)
			keyframes[i].c1.t = Math.round(p1.t - (project1.ti / easyEaseFactor))
			keyframes[i].c1.v = p1.v - (project1.vi / easyEaseFactor)

			let project2 = computeProjection(p2, p1, p0)
			keyframes[i].c2.t = Math.round(p1.t - (project2.ti / easyEaseFactor))
			keyframes[i].c2.v = p1.v - (project2.vi / easyEaseFactor)

			let min, max
			if (i === 0) {
				min = 0
			} else {
				min = keyframes[i - 1].p.t + (keyframes[i].p.t - keyframes[i - 1].p.t) / 2
			}

			if (i === keyframes.length - 1) {
				max = Number.POSITIVE_INFINITY
			} else {
				max = keyframes[i + 1].p.t - (keyframes[i + 1].p.t - keyframes[i].p.t) / 2
			}

			let c1t = Math.round(Math.max(keyframes[i].c1.t - (4 * units.FRAME_TIME), min))
			let c2t = Math.round(Math.min(keyframes[i].c2.t + (4 * units.FRAME_TIME), max))
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

function extractVisemesRhubarb(rhubarbOutput) {
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


function computeProjection(p0, p1, p2) {
	let t1, v1, t2, v2
	t1 = p1.t - p0.t
	t2 = p2.t - p0.t
	v1 = p1.v - p0.v
	v2 = p2.v - p0.v

	let ti, vi, factor
	factor = (t2 * t1 + v2 * v1) / (t2 ** 2 + v2 ** 2)

	ti = factor * t2
	vi = factor * v2

	return {
		ti: ti,
		vi: vi,
	}
}