import React from 'react';
import PuppetBrowser from './puppet/PuppetBrowser'

export default class Home extends React.Component {

	render() {
		return (
			<div className="home-container">
				<PuppetBrowser/>
			</div>
		);
	}
};
