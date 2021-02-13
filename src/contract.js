import { CovidCode, hexToUTF8, Statuses, Symptoms } from "./util/constants.js";
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
		const geohash = hexToUTF8( returnValues.geoHash );
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
				if( symptoms === 0 && ( !user.status || user.status === Statuses.Healthy || user.status === Statuses.WithSymptoms ) ) {
					user.status = Statuses.Healthy;
					user.symptoms = {
						fever: false,
						cough: false,
						breathingIssues: false,
						lostSmell: false,
						headache: false,
						musclePain: false,
						soreThroat: false
					};
				} else {
					user.symptoms = Object.keys( Symptoms ).reduce( ( dict, symptom ) => {
						if( symptoms > 0 && ( symptoms & Symptoms[symptom] ) > 0 )
							dict[symptom.slice( 0, 1 ).toLowerCase() + symptom.slice( 1 )] = true;
						return dict;
					}, {} );
					if( ( !user.status || user.status === Statuses.Healthy ) && symptoms > 0 ) {
						user.status = Statuses.WithSymptoms;
					}
				}
				user.withSymptoms = symptoms > 0;
				break;
		}
		user.history.push( {
			hash,
			kind: credentialType,
			status: user.status
		} );
		return user.save();
	}

	async setUserScore( { returnValues } ) {
		const { subjectId, points, level } = returnValues;

		let user = await this.dao.getUser( subjectId );
		if( !user ) {
			throw new Error( 'Invalid subjectId, user not found' );
		}
		user.points = parseInt( points );
		if( level )
			user.level = parseInt( level );
		user.histogram.push( points );
		return user.save();
	}

}
