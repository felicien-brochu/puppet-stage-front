import React from 'react';
import PropTypes from 'prop-types';

export default class List extends React.Component {

	static propTypes = {
		list: PropTypes.array.isRequired,
		itemValueKey: PropTypes.string.isRequired,
		itemKeyKey: PropTypes.string.isRequired,
	}


	render() {
		return (
			<ul className="list">
				{this.renderItems()}
			</ul>
		);
	}

	renderItem(item) {
		return (
			<li key={item[this.props.itemKeyKey]}>
				{item[this.props.itemValueKey]}
			</li>
		);
	}

	renderItems() {
		return this.props.list.map((item) => {
			return this.renderItem(item);
		});
	}
};
