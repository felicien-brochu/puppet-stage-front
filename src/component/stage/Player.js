import {
	host
} from '../../util/api'
import units from '../../util/units'

export default class Player {
	constructor(puppetID, onCurrentTimeChange, onPlayStart, onPlayStop) {
		this.puppetID = puppetID
		this.started = false
		this.stopping = false

		this.onCurrentTimeChange = onCurrentTimeChange
		this.onPlayStart = onPlayStart
		this.onPlayStop = onPlayStop

		this.handleMessage = this.handleMessage.bind(this)
		this.handleOpen = this.handleOpen.bind(this)
		this.handleClose = this.handleClose.bind(this)
		this.handleError = this.handleError.bind(this)

		this.connect()

	}

	connect() {
		let wsPath = `ws://${host}/puppet/${this.puppetID}/player`
		this.websocket = new WebSocket(wsPath)

		this.websocket.onmessage = this.handleMessage
		this.websocket.onopen = this.handleOpen
		this.websocket.onclose = this.handleClose
		this.websocket.onerror = this.handleError
	}

	preview(stage, time) {
		if (this.websocket.readyState === 1 && !this.started) {
			this.websocket.send(JSON.stringify({
				type: 'preview',
				body: {
					time: time,
					stage: stage,
				}
			}))
		}
	}

	play(stage, time) {
		if (this.websocket.readyState === 1 && !this.started) {
			this.stopping = false
			this.websocket.send(JSON.stringify({
				type: 'play',
				body: {
					time: time,
					stage: stage,
				}
			}))
		}
	}

	stop() {
		if (this.websocket.readyState === 1 && this.started) {
			this.stopping = true
			this.websocket.send(JSON.stringify({
				type: 'stop',
			}))
		}
	}

	handleMessage(e) {
		if (e.data === 'start') {
			if (!this.started) {
				this.started = true
				this.onPlayStart()
			}
		} else if (e.data === 'stop') {
			if (this.started) {
				this.started = false
				this.onPlayStop()
			}
		} else if (!this.stopping && !isNaN(e.data - parseFloat(e.data))) {
			let t = Math.round(Math.round(e.data / units.FRAME_TIME) * units.FRAME_TIME)
			this.onCurrentTimeChange(t)
		}
	}

	handleOpen(e) {}

	handleClose(e) {
		if (this.started) {
			this.started = false
			this.onPlayStop()
		}
		console.warn("Player Websocket closed. Try to connect in 1s")
		window.setTimeout(this.connect.bind(this), 1000)
	}

	handleError(error) {
		console.error("Player websocket error:", error);
	}

}
