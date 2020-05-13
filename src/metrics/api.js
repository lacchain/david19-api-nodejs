import Prometheus from "./prometheus.js";

export default class APIMetrics extends Prometheus {

	constructor() {
		super( 'david19-api', process.env.API_METRICS_PORT );

		const counters = [{
			id: 'all',
			path: '*'
		}, {
			id: 'ranking',
			path: '/'
		}, {
			id: 'map',
			path: '/map'
		}, {
			id: 'ages',
			path: '/ages'
		}, {
			id: 'query',
			path: '/query'
		}];

		this.requestCounters = counters.map( counter => ( {
			path: counter.path,
			meter: this.meter.createCounter( `request_count_${counter.id}`, {
				monotonic: true,
				labelKeys: ["hostname"],
				description: `Counts number of requests of path ${counter.path}`
			} )
		} ) );

		this.errorCounters = counters.map( counter => ( {
			path: counter.path,
			meter: this.meter.createCounter( `error_count_${counter.id}`, {
				monotonic: true,
				labelKeys: ["hostname"],
				description: `Counts number of errors of path ${counter.path}`
			} )
		} ) );

		this.latencyGauges = counters.map( counter => ( {
			path: counter.path,
			meter: this.meter.createCounter( `response_latency_${counter.id}`, {
				monotonic: false,
				labelKeys: ["hostname"],
				description: `Records latency of response of path ${counter.path}`
			} )
		} ) );
	}

	incrementRequestCount( path ) {
		const counter = this.requestCounters.find( counter => counter.path === path );
		if( counter )
			counter.meter.bind( this.labels ).add( 1 );
	}

	incrementErrorCount( path ) {
		const counter = this.errorCounters.find( counter => counter.path === path );
		if( counter )
			counter.meter.bind( this.labels ).add( 1 );
	}

	setLatencyValue( path, value ) {
		const gauge = this.latencyGauges.find( gauge => gauge.path === path );
		if( gauge )
			gauge.meter.bind( this.labels ).add( value );
	}

	middleware = ( req, res, next ) => {
		this.incrementRequestCount( '*' );
		this.incrementRequestCount( req.path );
		next();
	}

}