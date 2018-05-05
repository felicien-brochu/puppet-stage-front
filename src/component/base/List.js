import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export default class List extends React.Component {

	static propTypes = {
		list: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
		itemValueKey: PropTypes.string.isRequired,
		itemKeyKey: PropTypes.string.isRequired,
		selectedItem: PropTypes.object,
		onSelect: PropTypes.func,
	}

	constructor(props) {
		super(props)

		this.handleClickOutside = this.handleClickOutside.bind(this)
		this.handleClick = this.handleClick.bind(this)
	}

	render() {
		return (
			<ul
				className="list"
				onClick={this.handleClickOutside}>
				{this.renderItems()}
			</ul>
		)
	}

	getKey(item) {
		return item[this.props.itemKeyKey]
	}

	getValue(item) {
		return item[this.props.itemValueKey]
	}

	renderItem(item) {
		let key = this.getKey(item)
		let selected =
			this.props.selectedItem &&
			key === this.getKey(this.props.selectedItem)

		let classes = classNames('list-item', {
			'selected': selected,
		})

		return (
			<li
				key={key}
				className={classes}
				onClick={(e) => this.handleClick(e, key)}
			>
				{this.getValue(item)}
			</li>
		)
	}

	renderItems() {
		let items = Object.entries(this.props.list).map((entry) => {
			return entry[1]
		})
		items.sort((a, b) => {
			let aVal = this.getValue(a),
				bVal = this.getValue(b)
			if (aVal > bVal) {
				return 1
			}
			if (aVal < bVal) {
				return -1
			}
			return 0
		})
		return items.map((item) => this.renderItem(item))
	}

	handleClick(e, key) {
		e.stopPropagation()
		if (typeof this.props.onSelect === 'function') {
			let selectedItem

			Object.entries(this.props.list).forEach(
				(entry) => {
					if (this.getKey(entry[1]) === key) {
						selectedItem = entry[1]
						return false
					}
				})
			this.props.onSelect(selectedItem)
		}
	}

	handleClickOutside() {
		if (typeof this.props.onSelect === 'function') {
			this.props.onSelect(null)
		}
	}
}