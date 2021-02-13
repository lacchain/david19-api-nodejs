export default {
	subjectId: String,
	symptoms: {
		fever: Boolean,
		cough: Boolean,
		breathingIssues: Boolean,
		lostSmell: Boolean,
		headache: Boolean,
		musclePain: Boolean,
		soreThroat: Boolean
	},
	geohash: String,
	location: [Number],
	country: String,
	region: String,
	status: Number,
	age: Number,
	gender: Number,
	confined: Boolean,
	withSymptoms: {
		type: Boolean,
		default: false
	},
	interruptionReason: String,
	lastUpdate: Date,
	history: [{
		hash: String,
		kind: Number,
		status: Number
	}],
	points: {
		type: Number,
		default: 0
	},
	histogram: [Number],
	level: {
		type: Number,
		default: 0
	}
}