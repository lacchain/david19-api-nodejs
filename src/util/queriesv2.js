import { Statuses } from "./constants.js";

export const getPipeline = ( box, factor, filters ) => {
	// Stage 0 - Filter by country, state, gender or age (Optional)
	let filter = { $match: { $and: [] } };
	if( filters.country ) filter['$match']['$and'].push( { country: filters.country } );
	if( filters.state ) filter['$match']['$and'].push( { region: filters.state } );
	if( filters.gender ) filter['$match']['$and'].push( { gender: parseInt( filters.gender ) } );
	if( filters.age ) {
		const range = filters.age.split( ',' );
		const min = parseInt( range[0] );
		const max = parseInt( range[1] );
		filter['$match']['$and'].push( { age: { $gte: min } } );
		filter['$match']['$and'].push( { age: { $lte: max } } );
	}

	// Stage 1 - Group by geohash (Required)
	const group = {
		$group: {
			_id: "$geohash",
			usersCount: {
				$sum: 1
			},
			maleCount: {
				$sum: { $cond: { if: { $eq: ["$gender", 0] }, then: 1, else: 0 } }
			},
			femaleCount: {
				$sum: { $cond: { if: { $eq: ["$gender", 1] }, then: 1, else: 0 } }
			},
			unspecifiedCount: {
				$sum: { $cond: { if: { $eq: ["$gender", 2] }, then: 1, else: 0 } }
			},
			otherCount: {
				$sum: { $cond: { if: { $eq: ["$gender", 3] }, then: 1, else: 0 } }
			},
			confinedCount: {
				$sum: { $cond: { if: { $eq: ["$confined", true] }, then: 1, else: 0 } }
			},
			healthyCount: {
				$sum: { $cond: { if: { $eq: ["$status", 0] }, then: 1, else: 0 } }
			},
			withSymptomsCount: {
				$sum: { $cond: { if: { $eq: ["$withSymptoms", true] }, then: 1, else: 0 } }
			},
			affectedCount: {
				$sum: { $cond: { if: { $eq: ["$status", 2] }, then: 1, else: 0 } }
			},
			recoveredCount: {
				$sum: { $cond: { if: { $eq: ["$status", 3] }, then: 1, else: 0 } }
			},
			feverCount: {
				$sum: { $cond: { if: { $eq: ["$symptoms.fever", true] }, then: 1, else: 0 } }
			},
			coughCount: {
				$sum: { $cond: { if: { $eq: ["$symptoms.cough", true] }, then: 1, else: 0 } }
			},
			breathingIssuesCount: {
				$sum: { $cond: { if: { $eq: ["$symptoms.breathingIssues", true] }, then: 1, else: 0 } }
			},
			lostSmellCount: {
				$sum: { $cond: { if: { $eq: ["$symptoms.lostSmell", true] }, then: 1, else: 0 } }
			},
			headacheCount: {
				$sum: { $cond: { if: { $eq: ["$symptoms.headache", true] }, then: 1, else: 0 } }
			},
			musclePainCount: {
				$sum: { $cond: { if: { $eq: ["$symptoms.musclePain", true] }, then: 1, else: 0 } }
			},
			soreThroatCount: {
				$sum: { $cond: { if: { $eq: ["$symptoms.soreThroat", true] }, then: 1, else: 0 } }
			},
			location: { $first: "$location" },
			latAvg: { $avg: { $arrayElemAt: ["$location", 1] } },
			lonAvg: { $avg: { $arrayElemAt: ["$location", 0] } }
		}
	}

	// Stage 2 - Geospatial filter by box boundaries (Optional)
	const limit = {
		$match: {
			location: {
				$geoWithin: {
					$box: box
				}
			}
		}
	};

	// Stage 3 - Cluster by geoHash using a factor of precision (Optional)
	const cluster = [{
		$project: {
			_id: 0,
			geo: {
				$substr: ["$_id", 0, factor]
			},
			usersCount: 1,
			maleCount: 1,
			femaleCount: 1,
			unspecifiedCount: 1,
			otherCount: 1,
			confinedCount: 1,
			healthyCount: 1,
			withSymptomsCount: 1,
			affectedCount: 1,
			recoveredCount: 1,
			feverCount: 1,
			coughCount: 1,
			breathingIssuesCount: 1,
			lostSmellCount: 1,
			headacheCount: 1,
			musclePainCount: 1,
			soreThroatCount: 1,
			latAvg: 1,
			lonAvg: 1
		}
	}, {
		$group: {
			_id: "$geo",
			usersCount: {
				$sum: "$usersCount"
			},
			maleCount: {
				$sum: "$maleCount"
			},
			femaleCount: {
				$sum: "femaleCount"
			},
			unspecifiedCount: {
				$sum: "$unspecifiedCount"
			},
			otherCount: {
				$sum: "$otherCount"
			},
			confinedCount: {
				$sum: "$confinedCount"
			},
			healthyCount: {
				$sum: "$healthyCount"
			},
			withSymptomsCount: {
				$sum: "$withSymptomsCount"
			},
			affectedCount: {
				$sum: "$affectedCount"
			},
			recoveredCount: {
				$sum: "$recoveredCount"
			},
			feverCount: {
				$sum: "$feverCount"
			},
			coughCount: {
				$sum: "$coughCount"
			},
			breathingIssuesCount: {
				$sum: "$breathingIssuesCount"
			},
			lostSmellCount: {
				$sum: "$lostSmellCount"
			},
			headacheCount: {
				$sum: "$headacheCount"
			},
			musclePainCount: {
				$sum: "$musclePainCount"
			},
			soreThroatCount: {
				$sum: "$soreThroatCount"
			},
			latAvg: { $avg: "$latAvg" },
			lonAvg: { $avg: "$lonAvg" }
		}
	}]
	let pipeline = [];
	if( filter['$match']['$and'].length > 0 ) pipeline.push( filter );
	pipeline.push( group );
	if( box ) pipeline.push( limit );
	if( factor < 6 ) pipeline = pipeline.concat( cluster );
	return pipeline;
}

