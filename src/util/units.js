const FRAME_TIME = 1e9 / 60

class Units {
	static FRAME_TIME = 1e9 / 60
	static BEZIER_TIME_PRECISION = 1
	static MIN_PX_BY_TIME_INTERVAL = 60
	static MIN_PX_BY_TIME_INTER_INTERVAL = 40
	static MIN_PX_BY_PERCENT_INTERVAL = 30

	static TIME_INTERVALS = [{
		interval: FRAME_TIME, // 1 frame
		format: frameFormat,
	}, {
		interval: 2 * FRAME_TIME,
		format: frameFormat,
	}, {
		interval: 5 * FRAME_TIME,
		format: frameFormat,
	}, {
		interval: 10 * FRAME_TIME,
		format: frameFormat,
	}, {
		interval: 15 * FRAME_TIME,
		format: frameFormat,
	}, {
		interval: 20 * FRAME_TIME,
		format: frameFormat,
	}, {
		interval: 30 * FRAME_TIME,
		format: frameFormat,
	}, {
		interval: 1e9,
		format: frameFormat,
	}, {
		interval: 2e9,
		format: frameFormat,
	}, {
		interval: 5e9,
		format: secondFormat,
	}, {
		interval: 10e9,
		format: secondFormat,
	}, {
		interval: 20e9,
		format: secondFormat,
	}, {
		interval: 30e9,
		format: secondFormat,
	}, {
		interval: 60e9,
		format: secondFormat,
	}, {
		interval: 120e9,
		format: secondFormat,
	}, {
		interval: 300e9,
		format: secondFormat,
	}, {
		interval: 600e9,
		format: secondFormat,
	}, {
		interval: 1200e9,
		format: secondFormat,
	}, {
		interval: 1800e9,
		format: secondFormat,
	}, {
		interval: 3600e9,
		format: secondFormat,
	}, ]

	static PERCENT_INTERVALS = [{
		interval: 0.01, // 1 frame
		format: percentFormat,
	}, {
		interval: 0.02, // 1 frame
		format: percentFormat,
	}, {
		interval: 0.1, // 1 frame
		format: percentFormat,
	}, {
		interval: 0.2, // 1 frame
		format: percentFormat,
	}, {
		interval: 1, // 1 frame
		format: percentFormat,
	}, {
		interval: 5, // 1 frame
		format: percentFormat,
	}, {
		interval: 10, // 1 frame
		format: percentFormat,
	}, {
		interval: 20, // 1 frame
		format: percentFormat,
	}, ]

	static chooseTimeUnit(width, start, end) {
		let intervals = Units.TIME_INTERVALS
		let unit = intervals[intervals.length - 1]
		let scale = width / (end - start)

		for (let interval of intervals) {
			let unitWidth = interval.interval * scale
			if (unitWidth >= Units.MIN_PX_BY_TIME_INTERVAL) {
				unit = interval
				break
			}
		}

		let formatter = unit.format
		unit = JSON.parse(JSON.stringify(unit))
		unit.format = formatter
		let unitWidth = unit.interval * scale
		unit.showInterIntervals = (unitWidth >= Units.MIN_PX_BY_TIME_INTER_INTERVAL * 2)

		return unit
	}

	static choosePercentUnit(width, start, end) {
		let intervals = Units.PERCENT_INTERVALS
		let unit = intervals[intervals.length - 1]
		let scale = width / (end - start)

		for (let interval of intervals) {
			let unitWidth = interval.interval * scale
			if (unitWidth >= Units.MIN_PX_BY_PERCENT_INTERVAL) {
				unit = interval
				break
			}
		}

		let formatter = unit.format
		unit = JSON.parse(JSON.stringify(unit))
		unit.format = formatter

		return unit
	}
}


const intFormatter = new Intl.NumberFormat('en-US', {
	minimumIntegerDigits: 2,
})

function frameFormat(t) {
	let s = Math.floor(t / 1e9)
	let f = (t - s * 1e9) / FRAME_TIME
	return `${intFormatter.format(s)}:${intFormatter.format(f)}f`
}

function secondFormat(t) {
	let m = Math.floor(t / 60e9)
	let s = Math.floor((t - m * 60e9) / 1e9)
	return `${intFormatter.format(m)}:${intFormatter.format(s)}s`
}

function percentFormat(x) {
	let pow = 0
	for (let i = 0; i < 10; i++) {
		if (this.interval >= Math.pow(10, 1 - i)) {
			pow = 1 - i
			break
		}
	}
	let nbFraction = Math.max(-pow, 0)
	const intFormatter = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: nbFraction,
	})
	return intFormatter.format(x)
}

export default Units
