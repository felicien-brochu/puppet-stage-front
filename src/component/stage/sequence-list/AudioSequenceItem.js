import React from 'react'
import PropTypes from 'prop-types'
import ToggleButton from './ToggleButton'

export default class AudioSequenceItem extends React.Component {
	static propTypes = {
		mute: PropTypes.bool.isRequired,
		fileName: PropTypes.string.isRequired,

		onMuteChange: PropTypes.func,
	}

	constructor(props) {
		super(props)

		this.handleMuteChange = this.handleMuteChange.bind(this)
	}

	render() {
		return (
			<li className="audio-sequence-item">
				<ToggleButton
					shape="#sound-shape"
					checked={!this.props.mute}
					onChange={this.handleMuteChange}/>

				<span className="audio-sequence-label">
					{this.props.fileName.substring(37)}
				</span>
			</li>
		)
	}

	handleMuteChange(checked) {
		this.props.onMuteChange(!checked)
	}
}