export const getPipeline2 = ( box, factor, filters ) => {
	// Stage 0 - Filter by country, state, gender or age (Optional)
	let filter = { $match: { $and: [] } };
	if( filters.country ) filter['$match']['$and'].push( { country: filters.country } );
	if( filters.state ) filter['$match']['$and'].push( { region: filters.state } );
	if( filters.gender ) filter['$match']['$and'].push( { gender: parseInt( filters.gender ) } );
	if( filters.age ) {
		const range = filters.age.split( ',' );
		const min = parseInt( range[0] );
		const max = parseInt( range[1] );
		filter['$match']['$and'].push( { age: { $gte: min } } );
		filter['$match']['$and'].push( { age: { $lte: max } } );
	}

	// Stage 1 - Group by geohash (Required)
	const group = {
		$group: {
			_id: "$geohash",
			usersCount: {
				$sum: 1
			},
			maleCount: {
				$sum: { $cond: { if: { $eq: ["$gender", 0] }, then: 1, else: 0 } }
			},
			femaleCount: {
				$sum: { $cond: { if: { $eq: ["$gender", 1] }, then: 1, else: 0 } }
			},
			unspecifiedCount: {
				$sum: { $cond: { if: { $eq: ["$gender", 2] }, then: 1, else: 0 } }
			},
			otherCount: {
				$sum: { $cond: { if: { $eq: ["$gender", 3] }, then: 1, else: 0 } }
			},
			confinedCount: {
				$sum: { $cond: { if: { $eq: ["$confined", true] }, then: 1, else: 0 } }
			},
			healthyCount: {
				$sum: { $cond: { if: { $eq: ["$status", 0] }, then: 1, else: 0 } }
			},
			withSymptomsCount: {
				$sum: { $cond: { if: { $eq: ["$withSymptoms", true] }, then: 1, else: 0 } }
			},
			affectedCount: {
				$sum: { $cond: { if: { $eq: ["$status", 2] }, then: 1, else: 0 } }
			},
			recoveredCount: {
				$sum: { $cond: { if: { $eq: ["$status", 3] }, then: 1, else: 0 } }
			},
			feverCount: {
				$sum: { $cond: { if: { $eq: ["$symptoms.fever", true] }, then: 1, else: 0 } }
			},
			coughCount: {
				$sum: { $cond: { if: { $eq: ["$symptoms.cough", true] }, then: 1, else: 0 } }
			},
			breathingIssuesCount: {
				$sum: { $cond: { if: { $eq: ["$symptoms.breathingIssues", true] }, then: 1, else: 0 } }
			},
			lostSmellCount: {
				$sum: { $cond: { if: { $eq: ["$symptoms.lostSmell", true] }, then: 1, else: 0 } }
			},
			headacheCount: {
				$sum: { $cond: { if: { $eq: ["$symptoms.headache", true] }, then: 1, else: 0 } }
			},
			musclePainCount: {
				$sum: { $cond: { if: { $eq: ["$symptoms.musclePain", true] }, then: 1, else: 0 } }
			},
			soreThroatCount: {
				$sum: { $cond: { if: { $eq: ["$symptoms.soreThroat", true] }, then: 1, else: 0 } }
			},
			foodCount: {
				$sum: { $cond: { if: { $eq: ["$interruptionReason", "0"] }, then: 1, else: 0 } }
			},
			workCount: {
				$sum: { $cond: { if: { $eq: ["$interruptionReason", "1"] }, then: 1, else: 0 } }
			},
			medicinesCount: {
				$sum: { $cond: { if: { $eq: ["$interruptionReason", "2"] }, then: 1, else: 0 } }
			},
			doctorCount: {
				$sum: { $cond: { if: { $eq: ["$interruptionReason", "3"] }, then: 1, else: 0 } }
			},
			movingCount: {
				$sum: { $cond: { if: { $eq: ["$interruptionReason", "4"] }, then: 1, else: 0 } }
			},
			assistCount: {
				$sum: { $cond: { if: { $eq: ["$interruptionReason", "5"] }, then: 1, else: 0 } }
			},
			financialCount: {
				$sum: { $cond: { if: { $eq: ["$interruptionReason", "6"] }, then: 1, else: 0 } }
			},
			forceCount: {
				$sum: { $cond: { if: { $eq: ["$interruptionReason", "7"] }, then: 1, else: 0 } }
			},
			petsCount: {
				$sum: { $cond: { if: { $eq: ["$interruptionReason", "8"] }, then: 1, else: 0 } }
			},
			otherReasonCount: {
				$sum: { $cond: { if: { $eq: ["$interruptionReason", "9"] }, then: 1, else: 0 } }
			},
			location: { $first: "$location" },
			latAvg: { $avg: { $arrayElemAt: ["$location", 1] } },
			lonAvg: { $avg: { $arrayElemAt: ["$location", 0] } }
		}
	}

	// Stage 2 - Geospatial filter by box boundaries (Optional)
	const limit = {
		$match: {
			location: {
				$geoWithin: {
					$box: box
				}
			}
		}
	};

	// Stage 3 - Cluster by geoHash using a factor of precision (Optional)
	const cluster = [{
		$project: {
			_id: 0,
			geo: {
				$substr: ["$_id", 0, factor]
			},
			usersCount: 1,
			maleCount: 1,
			femaleCount: 1,
			unspecifiedCount: 1,
			otherCount: 1,
			confinedCount: 1,
			healthyCount: 1,
			withSymptomsCount: 1,
			affectedCount: 1,
			recoveredCount: 1,
			feverCount: 1,
			coughCount: 1,
			breathingIssuesCount: 1,
			lostSmellCount: 1,
			headacheCount: 1,
			musclePainCount: 1,
			soreThroatCount: 1,
			foodCount: 1,
			workCount: 1,
			medicinesCount: 1,
			doctorCount: 1,
			movingCount: 1,
			assistCount: 1,
			financialCount: 1,
			forceCount: 1,
			petsCount: 1,
			otherReasonCount: 1,
			latAvg: 1,
			lonAvg: 1
		}
	}, {
		$group: {
			_id: "$geo",
			usersCount: {
				$sum: "$usersCount"
			},
			maleCount: {
				$sum: "$maleCount"
			},
			femaleCount: {
				$sum: "femaleCount"
			},
			unspecifiedCount: {
				$sum: "$unspecifiedCount"
			},
			otherCount: {
				$sum: "$otherCount"
			},
			confinedCount: {
				$sum: "$confinedCount"
			},
			healthyCount: {
				$sum: "$healthyCount"
			},
			withSymptomsCount: {
				$sum: "$withSymptomsCount"
			},
			affectedCount: {
				$sum: "$affectedCount"
			},
			recoveredCount: {
				$sum: "$recoveredCount"
			},
			feverCount: {
				$sum: "$feverCount"
			},
			coughCount: {
				$sum: "$coughCount"
			},
			breathingIssuesCount: {
				$sum: "$breathingIssuesCount"
			},
			lostSmellCount: {
				$sum: "$lostSmellCount"
			},
			headacheCount: {
				$sum: "$headacheCount"
			},
			musclePainCount: {
				$sum: "$musclePainCount"
			},
			soreThroatCount: {
				$sum: "$soreThroatCount"
			},
			foodCount: {
				$sum: "$foodCount"
			},
			workCount: {
				$sum: "$workCount"
			},
			medicinesCount: {
				$sum: "$medicinesCount"
			},
			doctorCount: {
				$sum: "$doctorCount"
			},
			movingCount: {
				$sum: "$movingCount"
			},
			assistCount: {
				$sum: "$assistCount"
			},
			financialCount: {
				$sum: "$financialCount"
			},
			forceCount: {
				$sum: "$forceCount"
			},
			petsCount: {
				$sum: "$petsCount"
			},
			otherReasonCount: {
				$sum: "$otherReasonCount"
			},
			latAvg: { $avg: "$latAvg" },
			lonAvg: { $avg: "$lonAvg" }
		}
	}]
	let pipeline = [];
	if( filter['$match']['$and'].length > 0 ) pipeline.push( filter );
	pipeline.push( group );
	if( box ) pipeline.push( limit );
	if( factor < 6 ) pipeline = pipeline.concat( cluster );
	return pipeline;
}

