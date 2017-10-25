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
