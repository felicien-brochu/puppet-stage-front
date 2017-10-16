import React from 'react';
import './style/index.css';
import {
	Route,
	Switch
} from 'react-router-dom'

import Home from './component/home/Home';
import PuppetEditor from './component/puppet/PuppetEditor';
import StageEditor from './component/stage/StageEditor';

export default class App extends React.Component {
	render() {
		return (
			<Switch>
				<Route exact path="/" component={Home}/>
				<Route path="/puppet/:id" component={PuppetEditor}/>
				<Route path="/stage/:id" component={StageEditor}/>
			</Switch>
		);
	}
}
