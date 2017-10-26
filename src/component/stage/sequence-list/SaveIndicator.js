import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class SaveIndicator extends React.Component {

	static propTypes = {
		saveState: PropTypes.oneOf(['saved', 'saving', 'modified', 'traveled']).isRequired,
	}

	render() {
		let saveState = this.props.saveState
		let className = classNames("save-indicator", {
			saved: saveState === 'saved',
			saving: saveState === 'saving',
			modified: saveState === 'modified' || saveState === 'traveled',
		})
		return (
			<div className={className}>
				<span className="circle"/>
			</div>
		)
	}
}
