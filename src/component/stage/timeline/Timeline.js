import React from 'react';
import PropTypes from 'prop-types'
import SequenceTimeline from './SequenceTimeline'
import GraphTimeline from './GraphTimeline'
import TimeRuler from './TimeRuler'
import TimeCursor from './TimeCursor'
import TimeScroll from './TimeScroll'

const PADDING_LEFT = 16
const PADDING_RIGHT = 16
const FRAME_TIME = 1e9 / 60
const SCALE_MAX = 50 / FRAME_TIME // 50px by frame
const SCALE_STEP = 70;

export default class Timeline extends React.Component {

	static propTypes = {
		stage: PropTypes.object.isRequired,
		graphMode: PropTypes.bool,
		scrollY: PropTypes.number.isRequired,
		onScrollY: PropTypes.func.isRequired,
	}

	static defaultProps = {
		graphMode: false,
	}

	constructor(props) {
		super(props)

		this.state = {
			currentTime: 0,
			startTime: 0,
			endTime: props.stage.duration,
			viewWidth: 0,
			viewHeight: 0,
		}

		this.handleResize = this.handleResize.bind(this)
		this.handleScrollX = this.handleScrollX.bind(this)
		this.handleScrollY = this.handleScrollY.bind(this)
		this.handleScrollScale = this.handleScrollScale.bind(this)
		this.handleScrollToT = this.handleScrollToT.bind(this)
		this.handleCurrentTimeChange = this.handleCurrentTimeChange.bind(this)
	}

	render() {

		return (
			<div
				className="timeline"
			ref="container">

				<TimeRuler
					timeline={this.getViewState()}
					onCurrentTimeChange={this.handleCurrentTimeChange}/>

				<TimeCursor
					currentTime={this.state.currentTime}
					timeline={this.getViewState()}/>

				<TimeScroll
					scrollY={this.props.scrollY}
					onScrollX={this.handleScrollX}
					onScrollY={this.handleScrollY}
					onScrollScale={this.handleScrollScale}
					onScrollToT={this.handleScrollToT}
					timeline={this.getViewState()}
					onResize={(width, height) => this.handleResize(width, height)}>

					{this.renderTimelineBody()}

				</TimeScroll>
			</div>
		);
	}

	getViewState() {
		let viewState = {
			paddingLeft: PADDING_LEFT,
			paddingRight: PADDING_RIGHT,
			start: this.state.startTime,
			end: this.state.endTime,
			width: this.state.viewWidth,
			height: this.state.viewHeight,
			duration: this.props.stage.duration,
		}

		viewState.getScale = () => (viewState.width - viewState.paddingLeft - viewState.paddingRight) / (viewState.end - viewState.start)
		return viewState
	}

	renderTimelineBody() {
		if (this.props.graphMode) {
			return (
				<GraphTimeline
					timeline={this.getViewState()}
					sequences={this.props.stage.sequences}
				/>
			)
		} else {
			return (
				<SequenceTimeline
					timeline={this.getViewState()}
					sequences={this.props.stage.sequences}
				/>
			)
		}
	}

	handleResize(width, height) {
		this.setState({
			viewWidth: width,
			viewHeight: height,
		})
	}

	handleScrollX(delta) {
		let scale = this.getScale()
		let deltaT = 1 / scale * delta
		let startTime = this.state.startTime + deltaT;
		let endTime = this.state.endTime + deltaT;
		if (startTime < 0) {
			startTime = 0
			endTime = this.state.endTime - this.state.startTime
		}
		if (endTime > this.props.stage.duration) {
			startTime = this.state.startTime + this.props.stage.duration - this.state.endTime
			endTime = this.props.stage.duration
		}
		this.setState({
			startTime: startTime,
			endTime: endTime,
		})
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
		return (this.state.viewWidth - PADDING_LEFT - PADDING_RIGHT) / (this.state.endTime - this.state.startTime)
	}

	setScale(scale, from) {
		let oldScale = this.getScale()
		let fromT = this.state.startTime + 1 / oldScale * (from - PADDING_LEFT)

		let start = oldScale * (this.state.startTime - fromT) / scale + fromT

		this.moveTo(start, scale)
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

		this.setState({
			startTime: start,
			endTime: end,
		})
	}

	handleScrollToT(t) {
		this.moveTo(t, this.getScale())
	}

	handleCurrentTimeChange(time) {
		this.setState({
			currentTime: time,
		})
	}
};

function bound(x, min, max) {
	if (x < min) {
		x = min
	} else if (x > max) {
		x = max
	}
	return x
}
