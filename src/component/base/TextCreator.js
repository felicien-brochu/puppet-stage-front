import React from 'react';
import PropTypes from 'prop-types';

export default class TextCreator extends React.Component {

	static propTypes = {
		onCreate: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props);

		this.state = {
			nameEmpty: true
		}
	}

	render() {
		return (
			<form className="puppet-creator" onSubmit={(e) => this.handleSubmit(e)}>
				<input
					type="text"
					ref={nameInput => this.nameInput = nameInput}
					onChange={() => this.handleChange()}
					placeholder="Name"
					name="name"
				/>
				<input
					type="submit"
					value="New"
					disabled={this.state.nameEmpty}
				/>
			</form>
		);
	}

	handleSubmit(e) {
		e.preventDefault();
		let name = this.nameInput.value;
		if (name.length > 0) {
			this.props.onCreate(name);
		}
		this.nameInput.value = "";
		this.handleChange();
	}

	handleChange() {
		let nameEmpty = !this.nameInput.value.length > 0;
		if (nameEmpty === !this.state.nameEmpty) {
			this.setState({
				nameEmpty: nameEmpty
			})
		}
	}
};
