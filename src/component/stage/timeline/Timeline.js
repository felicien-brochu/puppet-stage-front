import React from 'react'
import PropTypes from 'prop-types'
import units from '../../../util/units'
import SequenceTimeline from './SequenceTimeline'
import GraphTimeline from './GraphTimeline'
import TimeRuler from './TimeRuler'
import TimeCursor from './TimeCursor'
import TimeScroll from './TimeScroll'

const PADDING_LEFT = 16
const PADDING_RIGHT = 16
const PADDING_TOP = 30
const PADDING_BOTTOM = 30
const TIME_SCALE_MAX = 50 / units.FRAME_TIME // 50px by frame
const TIME_SCALE_STEP = 12
const VALUE_SCALE_MAX = 50 / 0.1 // 50px by 0.1%
const VALUE_SCALE_STEP = 12

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
			startValue: units.MIN_VALUE,
			endValue: units.MAX_VALUE,
		}

		this.handleResize = this.handleResize.bind(this)
		this.handleScrollScaleTime = this.handleScrollScaleTime.bind(this)
		this.handleScrollScaleValue = this.handleScrollScaleValue.bind(this)
		this.handleScrollToT = this.handleScrollToT.bind(this)
		this.handleScrollToY = this.handleScrollToY.bind(this)
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
					stepX={12}
					stepY={this.props.showGraph ? 16 : NaN}
					contentSize={this.getContentSize()}
					onScrollScaleX={this.handleScrollScaleTime}
					onScrollScaleY={this.handleScrollScaleValue}
					onScrollToX={this.handleScrollToT}
					onScrollToY={this.handleScrollToY}
					onResize={this.handleResize}>

					{this.renderTimelineBody()}

				</TimeScroll>
			</div>
		)
	}

	getContentSize() {
		if (this.props.showGraph) {
			return this.getGraphTimelineContentSize()
		} else {
			return this.getSequenceTimelineContentSize()
		}
	}

	getSequenceTimelineContentSize() {
		let {
			startTime,
			endTime,
			stage,
		} = this.props

		let
			paddingStartX = PADDING_LEFT / this.getTimeScale(),
			paddingEndX = PADDING_RIGHT / this.getTimeScale(),
			startX = startTime - paddingStartX,
			endX = endTime + paddingEndX,
			minX = -paddingStartX,
			maxX = stage.duration + paddingEndX,
			width = stage.duration + paddingStartX + paddingEndX

		if (this.sequenceTimeline) {
			let
				startY = this.props.scrollY,
				height = this.sequenceTimeline.getContentHeight(),
				minY = 0,
				maxY = height,
				endY = Math.min(height, startY + this.state.viewHeight)

			return {
				minX: minX,
				maxX: maxX,
				startX: startX,
				endX: endX,
				width: width,
				minY: minY,
				maxY: maxY,
				startY: startY,
				endY: endY,
				height: height,
			}
		} else {
			return {
				minX: minX,
				maxX: maxX,
				startX: startX,
				endX: endX,
				width: width,
				minY: 0,
				maxY: 1,
				startY: 0,
				endY: 1,
				height: 1,
			}
		}
	}

	getGraphTimelineContentSize() {
		let {
			startTime,
			endTime,
			stage,
		} = this.props

		let {
			startValue,
			endValue
		} = this.state
		let
			paddingStartX = PADDING_LEFT / this.getTimeScale(),
			paddingEndX = PADDING_RIGHT / this.getTimeScale(),
			startX = startTime - paddingStartX,
			endX = endTime + paddingEndX,
			minX = -paddingStartX,
			maxX = stage.duration + paddingEndX,
			width = stage.duration + paddingStartX + paddingEndX

		let
			paddingStartY = PADDING_TOP / this.getValueScale(),
			paddingEndY = PADDING_BOTTOM / this.getValueScale(),
			startY = units.MAX_VALUE - endValue - paddingStartY,
			endY = units.MAX_VALUE - startValue + paddingEndY,
			minY = -paddingStartY,
			height = units.MAX_VALUE - units.MIN_VALUE + paddingStartY + paddingEndY,
			maxY = height - paddingStartY

		return {
			minX: minX,
			maxX: maxX,
			startX: startX,
			endX: endX,
			width: width,

			minY: minY,
			maxY: maxY,
			startY: startY,
			endY: endY,
			height: height,
		}
	}

	renderTimelineBody() {
		if (this.props.showGraph) {
			return (
				<GraphTimeline
					ref={graphTimeline => this.graphTimeline = graphTimeline}

					timeline={this.getViewState()}
					sequences={this.props.stage.sequences}
					selectedKeyframes={this.props.selectedKeyframes}
					paddingTop={PADDING_TOP}
					paddingBottom={PADDING_BOTTOM}
					minValue={units.MIN_VALUE}
					maxValue={units.MAX_VALUE}
					startValue={this.state.startValue}
					endValue={this.state.endValue}

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
					ref={sequenceTimeline => this.sequenceTimeline = sequenceTimeline}

					timeline={this.getViewState()}
					sequences={this.props.stage.sequences}
					selectedKeyframes={this.props.selectedKeyframes}
					scrollY={this.props.scrollY}

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

		viewState.getTimeScale = () => (viewState.width - viewState.paddingLeft - viewState.paddingRight) / (viewState.end - viewState.start)
		return viewState
	}

	handleResize(width, height) {
		if (!this.props.showGraph && this.sequenceTimeline) {
			let contentHeight = this.sequenceTimeline.getContentHeight()

			if (contentHeight - this.props.scrollY < height && this.props.scrollY > 0) {
				let scrollY = Math.max(contentHeight - height, 0)
				this.handleScrollToY(scrollY)
			}
		}

		if (width !== this.state.viewWidth && typeof this.props.onTimeScaleChange === 'function') {
			let scale = (width - PADDING_LEFT - PADDING_RIGHT) / (this.props.endTime - this.props.startTime)
			this.props.onTimeScaleChange(scale)
		}
		this.setState({
			viewWidth: width,
			viewHeight: height,
		})
	}

	handleScrollScaleTime(delta, from) {
		let min = this.getMinTimeScale()
		let max = TIME_SCALE_MAX
		let scale = this.getTimeScale()

		let rate = (scale - min) / (max - min)

		let x = Math.sqrt(1 - Math.pow(rate - 1, 2))
		x += -delta / TIME_SCALE_STEP
		x = bound(x, 0, 1)

		let newRate = -Math.sqrt(1 - Math.pow(x, 2)) + 1
		let newScale = newRate * (max - min) + min
		newScale = bound(newScale, min, max)

		if (newScale !== scale) {
			this.setTimeScale(newScale, from.x)
		}
	}

	handleScrollScaleValue(delta, from) {
		if (this.props.showGraph) {
			let min = this.getMinValueScale()
			let max = VALUE_SCALE_MAX
			let scale = this.getValueScale()

			let rate = (scale - min) / (max - min)

			let x = Math.sqrt(1 - Math.pow(rate - 1, 2))
			x += -delta / VALUE_SCALE_STEP
			x = bound(x, 0, 1)

			let newRate = -Math.sqrt(1 - Math.pow(x, 2)) + 1
			let newScale = newRate * (max - min) + min
			newScale = bound(newScale, min, max)

			if (newScale !== scale) {
				this.setValueScale(newScale, from.y)
			}
		}
	}

	getMinTimeScale() {
		return (this.state.viewWidth - PADDING_LEFT - PADDING_RIGHT) / this.props.stage.duration
	}

	getTimeScale() {
		return (this.state.viewWidth - PADDING_LEFT - PADDING_RIGHT) / (this.props.endTime - this.props.startTime)
	}

	setTimeScale(scale, from) {
		let oldScale = this.getTimeScale()
		let fromT = this.props.startTime + (from - PADDING_LEFT) / oldScale

		let start = oldScale * (this.props.startTime - fromT) / scale + fromT

		this.moveToTime(start, scale)

		if (typeof this.props.onTimeScaleChange === 'function') {
			this.props.onTimeScaleChange(scale)
		}
	}

	getMinValueScale() {
		return (this.state.viewHeight - PADDING_TOP - PADDING_BOTTOM) / (units.MAX_VALUE - units.MIN_VALUE)
	}

	getValueScale() {
		return (this.state.viewHeight - PADDING_TOP - PADDING_BOTTOM) / (this.state.endValue - this.state.startValue)
	}

	setValueScale(scale, from) {
		let oldScale = this.getValueScale()
		from = this.state.viewHeight - from
		let fromV = this.state.startValue + (from - PADDING_BOTTOM) / oldScale
		let start = fromV + oldScale * (this.state.startValue - fromV) / scale

		this.moveToValue(start, scale)
	}

	moveToTime(start, scale) {
		if (start < 0) {
			start = 0
		}

		let timeWidth = (this.state.viewWidth - PADDING_LEFT - PADDING_RIGHT) / scale
		let end = start + timeWidth
		if (end > this.props.stage.duration) {
			start -= end - this.props.stage.duration
			if (start < 0) {
				start = 0
			}
			end = start + timeWidth
		}

		this.props.onTimeWindowChange(start, end)
	}

	moveToValue(startValue, scale) {
		if (startValue < units.MIN_VALUE) {
			startValue = units.MIN_VALUE
		}
		let valueHeight = (this.state.viewHeight - PADDING_TOP - PADDING_BOTTOM) / scale
		let endValue = startValue + valueHeight
		if (endValue > units.MAX_VALUE) {
			startValue -= endValue - units.MAX_VALUE
			if (startValue < units.MIN_VALUE) {
				startValue = units.MIN_VALUE
			}
			endValue = startValue + valueHeight
		}

		this.setState({
			startValue: startValue,
			endValue: endValue,
		})
	}

	handleScrollToT(t) {
		let timeScale = this.getTimeScale()
		this.moveToTime(t + PADDING_LEFT / timeScale, timeScale)
	}

	handleScrollToY(y) {
		if (this.props.showGraph) {
			let valueScale = this.getValueScale()
			y = units.MAX_VALUE - y - PADDING_TOP / valueScale - (this.state.endValue - this.state.startValue)
			this.moveToValue(y, valueScale)
		} else {
			this.props.onScrollY(y - this.props.scrollY)
		}
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
