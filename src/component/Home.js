import React from 'react';
import PuppetBrowser from './home/PuppetBrowser'
import StageBrowser from './home/StageBrowser'

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
