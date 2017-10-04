import React from 'react';
import PropTypes from 'prop-types';

export default class PuppetCreator extends React.Component {

	static propTypes = {
		onCreatePuppet: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props);

		this.state = {}
	}

	render() {
		return (
			<form className="puppet-creator" onSubmit={(e) => this.handleSubmit(e)}>
				<input type="text" ref={nameInput => this.nameInput = nameInput} name="name" required/>
				<input type="submit" value="New"/>
			</form>
		);
	}

	handleSubmit(e) {
		e.preventDefault();
		let name = this.nameInput.value;
		if (name.length > 0) {
			this.props.onCreatePuppet(name);
		}
	}
};
