import React from 'react'
import PropTypes from 'prop-types'
import {
	ContextMenuTrigger
} from 'react-contextmenu'


export default class BasicSequenceItem extends React.Component {

	static propTypes = {
		sequence: PropTypes.object.isRequired,
	}

	render() {
		return (

			<ContextMenuTrigger
				attributes={{
					className: "basic-sequence-list-item"
				}}
				id="basic-sequence-context-menu"
				collect={() => {
					return {
						sequence: this.props.sequence
					}
				}}
				renderTag="li"
			>
				{this.props.sequence.name}
			</ContextMenuTrigger>
		);
	}
}
