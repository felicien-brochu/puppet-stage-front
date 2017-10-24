import alert from './alert'

let host = "http://localhost:8080"

function fetchAPI(path, conf, onSuccess, onError, errorMessage = "Error: ") {
	conf.mode = 'cors'
	let completePath = host + path
	let method = conf.method ? conf.method : "GET"
	errorMessage += ` ${method}(${completePath})`
	fetch(completePath, conf)
		.then((response) => {
			if (response.ok) {
				response.json()
					.then((object) => {
						if (typeof onSuccess === 'function') {
							onSuccess(object)
						}
					})
			} else {
				console.log(errorMessage)
				console.log(response)

				let preventDefault = false
				if (typeof onError === 'function') {
					preventDefault = onError(response) === false
				}

				if (!preventDefault) {
					response.text().then((message) => {
						alert.errorAlert(errorMessage + message)
					})
				}
			}
		})
		.catch((error) => {
			console.log(errorMessage)
			console.log(error)

			let preventDefault = false
			if (onError) {
				preventDefault = onError(error) === false
			}

			if (!preventDefault) {
				alert.errorAlert(errorMessage + error.message)
			}
		})
}

export default fetchAPI
export {
	fetchAPI,
	host
}
