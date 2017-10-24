import {
	host
} from './api'

let uuids = []

function fetchUUIDs(number, onSuccess, errorMessage = "Error retrieving uuids: ") {
	let path = host + `/uuids/?n=${number}`
	errorMessage += "(" + path + ") "
	fetch(path, {
			mode: 'cors'
		})
		.then((response) => {
			if (response.ok) {
				response.json()
					.then((object) => {
						if (onSuccess) {
							onSuccess(object)
						}
					})
			} else {
				console.log(errorMessage)
				console.log(response)
			}
		})
		.catch((error) => {
			console.log(errorMessage)
			console.log(error)
		})
}

fetchUUIDs(100, onFetchSuccess)

function onFetchSuccess(newUUIDs) {
	uuids = newUUIDs
}

export default class UUID {
	static getUUID() {
		let uuid = uuids.pop()
		if (uuids.length < 10) {
			fetchUUIDs(100, onFetchSuccess)
		}
		return uuid
	}
}
