import UUID from '../../util/uuid'

export default class Revision {
	constructor(stage, id, date = new Date()) {
		this.id = id
		this.date = date
		this.stage = JSON.parse(JSON.stringify(stage))
	}

	static fromJSON(json) {
		let parsed = JSON.parse(json)
		let date = new Date(parsed.date)
		return new Revision(parsed.stage, parsed.id, date)
	}

	static createRevision(stage) {
		return new Promise((resolve, reject) => {
			UUID.getUUID()
				.then((uuid) => {
					resolve(new Revision(stage, uuid))
				})
				.catch((error) => {
					reject(error)
				})
		})
	}
}