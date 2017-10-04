import React from 'react';
import Home from './component/Home';
import './style/index.min.css';
import {
	BrowserRouter,
	Route
} from 'react-router-dom'

export default class App extends React.Component {
	render() {
		return (
			<BrowserRouter>
				<Route exact path='/' component={Home}/>
			</BrowserRouter>
		);
	}
}
