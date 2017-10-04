import React from 'react';
import PuppetsEditor from './puppet/PuppetsEditor'

export default class PuppetCreator extends React.Component {

	render() {
		return (
			<div className="home-container">
				<PuppetsEditor/>
			</div>
		);
	}
};
