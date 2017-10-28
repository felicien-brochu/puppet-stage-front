import React from 'react'
import PropTypes from 'prop-types'


export default class ToggleButton extends React.Component {

	static propTypes = {
		checked: PropTypes.bool.isRequired,
		shape: PropTypes.string.isRequired,
		onChange: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.handleChange = this.handleChange.bind(this)
	}

	render() {
		return (
			<label className="toggle-button">
				<input
					type="checkbox"
					checked={this.props.checked}
					onChange={this.handleChange}
				/>
				<svg className="button-icon" x="0px" y="0px" viewBox="0 0 100 100">
					<use href={this.props.shape}/>
				</svg>
			</label>
		)
	}

	handleChange(e) {
		if (typeof this.props.onChange === 'function') {
			this.props.onChange(e.target.checked)
		}
	}
}
