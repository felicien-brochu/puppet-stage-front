import React from 'react'
import PropTypes from 'prop-types'


export default class ExpandButton extends React.Component {

	static propTypes = {
		expanded: PropTypes.bool.isRequired,
		onExpand: PropTypes.func,
	}

	constructor(props) {
		super(props)

		this.handleChange = this.handleChange.bind(this)
	}

	render() {
		return (
			<label className="expand-button">
				<input
					type="checkbox"
					checked={this.props.expanded}
					onChange={this.handleChange}
				/>
				<svg className="arrow" x="0px" y="0px" viewBox="0 0 100 100">
					<use className="button-icon" href="#expand-button-shape"/>
				</svg>
			</label>
		)
	}

	handleChange(e) {
		if (typeof this.props.onExpand === 'function') {
			this.props.onExpand(e.target.checked)
		}
	}
}
