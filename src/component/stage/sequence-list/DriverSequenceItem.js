import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import colorClasses from '../colorclasses'
import {
	ContextMenuTrigger
} from 'react-contextmenu'
import BasicSequenceItem from './BasicSequenceItem'
import ExpandButton from './ExpandButton'


export default class DriverSequenceItem extends React.Component {

	static propTypes = {
		sequence: PropTypes.object.isRequired,
		color: PropTypes.number.isRequired,
		onExpand: PropTypes.func,
	}

	constructor(props) {
		super(props)

		this.handleExpand = this.handleExpand.bind(this)
	}

	render() {
		return (
			<ContextMenuTrigger
				attributes={{
					className: "driver-sequence-list-item"
				}}
				id="driver-sequence-context-menu"
				collect={() => {
					return {
						sequence: this.props.sequence
					}
				}}
				renderTag="li"
			>
				<div className="driver-sequence-title">
					<ExpandButton
						expanded={this.props.sequence.expanded}
						onExpand={this.handleExpand}/>

					<span className={classNames("color-tile", colorClasses[this.props.color])}/>
					<span className="sequence-label">
						{this.props.sequence.name}
					</span>
				</div>
				{this.renderBasicSequenceList()}
			</ContextMenuTrigger>
		)
	}

	renderBasicSequenceList() {
		if (this.props.sequence.expanded && this.props.sequence.sequences.length > 0) {
			return (
				<ul className="basic-sequence-list">
					{this.props.sequence.sequences.map(this.renderBasicSequenceItem)}
				</ul>
			)
		} else {
			return null
		}
	}

	renderBasicSequenceItem(basicSequence) {
		return (
			<BasicSequenceItem
				key={basicSequence.id}
				sequence={basicSequence}/>
		)
	}

	handleExpand(expanded) {
		if (typeof this.props.onExpand === 'function') {
			this.props.onExpand(this.props.sequence, expanded)
		}
	}
}
