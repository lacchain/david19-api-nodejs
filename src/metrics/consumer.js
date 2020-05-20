import Prometheus from "./prometheus.js";
import { CovidCode } from "../util/constants.js";

export default class ConsumerMetrics extends Prometheus {

	constructor() {
		super( 'david19-consumer', process.env.CONSUMER_METRICS_PORT );

		const events = [{
			id: 'register_credential',
			name: 'CredentialRegistered'
		}, {
			id: 'revoke_credential',
			name: 'CredentialRevoked'
		}];
		const credentialTypes = Object.keys( CovidCode );

		this.eventsCounters = events.map( event => ( {
			name: event.name,
			meter: this.meter.createCounter( `events_count_${event.id}`, {
				monotonic: true,
				labelKeys: ["hostname"],
				description: `Counts number of events named ${event.name}`
			} )
		} ) );

		this.credentialsCounters = credentialTypes.map( type =>
			this.meter.createCounter( `events_count_${type.toLowerCase()}`, {
				monotonic: true,
				labelKeys: ["hostname"],
				description: `Counts number of credentials registered of type ${type}`
			} )
		);

		this.errorCounter = this.meter.createCounter( `register_credential_error_count`, {
			monotonic: true,
			labelKeys: ["hostname"],
			description: `Counts number of errors of Register Credential method`
		} );

		this.latencyGauge = this.meter.createCounter( `register_credential_latency`, {
			monotonic: false,
			labelKeys: ["hostname"],
			description: `Records latency of Register Credential method`
		} );

		this.blockCounter = this.meter.createCounter( `block_count`, {
			monotonic: true,
			labelKeys: ["hostname"],
			description: `Counts number of blocks of received from eventeum`
		} );

		this.blockHeightGauge = this.meter.createCounter( `block_height`, {
			monotonic: false,
			labelKeys: ["hostname"],
			description: `Latest block height received from eventeum`
		} );
	}

	incrementEventsCount( name ) {
		const counter = this.eventsCounters.find( counter => counter.name === name );
		if( counter )
			counter.meter.bind( this.labels ).add( 1 );
	}

	incrementCredentialsCount( typeIndex ) {
		const counter = this.credentialsCounters[typeIndex];
		if( counter )
			counter.bind( this.labels ).add( 1 );
	}

	incrementErrorCount() {
		this.errorCounter.bind( this.labels ).add( 1 );
	}

	setLatencyValue( value ) {
		this.latencyGauge.bind( this.labels ).add( value );
	}

	incrementBlocksCount() {
		this.blockCounter.bind( this.labels ).add( 1 );
	}

	setBlockHeight( value ) {
		this.blockHeightGauge.bind( this.labels ).add( value );
	}

}