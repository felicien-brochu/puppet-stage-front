import Modal from 'react-modal'

Modal.setAppElement('#root')
Modal.defaultProps.className = {
	base: "modal",
	afterOpen: "modal-open",
	beforeClose: "modal-close",
}
Modal.defaultProps.overlayClassName = {
	base: "modal-overlay",
	afterOpen: "modal-overlay-open",
	beforeClose: "modal-overlay-close",
}

export default Modal
// export default class Modal extends Modal {
//
// 	static defaultProps = {
// 		isOpen: false,
//
//
// 	}
//
// 	constructor(props) {
// 		super(props)
// 		this.state = {
// 			isOpen: props.isOpen,
// 		}
// 	}
//
// 	render() {
// 		return (
// 			<Modal
// 				isOpen={this.state.isOpen}
// 				onAfterOpen={this.props.onAfterOpen}
// 				onRequestClose={() => this.handleRequestClose()}
// 				parentSelector={() => document.querySelector('#root')}
// 				shouldCloseOnOverlayClick={true}
// 				className={{
// 					base: "modal",
// 					afterOpen: "modal-open",
// 					beforeClose: "modal-close",
// 				}}
// 				overlayClassName={{
// 					base: "modal-overlay",
// 					afterOpen: "modal-overlay-open",
// 					beforeClose: "modal-overlay-close",
// 				}}
// 			>
// 				{this.props.children}
// 			</Modal>
// 		)
// 	}
//
// 	handleRequestClose() {
// 		let close = true
// 		if (typeof this.props.onRequestClose === 'function') {
// 			close = this.props.onRequestClose() !== false
// 		}
//
// 		if (close) {
// 			this.setState({
// 				isOpen: false,
// 			})
// 		}
// 	}
//
// }
