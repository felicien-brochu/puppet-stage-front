import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {
	ContextMenuTrigger
} from 'react-contextmenu'
import colorClasses from '../colorclasses'
import BasicSequenceItem from './BasicSequenceItem'
import ExpandButton from './ExpandButton'
import ToggleButton from './ToggleButton'


export default class DriverSequenceItem extends React.Component {

	static propTypes = {
		sequence: PropTypes.object.isRequired,
		currentTime: PropTypes.number.isRequired,

		onExpand: PropTypes.func.isRequired,
		onBasicSequenceChange: PropTypes.func.isRequired,
		onDriverSequenceChange: PropTypes.func.isRequired,
		onGoToKeyframe: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.handleExpand = this.handleExpand.bind(this)
		this.handlePreviewEnabledChange = this.handlePreviewEnabledChange.bind(this)
		this.handlePlayEnabledChange = this.handlePlayEnabledChange.bind(this)
	}

	render() {
		let previewEnabled = false
		for (let basicSequence of this.props.sequence.sequences) {
			if (basicSequence.previewEnabled) {
				previewEnabled = true
				break
			}
		}

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

					<ToggleButton
						shape="#eye-shape"
						checked={previewEnabled}
						onChange={this.handlePreviewEnabledChange}/>

					<ToggleButton
						shape="#point-shape"
						checked={this.props.sequence.playEnabled}
						onChange={this.handlePlayEnabledChange}/>

					<ExpandButton
						expanded={this.props.sequence.expanded}
						onExpand={this.handleExpand}
						disabled={this.props.sequence.sequences.length === 0}/>

					<span className={classNames("color-tile", colorClasses[this.props.sequence.color])}/>
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
					{this.props.sequence.sequences.map(this.renderBasicSequenceItem.bind(this))}
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
				sequence={basicSequence}
				currentTime={this.props.currentTime}
				onBasicSequenceChange={(basicSequence, save) => {this.props.onBasicSequenceChange(basicSequence, this.props.sequence, save)}}
				onGoToKeyframe={this.props.onGoToKeyframe}/>
		)
	}

	handleExpand(expanded) {
		if (typeof this.props.onExpand === 'function') {
			this.props.onExpand(this.props.sequence, expanded)
		}
	}

	handlePreviewEnabledChange(enabled) {
		let sequence = JSON.parse(JSON.stringify(this.props.sequence))

		for (let basicSequence of sequence.sequences) {
			basicSequence.previewEnabled = enabled
		}
		this.props.onDriverSequenceChange(sequence)
	}

	handlePlayEnabledChange(enabled) {
		let sequence = JSON.parse(JSON.stringify(this.props.sequence))
		sequence.playEnabled = enabled
		this.props.onDriverSequenceChange(sequence)
	}
}
