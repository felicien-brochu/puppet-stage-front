import React from 'react'
import PropTypes from 'prop-types'


export default class PlayerButton extends React.Component {

	static propTypes = {
		disabled: PropTypes.bool.isRequired,
		shape: PropTypes.string.isRequired,
		onClick: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.handleClick = this.handleClick.bind(this)
	}

	render() {
		return (
			<button
				className="player-button"
				onClick={this.handleClick}
				disabled={this.props.disabled}>
				<svg className="button-icon" x="0px" y="0px" viewBox="0 0 100 75">
					<use href={this.props.shape}/>
				</svg>
			</button>
		)
	}

	handleClick(e) {
		this.props.onClick(e)
		e.target.blur()
	}
}
