const PREVIEW_DURATION = 0.05

export default class AudioPlayer {
	constructor(buffer, context) {
		this.buffer = buffer
		this.context = context

		this.playPreview = this.playPreview.bind(this)
	}

	playPreview(from) {
		from /= 1e9
		if (from > this.buffer.duration) {
			return
		}

		let source = this.context.createBufferSource()
		source.buffer = this.buffer
		source.connect(this.context.destination)
		source.start(0, from, PREVIEW_DURATION)
	}

	play(from, stageDuration) {
		from /= 1e9
		if (from > this.buffer.duration) {
			return
		}

		this.source = this.context.createBufferSource()
		this.source.buffer = this.buffer
		this.source.connect(this.context.destination)
		this.source.start(0, from, (stageDuration / 1e9) - from)
	}

	stop() {
		if (this.source) {
			this.source.stop()
		}
	}
}
