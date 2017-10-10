import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class List extends React.Component {

	static propTypes = {
		list: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
		itemValueKey: PropTypes.string.isRequired,
		itemKeyKey: PropTypes.string.isRequired,
		selectedItem: PropTypes.object,
		onSelect: PropTypes.func,
	}

	render() {
		return (
			<ul
				className="list"
				onClick={() => this.handleClickOutside()}>
				{this.renderItems()}
			</ul>
		);
	}

	getKey(item) {
		return item[this.props.itemKeyKey];
	}

	getValue(item) {
		return item[this.props.itemValueKey];
	}

	renderItem(item) {
		let key = this.getKey(item)
		let selected =
			this.props.selectedItem &&
			key === this.getKey(this.props.selectedItem);

		let classes = classNames('list-item', {
			'selected': selected,
		});

		return (
			<li
				key={key}
				className={classes}
				onClick={(e) => this.handleClick(e, key)}
			>
				{this.getValue(item)}
			</li>
		);
	}

	renderItems() {
		return Object.entries(this.props.list).map((entry) => {
			return this.renderItem(entry[1]);
		});
	}

	handleClick(e, key) {
		e.stopPropagation();
		if (typeof this.props.onSelect === 'function') {
			let selectedItem;

			Object.entries(this.props.list).forEach(
				(entry) => {
					if (this.getKey(entry[1]) === key) {
						selectedItem = entry[1];
						return false;
					}
				});
			this.props.onSelect(selectedItem);
		}
	}

	handleClickOutside() {
		if (typeof this.props.onSelect === 'function') {
			this.props.onSelect(null);
		}
	}
};
