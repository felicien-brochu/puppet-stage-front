import React from 'react'
import PropTypes from 'prop-types'
import SaveIndicator from './SaveIndicator'
import ToggleButton from './ToggleButton'

export default class SequenceListActionBar extends React.Component {

	static propTypes = {
		saveState: PropTypes.oneOf(['saved', 'saving', 'modified', 'traveled']).isRequired,
		showGraph: PropTypes.bool.isRequired,

		onShowGraphChange: PropTypes.func.isRequired,
	}

	render() {
		return (
			<div className="sequence-list-action-bar">
				<SaveIndicator saveState={this.props.saveState}/>
				<ToggleButton
					shape="#graph-button-shape"
					checked={this.props.showGraph}
					onChange={this.props.onShowGraphChange}/>
			</div>
		)
	}
}
