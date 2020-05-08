export const getPipeline = ( box, factor, filter ) => {
	let matcher = {
		$match: {
			$and: []
		}
	};
	if( box ) matcher['$match']['$and'].push( {
		location: {
			$geoWithin: {
				$box: box
			}
		}
	} );
	if( filter.country ) matcher['$match']['$and'].push( { country: filter.country } );
	if( filter.state ) matcher['$match']['$and'].push( { region: filter.state } );
	const cluster = {
		$project: {
			_id: 0,
			geo: {
				"$substr": ["$geohash", 0, factor]
			},
			gender: 1,
			confined: 1,
			status: 1,
			symptoms: 1,
			location: 1
		}
	};
	const group = {
		$group: {
			_id: "$geo",
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
				$sum: { $cond: { if: { $eq: ["$confined", 1] }, then: 1, else: 0 } }
			},
			healthyCount: {
				$sum: { $cond: { if: { $eq: ["$status", 0] }, then: 1, else: 0 } }
			},
			withSymptomsCount: {
				$sum: { $cond: { if: { $eq: ["$status", 1] }, then: 1, else: 0 } }
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
			latAvg: { $avg: { $arrayElemAt: ["$location", 1] } },
			lonAvg: { $avg: { $arrayElemAt: ["$location", 0] } }
		}
	}
	let pipeline = [];
	if( matcher['$match']['$and'].length > 0 ) pipeline.push( matcher );
	pipeline.push( cluster );
	pipeline.push( group );
	return pipeline;
}

export const getAgeRanges = ( status = 3, filter ) => {
	let matcher = {
		$match: {
			$and: [{
				status
			}]
		}
	};
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
									{ $gte: ["$age", 0] },
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
							}, then: "66-200"
						}
					]
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
				$sum: { $cond: { if: { $eq: ["$status", 1] }, then: 1, else: 0 } }
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