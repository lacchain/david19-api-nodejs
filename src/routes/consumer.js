import Router from "./router.js";
import CovidContract from "../contract.js";
import ConsumerMetrics from "../metrics/consumer.js";

export default class ConsumerRouter extends Router {

	constructor( logger, dao ) {
		super( logger );
		this.metrics = new ConsumerMetrics();
		this.contract = new CovidContract( dao );
	}

	init() {

		this.post( '/event', null, async( req ) => {
			const { name, status, indexedParameters, nonIndexedParameters } = req.body;
			if( name === 'CredentialRegistered' && status === 'CONFIRMED' ) {
				const eventValues = {
					hash: indexedParameters[0].value,
					id: nonIndexedParameters[1].value,
					sex: nonIndexedParameters[4].value,
					age: nonIndexedParameters[5].value,
					geoHash: nonIndexedParameters[6].value,
					credentialType: nonIndexedParameters[7].value,
					reason: nonIndexedParameters[8].value,
					symptoms: nonIndexedParameters[9].value
				};
				const startTime = new Date().getTime();
				this.contract.registerCredential( {
					name,
					returnValues: eventValues
				} ).then( result => {
					this.logger.info( 'CredentialRegistered', {
						...eventValues,
						result: {
							geoHash: result._doc.geohash,
							status: result._doc.status,
							confined: result._doc.confined,
							withSymptoms: result._doc.withSymptoms
						}
					} );
					const latency = new Date().getTime() - startTime;
					this.metrics.setLatencyValue( latency );
				} ).catch( error => {
					this.logger.error( 'CredentialRegistered', {
						...eventValues,
						error: JSON.stringify( error )
					} );
					this.metrics.incrementErrorCount();
				} );
				this.metrics.incrementCredentialsCount( eventValues.credentialType );
			} else if( name === 'CredentialRevoked' && status === 'CONFIRMED' ) {
				this.logger.info( 'CredentialRevoked', {
					hash: indexedParameters[0].value
				} );
			} else if( name === 'PointsSet' && status === 'CONFIRMED' ) {
				const eventValues = {
					subjectId: indexedParameters[0].value,
					points: nonIndexedParameters[1].value
				};
				this.contract.setUserScore( {
					returnValues: eventValues
				} ).then( () => {
					this.logger.info( 'ScoreUser', eventValues );
				} ).catch( error => {
					this.logger.error( 'ScoreUser', {
						...eventValues,
						error: JSON.stringify( error )
					} );
					this.metrics.incrementErrorCount();
				} );
			}
			if( status === 'CONFIRMED' ) {
				this.metrics.incrementEventsCount( name );
			}
			return {}
		} );

		this.post( '/block', null, async( req ) => {
			const { number } = req.body;
			this.metrics.incrementBlocksCount();
			this.metrics.setBlockHeight( number || 0 );
			return {};
		} );


	}
}