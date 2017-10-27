import React from 'react'
import PropTypes from 'prop-types'


export default class KeyframeNavigator extends React.Component {

	static propTypes = {
		currentTimeKeyframe: PropTypes.object,
		prevKeyframes: PropTypes.array.isRequired,
		nextKeyframes: PropTypes.array.isRequired,

		onGoToNextKeyframe: PropTypes.func.isRequired,
		onGoToPrevKeyframe: PropTypes.func.isRequired,
		onRemoveKeyframe: PropTypes.func.isRequired,
		onCreateKeyframe: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.handleChange = this.handleChange.bind(this)
	}

	render() {
		return (
			<div className="keyframe-navigator">

				<button
					className="svg-button"
					disabled={this.props.prevKeyframes.length === 0}
					onClick={this.props.onGoToPrevKeyframe}>
					<svg x="0px" y="0px" viewBox="5 0 90 100">
						<use className="button-icon" href="#arrow-left-button-shape"/>
					</svg>
				</button>

				<label className="keyframe-button">
					<input
						type="checkbox"
						checked={this.props.currentTimeKeyframe !== null}
						onChange={this.handleChange}
					/>
					<svg className="keyframe-shape" x="0px" y="0px" viewBox="0 0 100 100">
						<use className="button-icon" href="#keyframe-button-shape"/>
					</svg>
				</label>

				<button
					className="svg-button"
					disabled={this.props.nextKeyframes.length === 0}
					onClick={this.props.onGoToNextKeyframe}>
					<svg x="0px" y="0px" viewBox="0 0 85 100">
						<use className="button-icon" href="#arrow-right-button-shape"/>
					</svg>
				</button>

			</div>
		)
	}

	handleChange(e) {
		let checked = e.target.checked
		if (checked) {
			this.props.onCreateKeyframe()
		} else {
			this.props.onRemoveKeyframe()
		}
	}
}
