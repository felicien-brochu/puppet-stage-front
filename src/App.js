import React from 'react';
import './style/index.min.css';
import {
	Route,
	Switch
} from 'react-router-dom'

import Home from './component/Home';
import PuppetEditor from './component/PuppetEditor';
import StageEditor from './component/StageEditor';

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
