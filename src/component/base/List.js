import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class List extends React.Component {

	static propTypes = {
		list: PropTypes.array.isRequired,
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
		return this.props.list.map((item) => {
			return this.renderItem(item);
		});
	}

	handleClick(e, key) {
		e.stopPropagation();
		if (typeof this.props.onSelect === 'function') {
			let selectedItem;

			this.props.list.forEach(
				(item) => {
					if (this.getKey(item) === key) {
						selectedItem = item;
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
