import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const KEYFRAME_WIDTH = 11.3

export default class SequenceBox extends React.Component {
	static propTypes = {
		sequence: PropTypes.object,
		start: PropTypes.number,
		duration: PropTypes.number,
		timeline: PropTypes.shape({
			paddingLeft: PropTypes.number.isRequired,
			paddingRight: PropTypes.number.isRequired,
			start: PropTypes.number.isRequired,
			end: PropTypes.number.isRequired,
			width: PropTypes.number.isRequired,
		}).isRequired,
		renderTag: PropTypes.oneOfType([
			PropTypes.node,
			PropTypes.func
		]),
		height: PropTypes.number.isRequired,
		disabled: PropTypes.bool,
		attributes: PropTypes.object,
		selectedKeyframes: PropTypes.array,
		selectingKeyframes: PropTypes.array,

		onKeyframeMouseDown: PropTypes.func,
	}

	static defaultProps = {
		renderTag: "div",
		disabled: false,
		attributes: {},
	}

	constructor(props) {
		super(props)

		this.container = null
		this.keyframes = []
		this.initAttributes(props)

		this.getSelectingKeyframes = this.getSelectingKeyframes.bind(this)
		this.handleKeyframeMouseDown = this.handleKeyframeMouseDown.bind(this)
	}

	componentWillReceiveProps(nextProps) {
		this.initAttributes(nextProps)
	}

	initAttributes(props) {
		this.selectedKeyframes = []
		this.selectingKeyframes = []
		if (props.sequence && props.selectedKeyframes && props.selectingKeyframes) {
			for (let keyframe of props.selectedKeyframes) {
				if (keyframe.sequenceID === props.sequence.id) {
					this.selectedKeyframes.push(keyframe)
				}
			}
			for (let keyframe of props.selectingKeyframes) {
				if (keyframe.sequenceID === props.sequence.id) {
					this.selectingKeyframes.push(keyframe)
				}
			}
		}
	}

	render() {
		const {
			timeline,
			sequence,
			renderTag,
			attributes,
			start,
			duration
		} = this.props

		let seqStart = start
		let seqDuration = duration
		if (sequence) {
			seqStart = sequence.start
			seqDuration = sequence.duration
		}

		let scale = timeline.getScale()
		let marginLeft = timeline.paddingLeft + ((seqStart - timeline.start) * scale)
		let width = seqDuration * scale

		let keyframes = this.renderKeyFrames()

		let box = (
			<svg className="sequence-box-box"
				ref={container => this.container = container}>
				<rect x={marginLeft} y={0} width={width} height={this.props.height-1}/>
				{keyframes}
			</svg>
		)

		const newAttrs = {
			...attributes,
			style: {},
			className: classNames("sequence-box", attributes.className),
		}
		return React.createElement(renderTag, newAttrs, box)
	}

	renderKeyFrames() {
		const {
			sequence,
		} = this.props

		if (sequence && sequence.keyframes) {
			let keyframes = new Array(sequence.keyframes.length)
			let insertI = 0,
				insertSelectedI = sequence.keyframes.length
			for (let i = 0; i < sequence.keyframes.length; i++) {
				let keyframe = sequence.keyframes[i]
				let selected = this.isKeyframeSelected(i)
				let href
				if (i === 0) {
					if (i === sequence.keyframes.length - 1) {
						href = '#keyframe-shape'
					} else {
						href = '#keyframe-start-shape'
					}
				} else if (i === sequence.keyframes.length - 1) {
					href = '#keyframe-end-shape'
				} else {
					href = '#keyframe-shape'
				}

				let keyframeView = this.renderKeyframe(keyframe.p.t, i, selected, href)

				if (selected) {
					keyframes[insertSelectedI] = keyframeView
					insertSelectedI--
				} else {
					keyframes[insertI] = keyframeView
					insertI++
				}
			}
			return keyframes
		}

		return []
	}

	renderKeyframe(t, i, selected, href) {
		let timeline = this.props.timeline
		let x = timeline.paddingLeft + ((t - timeline.start) * timeline.getScale())
		let className = classNames("keyframe-diamond", {
			selected: selected,
		})
		return (
			<use
				href={href}
				className={className}
				key={i}
				ref={keyframe => this.keyframes[i] = keyframe}
				onMouseDown={this.handleKeyframeMouseDown}
				x={x}
				y={this.props.height / 2}
		/>
		)
	}

	isKeyframeSelected(i) {
		let selected = false
		for (let selectedKeyframe of this.selectedKeyframes) {
			if (selectedKeyframe.index === i) {
				selected = true
				break
			}
		}

		let selecting = false
		for (let selectingKeyframe of this.selectingKeyframes) {
			if (selectingKeyframe.index === i) {
				selecting = true
				break
			}
		}
		return (!selected && selecting) || (selected && !selecting)
	}

	handleKeyframeMouseDown(i, e) {
		if (typeof this.props.onKeyframeMouseDown === 'function') {
			this.props.onKeyframeMouseDown(e, {
				sequenceID: this.props.sequence.id,
				index: i,
			})
		}
		e.stopPropagation()
		e.preventDefault()
	}

	getSelectingKeyframes(selectionRect) {
		let keyframes = []
		let container = this.container.getBoundingClientRect()

		if (this.props.sequence && this.props.sequence.keyframes && this.props.sequence.keyframes.length > 0 && container.y <= selectionRect.y + selectionRect.height &&
			container.y + container.height >= selectionRect.y &&
			container.x <= selectionRect.x + selectionRect.width &&
			container.x + container.width >= selectionRect.x) {

			for (let i = 0; i < this.props.sequence.keyframes.length; i++) {
				let keyframe = this.keyframes[i]

				let keyframeRect = {
					x: container.x + keyframe.x.baseVal.value - (KEYFRAME_WIDTH / 2),
					y: container.y,
					width: KEYFRAME_WIDTH,
					height: container.height,
				}

				if (keyframeRect.y > selectionRect.y + selectionRect.height ||
					keyframeRect.y + keyframeRect.height < selectionRect.y ||
					keyframeRect.x > selectionRect.x + selectionRect.width ||
					keyframeRect.x + keyframeRect.width < selectionRect.x) {
					continue
				}
				keyframes.push({
					sequenceID: this.props.sequence.id,
					index: i,
				})
			}
		}
		return keyframes
	}
}
