import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import units from '../../../util/units'
import SequenceTimeline from './SequenceTimeline'
import GraphTimeline from './GraphTimeline'
import TimeRuler from './TimeRuler'
import TimeCursor from './TimeCursor'
import TimeScroll from './TimeScroll'

const PADDING_LEFT = 16
const PADDING_RIGHT = 16
const SCALE_MAX = 50 / units.FRAME_TIME // 50px by frame
const SCALE_STEP = 12

export default class Timeline extends React.Component {

	static propTypes = {
		stage: PropTypes.object.isRequired,
		scrollY: PropTypes.number.isRequired,
		selectedKeyframes: PropTypes.array.isRequired,
		currentTime: PropTypes.number.isRequired,
		startTime: PropTypes.number.isRequired,
		endTime: PropTypes.number.isRequired,
		showGraph: PropTypes.bool.isRequired,

		onScrollY: PropTypes.func.isRequired,
		onCurrentTimeChange: PropTypes.func.isRequired,
		onTimeWindowChange: PropTypes.func.isRequired,
		onTimeScaleChange: PropTypes.func.isRequired,
		onSelectKeyframes: PropTypes.func.isRequired,
		onUnselectKeyframes: PropTypes.func.isRequired,
		onSingleKeyframeMouseDown: PropTypes.func.isRequired,
		onBasicSequenceTimeChange: PropTypes.func.isRequired,
		onBasicSequenceChange: PropTypes.func.isRequired,
	}

	constructor(props) {
		super(props)

		this.state = {
			viewWidth: 0,
			viewHeight: 0,
		}

		this.handleResize = this.handleResize.bind(this)
		this.handleScrollX = this.handleScrollX.bind(this)
		this.handleScrollY = this.handleScrollY.bind(this)
		this.handleScrollScale = this.handleScrollScale.bind(this)
		this.handleScrollToT = this.handleScrollToT.bind(this)

		this.getNestedContentChildRef = this.getNestedContentChildRef.bind(this)
	}

	render() {

		return (
			<div
				className="timeline"
			ref="container">

				<TimeRuler
					timeline={this.getViewState()}
					onCurrentTimeChange={this.props.onCurrentTimeChange}/>

				<TimeCursor
					currentTime={this.props.currentTime}
					timeline={this.getViewState()}/>


				<TimeScroll
					contentChildRef={this.getNestedContentChildRef}
					scrollY={this.props.scrollY}
					onScrollX={this.handleScrollX}
					onScrollY={this.handleScrollY}
					onScrollScale={this.handleScrollScale}
					onScrollToT={this.handleScrollToT}
					timeline={this.getViewState()}
					onResize={this.handleResize}>

					{this.renderTimelineBody()}

				</TimeScroll>
			</div>
		)
	}

	getNestedContentChildRef() {
		if (!this.props.showGraph && this.sequenceTimeline) {
			return ReactDOM.findDOMNode(this.sequenceTimeline.refs.sequenceList)
		} else {
			return null
		}
	}

	renderTimelineBody() {
		if (this.props.showGraph) {
			return (
				<GraphTimeline
					timeline={this.getViewState()}
					sequences={this.props.stage.sequences}
					selectedKeyframes={this.props.selectedKeyframes}

					onValueScaleChange={this.props.onValueScaleChange}
					onSelectKeyframes={this.props.onSelectKeyframes}
					onUnselectKeyframes={this.props.onUnselectKeyframes}
					onSingleKeyframeMouseDown={this.props.onSingleKeyframeMouseDown}
					onBasicSequenceChange={this.props.onBasicSequenceChange}
				/>
			)
		} else {
			return (
				<SequenceTimeline
					timeline={this.getViewState()}
					sequences={this.props.stage.sequences}
					selectedKeyframes={this.props.selectedKeyframes}
					ref={sequenceTimeline => this.sequenceTimeline = sequenceTimeline}

					onSelectKeyframes={this.props.onSelectKeyframes}
					onUnselectKeyframes={this.props.onUnselectKeyframes}
					onSingleKeyframeMouseDown={this.props.onSingleKeyframeMouseDown}
					onBasicSequenceTimeChange={this.props.onBasicSequenceTimeChange}
				/>
			)
		}
	}