export const getAgeRanges = ( status = 3, filter ) => {
	let matcher = {
		$match: {
			$and: [{
				status
			}]
		}
	}
	if( status === Statuses.WithSymptoms ) {
		matcher = {
			$match: {
				$and: [{
					withSymptoms: true
				}]
			}
		}
	}
	if( filter.country ) matcher['$match']['$and'].push( { country: filter.country } );
	if( filter.state ) matcher['$match']['$and'].push( { region: filter.state } );
	const group = {
		$group: {
			_id: {
				$switch: {
					branches: [
						{
							case: {
								$and: [
									{ $gte: ["$age", 13] },
									{ $lte: ["$age", 17] }
								]
							}, then: "13_17"
						},
						{
							case: {
								$and: [
									{ $gte: ["$age", 18] },
									{ $lte: ["$age", 30] }
								]
							}, then: "18_30"
						},
						{
							case: {
								$and: [
									{ $gte: ["$age", 31] },
									{ $lte: ["$age", 40] }
								]
							}, then: "31_40"
						},
						{
							case: {
								$and: [
									{ $gte: ["$age", 41] },
									{ $lte: ["$age", 65] }
								]
							}, then: "41_65"
						},
						{
							case: {
								$gte: ["$age", 66]
							}, then: "66_200"
						}
					],
					default: "0_13"
				}
			},
			count: { $sum: 1 },
			maleCount: { $sum: { $cond: { if: { $eq: ["$gender", 0] }, then: 1, else: 0 } } },
			femaleCount: { $sum: { $cond: { if: { $eq: ["$gender", 1] }, then: 1, else: 0 } } },
			unspecifiedCount: { $sum: { $cond: { if: { $eq: ["$gender", 2] }, then: 1, else: 0 } } },
			otherCount: { $sum: { $cond: { if: { $eq: ["$gender", 3] }, then: 1, else: 0 } } },
		}
	};
	return [matcher, group]
}

