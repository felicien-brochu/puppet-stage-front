import UUID from '../../util/uuid'
import fetchAPI from '../../util/api'

export default class StageHistory {
	constructor(stageID) {
		this.stageID = stageID
		this.revisions = []
		this.activeRevision = -1
		this.historyLength = 0
	}

	push(stage) {
		return new Promise((resolve, reject) => {
			Revision.createRevision(stage)
				.then((revision) => {
					this.revisions[this.activeRevision + 1] = JSON.stringify(revision)
					this.activeRevision++
						this.historyLength = this.activeRevision + 1
					resolve()
				})
				.catch((error) => {
					reject(error)
				})
		})
	}

	previous() {
		let stage = null
		if (this.activeRevision > 0) {
			let revision = Revision.fromJSON(this.revisions[this.activeRevision - 1])
			stage = revision.stage
			this.activeRevision--
		}
		return stage
	}

	next() {
		let stage = null
		if (this.activeRevision < this.historyLength - 1) {
			let revision = Revision.fromJSON(this.revisions[this.activeRevision + 1])
			stage = revision.stage
			this.activeRevision++
		}
		return stage
	}

	save() {
		this.persist()
	}

	persist() {
		console.log("Persist history");
		// return new Promise((resolve, reject) => {
		// 	fetchAPI('/stage/')
		// 	xhr.onload = () => resolve(xhr.responseText);
		// 	xhr.onerror = () => reject(xhr.statusText);
		// });
	}
}

class Revision {
	constructor(stage, id, date = new Date()) {
		this.id = id
		this.date = date
		this.stage = JSON.parse(JSON.stringify(stage))
	}

	static fromJSON(json) {
		let parsed = JSON.parse(json)
		let date = new Date(parsed.date)
		return new Revision(parsed.stage, date, parsed.id)
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
