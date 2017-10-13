import React from 'react';
import SplitPane from 'react-split-pane'
import SequenceList from './SequenceList'
import Timeline from './Timeline'

export default class SequenceEditor extends React.Component {

	render() {
		return (
			<div className="sequence-editor">
				<SplitPane minSize={400}>
					<SequenceList/>
					<Timeline/>
				</SplitPane>
			</div>
		);
	}
};
