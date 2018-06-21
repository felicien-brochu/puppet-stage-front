import UUID from '../../util/uuid'
import fetchAPI from '../../util/api'
import Revision from './Revision'

const
	MIN_PREV_HISTORY_LENGTH = 10,
	MIN_NEXT_HISTORY_LENGTH = 10,
	BATCH_HISTORY_LENGTH = 20


export default class StageHistory {
	constructor(stageID, onSaveStateChange) {
		this.stageID = stageID
		this.onSaveStateChange = onSaveStateChange

		this.revisions = []
		this.activeRevision = -1
		this.historyLength = 0

		this.unsavedStart = -1
		this.savedActiveRevision = -1
		this.savePromise = null

		this.historyStart = NaN
		this.historyEnd = NaN
		this.lazyLoadingPromise = null
	}

	init() {
		return new Promise((resolve, reject) => {
			fetchAPI(`/stage/${this.stageID}/history?prev=${MIN_PREV_HISTORY_LENGTH}&next=${MIN_NEXT_HISTORY_LENGTH}`, {},
				(history) => {
					this.handleInitRequestSuccess(history)
					this.fireSaveStateChange()
					resolve()
				},
				(error) => {
					reject(error)
				},
				"Error fetching history"
			)
		})
	}

	handleInitRequestSuccess(history) {
		this.revisions = []
		for (let i = 0; i < history.revisions.length; i++) {
			let revision = history.revisions[i]
			this.revisions.push(JSON.stringify(revision))

			if (revision.id === history.activeRevision) {
				this.activeRevision = i
			}
		}

		this.savedActiveRevision = this.activeRevision
		this.historyLength = history.revisions.length

		if (this.activeRevision < MIN_PREV_HISTORY_LENGTH) {
			this.historyStart = 0
		}
		if (this.historyLength - 1 - this.activeRevision < MIN_NEXT_HISTORY_LENGTH) {
			this.historyEnd = this.historyLength - 1
		}
	}

