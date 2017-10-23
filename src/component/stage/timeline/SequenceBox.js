import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const KEYFRAME_WIDTH = 8

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

		onSelectKeyframe: PropTypes.func,
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

		let keyframes = []
		if (sequence && sequence.curves) {
			for (let i = 0; i < sequence.curves.length; i++) {
				let curve = sequence.curves[i]
				let href = i === 0 ? '#keyframe-start-shape' : '#keyframe-shape'
				keyframes.push(this.renderKeyframe(curve.p1.t, i, href))

				// The last keyframe is also in the last curve
				if (i === sequence.curves.length - 1) {
					keyframes.push(this.renderKeyframe(curve.p2.t, i + 1, '#keyframe-end-shape'))
				}
			}
		}

		return keyframes
	}

	renderKeyframe(t, i, href) {
		let timeline = this.props.timeline
		let x = timeline.paddingLeft + ((t - timeline.start) * timeline.getScale())
		return (
			<use
				href={href}
				className={classNames("keyframe-diamond", {
					selected: this.isKeyframeSelected(i)
				})}
				key={i}
				ref={keyframe => this.keyframes[i] = keyframe}
				onMouseDown={(e) => this.handleSelectKeyframe(i, e)}
				x={x}
				y={this.props.height / 2}
		/>
		)
	}

	isKeyframeSelected(i) {
		let selected = false
		for (let selectedKeyframe of this.selectedKeyframes) {
			if (selectedKeyframe.keyframe === i) {
				selected = true
				break
			}
		}

		let selecting = false
		for (let selectingKeyframe of this.selectingKeyframes) {
			if (selectingKeyframe.keyframe === i) {
				selecting = true
				break
			}
		}
		return (!selected && selecting) || (selected && !selecting)
	}

	handleSelectKeyframe(i, e) {
		if (typeof this.props.onSelectKeyframe === 'function') {
			this.props.onSelectKeyframe({
				sequenceID: this.props.sequence.id,
				keyframe: i,
			}, e.shiftKey || e.ctrlKey)

			e.stopPropagation()
		}
	}

	getSelectingKeyframes(selectionRect) {
		if (!this.props.sequence || !this.props.sequence.curves || this.props.sequence.curves.length === 0) {
			return []
		}

		let container = this.container.getBoundingClientRect()

		if (container.y > selectionRect.y + selectionRect.height ||
			container.y + container.height < selectionRect.y ||
			container.x > selectionRect.x + selectionRect.width ||
			container.x + container.width < selectionRect.x) {
			return []
		} else {
			let keyframes = []

			for (let i = 0; i < this.props.sequence.curves.length + 1; i++) {
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
					keyframe: i,
				})
			}

			return keyframes
		}
	}
};
