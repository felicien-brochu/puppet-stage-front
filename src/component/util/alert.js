import Alert from 'react-s-alert'
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css';

var alert = {
	infoAlert(message, conf) {
		let configuration = Object.assign({
			position: 'top-right',
			effect: 'stackslide'
		}, conf);
		Alert.info(message, configuration);
	},

	successAlert(message, conf) {
		let configuration = Object.assign({
			position: 'top-right',
			effect: 'stackslide'
		}, conf);
		Alert.success(message, configuration);
	},

	warningAlert(message, conf) {
		let configuration = Object.assign({
			position: 'top-right',
			effect: 'stackslide'
		}, conf);
		Alert.warning(message, configuration);
	},

	errorAlert(message, conf) {
		let configuration = Object.assign({
			position: 'top-right',
			effect: 'stackslide',
			timeout: 'none'
		}, conf);
		Alert.error(message, configuration);
	},
}
export default alert