	push(stage) {
		return new Promise((resolve, reject) => {
			Revision.createRevision(stage)
				.then((revision) => {
					this.revisions[this.activeRevision + 1] = JSON.stringify(revision)
					this.activeRevision++
						this.historyLength = this.activeRevision + 1
					if (this.unsavedStart < 0 || this.unsavedStart > this.activeRevision) {
						this.unsavedStart = this.activeRevision
					}
					resolve()
					this.fireSaveStateChange()
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
				this.extendHistory()
			this.fireSaveStateChange()
		}

		return stage
	}

	next() {
		let stage = null
		if (this.activeRevision < this.historyLength - 1) {
			let revision = Revision.fromJSON(this.revisions[this.activeRevision + 1])
			stage = revision.stage
			this.activeRevision++
				this.extendHistory()
			this.fireSaveStateChange()
		}

		return stage
	}

	getActiveRevision() {
		let stage = null
		if (this.historyLength > 0) {
			let revision = Revision.fromJSON(this.revisions[this.activeRevision])
			stage = revision.stage
		}
		return stage
	}

	getSaveState() {
		let saveState = 'saved'
		if (this.savePromise) {
			saveState = 'saving'
		} else if (this.unsavedStart >= 0) {
			saveState = 'modified'
		} else if (this.savedActiveRevision !== this.activeRevision) {
			saveState = 'traveled'
		}
		return saveState
	}

	fireSaveStateChange() {
		if (typeof this.onSaveStateChange === 'function') {
			this.onSaveStateChange(this.getSaveState())
		}
	}

	save() {
		if (!this.savePromise) {
			if (this.unsavedStart >= 0) {
				this.savePromise = new Promise((resolve, reject) => {
					this.persist()
						.then(() => {
							this.unsavedStart = -1
							this.savedActiveRevision = this.activeRevision
							resolve()
							this.savePromise = null
							this.fireSaveStateChange()
						})
						.catch((error) => {
							reject(error)
							this.savePromise = null
							this.fireSaveStateChange()
						})
				})
				this.fireSaveStateChange()
			} else if (this.savedActiveRevision !== this.activeRevision) {
				let savingActiveRevision = this.activeRevision
				this.savePromise = new Promise((resolve, reject) => {
					this.saveActiveRevision(savingActiveRevision)
						.then(() => {
							this.savedActiveRevision = savingActiveRevision
							resolve()
							this.savePromise = null
							this.fireSaveStateChange()
						})
						.catch((error) => {
							reject(error)
							this.savePromise = null
							this.fireSaveStateChange()
						})
				})
				this.fireSaveStateChange()
			}
		}
		return this.savePromise
	}

	persist() {
		console.log("Persist history");
		let revisions = []
		let activeRevisionID
		for (let i = 0; i < this.historyLength; i++) {
			let revision = Revision.fromJSON(this.revisions[i])
			if (i >= this.unsavedStart) {
				revisions.push(revision)
			}
			if (i === this.activeRevision) {
				activeRevisionID = revision.id
			}
		}
		let body = {
			startRevisionID: Revision.fromJSON(this.revisions[this.unsavedStart - 1]).id,
			activeRevisionID: activeRevisionID,
			revisions: revisions,
		}

		return new Promise((resolve, reject) => {
			fetchAPI(`/stage/${this.stageID}/history`, {
					method: 'PUT',
					body: JSON.stringify(body)
				},
				(history) => {
					resolve()
				},
				(error) => {
					reject(error)
				},
				"Error saving history"
			)
		})
	}

	saveActiveRevision(activeRevision) {
		console.log("Save active revision");
		let body = {
			activeRevisionID: Revision.fromJSON(this.revisions[activeRevision]).id,
		}
		return new Promise((resolve, reject) => {
			fetchAPI(`/stage/${this.stageID}/history/activeRevision`, {
					method: 'PUT',
					body: JSON.stringify(body)
				},
				(history) => {
					resolve()
				},
				(error) => {
					reject(error)
				},
				"Error saving active revision"
			)
		})
	}

	extendHistory() {
		if (!this.lazyLoadingPromise) {
			if (this.activeRevision < MIN_PREV_HISTORY_LENGTH && isNaN(this.historyStart)) {
				this.extendPrevHistory(BATCH_HISTORY_LENGTH)
			} else if (this.historyLength < this.activeRevision + MIN_NEXT_HISTORY_LENGTH && isNaN(this.historyEnd)) {
				this.extendNextHistory(BATCH_HISTORY_LENGTH)
			}
		}
	}

	extendPrevHistory(length) {
		let from = Revision.fromJSON(this.revisions[0]).id
		this.lazyLoadingPromise = new Promise((resolve, reject) => {
			fetchAPI(`/stage/${this.stageID}/history?from=${from}&prev=${length}&next=0`, {},
				(history) => {
					this.handleExtendPrevRequestSuccess(history)
					resolve(history)
					this.lazyLoadingPromise = null
				},
				(error) => {
					reject(error)
					this.lazyLoadingPromise = null
				},
				"Error fetching history"
			)
		})
	}

	handleExtendPrevRequestSuccess(history) {
		let newRevisions = []
		for (let i = 0; i < history.revisions.length - 1; i++) {
			let revision = history.revisions[i]
			newRevisions.push(JSON.stringify(revision))
		}

		this.revisions = newRevisions.concat(this.revisions)
		this.historyLength += newRevisions.length
		this.activeRevision += newRevisions.length

		if (newRevisions.length < BATCH_HISTORY_LENGTH) {
			this.historyStart = 0
		}
	}

	extendNextHistory(length) {
		let from = Revision.fromJSON(this.revisions[this.historyLength - 1]).id
		this.lazyLoadingPromise = new Promise((resolve, reject) => {
			fetchAPI(`/stage/${this.stageID}/history?from=${from}&prev=0&next=${length}`, {},
				(history) => {
					this.handleExtendNextRequestSuccess(history)
					resolve(history)
					this.lazyLoadingPromise = null
				},
				(error) => {
					reject(error)
					this.lazyLoadingPromise = null
				},
				"Error fetching history"
			)
		})
	}

	handleExtendNextRequestSuccess(history) {
		if (isNaN(this.historyEnd)) {
			let newRevisions = []
			for (let i = 1; i < history.revisions.length; i++) {
				let revision = history.revisions[i]
				newRevisions.push(JSON.stringify(revision))
			}

			this.revisions = this.revisions.concat(newRevisions)
			this.historyLength += newRevisions.length

			if (newRevisions.length < BATCH_HISTORY_LENGTH) {
				this.historyEnd = this.historyLength - 1
			}
		}
	}
}