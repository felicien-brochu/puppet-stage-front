import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import units from '../../../util/units'

const
	KEYFRAME_WIDTH = 11.3,
	HANDLE_WIDTH = 16

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
		onBasicSequenceTimeChange: PropTypes.func,
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
		this.handleHandleDragMove = this.handleHandleDragMove.bind(this)
		this.handleHandleDragUp = this.handleHandleDragUp.bind(this)
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
		let x = timeline.paddingLeft + ((seqStart - timeline.start) * scale)
		let width = seqDuration * scale

		let handles = this.renderHandles()
		let keyframes = this.renderKeyFrames()

		let box = (
			<svg className="sequence-box-box"
				ref={container => this.container = container}>
				<rect x={x} y={0} width={width} height={this.props.height-1}/>
				{handles}
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

	renderHandles() {
		const {
			timeline,
			sequence,
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
		let x = timeline.paddingLeft + ((seqStart - timeline.start) * scale)
		let width = seqDuration * scale

		let handles = []

		if (sequence && sequence.keyframes) {
			handles.push(
				<use
					className="handle"
					key="left-handle"
					href="#handle-shape"
					x={x - HANDLE_WIDTH / 2}
					y="0"
					onMouseDown={(e) => this.handleHandleMouseDown('left', e)}
				/>)
			handles.push(
				<use
					className="handle"
					key="right-handle"
					href="#handle-shape"
					x={x + width - HANDLE_WIDTH / 2}
					y="0"
					onMouseDown={(e) => this.handleHandleMouseDown('right', e)}
				/>)
		}

		return handles
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
				onMouseDown={(e) => this.handleKeyframeMouseDown(i, e)}
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

	handleHandleMouseDown(handle, e) {
		this.handleDrag = {
			startX: e.clientX,
			startT: this.props.sequence.start,
			duration: this.props.sequence.duration,
			handle: handle,
		}
		window.addEventListener('mousemove', this.handleHandleDragMove)
		window.addEventListener('mouseup', this.handleHandleDragUp)
		e.stopPropagation()
	}

	handleHandleDragMove(e) {
		let {
			startTime,
			duration
		} = this.getNewSequenceTime(e.clientX)
		if (typeof this.props.onBasicSequenceTimeChange === 'function') {
			this.props.onBasicSequenceTimeChange(this.props.sequence.id, startTime, duration, false)
		}
	}

	handleHandleDragUp(e) {
		window.removeEventListener('mousemove', this.handleHandleDragMove)
		window.removeEventListener('mouseup', this.handleHandleDragUp)
		let {
			startTime,
			duration
		} = this.getNewSequenceTime(e.clientX)
		if (typeof this.props.onBasicSequenceTimeChange === 'function') {
			this.props.onBasicSequenceTimeChange(this.props.sequence.id, startTime, duration, true)
		}
	}

	getNewSequenceTime(clientX) {
		let {
			startX,
			startT,
			duration,
			handle,
		} = this.handleDrag

		let sequenceTime
		if (handle === 'left') {
			let deltaT = Math.round(Math.round((clientX - startX) / this.props.timeline.getScale() / units.FRAME_TIME) * units.FRAME_TIME)
			deltaT = Math.max(deltaT, -startT)
			deltaT = Math.min(deltaT, Math.round(duration - units.FRAME_TIME))
			sequenceTime = {
				startTime: startT + deltaT,
				duration: duration - deltaT,
			}
		} else if (handle === 'right') {
			let deltaT = Math.round(Math.round((clientX - startX) / this.props.timeline.getScale() / units.FRAME_TIME) * units.FRAME_TIME)
			deltaT = Math.max(deltaT, -Math.round(duration - units.FRAME_TIME))
			deltaT = Math.min(deltaT, this.props.timeline.duration - startT - duration)
			sequenceTime = {
				startTime: startT,
				duration: duration + deltaT,
			}
		} else {
			sequenceTime = {
				startTime: this.props.sequence.start,
				duration: this.props.sequence.duration,
			}
		}

		return sequenceTime
	}
}
