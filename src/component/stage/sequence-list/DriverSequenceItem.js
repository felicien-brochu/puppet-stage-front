import React from 'react'
import PropTypes from 'prop-types'
import {
	ContextMenuTrigger
} from 'react-contextmenu'
import BasicSequenceItem from './BasicSequenceItem'


export default class DriverSequenceItem extends React.Component {

	static propTypes = {
		sequence: PropTypes.object.isRequired,
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
					{this.props.sequence.name}
				</div>
				{this.renderBasicSequenceList()}
			</ContextMenuTrigger>
		);
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
}
