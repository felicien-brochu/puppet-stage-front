import React from 'react';
import PropTypes from 'prop-types'
import ReactResizeDetector from 'react-resize-detector'
import SequenceTimeline from './SequenceTimeline'
import GraphTimeline from './GraphTimeline'
import TimeRuler from './TimeRuler'
import TimeCursor from './TimeCursor'
import TimeScroll from './TimeScroll'

const PADDING_LEFT = 16
const PADDING_RIGHT = 16
const SCROLL_BAR_WIDTH = 16

export default class Timeline extends React.Component {

	static propTypes = {
		stage: PropTypes.object.isRequired,
		graphMode: PropTypes.bool,
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
	}

	render() {

		return (
			<div
				className="timeline"
			ref="container">
				<TimeRuler
					timeline={{
						paddingLeft: PADDING_LEFT,
						paddingRight: PADDING_RIGHT,
						start: this.state.startTime,
						end: this.state.endTime,
						width: this.state.viewWidth,
						height: this.state.viewHeight,
						duration: this.props.stage.duration,
					}}
				/>
				<TimeScroll
					onScrollX={this.handleScrollX}
					onScrollY={this.handleScrollY}
					onScrollScale={this.handleScrollScale}>
					{this.renderTimelineBody()}
					<ReactResizeDetector handleWidth handleHeight onResize={(width, height) => this.handleResize(width, height)}/>
				</TimeScroll>
			</div>
		);
	}

	renderTimelineBody() {
		if (this.props.graphMode) {
			return (
				<GraphTimeline
					timeline={{
						paddingLeft: PADDING_LEFT,
						paddingRight: PADDING_RIGHT,
						start: this.state.startTime,
						end: this.state.endTime,
						width: this.state.viewWidth,
						height: this.state.viewHeight,
					}}
					sequences={this.props.stage.sequences}
				/>
			)
		} else {
			return (
				<SequenceTimeline
					timeline={{
						paddingLeft: PADDING_LEFT,
						paddingRight: PADDING_RIGHT,
						start: this.state.startTime,
						end: this.state.endTime,
						width: this.state.viewWidth,
						height: this.state.viewHeight,
					}}
					sequences={this.props.stage.sequences}
				/>
			)
		}
	}

	handleResize(width, height) {
		this.setState({
			viewWidth: width - SCROLL_BAR_WIDTH,
			viewHeight: height - SCROLL_BAR_WIDTH,
		})
	}

	handleScrollX(delta) {
		console.log("x:", delta)
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

	handleScrollY(delta) {
		console.log("y:", delta)
	}

	handleScrollScale(delta) {
		console.log("sc:", delta)


	}

	getScale() {
		return (this.state.viewWidth - PADDING_LEFT - PADDING_RIGHT) / (this.state.endTime - this.state.startTime)
	}
};
