import {
	host
} from './api'

let uuids = []
let fetchingPromise = null

fetchUUIDs(200)

function fetchUUIDs(number, errorMessage = "Error retrieving uuids: ") {
	if (!fetchingPromise) {
		let path = host + `/uuids/?n=${number}`
		errorMessage += "(" + path + ") "
		fetchingPromise = new Promise((resolve, reject) => {
			fetch(path, {
					mode: 'cors'
				})
				.then((response) => {
					if (response.ok) {
						response.json()
							.then((newUUIDs) => {
								uuids = newUUIDs
								resolve()
								fetchingPromise = null
							})
							.catch(() => {
								reject()
							})
					} else {
						console.log(errorMessage)
						console.log(response)
						reject()
						fetchingPromise = null
					}
				})
				.catch((error) => {
					console.log(errorMessage)
					console.log(error)
					reject()
					fetchingPromise = null
				})
		})
	}

	return fetchingPromise
}

export default class UUID {
	static getUUID() {
		let uuid = uuids.pop()
		let promise = new Promise((resolve, reject) => {
			if (!uuid) {
				fetchUUIDs(200)
					.then(() => {
						let uuid = uuids.pop()
						if (!uuid) {
							reject("No uuid available")
						} else {
							resolve(uuid)
						}
					})
			} else {
				resolve(uuid)
				if (uuids.length < 100) {
					fetchUUIDs(200)
				}
			}
		})
		return promise
	}
}