export const getCountryRank = () => {
	return [{
		$group: {
			_id: "$country",
			healthyCount: {
				$sum: { $cond: { if: { $eq: ["$status", 0] }, then: 1, else: 0 } }
			},
			withSymptomsCount: {
				$sum: { $cond: { if: { $eq: ["$withSymptoms", true] }, then: 1, else: 0 } }
			},
			affectedCount: {
				$sum: { $cond: { if: { $eq: ["$status", 2] }, then: 1, else: 0 } }
			},
			recoveredCount: {
				$sum: { $cond: { if: { $eq: ["$status", 3] }, then: 1, else: 0 } }
			},
			usersCount: {
				$sum: 1
			},
			transactionsCount: {
				$sum: { $size: "$history" }
			}
		}
	}]
}

export const getCountryPoints = () => {
	return [{
		$group: {
			_id: "$country",
			points: {
				$sum: "$points"
			},
			users: {
				$sum: 1
			}
		}
	}]
}

export const getPointsRanking = () => {
	return [{
		$project: {
			_id: 0,
			history: 0,
			__v: 0,
			confined: 0,
			interruptionReason: 0,
			symptoms: 0,
			withSymptoms: 0,
			geohash: 0,
			age: 0,
			gender: 0
		}
	}, {
		$sort: { points: -1 }
	}]
}

