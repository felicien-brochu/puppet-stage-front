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
}
