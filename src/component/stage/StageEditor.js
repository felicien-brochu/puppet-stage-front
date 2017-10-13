import React from 'react'
import SplitPane from 'react-split-pane'
import SequenceEditor from './SequenceEditor'

export default class StageEditor extends React.Component {

	render() {
		return (
			<div className="stage-editor">
				<SplitPane split="horizontal" primary="second" defaultSize="50vh" minSize={100}>
					<div className="top-panel"/>
					<SequenceEditor />
				</SplitPane>
				</div>
		);
	}
};
