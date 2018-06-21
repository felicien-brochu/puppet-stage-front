import fetchAPI from '../../util/api'
import Revision from '../stage/Revision'
import LipSync from '../stage/LipSync'
import HeadTracking from '../stage/HeadTracking'
import model from '../../util/model'
import UUID from '../../util/uuid'
import {
	entries
} from '../../util/utils'

export default class TemplateStageFactory {

	constructor() {
		this.stages = []

		this.handleCreateTemplateStageSuccess = this.handleCreateTemplateStageSuccess.bind(this)
	}

	createTemplateStages(prefix, wavFiles, lipSyncFiles, headTrackingFiles, puppet, onSuccess) {
		this.puppet = puppet
		this.onSuccess = onSuccess
		let fileReaderProsises = []
		this.lipSyncTexts = []
		this.headTrackingTexts = []

		for (let i = 0; i < wavFiles.length; i++) {
			fileReaderProsises.push(TemplateStageFactory.promiseFileReader(lipSyncFiles[i])
				.then(text => {
					this.lipSyncTexts.push(text)
				}))
			fileReaderProsises.push(TemplateStageFactory.promiseFileReader(headTrackingFiles[i])
				.then(text => {
					this.headTrackingTexts.push(text)
				}))
		}

		// Execute in series
		return fileReaderProsises.reduce((promiseChain, currentTask) => {
			return promiseChain.then(chainResults =>
				currentTask.then(currentResult => [...chainResults, currentResult])
			)
		}, Promise.resolve([])).then(arrayOfResults => {
			for (let i = 0; i < wavFiles.length; i++) {
				let name = prefix + "-" + wavFiles[i].name.substring(0, wavFiles[i].name.length - 4)

				this.createTemplateStage(name, wavFiles[i], this.lipSyncTexts[i], this.headTrackingTexts[i])
			}
		})
	}

	static promiseFileReader(file) {
		return new Promise((resolve, reject) => {
			var reader = new FileReader();
			reader.onload = e => {
				resolve(e.target.result)
			};
			reader.readAsText(file);
		});
	}

	createTemplateStage(name, wavFile, lipSyncText, headTrackingText) {
		console.log("Create stage: " + name)
		fetchAPI("/stage", {
			method: 'PUT',
			body: JSON.stringify({
				name: name,
				puppetID: this.puppet.id,
			}),
		}, stage => {
			this.handleCreateTemplateStageSuccess(stage, wavFile, lipSyncText, headTrackingText)
		}, null, "Error creating stage:")
	}

	handleCreateTemplateStageSuccess(stage, wavFile, lipSyncText, headTrackingText) {
		stage.duration = Math.round(HeadTracking.getHeadTrackingEnd(headTrackingText) + 5e9)
		this.sortDriverSequences(stage, this.puppet)

		this.generateLipSyncSequence(stage, this.puppet, lipSyncText)
			.then(() => {
				return this.generateHeadTrackingSequences(stage, this.puppet, headTrackingText)
			})
			.then(() => {
				return this.saveAudio(stage, wavFile)
			})
			.then(() => {
				return this.saveStage(stage)
			})
			.then(() => {
				this.stages.push(stage)
				if (this.stages.length === this.lipSyncTexts.length) {
					this.onSuccess(this.stages)
				}
			})
	}

	sortDriverSequences(stage, puppet) {
		const order = ["mouth", "neckH", "neckV", "eyesH", "eyesV", "browL", "browR", "lidL", "lidR"]
		stage.sequences.sort((a, b) => {
			let servoA = model.getServo(puppet.boards, a.servoID)
			let servoB = model.getServo(puppet.boards, b.servoID)
			let tagIndexA = -1,
				tagIndexB = -1

			for (const tag of servoA.tags) {
				tagIndexA = order.indexOf(tag)
				if (tagIndexA >= 0) {
					break
				}
			}
			if (tagIndexA < 0) {
				tagIndexA = Number.MAX_VALUE
			}

			for (const tag of servoB.tags) {
				tagIndexB = order.indexOf(tag)
				if (tagIndexB >= 0) {
					break
				}
			}
			if (tagIndexB < 0) {
				tagIndexB = Number.MAX_VALUE
			}

			return tagIndexA - tagIndexB
		})
	}

	generateLipSyncSequence(stage, puppet, lipSyncText) {
		let keyframes = LipSync.generateKeyframes(lipSyncText)

		return UUID.getUUID().then((uuid) => {
			let servo = model.getServosByTag(puppet.boards, "mouth")[0]

			let defaultValue = (servo.defaultPosition - servo.min) / (servo.max - servo.min) * 100,
				sequence = {
					id: uuid,
					name: 'Lip Sync',
					defaultValue: defaultValue,
					start: 0,
					duration: stage.duration,
					slave: false,
					playEnabled: true,
					previewEnabled: false,
					showGraph: false,
					keyframes: keyframes,
				}

			let driverSequence = null
			for (const driverSeq of stage.sequences) {
				if (driverSeq.servoID === servo.id) {
					driverSequence = driverSeq
					break
				}
			}

			driverSequence.sequences = [sequence]
		}).catch((error) => {
			console.error(error)
		})
	}

	generateHeadTrackingSequences(stage, puppet, headTrackingText) {
		return HeadTracking.importTrackingData(headTrackingText, stage.duration)
			.then((tracking) => {
				for (const [tag, sequence] of entries()(tracking.sequences)) {
					let servos = model.getServosByTag(puppet.boards, tag)

					if (servos.length > 0) {
						let servo = servos[0]
						let driverSequence = null

						for (const driverSeq of stage.sequences) {
							if (driverSeq.servoID === servo.id) {
								driverSequence = driverSeq
								break
							}
						}

						driverSequence.sequences = [sequence]
					}
				}
			})
	}

	saveAudio(stage, audioFile) {
		return new Promise((resolve, reject) => {
			const fileName = audioFile.name
			const reader = new FileReader();
			reader.addEventListener("loadend", () => {
				fetchAPI(
					`/audio/${stage.id}/${fileName}`, {
						method: 'PUT',
						body: reader.result,
					},
					resolve,
					reject,
					`Error uploading audio file "${audioFile.name}"`)
			})

			reader.readAsDataURL(audioFile)
			stage.audio.file = fileName
		})
	}

	saveStage(stage) {
		return new Promise((resolve, reject) => {
				fetchAPI(`/stage/${stage.id}/history?prev=1&next=0`, {},
					(fetchedHistory) => {
						resolve(fetchedHistory)
					},
					(error) => {
						reject(error)
					},
					"Error fetching history"
				)
			})
			.then((history) => {
				return Revision.createRevision(stage)
					.then((revision) => {
						let body = {
							startRevisionID: history.activeRevision,
							activeRevisionID: revision.id,
							revisions: [revision],
						}

						return new Promise((resolve, reject) => {
							fetchAPI(`/stage/${stage.id}/history`, {
									method: 'PUT',
									body: JSON.stringify(body)
								},
								(savedHistory) => {
									resolve()
								},
								(error) => {
									reject(error)
								},
								"Error saving stage"
							)
						})
					})
			})
	}
}