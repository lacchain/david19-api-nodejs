import mongoose from "mongoose";
import countryModel from "./model/country.js";
import userModel from "./model/user.js";
import { getAgeRanges, getCountryRank, getPipeline } from "./query.js";

export default class MongoDAO {

	constructor() {
		mongoose.connect( 'mongodb://localhost:27017/david19', { useNewUrlParser: true, useUnifiedTopology: true } );

		const userSchema = mongoose.Schema( userModel );
		userSchema.index( { 'location': '2d' } );

		const countrySchema = mongoose.Schema( countryModel );
		countrySchema.index( { 'geometry': '2dsphere' } );

		this.models = {
			'user': mongoose.model( 'user', userSchema ),
			'country': mongoose.model( 'country', countrySchema )
		};
	}

	insert( data, model ) {
		return new this.models[model]( data ).save();
	}

	getUsers() {
		return this.models['user'].find( {} );
	}

	getCountry( location ) {
		return this.models['country'].findOne( {
			geometry: {
				$geoIntersects: {
					$geometry: {
						"type": "Point",
						"coordinates": location
					}
				}
			}
		} );
	}

	getUser( subjectId ) {
		return this.models['user'].findOne( { subjectId } );
	}

	newUser( subjectId, gender, age, geohash, coordinates, iso3166_2 ) {
		return new this.models['user']( {
			age,
			gender,
			geohash,
			subjectId,
			location: coordinates,
			country: iso3166_2[0],
			region: iso3166_2[1]
		} );
	}

	getByUID( uid, model ) {
		return this.models[model].findOne( { uid } );
	}

	getClusters( box, factor ) {
		return this.models['user'].aggregate( getPipeline( box, factor ) );
	}

	getAgeRanges( status ) {
		return this.models['user'].aggregate( getAgeRanges( status ) );
	}

	getCountryRanking() {
		return this.models['user'].aggregate( getCountryRank() );
	}

	getGlobalStatus() {
		return this.models['user'].aggregate( [{
			$group: {
				_id: "$status",
				count: { $sum: 1 },
			}
		}] );
	}

}