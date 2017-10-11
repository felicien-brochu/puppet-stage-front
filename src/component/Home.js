import React from 'react';
import PuppetBrowser from './puppet/PuppetBrowser'
import StageBrowser from './stage/StageBrowser'

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
