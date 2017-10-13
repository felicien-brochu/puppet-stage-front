import React from 'react';
import PuppetBrowser from './PuppetBrowser'
import StageBrowser from './StageBrowser'

export default class Home extends React.Component {

	render() {
		return (
			<div className="home-container">
				<StageBrowser/>
				<PuppetBrowser/>
			</div>
		);
	}
};
