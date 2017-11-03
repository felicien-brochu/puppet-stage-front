import React from 'react'
import PropTypes from 'prop-types'
import units from '../../../util/units'
import PlayerButton from './PlayerButton'

export default class PlayerControl extends React.Component {

	static propTypes = {
		currentTime: PropTypes.number.isRequired,
		stageDuration: PropTypes.number.isRequired,
		playing: PropTypes.bool.isRequired,

		onStartPlaying: PropTypes.func.isRequired,
		onStopPlaying: PropTypes.func.isRequired,
		onGoToTime: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.handleGoToStart = this.handleGoToStart.bind(this)
		this.handleGoToEnd = this.handleGoToEnd.bind(this)
		this.handleGoToPrevFrame = this.handleGoToPrevFrame.bind(this)
		this.handleGoToNextFrame = this.handleGoToNextFrame.bind(this)
		this.handlePlayStopClick = this.handlePlayStopClick.bind(this)
	}

	render() {
		return (
			<div className="player-control">
				<PlayerButton
					shape="#first-frame-button-shape"
					disabled={this.props.currentTime <= 0}
					onClick={this.handleGoToStart}/>
				<PlayerButton
					shape="#prev-frame-button-shape"
					disabled={this.props.currentTime <= 0}
					onClick={this.handleGoToPrevFrame}/>
				<PlayerButton
					shape={this.props.playing ? "#stop-button-shape" : "#play-button-shape"}
					disabled={this.props.currentTime >= this.props.stageDuration}
					onClick={this.handlePlayStopClick}/>
				<PlayerButton
					shape="#next-frame-button-shape"
					disabled={this.props.currentTime >= this.props.stageDuration}
					onClick={this.handleGoToNextFrame}/>
				<PlayerButton
					shape="#last-frame-button-shape"
					disabled={this.props.currentTime >= this.props.stageDuration}
					onClick={this.handleGoToEnd}/>
			</div>
		)
	}

	handleGoToStart(e) {
		this.props.onGoToTime(0)
	}
	handleGoToEnd(e) {
		this.props.onGoToTime(this.props.stageDuration)
	}
	handleGoToPrevFrame(e) {
		let t = Math.round((Math.round(this.props.currentTime / units.FRAME_TIME) - 1) * units.FRAME_TIME)
		this.props.onGoToTime(t)
	}
	handleGoToNextFrame(e) {
		let t = Math.round((Math.round(this.props.currentTime / units.FRAME_TIME) + 1) * units.FRAME_TIME)
		this.props.onGoToTime(t)
	}
	handlePlayStopClick(e) {
		if (this.props.playing) {
			this.props.onStopPlaying()
		} else {
			this.props.onStartPlaying()
		}
	}
}
