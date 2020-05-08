export default {
	subjectId: String,
	symptoms: {
		fever: Boolean,
		cough: Boolean,
		breathingIssues: Boolean,
		lossSmell: Boolean,
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
	interruptionReason: String,
	lastUpdate: Date,
	history: [{
		hash: String,
		kind: Number,
		status: Number
	}]
}