import React from 'react';
import SequenceTimeline from './SequenceTimeline'
import GraphTimeline from './GraphTimeline'

export default class Timeline extends React.Component {

	render() {
		return (
			<div className="timeline">
				<SequenceTimeline/>
				<GraphTimeline/>
			</div>
		);
	}
};
