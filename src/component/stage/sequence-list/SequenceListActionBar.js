import React from 'react'
import PropTypes from 'prop-types'
import SaveIndicator from './SaveIndicator'

export default class SequenceListActionBar extends React.Component {

	static propTypes = {
		saveState: PropTypes.oneOf(['saved', 'saving', 'modified', 'traveled']).isRequired,
	}

	render() {
		return (
			<div className="sequence-list-action-bar">
				<SaveIndicator saveState={this.props.saveState}/>
					</div>
		)
	}
}
