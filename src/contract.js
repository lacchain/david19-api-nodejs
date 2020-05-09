import { CovidCode, Statuses, Symptoms, hexToAscii } from "./util/constants.js";
import geoHash from "ngeohash";

export default class CovidContract {

	constructor( dao ) {
		this.dao = dao;
	}

	async registerCredential( { returnValues } ) {
		const subjectId = returnValues.id;
		const hash = returnValues.hash;
		const gender = returnValues.sex;
		const age = parseInt( returnValues.age );
		const geohash = hexToAscii( returnValues.geoHash );
		const credentialType = parseInt( returnValues.credentialType );
		const interruptionReason = parseInt( returnValues.reason );
		const symptoms = parseInt( returnValues.symptoms );

		let user = await this.dao.getUser( subjectId );
		if( !user ) {
			const location = geoHash.decode( geohash );
			const coordinates = [location.longitude, location.latitude];
			let iso3166_2 = ['', ''];
			try {
				const reverse = await this.dao.getCountry( coordinates );
				if( reverse ) {
					iso3166_2 = reverse.properties.iso_3166_2.split( '-' );
				}
			} catch( e ) {
			}
			user = this.dao.newUser( subjectId, gender, age, geohash, coordinates, iso3166_2 );
		}

		switch( credentialType ) {
			case CovidCode.Infection:
				user.status = Statuses.Affected;
				break;
			case CovidCode.Recovery:
				user.status = Statuses.Recovered;
				break;
			case CovidCode.Confinement:
				if( !( user.status && user.status > 0 ) ) {
					user.status = Statuses.Healthy;
				}
				user.confined = true;
				break;
			case CovidCode.Interruption:
				if( !( user.status && user.status > 0 ) ) {
					user.status = Statuses.Healthy;
				}
				user.confined = false;
				user.interruptionReason = interruptionReason;
				break;
			case CovidCode.Symptoms:
				if( symptoms === 0 ) {
					user.status = Statuses.Healthy;
				} else {
					user.status = Statuses.WithSymptoms
					user.symptoms = Object.keys( Symptoms ).reduce( ( dict, symptom ) => {
						if( ( symptoms & Symptoms[symptom] ) > 0 )
							dict[symptom.slice( 0, 1 ).toLowerCase() + symptom.slice( 1 )] = true;
						return dict;
					}, {} );
				}
				break;
		}
		user.history.push( {
			hash,
			kind: credentialType,
			status: user.status
		} );
		return user.save();
	}

	async revokeCredential( { returnValues } ) {
		const subjectId = returnValues.id;
		const hash = returnValues.hash;

		const user = await this.dao.getUser( subjectId );
		if( !user ) return false;

		const previous = user.history.find( h => h.hash === hash );
		if( !previous ) return false;

		if( user.history.length < 2 ) {
			user.history = [];
			user.status = Statuses.Unknown;
			return user.save();
		}

		switch( previous.kind ) {
			case CovidCode.Infection:
				user.status = user.history[user.length - 1].status;
				break;
			case CovidCode.Recovery:
				user.status = Statuses.Affected;
				break;
			case CovidCode.Confinement:
				user.confined = false;
				break;
			case CovidCode.Interruption:
				user.confined = true;
				user.interruptionReason = null;
				break;
			case CovidCode.Symptoms:
				user.status = user.history[user.length - 1].status;
				user.symptoms = [];
				break;
		}
		user.save();
	}

}
