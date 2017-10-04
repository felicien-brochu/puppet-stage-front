import Alert from 'react-s-alert'
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css';

var alert = {
	errorAlert(message) {
		Alert.error(message, {
			position: 'top-right',
			effect: 'stackslide',
			timeout: 'none'
		});
	}
}
export default alert
