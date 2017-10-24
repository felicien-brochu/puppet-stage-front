import UUID from '../../util/uuid'

export default class StageHistory {
	constructor(stageID) {
		this.stageID = stageID
		this.revisions = []
		this.activeRevision = 0
		this.historyLength = 0
	}

	push(stage) {
		this.revisions[this.activeRevision] = JSON.stringify({
			id: UUID.getUUID(),
			stage: stage,
		})
		this.activeRevision++
			this.historyLength = this.activeRevision
	}

	previous() {
		let stage = null
		if (this.activeRevision > 1) {
			stage = JSON.parse(this.revisions[this.activeRevision - 2]).stage
			this.activeRevision--
		}
		return stage
	}

	next() {
		let stage = null
		if (this.activeRevision < this.historyLength) {
			stage = JSON.parse(this.revisions[this.activeRevision]).stage
			this.activeRevision++
		}
		return stage
	}

	persist() {
		console.log("Persist history");
	}
}
