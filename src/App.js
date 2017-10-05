import React from 'react';
import './style/index.min.css';
import {
	Route,
	Switch
} from 'react-router-dom'

import Home from './component/Home';

export default class App extends React.Component {
	render() {
		return (
			<Switch>
				<Route exact path="/" component={Home}/>
				{/* <Route path="/puppet/:name" component={Home}/> */}
			</Switch>
		);
	}
}