	getViewState() {
		let viewState = {
			paddingLeft: PADDING_LEFT,
			paddingRight: PADDING_RIGHT,
			start: this.props.startTime,
			end: this.props.endTime,
			duration: this.props.stage.duration,
			width: this.state.viewWidth,
			height: this.state.viewHeight,
		}

		viewState.getScale = () => (viewState.width - viewState.paddingLeft - viewState.paddingRight) / (viewState.end - viewState.start)
		return viewState
	}

	handleResize(width, height) {
		if (width !== this.state.viewWidth && typeof this.props.onTimeScaleChange === 'function') {
			let scale = (width - PADDING_LEFT - PADDING_RIGHT) / (this.props.endTime - this.props.startTime)
			this.props.onTimeScaleChange(scale)
		}
		this.setState({
			viewWidth: width,
			viewHeight: height,
		})
	}

	handleScrollX(delta) {
		let scale = this.getScale()
		let deltaT = 1 / scale * delta
		let startTime = this.props.startTime + deltaT
		let endTime = this.props.endTime + deltaT
		if (startTime < 0) {
			startTime = 0
			endTime = this.props.endTime - this.props.startTime
		}
		if (endTime > this.props.stage.duration) {
			startTime = this.props.startTime + this.props.stage.duration - this.props.endTime
			endTime = this.props.stage.duration
		}
		this.props.onTimeWindowChange(startTime, endTime)
	}

	handleScrollY(deltaY) {
		if (typeof this.props.onScrollY === 'function') {
			this.props.onScrollY(deltaY)
		}
	}

	handleScrollScale(delta, from) {
		let min = this.getMinScale()
		let max = SCALE_MAX
		let scale = this.getScale()

		let rate = (scale - min) / (max - min)

		let x = Math.sqrt(1 - Math.pow(rate - 1, 2))
		x += -delta / SCALE_STEP
		x = bound(x, 0, 1)

		let newRate = -Math.sqrt(1 - Math.pow(x, 2)) + 1
		let newScale = newRate * (max - min) + min
		newScale = bound(newScale, min, max)

		if (newScale !== scale) {
			this.setScale(newScale, from.x)
		}
	}

	getMinScale() {
		return (this.state.viewWidth - PADDING_LEFT - PADDING_RIGHT) / this.props.stage.duration
	}

	getScale() {
		return (this.state.viewWidth - PADDING_LEFT - PADDING_RIGHT) / (this.props.endTime - this.props.startTime)
	}

	setScale(scale, from) {
		let oldScale = this.getScale()
		let fromT = this.props.startTime + 1 / oldScale * (from - PADDING_LEFT)

		let start = oldScale * (this.props.startTime - fromT) / scale + fromT

		this.moveTo(start, scale)

		if (typeof this.props.onTimeScaleChange === 'function') {
			this.props.onTimeScaleChange(scale)
		}
	}

	moveTo(start, scale) {
		if (start < 0) {
			start = 0
		}

		let end = start + 1 / scale * (this.state.viewWidth - PADDING_LEFT - PADDING_RIGHT)
		if (end > this.props.stage.duration) {
			start -= end - this.props.stage.duration
			if (start < 0) {
				start = 0
			}
			end = start + 1 / scale * (this.state.viewWidth - PADDING_LEFT - PADDING_RIGHT)
		}

		this.props.onTimeWindowChange(start, end)
	}

	handleScrollToT(t) {
		this.moveTo(t, this.getScale())
	}
}

function bound(x, min, max) {
	if (x < min) {
		x = min
	} else if (x > max) {
		x = max
	}
	return x
}
