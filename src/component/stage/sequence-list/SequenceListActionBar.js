import React from 'react'
import PropTypes from 'prop-types'
import SaveIndicator from './SaveIndicator'
import PlayerControl from './PlayerControl'
import ToggleButton from './ToggleButton'

export default class SequenceListActionBar extends React.Component {

	static propTypes = {
		saveState: PropTypes.oneOf(['saved', 'saving', 'modified', 'traveled']).isRequired,
		showGraph: PropTypes.bool.isRequired,
		currentTime: PropTypes.number.isRequired,
		stageDuration: PropTypes.number.isRequired,
		playing: PropTypes.bool.isRequired,

		onStartPlaying: PropTypes.func.isRequired,
		onStopPlaying: PropTypes.func.isRequired,
		onGoToTime: PropTypes.func.isRequired,
		onShowGraphChange: PropTypes.func.isRequired,
	}

	render() {
		return (
			<div className="sequence-list-action-bar">
				<SaveIndicator saveState={this.props.saveState}/>

				<PlayerControl
					playing={this.props.playing}
					currentTime={this.props.currentTime}
					stageDuration={this.props.stageDuration}

					onStartPlaying={this.props.onStartPlaying}
					onStopPlaying={this.props.onStopPlaying}
					onGoToTime={this.props.onGoToTime}/>

				<ToggleButton
					shape="#graph-button-shape"
					checked={this.props.showGraph}
					onChange={this.props.onShowGraphChange}/>
			</div>
		)
	}
}