export const getUserRankPosition = ( subjectId ) => {
	return [{
		$project: {
			_id: 1,
			subjectId: "$subjectId",
			points: 1
		}
	}, {
		$sort: { points: -1 }
	}, {
		$group: {
			_id: {},
			arr: {
				$push: {
					subjectId: '$subjectId',
					points: '$points'
				}
			}
		}
	}, {
		$unwind: {
			path: '$arr',
			includeArrayIndex: 'globalRank',
		}
	}, {
		$match: {
			"arr.subjectId": subjectId
		}
	}, {
		$project: {
			_id: 0,
			position: '$globalRank'
		}
	}]
}

export const getUserRankPositionCountry = ( country, subjectId ) => {
	return [{
		$match: {
			"country": country
		}
	}, {
		$project: {
			_id: 1,
			subjectId: "$subjectId",
			points: 1
		}
	}, {
		$sort: { points: -1 }
	}, {
		$group: {
			_id: {},
			arr: {
				$push: {
					subjectId: '$subjectId',
					points: '$points'
				}
			}
		}
	}, {
		$unwind: {
			path: '$arr',
			includeArrayIndex: 'globalRank',
		}
	}, {
		$match: {
			"arr.subjectId": subjectId
		}
	}, {
		$project: {
			_id: 0,
			position: '$globalRank'
		}
	}]
}

export const getUserRankPositionRegion = ( country, region, subjectId ) => {
	return [{
		$match: {
			"country": country,
			"region": region
		}
	}, {
		$project: {
			_id: 1,
			subjectId: "$subjectId",
			points: 1
		}
	}, {
		$sort: { points: -1 }
	}, {
		$group: {
			_id: {},
			arr: {
				$push: {
					subjectId: '$subjectId',
					points: '$points'
				}
			}
		}
	}, {
		$unwind: {
			path: '$arr',
			includeArrayIndex: 'globalRank',
		}
	}, {
		$match: {
			"arr.subjectId": subjectId
		}
	}, {
		$project: {
			_id: 0,
			position: '$globalRank'
		}
	}]
}

export const getTotalUsers = () => {
	return [{
		$group: {
			_id: null,
			users: {
				$sum: 1
			}
		}
	}]
}

export const getCountryUsers = country => {
	return [{
		$match: {
			country
		}
	}, {
		$group: {
			_id: null,
			users: {
				$sum: 1
			}
		}
	}]
}

export const getRegionUsers = ( country, region ) => {
	return [{
		$match: {
			country,
			region
		}
	}, {
		$group: {
			_id: null,
			users: {
				$sum: 1
			}
		}
	}]
}

export const getAveragePoints = () => {
	return [{
		$group: {
			_id: null,
			average: {
				$avg: "$points"
			}
		}
	}]
}