import React from 'react'
import PropTypes from 'prop-types'

const AUDIO_SEQUENCE_HEIGHT = 30

export default class TimelineAudioSequence extends React.Component {
	static propTypes = {
		audioBuffer: PropTypes.object,
		timeline: PropTypes.shape({
			paddingLeft: PropTypes.number.isRequired,
			paddingRight: PropTypes.number.isRequired,
			start: PropTypes.number.isRequired,
			end: PropTypes.number.isRequired,
			width: PropTypes.number.isRequired,
		}).isRequired,
	}

	render() {
		return (
			<li className="timeline-audio-sequence">
				<canvas
					ref={canvas => this.canvas = canvas}
					width={this.props.timeline.width}
					height={AUDIO_SEQUENCE_HEIGHT}/>
			</li>
		)
	}



	shouldComponentUpdate(nextProps, nextState) {
		return (
			nextProps.audioBuffer !== this.props.audioBuffer ||
			nextProps.timeline.start !== this.props.timeline.start ||
			nextProps.timeline.end !== this.props.timeline.end ||
			nextProps.timeline.width !== this.props.timeline.width
		)
	}


	componentDidUpdate(prevProps, prevState) {
		this.drawWaveForm()
	}

	componentDidMount() {
		this.drawWaveForm()
	}

	drawWaveForm() {
		let {
			width,
			start,
			end,
			paddingLeft,
			paddingRight,
		} = this.props.timeline
		let timeScale = (end - start) / (width - paddingLeft - paddingRight)
		let audioDuration = this.props.audioBuffer.duration * 1e9
		let middle = AUDIO_SEQUENCE_HEIGHT / 2

		let channelData = this.props.audioBuffer.getChannelData(0)

		let ctx = this.canvas.getContext('2d')
		ctx.fillStyle = '#A6A6A6'
		ctx.clearRect(0, 0, width, AUDIO_SEQUENCE_HEIGHT)

		ctx.fillRect(0, middle, width, 1)

		for (let i = 0; i < width; i++) {
			let min = 1.0
			let max = -1.0

			let t = Math.round((i - paddingLeft) * timeScale + start)
			let nextT = Math.round((i + 1 - paddingLeft) * timeScale + start)
			let step = ((nextT - t) / 1e9) * this.props.audioBuffer.sampleRate

			if (t < 0 || t >= audioDuration) {
				min = 0
				max = 0
			} else {
				for (let j = 0; j < step; j++) {
					let datum = channelData[Math.floor((t / audioDuration) * channelData.length) + j]

					if (datum < min) {
						min = datum
					} else if (datum > max) {
						max = datum
					}
				}
			}

			ctx.fillRect(i, (1 + min) * middle, 1, (max - min) * middle + 1)
		}
	}
}
