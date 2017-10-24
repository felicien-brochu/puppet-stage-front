export default null
export function entries() {
	return function*(obj) {
		for (let key of Object.keys(obj)) {
			yield [key, obj[key]]
		}
	}
}
