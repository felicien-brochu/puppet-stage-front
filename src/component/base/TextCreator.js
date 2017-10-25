import React from 'react'
import PropTypes from 'prop-types'

export default class TextCreator extends React.Component {

	static propTypes = {
		onCreate: PropTypes.func.isRequired,
		placeholder: PropTypes.string,
	}

	static defaultProps = {
		placeholder: "Name",
	}

	constructor(props) {
		super(props)

		this.state = {
			nameEmpty: true
		}

		this.handleSubmit = this.handleSubmit.bind(this)
		this.handleChange = this.handleChange.bind(this)
	}

	render() {
		return (
			<form className="puppet-creator" onSubmit={this.handleSubmit}>
				<input
					type="text"
					ref={textInput => this.textInput = textInput}
					onChange={this.handleChange}
					placeholder={this.props.placeholder}
				/>
				<input
					type="submit"
					value="New"
					disabled={this.state.nameEmpty}
				/>
			</form>
		)
	}

	handleSubmit(e) {
		e.preventDefault()
		let text = this.textInput.value
		if (text.length > 0) {
			this.props.onCreate(text)
		}
		this.textInput.value = ""
		this.handleChange()
	}

	handleChange() {
		let nameEmpty = !this.textInput.value.length > 0
		if (nameEmpty === !this.state.nameEmpty) {
			this.setState({
				nameEmpty: nameEmpty
			})
		}
	}
}
